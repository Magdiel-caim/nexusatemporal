import { Router } from 'express';
import { LeadController } from './lead.controller';
import { PipelineController } from './pipeline.controller';
import { ProcedureController } from './procedure.controller';
import { authenticate } from '@/shared/middleware/auth.middleware';

const router = Router();
const leadController = new LeadController();
const pipelineController = new PipelineController();
const procedureController = new ProcedureController();

// All routes require authentication
router.use(authenticate);

// Pipeline routes
router.post('/pipelines', pipelineController.createPipeline);
router.get('/pipelines', pipelineController.getPipelines);
router.get('/pipelines/:id', pipelineController.getPipeline);
router.put('/pipelines/:id', pipelineController.updatePipeline);
router.delete('/pipelines/:id', pipelineController.deletePipeline);

// Stage routes
router.post('/stages', pipelineController.createStage);
router.put('/stages/:id', pipelineController.updateStage);
router.delete('/stages/:id', pipelineController.deleteStage);
router.post('/stages/reorder', pipelineController.reorderStages);

// Lead routes
router.post('/leads', leadController.createLead);
router.get('/leads', leadController.getLeads);
router.get('/leads/stats', leadController.getLeadStats);
router.get('/leads/:id', leadController.getLead);
router.put('/leads/:id', leadController.updateLead);
router.delete('/leads/:id', leadController.deleteLead);
router.post('/leads/:id/move', leadController.moveLeadToStage);
router.post('/leads/bulk-update', leadController.bulkUpdateLeads);

// Activity routes
router.post('/leads/:id/activities', leadController.createActivity);
router.get('/leads/:id/activities', leadController.getLeadActivities);
router.put('/activities/:activityId/complete', leadController.completeActivity);

// Procedure routes
router.post('/procedures', procedureController.createProcedure);
router.get('/procedures', procedureController.getProcedures);
router.get('/procedures/:id', procedureController.getProcedure);
router.put('/procedures/:id', procedureController.updateProcedure);
router.delete('/procedures/:id', procedureController.deleteProcedure);

export default router;
