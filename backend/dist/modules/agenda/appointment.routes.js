"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = __importDefault(require("./appointment.controller"));
const search_patients_controller_1 = __importDefault(require("./search-patients.controller"));
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Todas as rotas requerem autenticação
router.use(auth_middleware_1.authenticate);
// Rotas principais
router.post('/', appointment_controller_1.default.create.bind(appointment_controller_1.default));
router.get('/', appointment_controller_1.default.findAll.bind(appointment_controller_1.default));
router.get('/today', appointment_controller_1.default.findToday.bind(appointment_controller_1.default));
// Rotas de busca e disponibilidade (devem vir antes de /:id para não conflitar)
router.get('/search-patients', search_patients_controller_1.default.searchPatients.bind(search_patients_controller_1.default));
router.post('/check-availability', appointment_controller_1.default.checkAvailability.bind(appointment_controller_1.default));
router.get('/occupied-slots', appointment_controller_1.default.getOccupiedSlots.bind(appointment_controller_1.default));
router.get('/available-slots', appointment_controller_1.default.getAvailableSlots.bind(appointment_controller_1.default));
router.get('/:id', appointment_controller_1.default.findById.bind(appointment_controller_1.default));
// Rotas por relacionamento
router.get('/lead/:leadId', appointment_controller_1.default.findByLead.bind(appointment_controller_1.default));
router.get('/professional/:professionalId', appointment_controller_1.default.findByProfessional.bind(appointment_controller_1.default));
// Rotas de ação
router.put('/:id', appointment_controller_1.default.update.bind(appointment_controller_1.default));
router.post('/:id/confirm-payment', appointment_controller_1.default.confirmPayment.bind(appointment_controller_1.default));
router.post('/:id/send-anamnesis', appointment_controller_1.default.sendAnamnesis.bind(appointment_controller_1.default));
router.post('/:id/confirm', appointment_controller_1.default.confirm.bind(appointment_controller_1.default));
router.post('/:id/check-in', appointment_controller_1.default.checkIn.bind(appointment_controller_1.default));
router.post('/:id/start', appointment_controller_1.default.startAttendance.bind(appointment_controller_1.default));
router.post('/:id/finalize', appointment_controller_1.default.finalizeAttendance.bind(appointment_controller_1.default));
router.delete('/:id', appointment_controller_1.default.cancel.bind(appointment_controller_1.default));
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map