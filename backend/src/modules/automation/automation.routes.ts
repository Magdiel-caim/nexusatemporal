import { Router } from 'express';
import { TriggerController } from './trigger.controller';
import { WorkflowController } from './workflow.controller';
import { EventController } from './event.controller';
import { IntegrationController } from './integration.controller';
import { getAutomationDbPool } from './database';
import { authenticate } from '@/shared/middleware/auth.middleware';

const router = Router();

// All automation routes require authentication
router.use(authenticate);

// Initialize database pool from CrmDataSource (lazy initialization)
let triggerController: TriggerController;
let workflowController: WorkflowController;
let eventController: EventController;
let integrationController: IntegrationController;

const initControllers = () => {
  if (!triggerController) {
    const db = getAutomationDbPool();
    triggerController = new TriggerController(db);
    workflowController = new WorkflowController(db);
    eventController = new EventController(db);
    integrationController = new IntegrationController(db);
  }
};

// ==========================================
// TRIGGERS ROUTES
// ==========================================

// GET /api/automation/triggers - List all triggers
router.get('/triggers', (req, res) => {
  initControllers();
  triggerController.findAll(req, res);
});

// GET /api/automation/triggers/stats - Get trigger statistics
router.get('/triggers/stats', (req, res) => {
  initControllers();
  triggerController.getStats(req, res);
});

// GET /api/automation/triggers/events - Get available event types
router.get('/triggers/events', (req, res) => {
  initControllers();
  triggerController.getEventTypes(req, res);
});

// GET /api/automation/triggers/:id - Get trigger by ID
router.get('/triggers/:id', (req, res) => {
  initControllers();
  triggerController.findById(req, res);
});

// POST /api/automation/triggers - Create new trigger
router.post('/triggers', (req, res) => {
  initControllers();
  triggerController.create(req, res);
});

// PUT /api/automation/triggers/:id - Update trigger
router.put('/triggers/:id', (req, res) => {
  initControllers();
  triggerController.update(req, res);
});

// DELETE /api/automation/triggers/:id - Delete trigger
router.delete('/triggers/:id', (req, res) => {
  initControllers();
  triggerController.delete(req, res);
});

// PATCH /api/automation/triggers/:id/toggle - Toggle trigger active status
router.patch('/triggers/:id/toggle', (req, res) => {
  initControllers();
  triggerController.toggleActive(req, res);
});

// ==========================================
// WORKFLOWS ROUTES
// ==========================================

// GET /api/automation/workflows - List all workflows
router.get('/workflows', (req, res) => {
  initControllers();
  workflowController.findAll(req, res);
});

// GET /api/automation/workflows/stats - Get workflow statistics
router.get('/workflows/stats', (req, res) => {
  initControllers();
  workflowController.getStats(req, res);
});

// GET /api/automation/workflows/:id - Get workflow by ID
router.get('/workflows/:id', (req, res) => {
  initControllers();
  workflowController.findById(req, res);
});

// POST /api/automation/workflows - Create new workflow
router.post('/workflows', (req, res) => {
  initControllers();
  workflowController.create(req, res);
});

// PUT /api/automation/workflows/:id - Update workflow
router.put('/workflows/:id', (req, res) => {
  initControllers();
  workflowController.update(req, res);
});

// DELETE /api/automation/workflows/:id - Delete workflow
router.delete('/workflows/:id', (req, res) => {
  initControllers();
  workflowController.delete(req, res);
});

// POST /api/automation/workflows/:id/execute - Execute workflow
router.post('/workflows/:id/execute', (req, res) => {
  initControllers();
  workflowController.execute(req, res);
});

// GET /api/automation/workflows/:id/logs - Get execution logs
router.get('/workflows/:id/logs', (req, res) => {
  initControllers();
  workflowController.getExecutionLogs(req, res);
});

// ==========================================
// TEMPLATES ROUTES
// ==========================================

