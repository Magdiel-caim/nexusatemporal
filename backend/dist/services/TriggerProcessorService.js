"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerProcessorService = void 0;
exports.getTriggerProcessorService = getTriggerProcessorService;
const RabbitMQService_1 = require("./RabbitMQService");
class TriggerProcessorService {
    rabbitMQ = (0, RabbitMQService_1.getRabbitMQService)();
    db;
    exchangeName = 'nexus.automation.events';
    isProcessing = false;
    constructor(dbPool) {
        this.db = dbPool;
    }
    /**
     * Start processing triggers
     */
    async start() {
        try {
            if (!this.rabbitMQ.isConnected()) {
                await this.rabbitMQ.connect();
            }
            this.isProcessing = true;
            // Subscribe to all automation events
            await this.rabbitMQ.subscribe(this.exchangeName, '#', // Subscribe to all events
            this.processEvent.bind(this), 'topic');
            console.log('[TriggerProcessor] ✅ Started processing triggers');
        }
        catch (error) {
            console.error('[TriggerProcessor] Failed to start:', error);
            throw error;
        }
    }
    /**
     * Process incoming automation event
     */
    async processEvent(eventData) {
        try {
            console.log(`[TriggerProcessor] Processing event: ${eventData.eventType}`);
            // 1. Find all active triggers for this event type and tenant
            const triggers = await this.findMatchingTriggers(eventData.eventType, eventData.tenantId);
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
        }
        catch (error) {
            console.error('[TriggerProcessor] Error processing event:', error);
        }
    }
    /**
     * Find triggers that match the event
     */
    async findMatchingTriggers(eventType, tenantId) {
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
        }
        catch (error) {
            console.error('[TriggerProcessor] Error finding triggers:', error);
            return [];
        }
    }
    /**
     * Execute a trigger
     */
    async executeTrigger(trigger, eventData) {
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
            }
            else if (typeof actions === 'object') {
                await this.executeAction(actions, eventData, trigger);
            }
            // 3. Update trigger execution count
            await this.updateTriggerExecutionCount(trigger.id);
            console.log(`[TriggerProcessor] ✅ Trigger executed successfully: ${trigger.name}`);
        }
        catch (error) {
            console.error(`[TriggerProcessor] Error executing trigger ${trigger.name}:`, error);
        }
    }
    /**
     * Evaluate trigger conditions
     */
    evaluateConditions(conditions, eventData) {
        try {
            // Simple condition evaluation
            // Example: {"source": "whatsapp", "status": "novo"}
            for (const [key, value] of Object.entries(conditions)) {
                if (eventData[key] !== value) {
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            console.error('[TriggerProcessor] Error evaluating conditions:', error);
            return false;
        }
    }
    /**
     * Execute a single action
     */
    async executeAction(action, eventData, trigger) {
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
        }
        catch (error) {
            console.error(`[TriggerProcessor] Error executing action:`, error);
        }
    }
    /**
     * Action implementations
     */
    async sendWebhook(action, eventData) {
        // TODO: Implement webhook sending
        console.log('[TriggerProcessor] [TODO] Send webhook:', action.url);
    }
    async executeWorkflow(action, eventData) {
        // TODO: Trigger n8n workflow
        console.log('[TriggerProcessor] [TODO] Execute workflow:', action.workflowId);
    }
    async sendWhatsAppMessage(action, eventData) {
        // TODO: Send WhatsApp message via Waha
        console.log('[TriggerProcessor] [TODO] Send WhatsApp message');
    }
    async sendNotification(action, eventData) {
        // TODO: Send in-app notification
        console.log('[TriggerProcessor] [TODO] Send notification');
    }
    async createActivity(action, eventData) {
        // TODO: Create activity/task
        console.log('[TriggerProcessor] [TODO] Create activity');
    }
    /**
     * Update trigger execution count
     */
    async updateTriggerExecutionCount(triggerId) {
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
        }
        catch (error) {
            console.error('[TriggerProcessor] Error updating trigger count:', error);
        }
    }
    /**
     * Mark event as processed
     */
    async markEventAsProcessed(eventData) {
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
        }
        catch (error) {
            console.error('[TriggerProcessor] Error marking event as processed:', error);
        }
    }
    /**
     * Stop processing
     */
    async stop() {
        this.isProcessing = false;
        console.log('[TriggerProcessor] Stopped');
    }
    /**
     * Check if processor is running
     */
    isRunning() {
        return this.isProcessing;
    }
}
exports.TriggerProcessorService = TriggerProcessorService;
// Singleton instance
let processorInstance = null;
function getTriggerProcessorService(dbPool) {
    if (!processorInstance) {
        processorInstance = new TriggerProcessorService(dbPool);
    }
    return processorInstance;
}
//# sourceMappingURL=TriggerProcessorService.js.map