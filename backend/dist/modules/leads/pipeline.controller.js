"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineController = void 0;
const pipeline_service_1 = require("./pipeline.service");
class PipelineController {
    pipelineService = new pipeline_service_1.PipelineService();
    createPipeline = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const pipeline = await this.pipelineService.createPipeline({
                ...req.body,
                tenantId,
            });
            res.status(201).json(pipeline);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getPipelines = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const pipelines = await this.pipelineService.getPipelinesByTenant(tenantId);
            res.json(pipelines);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getPipeline = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const pipeline = await this.pipelineService.getPipelineById(id, tenantId);
            if (!pipeline) {
                return res.status(404).json({ error: 'Pipeline not found' });
            }
            res.json(pipeline);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    updatePipeline = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const pipeline = await this.pipelineService.updatePipeline(id, tenantId, req.body);
            res.json(pipeline);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    deletePipeline = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            await this.pipelineService.deletePipeline(id, tenantId);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    // Stage operations
    createStage = async (req, res) => {
        try {
            const stage = await this.pipelineService.createStage(req.body);
            res.status(201).json(stage);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    updateStage = async (req, res) => {
        try {
            const { id } = req.params;
            const stage = await this.pipelineService.updateStage(id, req.body);
            res.json(stage);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    deleteStage = async (req, res) => {
        try {
            const { id } = req.params;
            await this.pipelineService.deleteStage(id);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    reorderStages = async (req, res) => {
        try {
            const { stageOrders } = req.body;
            await this.pipelineService.reorderStages(stageOrders);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.PipelineController = PipelineController;
//# sourceMappingURL=pipeline.controller.js.map