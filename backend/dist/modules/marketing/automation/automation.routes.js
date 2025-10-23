"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trigger_controller_1 = require("./trigger.controller");
const workflow_controller_1 = require("./workflow.controller");
const event_controller_1 = require("./event.controller");
const integration_controller_1 = require("./integration.controller");
const database_1 = require("./database");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// All automation routes require authentication
router.use(auth_middleware_1.authenticate);
// Initialize database pool from CrmDataSource (lazy initialization)
let triggerController;
let workflowController;
let eventController;
let integrationController;
const initControllers = () => {
    if (!triggerController) {
        const db = (0, database_1.getAutomationDbPool)();
        triggerController = new trigger_controller_1.TriggerController(db);
        workflowController = new workflow_controller_1.WorkflowController(db);
        eventController = new event_controller_1.EventController(db);
        integrationController = new integration_controller_1.IntegrationController(db);
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
        const db = (0, database_1.getAutomationDbPool)();
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
    }
    catch (error) {
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
        const db = (0, database_1.getAutomationDbPool)();
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
    }
    catch (error) {
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
        const db = (0, database_1.getAutomationDbPool)();
        const tenantId = req.user?.tenantId || 'default';
        const limit = parseInt(req.query.limit) || 100;
        const processed = req.query.processed;
        let query = `
      SELECT * FROM automation_events
      WHERE tenant_id = $1
    `;
        const params = [tenantId];
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
    }
    catch (error) {
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
        const db = (0, database_1.getAutomationDbPool)();
        const tenantId = req.user?.tenantId || 'default';
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
    }
    catch (error) {
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
exports.default = router;
//# sourceMappingURL=automation.routes.js.map