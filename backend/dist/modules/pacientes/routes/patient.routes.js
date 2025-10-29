"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patient_controller_1 = require("../controllers/patient.controller");
const auth_middleware_1 = require("../../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
const patientController = new patient_controller_1.PatientController();
// Todas as rotas requerem autenticação
router.use(auth_middleware_1.authenticate);
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
exports.default = router;
//# sourceMappingURL=patient.routes.js.map