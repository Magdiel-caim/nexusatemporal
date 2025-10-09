"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineService = void 0;
const data_source_1 = require("@/database/data-source");
const pipeline_entity_1 = require("./pipeline.entity");
const stage_entity_1 = require("./stage.entity");
class PipelineService {
    pipelineRepository = data_source_1.AppDataSource.getRepository(pipeline_entity_1.Pipeline);
    stageRepository = data_source_1.AppDataSource.getRepository(stage_entity_1.Stage);
    async createPipeline(data) {
        const pipeline = this.pipelineRepository.create({
            name: data.name,
            description: data.description,
            tenantId: data.tenantId,
            color: data.color,
        });
        const savedPipeline = await this.pipelineRepository.save(pipeline);
        // Create default stages if provided
        if (data.stages && data.stages.length > 0) {
            const stages = data.stages.map((stageData) => this.stageRepository.create({
                ...stageData,
                pipelineId: savedPipeline.id,
            }));
            await this.stageRepository.save(stages);
        }
        return this.pipelineRepository.findOne({
            where: { id: savedPipeline.id },
            relations: ['stages'],
        });
    }
    async getPipelinesByTenant(tenantId) {
        return this.pipelineRepository.find({
            where: { tenantId, isActive: true },
            relations: ['stages'],
            order: { order: 'ASC', stages: { order: 'ASC' } },
        });
    }
    async getPipelineById(id, tenantId) {
        return this.pipelineRepository.findOne({
            where: { id, tenantId },
            relations: ['stages', 'stages.leads'],
        });
    }
    async updatePipeline(id, tenantId, data) {
        await this.pipelineRepository.update({ id, tenantId }, data);
        return this.getPipelineById(id, tenantId);
    }
    async deletePipeline(id, tenantId) {
        const pipeline = await this.pipelineRepository.findOne({
            where: { id, tenantId },
        });
        if (!pipeline) {
            throw new Error('Pipeline not found');
        }
        // Soft delete
        await this.pipelineRepository.update({ id }, { isActive: false });
        return { success: true };
    }
    // Stage operations
    async createStage(data) {
        const stage = this.stageRepository.create(data);
        return this.stageRepository.save(stage);
    }
    async updateStage(id, data) {
        await this.stageRepository.update({ id }, data);
        return this.stageRepository.findOne({ where: { id } });
    }
    async deleteStage(id) {
        // Check if stage has leads
        const stage = await this.stageRepository.findOne({
            where: { id },
            relations: ['leads'],
        });
        if (!stage) {
            throw new Error('Stage not found');
        }
        if (stage.leads && stage.leads.length > 0) {
            throw new Error('Cannot delete stage with existing leads');
        }
        await this.stageRepository.delete({ id });
        return { success: true };
    }
    async reorderStages(stageOrders) {
        const promises = stageOrders.map(({ id, order }) => this.stageRepository.update({ id }, { order }));
        await Promise.all(promises);
        return { success: true };
    }
}
exports.PipelineService = PipelineService;
//# sourceMappingURL=pipeline.service.js.map