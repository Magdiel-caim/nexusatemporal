import { CrmDataSource } from '@/database/data-source';
import { Procedure } from './procedure.entity';
import { Repository } from 'typeorm';

class ProcedureService {
  private procedureRepository: Repository<Procedure>;

  constructor() {
    this.procedureRepository = CrmDataSource.getRepository(Procedure);
  }

  async getProcedures(tenantId: string): Promise<Procedure[]> {
    return await this.procedureRepository.find({
      where: { tenantId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getProcedure(id: string, tenantId: string): Promise<Procedure | null> {
    return await this.procedureRepository.findOne({
      where: { id, tenantId },
    });
  }

  async createProcedure(data: Partial<Procedure>): Promise<Procedure> {
    const procedure = this.procedureRepository.create(data);
    return await this.procedureRepository.save(procedure);
  }

  async updateProcedure(
    id: string,
    tenantId: string,
    data: Partial<Procedure>
  ): Promise<Procedure | null> {
    await this.procedureRepository.update({ id, tenantId }, data);
    return await this.getProcedure(id, tenantId);
  }

  async deleteProcedure(id: string, tenantId: string): Promise<boolean> {
    // Soft delete
    const result = await this.procedureRepository.update(
      { id, tenantId },
      { isActive: false }
    );
    return result.affected ? result.affected > 0 : false;
  }
}

export const procedureService = new ProcedureService();
