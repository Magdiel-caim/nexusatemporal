/**
 * CONTRATO: n8n Service (Workflow Automation)
 *
 * Serviço de integração com n8n para execução de workflows.
 *
 * SESSÃO A: Implementará este serviço
 * SESSÃO B: NÃO PRECISA TOCAR - Apenas usar depois
 */

export interface ExecuteN8nWorkflowDto {
  tenantId: string;
  workflowId: string; // ID do workflow no n8n
  payload: Record<string, any>;
  waitForCompletion?: boolean;
  timeout?: number; // em milissegundos
}

export interface N8nWorkflowExecutionResponse {
  success: boolean;
  executionId: string;
  status: 'running' | 'success' | 'error' | 'waiting';
  data?: any;
  startedAt: Date;
  finishedAt?: Date;
  error?: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags?: string[];
  nodes: N8nWorkflowNode[];
  connections?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface N8nWorkflowNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
}

export interface CreateN8nWorkflowDto {
  tenantId: string;
  name: string;
  nodes: N8nWorkflowNode[];
  connections?: any;
  tags?: string[];
  active?: boolean;
}

export interface UpdateN8nWorkflowDto {
  name?: string;
  nodes?: N8nWorkflowNode[];
  connections?: any;
  tags?: string[];
  active?: boolean;
}

/**
 * MÉTODOS DO SERVIÇO (Sessão A implementará):
 *
 * - executeWorkflow(dto: ExecuteN8nWorkflowDto)
 * - getWorkflowExecutionStatus(executionId: string)
 * - listWorkflows(tenantId: string)
 * - getWorkflow(workflowId: string)
 * - createWorkflow(dto: CreateN8nWorkflowDto)
 * - updateWorkflow(workflowId: string, dto: UpdateN8nWorkflowDto)
 * - deleteWorkflow(workflowId: string)
 * - activateWorkflow(workflowId: string)
 * - deactivateWorkflow(workflowId: string)
 */
