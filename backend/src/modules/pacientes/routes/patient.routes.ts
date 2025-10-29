import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';

const router = Router();
const patientController = new PatientController();

// Todas as rotas requerem autenticação
router.use(authenticate);

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
router.post(
  '/:id/imagens',
  patientController.uploadMiddleware,
  patientController.uploadImage
);
router.get('/:id/imagens', patientController.getImages);

// ========== PRONTUÁRIOS DO PACIENTE ==========
router.get('/:id/prontuarios', patientController.getMedicalRecords);
router.post('/:id/prontuarios', patientController.createMedicalRecord);

export default router;
