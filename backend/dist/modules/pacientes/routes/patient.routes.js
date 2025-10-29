"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patient_controller_1 = require("../controllers/patient.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const check_datasource_middleware_1 = require("../middleware/check-datasource.middleware");
const router = (0, express_1.Router)();
const patientController = new patient_controller_1.PatientController();
// Todas as rotas requerem autenticação e banco de pacientes disponível
router.use(auth_middleware_1.authenticate);
router.use(check_datasource_middleware_1.checkPatientDataSource);
// ========== ESTATÍSTICAS ==========
// Deve vir ANTES das rotas com :id para não capturar "stats" como ID
router.get('/stats', patientController.getStats);
// ========== PACIENTES - CRUD ==========
router.get('/', patientController.getAll);
router.get('/:id', patientController.getById);
router.post('/', patientController.create);
router.put('/:id', patientController.update);
router.delete('/:id', patientController.delete);
// ========== IMAGENS DO PACIENTE ==========
router.post('/:id/imagens', patientController.uploadMiddleware, patientController.uploadImage);
router.get('/:id/imagens', patientController.getImages);
router.delete('/:id/imagens/:imageId', patientController.deleteImage);
// ========== PRONTUÁRIOS DO PACIENTE ==========
router.get('/:id/prontuarios', patientController.getMedicalRecords);
router.post('/:id/prontuarios', patientController.createMedicalRecord);
// ========== INTEGRAÇÕES COM OUTROS MÓDULOS ==========
router.get('/:id/agendamentos', patientController.getAppointments);
router.get('/:id/transacoes', patientController.getTransactions);
router.get('/:id/conversas', patientController.getConversations);
exports.default = router;
//# sourceMappingURL=patient.routes.js.map