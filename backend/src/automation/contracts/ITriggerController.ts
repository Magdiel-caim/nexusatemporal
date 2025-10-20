/**
 * CONTRATO: Trigger Controller
 *
 * Responsável pela gestão de gatilhos (triggers) do sistema de automação.
 *
 * SESSÃO A: Implementará este contrato
 * SESSÃO B: Poderá consumir após implementação
 */

export interface CreateTriggerDto {
  name: string;
  description?: string;
  tenantId: string;
  event: string; // 'lead.created', 'lead.stage_changed', 'appointment.created', etc.
  conditions?: TriggerCondition[];
  workflowId?: string;
  active: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateTriggerDto {
  name?: string;
  description?: string;
  event?: string;
  conditions?: TriggerCondition[];
  workflowId?: string;
  active?: boolean;
  metadata?: Record<string, any>;
}

export interface TriggerCondition {
  field: string; // Campo a ser avaliado (ex: 'stage', 'value', 'source')
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR'; // Para múltiplas condições
}

export interface TriggerResponse {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  event: string;
  conditions?: TriggerCondition[];
  workflowId?: string;
  active: boolean;
  metadata?: Record<string, any>;
  executionCount: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TriggerExecutionResult {
  triggerId: string;
  success: boolean;
  executedAt: Date;
  workflowExecutionId?: string;
  error?: string;
}

/**
 * ENDPOINTS A SEREM IMPLEMENTADOS (Sessão A):
 *
 * POST   /api/automation/triggers          - Criar trigger
 * GET    /api/automation/triggers          - Listar triggers (com filtros)
 * GET    /api/automation/triggers/:id      - Buscar trigger por ID
 * PUT    /api/automation/triggers/:id      - Atualizar trigger
 * DELETE /api/automation/triggers/:id      - Deletar trigger
 * POST   /api/automation/triggers/:id/test - Testar trigger
 * GET    /api/automation/triggers/:id/executions - Histórico de execuções
 */
