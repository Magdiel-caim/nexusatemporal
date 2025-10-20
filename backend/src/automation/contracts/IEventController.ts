/**
 * CONTRATO: Event Controller
 *
 * Responsável pela gestão e rastreamento de eventos do sistema.
 *
 * SESSÃO A: Implementará este contrato
 * SESSÃO B: Poderá consumir após implementação
 */

export interface EventLogResponse {
  id: string;
  tenantId: string;
  eventType: string; // 'lead.created', 'appointment.created', etc.
  entityType: 'lead' | 'appointment' | 'payment' | 'whatsapp' | 'user' | 'other';
  entityId: string;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
  triggersExecuted: number;
  workflowsExecuted: number;
  processedAt: Date;
  createdAt: Date;
}

export interface EventStatsResponse {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByEntity: Record<string, number>;
  triggersExecuted: number;
  workflowsExecuted: number;
  successRate: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface QueryEventsDto {
  tenantId: string;
  eventType?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * ENDPOINTS A SEREM IMPLEMENTADOS (Sessão A):
 *
 * GET /api/automation/events              - Listar eventos (com filtros)
 * GET /api/automation/events/:id          - Buscar evento por ID
 * GET /api/automation/events/stats        - Estatísticas de eventos
 * GET /api/automation/events/types        - Listar tipos de eventos disponíveis
 */