// GET /api/automation/templates - List all workflow templates
router.get('/templates', async (req, res) => {
  try {
    const db = getAutomationDbPool();
    const result = await db.query(`
      SELECT * FROM workflow_templates
      WHERE is_public = true
      ORDER BY category, name
    `);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
});

// GET /api/automation/templates/:id - Get template by ID
router.get('/templates/:id', async (req, res) => {
  try {
    const db = getAutomationDbPool();
    const { id } = req.params;
    const result = await db.query('SELECT * FROM workflow_templates WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Template not found'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template',
      error: error.message
    });
  }
});

// ==========================================
// EVENTS ROUTES
// ==========================================

// GET /api/automation/events - List automation events
router.get('/events', async (req, res) => {
  try {
    const db = getAutomationDbPool();
    const tenantId = (req as any).user?.tenantId || 'default';
    const limit = parseInt(req.query.limit as string) || 100;
    const processed = req.query.processed as string;

    let query = `
      SELECT * FROM automation_events
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];

    if (processed !== undefined) {
      params.push(processed === 'true');
      query += ` AND processed = $${params.length}`;
    }

    query += ` ORDER BY triggered_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
});

// GET /api/automation/events/stats - Get event statistics
router.get('/events/stats', async (req, res) => {
  try {
    const db = getAutomationDbPool();
    const tenantId = (req as any).user?.tenantId || 'default';

    const result = await db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE processed = true) as processed,
        COUNT(*) FILTER (WHERE processed = false) as pending,
        COUNT(DISTINCT event_name) as unique_events
      FROM automation_events
      WHERE tenant_id = $1
    `, [tenantId]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching event stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event stats',
      error: error.message
    });
  }
});

// ==========================================
// NEW EVENT CONTROLLER ROUTES (v2)
// ==========================================

// GET /api/automation/events/v2 - List events with advanced filters (NEW)
router.get('/events/v2', (req, res) => {
  initControllers();
  eventController.findAll(req, res);
});

// GET /api/automation/events/v2/stats - Get event stats (NEW)
router.get('/events/v2/stats', (req, res) => {
  initControllers();
  eventController.getStats(req, res);
});

// GET /api/automation/events/v2/types - Get event types (NEW)
router.get('/events/v2/types', (req, res) => {
  initControllers();
  eventController.getEventTypes(req, res);
});

// DELETE /api/automation/events/v2/cleanup - Cleanup old events (NEW)
router.delete('/events/v2/cleanup', (req, res) => {
  initControllers();
  eventController.cleanup(req, res);
});

// GET /api/automation/events/v2/:id - Get event by ID (NEW)
// IMPORTANT: This must come AFTER all specific routes to avoid matching "stats", "types", etc. as IDs
router.get('/events/v2/:id', (req, res) => {
  initControllers();
  eventController.findById(req, res);
});

// ==========================================
// INTEGRATIONS ROUTES (NEW)
// ==========================================

// GET /api/automation/integrations - List integrations
router.get('/integrations', (req, res) => {
  initControllers();
  integrationController.findAll(req, res);
});

// GET /api/automation/integrations/:id - Get integration by ID
router.get('/integrations/:id', (req, res) => {
  initControllers();
  integrationController.findById(req, res);
});

// POST /api/automation/integrations - Create integration
router.post('/integrations', (req, res) => {
  initControllers();
  integrationController.create(req, res);
});

// PUT /api/automation/integrations/:id - Update integration
router.put('/integrations/:id', (req, res) => {
  initControllers();
  integrationController.update(req, res);
});

// DELETE /api/automation/integrations/:id - Delete integration
router.delete('/integrations/:id', (req, res) => {
  initControllers();
  integrationController.delete(req, res);
});

// POST /api/automation/integrations/:id/test - Test integration
router.post('/integrations/:id/test', (req, res) => {
  initControllers();
  integrationController.test(req, res);
});

export default router;
