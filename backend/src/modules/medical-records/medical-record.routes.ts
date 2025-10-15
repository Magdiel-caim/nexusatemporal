import { Router } from 'express';
import medicalRecordController from './medical-record.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// ========== PRONTUÁRIOS ==========
router.post('/', medicalRecordController.createMedicalRecord.bind(medicalRecordController));
router.get('/', medicalRecordController.getAllMedicalRecords.bind(medicalRecordController));
router.get('/:id', medicalRecordController.getMedicalRecordById.bind(medicalRecordController));
router.get('/:id/complete', medicalRecordController.getMedicalRecordComplete.bind(medicalRecordController));
router.get('/lead/:leadId', medicalRecordController.getMedicalRecordByLeadId.bind(medicalRecordController));
router.put('/:id', medicalRecordController.updateMedicalRecord.bind(medicalRecordController));
router.delete('/:id', medicalRecordController.deleteMedicalRecord.bind(medicalRecordController));

// ========== ANAMNESE ==========
router.post('/anamnesis', medicalRecordController.createAnamnesis.bind(medicalRecordController));
router.get('/:medicalRecordId/anamnesis', medicalRecordController.getAnamnesisListByMedicalRecord.bind(medicalRecordController));
router.get('/anamnesis/:id', medicalRecordController.getAnamnesisById.bind(medicalRecordController));

// ========== HISTÓRICO DE PROCEDIMENTOS ==========
router.post('/procedure-history', medicalRecordController.createProcedureHistory.bind(medicalRecordController));
router.get('/:medicalRecordId/procedure-history', medicalRecordController.getProcedureHistoryByMedicalRecord.bind(medicalRecordController));
router.get('/procedure-history/:id', medicalRecordController.getProcedureHistoryById.bind(medicalRecordController));

export default router;
