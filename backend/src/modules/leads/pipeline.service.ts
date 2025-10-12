import { CrmDataSource } from '@/database/data-source';
import { Pipeline } from './pipeline.entity';
import { Stage } from './stage.entity';

export class PipelineService {
  private pipelineRepository = CrmDataSource.getRepository(Pipeline);
  private stageRepository = CrmDataSource.getRepository(Stage);

  async createPipeline(data: {
    name: string;
    description?: string;
    tenantId: string;
    color?: string;
    stages?: Array<{ name: string; order: number; probability?: number; color?: string }>;
  }) {
    const pipeline = this.pipelineRepository.create({
      name: data.name,
      description: data.description,
      tenantId: data.tenantId,
      color: data.color,
    });

    const savedPipeline = await this.pipelineRepository.save(pipeline);

    // Create default stages if provided
    if (data.stages && data.stages.length > 0) {
      const stages = data.stages.map((stageData) =>
        this.stageRepository.create({
          ...stageData,
          pipelineId: savedPipeline.id,
        })
      );
      await this.stageRepository.save(stages);
    }

    return this.pipelineRepository.findOne({
      where: { id: savedPipeline.id },
      relations: ['stages'],
    });
  }

  async getPipelinesByTenant(tenantId: string) {
    return this.pipelineRepository.find({
      where: { tenantId, isActive: true },
      relations: ['stages'],
      order: { order: 'ASC', stages: { order: 'ASC' } },
    });
  }

  async getPipelineById(id: string, tenantId: string) {
    return this.pipelineRepository.findOne({
      where: { id, tenantId },
      relations: ['stages', 'stages.leads'],
    });
  }

  async updatePipeline(
    id: string,
    tenantId: string,
    data: Partial<Pipeline>
  ) {
    await this.pipelineRepository.update({ id, tenantId }, data);
    return this.getPipelineById(id, tenantId);
  }

  async deletePipeline(id: string, tenantId: string) {
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
  async createStage(data: {
    name: string;
    pipelineId: string;
    order: number;
    probability?: number;
    color?: string;
    description?: string;
  }) {
    const stage = this.stageRepository.create(data);
    return this.stageRepository.save(stage);
  }

  async updateStage(id: string, data: Partial<Stage>) {
    await this.stageRepository.update({ id }, data);
    return this.stageRepository.findOne({ where: { id } });
  }

  async deleteStage(id: string) {
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

  async reorderStages(stageOrders: Array<{ id: string; order: number }>) {
    const promises = stageOrders.map(({ id, order }) =>
      this.stageRepository.update({ id }, { order })
    );
    await Promise.all(promises);
    return { success: true };
  }
}
