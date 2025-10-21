"use strict";
/**
 * CONTRATO: Event Emitter
 *
 * Sistema centralizado de emissão de eventos para automações.
 *
 * SESSÃO A: Implementará o EventEmitter e integrará nos módulos
 * SESSÃO B: NÃO PRECISA TOCAR - Sessão A fará integração
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * EVENTOS DO SISTEMA:
 *
 * Leads:
 * - lead.created
 * - lead.updated
 * - lead.deleted
 * - lead.stage_changed
 * - lead.assigned
 *
 * Appointments:
 * - appointment.created
 * - appointment.updated
 * - appointment.deleted
 * - appointment.confirmed
 * - appointment.cancelled
 * - appointment.completed
 * - appointment.reminder_sent
 *
 * Payments:
 * - payment.created
 * - payment.updated
 * - payment.confirmed
 * - payment.failed
 * - payment.refunded
 *
 * WhatsApp:
 * - whatsapp.message_received
 * - whatsapp.message_sent
 * - whatsapp.message_failed
 * - whatsapp.session_connected
 * - whatsapp.session_disconnected
 *
 * Users:
 * - user.created
 * - user.updated
 * - user.login
 * - user.logout
 */
/**
 * EXEMPLO DE USO (Sessão A implementará):
 *
 * // No LeadsService
 * await this.eventEmitter.emitAutomationEvent({
 *   tenantId: lead.tenantId,
 *   eventType: 'lead.created',
 *   entityType: 'lead',
 *   entityId: lead.id,
 *   action: 'created',
 *   data: { lead },
 *   metadata: { source: 'api', userId: user.id }
 * });
 */
//# sourceMappingURL=IEventEmitter.js.map