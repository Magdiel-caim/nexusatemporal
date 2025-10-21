"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_appointment_controller_1 = __importDefault(require("./public-appointment.controller"));
const router = (0, express_1.Router)();
/**
 * Rotas públicas para integração externa
 * Estas rotas não requerem autenticação para consultas
 * Apenas a criação de agendamentos requer API key
 */
// Rotas públicas (sem autenticação)
router.get('/available-slots', public_appointment_controller_1.default.getAvailableSlots.bind(public_appointment_controller_1.default));
router.get('/occupied-slots', public_appointment_controller_1.default.getOccupiedSlots.bind(public_appointment_controller_1.default));
router.post('/check-availability', public_appointment_controller_1.default.checkAvailability.bind(public_appointment_controller_1.default));
router.get('/locations', public_appointment_controller_1.default.getLocations.bind(public_appointment_controller_1.default));
// Rota que requer API key
router.post('/', public_appointment_controller_1.default.createAppointment.bind(public_appointment_controller_1.default));
exports.default = router;
//# sourceMappingURL=public-appointment.routes.js.map