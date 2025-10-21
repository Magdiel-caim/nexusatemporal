import { Pool } from 'pg';
import { getRabbitMQService } from './RabbitMQService';
import { AutomationEventData } from './EventEmitterService';

interface Trigger {
  id: string;
  tenant_id: string;
  name: string;
  event: string;
  conditions: any;
  actions: any;
  is_active: boolean;
  execution_count: number;
}

export class TriggerProcessorService {
  private rabbitMQ = getRabbitMQService();
  private db: Pool;
  private exchangeName = 'nexus.automation.events';
  private isProcessing = false;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  /**
   * Start processing triggers
   */
  async start(): Promise<void> {
    try {
      if (!this.rabbitMQ.isConnected()) {
        await this.rabbitMQ.connect();
      }

      this.isProcessing = true;

      // Subscribe to all automation events
      await this.rabbitMQ.subscribe(
        this.exchangeName,
        '#', // Subscribe to all events
        this.processEvent.bind(this),
        'topic'
      );

      console.log('[TriggerProcessor] ✅ Started processing triggers');
    } catch (error) {
      console.error('[TriggerProcessor] Failed to start:', error);
      throw error;
    }
  }

  /**
   * Process incoming automation event
   */
  private async processEvent(eventData: AutomationEventData): Promise<void> {
    try {
      console.log(`[TriggerProcessor] Processing event: ${eventData.eventType}`);

      // 1. Find all active triggers for this event type and tenant
      const triggers = await this.findMatchingTriggers(
        eventData.eventType,
        eventData.tenantId
      );

      if (triggers.length === 0) {
        console.log(`[TriggerProcessor] No triggers found for event: ${eventData.eventType}`);
        return;
      }

      console.log(`[TriggerProcessor] Found ${triggers.length} triggers to process`);

      // 2. Process each trigger
      for (const trigger of triggers) {
        await this.executeTrigger(trigger, eventData);
      }

      // 3. Mark event as processed
      await this.markEventAsProcessed(eventData);

    } catch (error) {
      console.error('[TriggerProcessor] Error processing event:', error);
    }
  }

  /**
   * Find triggers that match the event
   */
  private async findMatchingTriggers(eventType: string, tenantId: string): Promise<Trigger[]> {
    const query = `
      SELECT
        id, tenant_id, name, event, conditions, actions,
        is_active, execution_count
      FROM triggers
      WHERE event = $1
        AND (tenant_id = $2 OR tenant_id IS NULL)
        AND is_active = true
      ORDER BY created_at ASC
    `;

    try {
      const result = await this.db.query(query, [eventType, tenantId]);
      return result.rows;
    } catch (error) {
      console.error('[TriggerProcessor] Error finding triggers:', error);
      return [];
    }
  }

  /**
   * Execute a trigger
   */
  private async executeTrigger(trigger: Trigger, eventData: AutomationEventData): Promise<void> {
    try {
      console.log(`[TriggerProcessor] Executing trigger: ${trigger.name} (${trigger.id})`);

      // 1. Check if conditions match
      if (trigger.conditions && !this.evaluateConditions(trigger.conditions, eventData.data)) {
        console.log(`[TriggerProcessor] Conditions not met for trigger: ${trigger.name}`);
        return;
      }

      // 2. Execute actions
      const actions = trigger.actions;

      if (Array.isArray(actions)) {
        for (const action of actions) {
          await this.executeAction(action, eventData, trigger);
        }
      } else if (typeof actions === 'object') {
        await this.executeAction(actions, eventData, trigger);
      }

      // 3. Update trigger execution count
      await this.updateTriggerExecutionCount(trigger.id);

      console.log(`[TriggerProcessor] ✅ Trigger executed successfully: ${trigger.name}`);

    } catch (error) {
      console.error(`[TriggerProcessor] Error executing trigger ${trigger.name}:`, error);
    }
  }

