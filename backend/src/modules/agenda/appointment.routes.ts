import { Router } from 'express';
import appointmentController from './appointment.controller';
import searchPatientsController from './search-patients.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas principais
router.post('/', appointmentController.create.bind(appointmentController));
router.get('/', appointmentController.findAll.bind(appointmentController));
router.get('/today', appointmentController.findToday.bind(appointmentController));

// Rotas de busca e disponibilidade (devem vir antes de /:id para não conflitar)
router.get('/search-patients', searchPatientsController.searchPatients.bind(searchPatientsController));
router.post('/check-availability', appointmentController.checkAvailability.bind(appointmentController));
router.get('/occupied-slots', appointmentController.getOccupiedSlots.bind(appointmentController));
router.get('/available-slots', appointmentController.getAvailableSlots.bind(appointmentController));

router.get('/:id', appointmentController.findById.bind(appointmentController));

// Rotas por relacionamento
router.get('/lead/:leadId', appointmentController.findByLead.bind(appointmentController));
router.get('/professional/:professionalId', appointmentController.findByProfessional.bind(appointmentController));

// Rotas de ação
router.put('/:id', appointmentController.update.bind(appointmentController));
router.post('/:id/confirm-payment', appointmentController.confirmPayment.bind(appointmentController));
router.post('/:id/send-anamnesis', appointmentController.sendAnamnesis.bind(appointmentController));
router.post('/:id/confirm', appointmentController.confirm.bind(appointmentController));
router.post('/:id/check-in', appointmentController.checkIn.bind(appointmentController));
router.post('/:id/start', appointmentController.startAttendance.bind(appointmentController));
router.post('/:id/finalize', appointmentController.finalizeAttendance.bind(appointmentController));
router.delete('/:id', appointmentController.cancel.bind(appointmentController));

export default router;
