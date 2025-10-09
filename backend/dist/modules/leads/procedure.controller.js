"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcedureController = void 0;
const procedure_service_1 = require("./procedure.service");
class ProcedureController {
    async getProcedures(req, res) {
        try {
            const { tenantId } = req.user;
            const procedures = await procedure_service_1.procedureService.getProcedures(tenantId);
            return res.json(procedures);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    async getProcedure(req, res) {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const procedure = await procedure_service_1.procedureService.getProcedure(id, tenantId);
            if (!procedure) {
                return res.status(404).json({ message: 'Procedure not found' });
            }
            return res.json(procedure);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    async createProcedure(req, res) {
        try {
            const { tenantId, userId } = req.user;
            const procedure = await procedure_service_1.procedureService.createProcedure({
                ...req.body,
                tenantId,
            });
            return res.status(201).json(procedure);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    async updateProcedure(req, res) {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const procedure = await procedure_service_1.procedureService.updateProcedure(id, tenantId, req.body);
            if (!procedure) {
                return res.status(404).json({ message: 'Procedure not found' });
            }
            return res.json(procedure);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    async deleteProcedure(req, res) {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const success = await procedure_service_1.procedureService.deleteProcedure(id, tenantId);
            if (!success) {
                return res.status(404).json({ message: 'Procedure not found' });
            }
            return res.status(204).send();
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}
exports.ProcedureController = ProcedureController;
//# sourceMappingURL=procedure.controller.js.map