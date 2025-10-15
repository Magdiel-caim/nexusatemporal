"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecordController = void 0;
const medical_record_service_1 = __importDefault(require("./medical-record.service"));
class MedicalRecordController {
    // ========== PRONTUÁRIOS ==========
    async createMedicalRecord(req, res) {
        try {
            const userId = req.user.userId;
            const tenantId = req.user.tenantId;
            const medicalRecord = await medical_record_service_1.default.createMedicalRecord(req.body, userId, tenantId);
            res.status(201).json({
                success: true,
                data: medicalRecord,
            });
        }
        catch (error) {
            console.error('Error creating medical record:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar prontuário',
                error: error.message,
            });
        }
    }
    async getMedicalRecordById(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user.tenantId;
            const medicalRecord = await medical_record_service_1.default.getMedicalRecordById(id, tenantId);
            if (!medicalRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Prontuário não encontrado',
                });
            }
            res.json({
                success: true,
                data: medicalRecord,
            });
        }
        catch (error) {
            console.error('Error getting medical record:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar prontuário',
                error: error.message,
            });
        }
    }
    async getMedicalRecordByLeadId(req, res) {
        try {
            const { leadId } = req.params;
            const tenantId = req.user.tenantId;
            const medicalRecord = await medical_record_service_1.default.getMedicalRecordByLeadId(leadId, tenantId);
            if (!medicalRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Prontuário não encontrado para este lead',
                });
            }
            res.json({
                success: true,
                data: medicalRecord,
            });
        }
        catch (error) {
            console.error('Error getting medical record by lead:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar prontuário',
                error: error.message,
            });
        }
    }
    async getMedicalRecordComplete(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user.tenantId;
            const medicalRecord = await medical_record_service_1.default.getMedicalRecordComplete(id, tenantId);
            if (!medicalRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Prontuário não encontrado',
                });
            }
            res.json({
                success: true,
                data: medicalRecord,
            });
        }
        catch (error) {
            console.error('Error getting complete medical record:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar prontuário completo',
                error: error.message,
            });
        }
    }
    async getAllMedicalRecords(req, res) {
        try {
            const tenantId = req.user.tenantId;
            const medicalRecords = await medical_record_service_1.default.getAllMedicalRecords(tenantId);
            res.json({
                success: true,
                data: medicalRecords,
            });
        }
        catch (error) {
            console.error('Error getting medical records:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar prontuários',
                error: error.message,
            });
        }
    }
    async updateMedicalRecord(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const tenantId = req.user.tenantId;
            const medicalRecord = await medical_record_service_1.default.updateMedicalRecord(id, req.body, userId, tenantId);
            if (!medicalRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Prontuário não encontrado',
                });
            }
            res.json({
                success: true,
                data: medicalRecord,
            });
        }
        catch (error) {
            console.error('Error updating medical record:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar prontuário',
                error: error.message,
            });
        }
    }
    async deleteMedicalRecord(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user.tenantId;
            const deleted = await medical_record_service_1.default.deleteMedicalRecord(id, tenantId);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Prontuário não encontrado',
                });
            }
            res.json({
                success: true,
                message: 'Prontuário excluído com sucesso',
            });
        }
        catch (error) {
            console.error('Error deleting medical record:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao excluir prontuário',
                error: error.message,
            });
        }
    }
    // ========== ANAMNESE ==========
    async createAnamnesis(req, res) {
        try {
            const userId = req.user.userId;
            const tenantId = req.user.tenantId;
            const anamnesis = await medical_record_service_1.default.createAnamnesis(req.body, userId, tenantId);
            res.status(201).json({
                success: true,
                data: anamnesis,
            });
        }
        catch (error) {
            console.error('Error creating anamnesis:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar anamnese',
                error: error.message,
            });
        }
    }
    async getAnamnesisListByMedicalRecord(req, res) {
        try {
            const { medicalRecordId } = req.params;
            const tenantId = req.user.tenantId;
            const anamnesisList = await medical_record_service_1.default.getAnamnesisListByMedicalRecord(medicalRecordId, tenantId);
            res.json({
                success: true,
                data: anamnesisList,
            });
        }
        catch (error) {
            console.error('Error getting anamnesis list:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar anamneses',
                error: error.message,
            });
        }
    }
    async getAnamnesisById(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user.tenantId;
            const anamnesis = await medical_record_service_1.default.getAnamnesisById(id, tenantId);
            if (!anamnesis) {
                return res.status(404).json({
                    success: false,
                    message: 'Anamnese não encontrada',
                });
            }
            res.json({
                success: true,
                data: anamnesis,
            });
        }
        catch (error) {
            console.error('Error getting anamnesis:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar anamnese',
                error: error.message,
            });
        }
    }
    // ========== HISTÓRICO DE PROCEDIMENTOS ==========
    async createProcedureHistory(req, res) {
        try {
            const tenantId = req.user.tenantId;
            const procedureHistory = await medical_record_service_1.default.createProcedureHistory(req.body, tenantId);
            res.status(201).json({
                success: true,
                data: procedureHistory,
            });
        }
        catch (error) {
            console.error('Error creating procedure history:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar histórico de procedimento',
                error: error.message,
            });
        }
    }
    async getProcedureHistoryByMedicalRecord(req, res) {
        try {
            const { medicalRecordId } = req.params;
            const tenantId = req.user.tenantId;
            const procedureHistory = await medical_record_service_1.default.getProcedureHistoryByMedicalRecord(medicalRecordId, tenantId);
            res.json({
                success: true,
                data: procedureHistory,
            });
        }
        catch (error) {
            console.error('Error getting procedure history:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar histórico de procedimentos',
                error: error.message,
            });
        }
    }
    async getProcedureHistoryById(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.user.tenantId;
            const procedureHistory = await medical_record_service_1.default.getProcedureHistoryById(id, tenantId);
            if (!procedureHistory) {
                return res.status(404).json({
                    success: false,
                    message: 'Histórico de procedimento não encontrado',
                });
            }
            res.json({
                success: true,
                data: procedureHistory,
            });
        }
        catch (error) {
            console.error('Error getting procedure history:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar histórico de procedimento',
                error: error.message,
            });
        }
    }
}
exports.MedicalRecordController = MedicalRecordController;
exports.default = new MedicalRecordController();
//# sourceMappingURL=medical-record.controller.js.map