import { Router } from 'express';
import publicAppointmentController from './public-appointment.controller';

const router = Router();

/**
 * Rotas públicas para integração externa
 * Estas rotas não requerem autenticação para consultas
 * Apenas a criação de agendamentos requer API key
 */

// Rotas públicas (sem autenticação)
router.get('/available-slots', publicAppointmentController.getAvailableSlots.bind(publicAppointmentController));
router.get('/occupied-slots', publicAppointmentController.getOccupiedSlots.bind(publicAppointmentController));
router.post('/check-availability', publicAppointmentController.checkAvailability.bind(publicAppointmentController));
router.get('/locations', publicAppointmentController.getLocations.bind(publicAppointmentController));

// Rota que requer API key
router.post('/', publicAppointmentController.createAppointment.bind(publicAppointmentController));

export default router;