  /**
   * Evaluate trigger conditions
   */
  private evaluateConditions(conditions: any, eventData: any): boolean {
    try {
      // Simple condition evaluation
      // Example: {"source": "whatsapp", "status": "novo"}
      for (const [key, value] of Object.entries(conditions)) {
        if (eventData[key] !== value) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('[TriggerProcessor] Error evaluating conditions:', error);
      return false;
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: any, eventData: AutomationEventData, trigger: Trigger): Promise<void> {
    try {
      const actionType = action.type || action;

      console.log(`[TriggerProcessor] Executing action: ${actionType}`);

      switch (actionType) {
        case 'send_webhook':
          await this.sendWebhook(action, eventData);
          break;

        case 'execute_workflow':
          await this.executeWorkflow(action, eventData);
          break;

        case 'send_whatsapp':
          await this.sendWhatsAppMessage(action, eventData);
          break;

        case 'send_notification':
          await this.sendNotification(action, eventData);
          break;

        case 'create_activity':
          await this.createActivity(action, eventData);
          break;

        default:
          console.log(`[TriggerProcessor] Unknown action type: ${actionType}`);
      }

    } catch (error) {
      console.error(`[TriggerProcessor] Error executing action:`, error);
    }
  }

  /**
   * Action implementations
   */

  private async sendWebhook(action: any, eventData: AutomationEventData): Promise<void> {
    // TODO: Implement webhook sending
    console.log('[TriggerProcessor] [TODO] Send webhook:', action.url);
  }

  private async executeWorkflow(action: any, eventData: AutomationEventData): Promise<void> {
    // TODO: Trigger n8n workflow
    console.log('[TriggerProcessor] [TODO] Execute workflow:', action.workflowId);
  }

  private async sendWhatsAppMessage(action: any, eventData: AutomationEventData): Promise<void> {
    // TODO: Send WhatsApp message via Waha
    console.log('[TriggerProcessor] [TODO] Send WhatsApp message');
  }

  private async sendNotification(action: any, eventData: AutomationEventData): Promise<void> {
    // TODO: Send in-app notification
    console.log('[TriggerProcessor] [TODO] Send notification');
  }

  private async createActivity(action: any, eventData: AutomationEventData): Promise<void> {
    // TODO: Create activity/task
    console.log('[TriggerProcessor] [TODO] Create activity');
  }

  /**
   * Update trigger execution count
   */
  private async updateTriggerExecutionCount(triggerId: string): Promise<void> {
    const query = `
      UPDATE triggers
      SET
        execution_count = execution_count + 1,
        last_executed_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
    `;

    try {
      await this.db.query(query, [triggerId]);
    } catch (error) {
      console.error('[TriggerProcessor] Error updating trigger count:', error);
    }
  }

  /**
   * Mark event as processed
   */
  private async markEventAsProcessed(eventData: AutomationEventData): Promise<void> {
    const query = `
      UPDATE automation_events
      SET
        processed = true,
        processed_at = NOW()
      WHERE entity_id = $1
        AND event_name = $2
        AND tenant_id = $3
        AND processed = false
    `;

    try {
      await this.db.query(query, [
        eventData.entityId,
        eventData.eventType,
        eventData.tenantId
      ]);
    } catch (error) {
      console.error('[TriggerProcessor] Error marking event as processed:', error);
    }
  }

  /**
   * Stop processing
   */
  async stop(): Promise<void> {
    this.isProcessing = false;
    console.log('[TriggerProcessor] Stopped');
  }

  /**
   * Check if processor is running
   */
  isRunning(): boolean {
    return this.isProcessing;
  }
}

// Singleton instance
let processorInstance: TriggerProcessorService | null = null;

export function getTriggerProcessorService(dbPool: Pool): TriggerProcessorService {
  if (!processorInstance) {
    processorInstance = new TriggerProcessorService(dbPool);
  }
  return processorInstance;
}
