"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medical_record_controller_1 = __importDefault(require("./medical-record.controller"));
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Todas as rotas requerem autenticação
router.use(auth_middleware_1.authenticate);
// ========== PRONTUÁRIOS ==========
router.post('/', medical_record_controller_1.default.createMedicalRecord.bind(medical_record_controller_1.default));
router.get('/', medical_record_controller_1.default.getAllMedicalRecords.bind(medical_record_controller_1.default));
router.get('/:id', medical_record_controller_1.default.getMedicalRecordById.bind(medical_record_controller_1.default));
router.get('/:id/complete', medical_record_controller_1.default.getMedicalRecordComplete.bind(medical_record_controller_1.default));
router.get('/lead/:leadId', medical_record_controller_1.default.getMedicalRecordByLeadId.bind(medical_record_controller_1.default));
router.put('/:id', medical_record_controller_1.default.updateMedicalRecord.bind(medical_record_controller_1.default));
router.delete('/:id', medical_record_controller_1.default.deleteMedicalRecord.bind(medical_record_controller_1.default));
// ========== ANAMNESE ==========
router.post('/anamnesis', medical_record_controller_1.default.createAnamnesis.bind(medical_record_controller_1.default));
router.get('/:medicalRecordId/anamnesis', medical_record_controller_1.default.getAnamnesisListByMedicalRecord.bind(medical_record_controller_1.default));
router.get('/anamnesis/:id', medical_record_controller_1.default.getAnamnesisById.bind(medical_record_controller_1.default));
// ========== HISTÓRICO DE PROCEDIMENTOS ==========
router.post('/procedure-history', medical_record_controller_1.default.createProcedureHistory.bind(medical_record_controller_1.default));
router.get('/:medicalRecordId/procedure-history', medical_record_controller_1.default.getProcedureHistoryByMedicalRecord.bind(medical_record_controller_1.default));
router.get('/procedure-history/:id', medical_record_controller_1.default.getProcedureHistoryById.bind(medical_record_controller_1.default));
exports.default = router;
//# sourceMappingURL=medical-record.routes.js.map