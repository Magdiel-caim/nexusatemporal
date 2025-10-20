export interface AutomationEvent {
  id: string;
  tenant_id: string;
  event_type: string; // 'lead.created', 'appointment.created', etc.
  entity_type: 'lead' | 'appointment' | 'payment' | 'whatsapp' | 'user' | 'other';
  entity_id: string;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
  triggers_executed: number;
  workflows_executed: number;
  processed_at: Date;
  created_at: Date;
}

export interface EventStats {
  total_events: number;
  events_by_type: Record<string, number>;
  events_by_entity: Record<string, number>;
  triggers_executed: number;
  workflows_executed: number;
  success_rate: number;
  processed: number;
  pending: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface QueryEventsDTO {
  tenant_id: string;
  event_type?: string;
  entity_type?: string;
  entity_id?: string;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}
