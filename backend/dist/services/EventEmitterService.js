"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitterService = exports.AutomationEventType = void 0;
exports.getEventEmitterService = getEventEmitterService;
const RabbitMQService_1 = require("./RabbitMQService");
/**
 * Event types supported by the automation system
 */
var AutomationEventType;
(function (AutomationEventType) {
    // Lead events
    AutomationEventType["LEAD_CREATED"] = "lead.created";
    AutomationEventType["LEAD_UPDATED"] = "lead.updated";
    AutomationEventType["LEAD_STATUS_CHANGED"] = "lead.status.changed";
    AutomationEventType["LEAD_ASSIGNED"] = "lead.assigned";
    AutomationEventType["LEAD_CONVERTED"] = "lead.converted";
    // Appointment events
    AutomationEventType["APPOINTMENT_SCHEDULED"] = "appointment.scheduled";
    AutomationEventType["APPOINTMENT_CONFIRMED"] = "appointment.confirmed";
    AutomationEventType["APPOINTMENT_CANCELLED"] = "appointment.cancelled";
    AutomationEventType["APPOINTMENT_COMPLETED"] = "appointment.completed";
    AutomationEventType["APPOINTMENT_NO_SHOW"] = "appointment.no_show";
    AutomationEventType["APPOINTMENT_RESCHEDULED"] = "appointment.rescheduled";
    // Payment events
    AutomationEventType["PAYMENT_RECEIVED"] = "payment.received";
    AutomationEventType["PAYMENT_PENDING"] = "payment.pending";
    AutomationEventType["PAYMENT_OVERDUE"] = "payment.overdue";
    AutomationEventType["PAYMENT_FAILED"] = "payment.failed";
    // Client events
    AutomationEventType["CLIENT_BIRTHDAY"] = "client.birthday";
    AutomationEventType["CLIENT_INACTIVE"] = "client.inactive";
    AutomationEventType["CLIENT_REACTIVATED"] = "client.reactivated";
    // WhatsApp events
    AutomationEventType["WHATSAPP_MESSAGE_RECEIVED"] = "whatsapp.message.received";
    AutomationEventType["WHATSAPP_MESSAGE_SENT"] = "whatsapp.message.sent";
    // Custom events
    AutomationEventType["CUSTOM_EVENT"] = "custom.event";
})(AutomationEventType || (exports.AutomationEventType = AutomationEventType = {}));
class EventEmitterService {
    rabbitMQ = (0, RabbitMQService_1.getRabbitMQService)();
    exchangeName = 'nexus.automation.events';
    db;
    constructor(dbPool) {
        this.db = dbPool;
    }
    /**
     * Initialize the event emitter (connect to RabbitMQ)
     */
    async initialize() {
        try {
            if (!this.rabbitMQ.isConnected()) {
                await this.rabbitMQ.connect();
            }
            console.log('[EventEmitter] ✅ Initialized successfully');
        }
        catch (error) {
            console.error('[EventEmitter] Failed to initialize:', error);
            throw error;
        }
    }
    /**
     * Emit an automation event
     */
    async emit(eventData) {
        try {
            const completeEventData = {
                ...eventData,
                timestamp: new Date()
            };
            // 1. Save event to database (automation_events table)
            await this.saveEventToDatabase(completeEventData);
            // 2. Publish to RabbitMQ exchange
            const routingKey = eventData.eventType.replace(/\./g, '.');
            await this.rabbitMQ.publishToExchange(this.exchangeName, routingKey, completeEventData, 'topic');
            console.log(`[EventEmitter] ✅ Event emitted: ${eventData.eventType}`, {
                entityType: eventData.entityType,
                entityId: eventData.entityId,
                tenantId: eventData.tenantId
            });
        }
        catch (error) {
            console.error('[EventEmitter] Error emitting event:', error);
            // Don't throw - we don't want to break the main flow if event emission fails
        }
    }
    /**
     * Save event to database for audit and processing
     */
    async saveEventToDatabase(eventData) {
        const query = `
      INSERT INTO automation_events (
        tenant_id,
        event_name,
        event_data,
        entity_type,
        entity_id,
        processed,
        triggered_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
        const values = [
            eventData.tenantId,
            eventData.eventType,
            JSON.stringify(eventData.data),
            eventData.entityType,
            eventData.entityId,
            false, // not processed yet
            eventData.timestamp || new Date()
        ];
        try {
            const result = await this.db.query(query, values);
            console.log(`[EventEmitter] Event saved to database with ID: ${result.rows[0].id}`);
        }
        catch (error) {
            console.error('[EventEmitter] Error saving event to database:', error);
            throw error;
        }
    }
    /**
     * Convenience methods for common events
     */
    async emitLeadCreated(tenantId, leadId, leadData) {
        await this.emit({
            eventType: AutomationEventType.LEAD_CREATED,
            tenantId,
            entityType: 'lead',
            entityId: leadId,
            data: leadData
        });
    }
    async emitLeadStatusChanged(tenantId, leadId, oldStatus, newStatus, leadData) {
        await this.emit({
            eventType: AutomationEventType.LEAD_STATUS_CHANGED,
            tenantId,
            entityType: 'lead',
            entityId: leadId,
            data: {
                ...leadData,
                oldStatus,
                newStatus
            }
        });
    }
    async emitAppointmentScheduled(tenantId, appointmentId, appointmentData) {
        await this.emit({
            eventType: AutomationEventType.APPOINTMENT_SCHEDULED,
            tenantId,
            entityType: 'appointment',
            entityId: appointmentId,
            data: appointmentData
        });
    }
    async emitAppointmentCompleted(tenantId, appointmentId, appointmentData) {
        await this.emit({
            eventType: AutomationEventType.APPOINTMENT_COMPLETED,
            tenantId,
            entityType: 'appointment',
            entityId: appointmentId,
            data: appointmentData
        });
    }
    async emitPaymentOverdue(tenantId, paymentId, paymentData) {
        await this.emit({
            eventType: AutomationEventType.PAYMENT_OVERDUE,
            tenantId,
            entityType: 'payment',
            entityId: paymentId,
            data: paymentData
        });
    }
    async emitWhatsAppMessageReceived(tenantId, messageId, messageData) {
        await this.emit({
            eventType: AutomationEventType.WHATSAPP_MESSAGE_RECEIVED,
            tenantId,
            entityType: 'whatsapp_message',
            entityId: messageId,
            data: messageData
        });
    }
    /**
     * Close connections
     */
    async close() {
        await this.rabbitMQ.close();
        console.log('[EventEmitter] Closed');
    }
}
exports.EventEmitterService = EventEmitterService;
// Singleton instance
let eventEmitterInstance = null;
function getEventEmitterService(dbPool) {
    if (!eventEmitterInstance) {
        eventEmitterInstance = new EventEmitterService(dbPool);
    }
    return eventEmitterInstance;
}
//# sourceMappingURL=EventEmitterService.js.map