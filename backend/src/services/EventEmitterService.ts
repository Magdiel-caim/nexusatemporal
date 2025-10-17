import { getRabbitMQService } from './RabbitMQService';
import { Pool } from 'pg';

/**
 * Event types supported by the automation system
 */
export enum AutomationEventType {
  // Lead events
  LEAD_CREATED = 'lead.created',
  LEAD_UPDATED = 'lead.updated',
  LEAD_STATUS_CHANGED = 'lead.status.changed',
  LEAD_ASSIGNED = 'lead.assigned',
  LEAD_CONVERTED = 'lead.converted',

  // Appointment events
  APPOINTMENT_SCHEDULED = 'appointment.scheduled',
  APPOINTMENT_CONFIRMED = 'appointment.confirmed',
  APPOINTMENT_CANCELLED = 'appointment.cancelled',
  APPOINTMENT_COMPLETED = 'appointment.completed',
  APPOINTMENT_NO_SHOW = 'appointment.no_show',
  APPOINTMENT_RESCHEDULED = 'appointment.rescheduled',

  // Payment events
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_PENDING = 'payment.pending',
  PAYMENT_OVERDUE = 'payment.overdue',
  PAYMENT_FAILED = 'payment.failed',

  // Client events
  CLIENT_BIRTHDAY = 'client.birthday',
  CLIENT_INACTIVE = 'client.inactive',
  CLIENT_REACTIVATED = 'client.reactivated',

  // WhatsApp events
  WHATSAPP_MESSAGE_RECEIVED = 'whatsapp.message.received',
  WHATSAPP_MESSAGE_SENT = 'whatsapp.message.sent',

  // Custom events
  CUSTOM_EVENT = 'custom.event'
}

export interface AutomationEventData {
  eventType: AutomationEventType | string;
  tenantId: string;
  entityType: string; // 'lead', 'appointment', 'payment', 'client', etc
  entityId: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export class EventEmitterService {
  private rabbitMQ = getRabbitMQService();
  private exchangeName = 'nexus.automation.events';
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  /**
   * Initialize the event emitter (connect to RabbitMQ)
   */
  async initialize(): Promise<void> {
    try {
      if (!this.rabbitMQ.isConnected()) {
        await this.rabbitMQ.connect();
      }
      console.log('[EventEmitter] ✅ Initialized successfully');
    } catch (error) {
      console.error('[EventEmitter] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Emit an automation event
   */
  async emit(eventData: Omit<AutomationEventData, 'timestamp'>): Promise<void> {
    try {
      const completeEventData: AutomationEventData = {
        ...eventData,
        timestamp: new Date()
      };

      // 1. Save event to database (automation_events table)
      await this.saveEventToDatabase(completeEventData);

      // 2. Publish to RabbitMQ exchange
      const routingKey = eventData.eventType.replace(/\./g, '.');
      await this.rabbitMQ.publishToExchange(
        this.exchangeName,
        routingKey,
        completeEventData,
        'topic'
      );

      console.log(`[EventEmitter] ✅ Event emitted: ${eventData.eventType}`, {
        entityType: eventData.entityType,
        entityId: eventData.entityId,
        tenantId: eventData.tenantId
      });
    } catch (error) {
      console.error('[EventEmitter] Error emitting event:', error);
      // Don't throw - we don't want to break the main flow if event emission fails
    }
  }

  /**
   * Save event to database for audit and processing
   */
  private async saveEventToDatabase(eventData: AutomationEventData): Promise<void> {
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
    } catch (error) {
      console.error('[EventEmitter] Error saving event to database:', error);
      throw error;
    }
  }

  /**
   * Convenience methods for common events
   */

  async emitLeadCreated(tenantId: string, leadId: string, leadData: any): Promise<void> {
    await this.emit({
      eventType: AutomationEventType.LEAD_CREATED,
      tenantId,
      entityType: 'lead',
      entityId: leadId,
      data: leadData
    });
  }

  async emitLeadStatusChanged(tenantId: string, leadId: string, oldStatus: string, newStatus: string, leadData: any): Promise<void> {
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

  async emitAppointmentScheduled(tenantId: string, appointmentId: string, appointmentData: any): Promise<void> {
    await this.emit({
      eventType: AutomationEventType.APPOINTMENT_SCHEDULED,
      tenantId,
      entityType: 'appointment',
      entityId: appointmentId,
      data: appointmentData
    });
  }

  async emitAppointmentCompleted(tenantId: string, appointmentId: string, appointmentData: any): Promise<void> {
    await this.emit({
      eventType: AutomationEventType.APPOINTMENT_COMPLETED,
      tenantId,
      entityType: 'appointment',
      entityId: appointmentId,
      data: appointmentData
    });
  }

  async emitPaymentOverdue(tenantId: string, paymentId: string, paymentData: any): Promise<void> {
    await this.emit({
      eventType: AutomationEventType.PAYMENT_OVERDUE,
      tenantId,
      entityType: 'payment',
      entityId: paymentId,
      data: paymentData
    });
  }

  async emitWhatsAppMessageReceived(tenantId: string, messageId: string, messageData: any): Promise<void> {
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
  async close(): Promise<void> {
    await this.rabbitMQ.close();
    console.log('[EventEmitter] Closed');
  }
}

// Singleton instance
let eventEmitterInstance: EventEmitterService | null = null;

export function getEventEmitterService(dbPool: Pool): EventEmitterService {
  if (!eventEmitterInstance) {
    eventEmitterInstance = new EventEmitterService(dbPool);
  }
  return eventEmitterInstance;
}
