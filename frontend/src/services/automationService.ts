/**
 * Automation Service - API Client
 *
 * Serviço para comunicação com APIs de Automação
 */

import api from './api';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Integration {
  id: string;
  tenantId: string;
  name: string;
  type: 'waha' | 'openai' | 'n8n' | 'webhook' | 'notificame' | 'custom';
  config: Record<string, any>;
  credentials?: Record<string, any>; // Masked in responses
  isActive: boolean;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed' | 'pending';
  lastTestMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntegrationDto {
  name: string;
  type: Integration['type'];
  config: Record<string, any>;
  credentials: Record<string, any>;
  isActive: boolean;
}

export interface TestIntegrationResult {
  success: boolean;
  message: string;
  details?: any;
  tested_at: string;
}

export interface Trigger {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  event: string;
  conditions?: TriggerCondition[];
  actions: TriggerAction[];
  active: boolean;
  priority?: number;
  executionCount?: number;
  lastExecutedAt?: string;
  avgExecutionTimeMs?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface TriggerAction {
  type: string;
  description?: string;
  config: Record<string, any>;
}

export interface CreateTriggerDto {
  name: string;
  description?: string;
  event: string;
  conditions?: TriggerCondition[];
  actions: TriggerAction[];
  active: boolean;
  priority?: number;
}

export interface AutomationEvent {
  id: string;
  tenantId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
  processed: boolean;
  triggeredAt: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventStats {
  total: number;
  processed: number;
  pending: number;
  byType: Record<string, number>;
  byEntity: Record<string, number>;
  triggersExecuted: number;
  workflowsExecuted: number;
  successRate: number;
}

export interface TriggerStats {
  total: number;
  active: number;
  inactive: number;
  byEvent: Record<string, number>;
  totalExecutions: number;
  avgExecutionTime: number;
}

export interface QueryEventsDto {
  eventType?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  processed?: boolean;
  limit?: number;
  offset?: number;
}

// ==========================================
// INTEGRATIONS API
// ==========================================

export const integrationService = {
  /**
   * List all integrations
   */
  async list(type?: string): Promise<Integration[]> {
    const params = type ? { type } : {};
    const response = await api.get('/automation/integrations', { params });
    return response.data.data;
  },

  /**
   * Get integration by ID
   */
  async getById(id: string): Promise<Integration> {
    const response = await api.get(`/automation/integrations/${id}`);
    return response.data.data;
  },

  /**
   * Create new integration
   */
  async create(data: CreateIntegrationDto): Promise<Integration> {
    const response = await api.post('/automation/integrations', data);
    return response.data.data;
  },

  /**
   * Update integration
   */
  async update(id: string, data: Partial<CreateIntegrationDto>): Promise<Integration> {
    const response = await api.put(`/automation/integrations/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete integration
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/automation/integrations/${id}`);
  },

  /**
   * Test integration connection
   */
  async test(id: string): Promise<TestIntegrationResult> {
    const response = await api.post(`/automation/integrations/${id}/test`);
    return response.data;
  },
};

// ==========================================
// TRIGGERS API
// ==========================================

export const triggerService = {
  /**
   * List all triggers
   */
  async list(filters?: { active?: boolean; event?: string }): Promise<Trigger[]> {
    const response = await api.get('/automation/triggers', { params: filters });
    return response.data.data;
  },

  /**
   * Get trigger by ID
   */
  async getById(id: string): Promise<Trigger> {
    const response = await api.get(`/automation/triggers/${id}`);
    return response.data.data;
  },

  /**
   * Create new trigger
   */
  async create(data: CreateTriggerDto): Promise<Trigger> {
    const response = await api.post('/automation/triggers', data);
    return response.data.data;
  },

  /**
   * Update trigger
   */
  async update(id: string, data: Partial<CreateTriggerDto>): Promise<Trigger> {
    const response = await api.put(`/automation/triggers/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete trigger
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/automation/triggers/${id}`);
  },

  /**
   * Toggle trigger active status
   */
  async toggle(id: string): Promise<Trigger> {
    const response = await api.patch(`/automation/triggers/${id}/toggle`);
    return response.data.data;
  },

  /**
   * Get trigger statistics
   */
  async getStats(): Promise<TriggerStats> {
    const response = await api.get('/automation/triggers/stats');
    return response.data.data;
  },

  /**
   * Get available event types
   */
  async getEventTypes(): Promise<string[]> {
    const response = await api.get('/automation/triggers/events');
    return response.data.data;
  },
};

// ==========================================
// HELPER FUNCTIONS FOR DATA TRANSFORMATION
// ==========================================

/**
 * Transform backend event (snake_case) to frontend format (camelCase)
 */
function transformEvent(backendEvent: any): AutomationEvent {
  return {
    id: backendEvent.id,
    tenantId: backendEvent.tenant_id,
    eventType: backendEvent.event_name || backendEvent.event_type, // Support both fields
    entityType: backendEvent.entity_type,
    entityId: backendEvent.entity_id,
    payload: backendEvent.event_data || backendEvent.payload, // Support both fields
    metadata: backendEvent.metadata,
    processed: backendEvent.processed,
    triggeredAt: backendEvent.triggered_at,
    processedAt: backendEvent.processed_at,
    createdAt: backendEvent.triggered_at, // Use triggered_at as createdAt
    updatedAt: backendEvent.processed_at || backendEvent.triggered_at, // Use processed_at or triggered_at
  };
}

// ==========================================
// EVENTS API
// ==========================================

export const eventService = {
  /**
   * List events with filters
   */
  async list(filters?: QueryEventsDto): Promise<AutomationEvent[]> {
    const response = await api.get('/automation/events/v2', { params: filters });
    const events = response.data.data || [];
    console.log('[eventService] Raw events from API:', events);
    const transformed = events.map(transformEvent);
    console.log('[eventService] Transformed events:', transformed);
    return transformed;
  },

  /**
   * Get event by ID
   */
  async getById(id: string): Promise<AutomationEvent> {
    const response = await api.get(`/automation/events/v2/${id}`);
    return transformEvent(response.data.data);
  },

  /**
   * Get event statistics
   */
  async getStats(startDate?: string, endDate?: string): Promise<EventStats> {
    const params = { startDate, endDate };
    const response = await api.get('/automation/events/v2/stats', { params });
    return response.data.data;
  },

  /**
   * Get available event types
   */
  async getEventTypes(): Promise<string[]> {
    const response = await api.get('/automation/events/v2/types');
    return response.data.data;
  },

  /**
   * Cleanup old events
   */
  async cleanup(daysToKeep: number): Promise<{ deleted: number }> {
    const response = await api.delete('/automation/events/v2/cleanup', {
      params: { daysToKeep }
    });
    return response.data;
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get integration type label
 */
export function getIntegrationTypeLabel(type: Integration['type']): string {
  const labels: Record<Integration['type'], string> = {
    waha: 'WhatsApp (WAHA)',
    openai: 'OpenAI (IA)',
    n8n: 'n8n (Workflows)',
    webhook: 'Webhook',
    notificame: 'Notificame',
    custom: 'Personalizado',
  };
  return labels[type] || type;
}

/**
 * Get integration type icon
 */
export function getIntegrationTypeIcon(type: Integration['type']): string {
  const icons: Record<Integration['type'], string> = {
    waha: '💬',
    openai: '🤖',
    n8n: '🔄',
    webhook: '🔗',
    notificame: '🔔',
    custom: '⚙️',
  };
  return icons[type] || '📦';
}

/**
 * Get event type label (friendly name)
 */
export function getEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    'lead.created': 'Lead Criado',
    'lead.updated': 'Lead Atualizado',
    'lead.stage_changed': 'Mudança de Estágio',
    'lead.status_changed': 'Mudança de Status',
    'lead.assigned': 'Lead Atribuído',
    'lead.converted': 'Lead Convertido',
    'appointment.scheduled': 'Agendamento Criado',
    'appointment.confirmed': 'Agendamento Confirmado',
    'appointment.cancelled': 'Agendamento Cancelado',
    'appointment.completed': 'Atendimento Finalizado',
    'appointment.no_show': 'Cliente Não Compareceu',
    'appointment.rescheduled': 'Agendamento Remarcado',
    'payment.pending': 'Pagamento Pendente',
    'payment.received': 'Pagamento Recebido',
    'payment.overdue': 'Pagamento Atrasado',
    'payment.failed': 'Pagamento Falhou',
    'whatsapp.message.received': 'Mensagem WhatsApp Recebida',
    'whatsapp.message.sent': 'Mensagem WhatsApp Enviada',
    'client.birthday': 'Aniversário de Cliente',
    'client.inactive': 'Cliente Inativo',
    'client.reactivated': 'Cliente Reativado',
  };
  return labels[eventType] || eventType;
}

/**
 * Get event category
 */
export function getEventCategory(eventType: string): string {
  if (eventType.startsWith('lead.')) return 'Leads';
  if (eventType.startsWith('appointment.')) return 'Agendamentos';
  if (eventType.startsWith('payment.')) return 'Pagamentos';
  if (eventType.startsWith('whatsapp.')) return 'WhatsApp';
  if (eventType.startsWith('client.')) return 'Clientes';
  return 'Outros';
}

/**
 * Format event type for display
 */
export function formatEventType(eventType: string): { category: string; label: string; icon: string } {
  const category = getEventCategory(eventType);
  const label = getEventTypeLabel(eventType);

  const icons: Record<string, string> = {
    'Leads': '👤',
    'Agendamentos': '📅',
    'Pagamentos': '💰',
    'WhatsApp': '💬',
    'Clientes': '👥',
    'Outros': '📦',
  };

  return {
    category,
    label,
    icon: icons[category] || '📦',
  };
}

export default {
  integrationService,
  triggerService,
  eventService,
  getIntegrationTypeLabel,
  getIntegrationTypeIcon,
  getEventTypeLabel,
  getEventCategory,
  formatEventType,
};
