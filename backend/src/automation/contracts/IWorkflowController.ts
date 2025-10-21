/**
 * CONTRATO: Workflow Controller
 *
 * Responsável pela gestão de workflows (fluxos de automação).
 *
 * SESSÃO A: Implementará este contrato
 * SESSÃO B: Poderá consumir após implementação
 */

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  tenantId: string;
  n8nWorkflowId?: string; // ID do workflow no n8n
  steps?: WorkflowStep[];
  active: boolean;
  tags?: string[];
  category?: string;
  metadata?: Record<string, any>;
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  n8nWorkflowId?: string;
  steps?: WorkflowStep[];
  active?: boolean;
  tags?: string[];
  category?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowStep {
  order: number;
  type: 'webhook' | 'function' | 'condition' | 'notification' | 'ai' | 'integration';
  config: Record<string, any>;
  name: string;
  description?: string;
}

export interface WorkflowResponse {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  n8nWorkflowId?: string;
  steps?: WorkflowStep[];
  active: boolean;
  tags?: string[];
  category?: string;
  metadata?: Record<string, any>;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecuteWorkflowDto {
  workflowId: string;
  tenantId: string;
  payload: Record<string, any>;
  context?: Record<string, any>;
}

export interface WorkflowExecutionResponse {
  executionId: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startedAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  steps?: StepExecution[];
}

export interface StepExecution {
  stepOrder: number;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

/**
 * ENDPOINTS A SEREM IMPLEMENTADOS (Sessão A):
 *
 * POST   /api/automation/workflows              - Criar workflow
 * GET    /api/automation/workflows              - Listar workflows
 * GET    /api/automation/workflows/:id          - Buscar workflow por ID
 * PUT    /api/automation/workflows/:id          - Atualizar workflow
 * DELETE /api/automation/workflows/:id          - Deletar workflow
 * POST   /api/automation/workflows/:id/execute  - Executar workflow
 * GET    /api/automation/workflows/:id/executions - Histórico de execuções
 * GET    /api/automation/workflows/:id/stats    - Estatísticas do workflow
 */
