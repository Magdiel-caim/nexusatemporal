"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procedureService = void 0;
const data_source_1 = require("@/database/data-source");
const procedure_entity_1 = require("./procedure.entity");
class ProcedureService {
    procedureRepository;
    constructor() {
        this.procedureRepository = data_source_1.CrmDataSource.getRepository(procedure_entity_1.Procedure);
    }
    async getProcedures(tenantId) {
        return await this.procedureRepository.find({
            where: { tenantId, isActive: true },
            order: { name: 'ASC' },
        });
    }
    async getProcedure(id, tenantId) {
        return await this.procedureRepository.findOne({
            where: { id, tenantId },
        });
    }
    async createProcedure(data) {
        const procedure = this.procedureRepository.create(data);
        return await this.procedureRepository.save(procedure);
    }
    async updateProcedure(id, tenantId, data) {
        await this.procedureRepository.update({ id, tenantId }, data);
        return await this.getProcedure(id, tenantId);
    }
    async deleteProcedure(id, tenantId) {
        // Soft delete
        const result = await this.procedureRepository.update({ id, tenantId }, { isActive: false });
        return result.affected ? result.affected > 0 : false;
    }
}
exports.procedureService = new ProcedureService();
//# sourceMappingURL=procedure.service.js.map