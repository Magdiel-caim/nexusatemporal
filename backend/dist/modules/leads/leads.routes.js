"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lead_controller_1 = require("./lead.controller");
const pipeline_controller_1 = require("./pipeline.controller");
const procedure_controller_1 = require("./procedure.controller");
const auth_middleware_1 = require("@/shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
const leadController = new lead_controller_1.LeadController();
const pipelineController = new pipeline_controller_1.PipelineController();
const procedureController = new procedure_controller_1.ProcedureController();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
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
exports.default = router;
//# sourceMappingURL=leads.routes.js.map