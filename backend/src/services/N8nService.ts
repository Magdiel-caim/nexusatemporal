/**
 * n8n Service - Workflow Automation
 *
 * Serviço de integração com n8n para execução de workflows
 * - Execução de workflows
 * - Gerenciamento de workflows
 * - Status de execuções
 *
 * @see https://docs.n8n.io/api/
 */

import axios, { AxiosInstance } from 'axios';

export interface N8nConfig {
  apiUrl: string;
  apiKey: string;
}

export interface ExecuteWorkflowDTO {
  workflowId: string;
  payload: Record<string, any>;
  waitForCompletion?: boolean;
  timeout?: number; // em ms
}

export interface WorkflowExecutionResponse {
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

export interface CreateWorkflowDTO {
  name: string;
  nodes: N8nWorkflowNode[];
  connections?: any;
  tags?: string[];
  active?: boolean;
}

export interface UpdateWorkflowDTO {
  name?: string;
  nodes?: N8nWorkflowNode[];
  connections?: any;
  tags?: string[];
  active?: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'error' | 'waiting';
  mode: 'manual' | 'trigger' | 'webhook';
  startedAt: Date;
  stoppedAt?: Date;
  finished: boolean;
  data?: any;
  error?: string;
}

export class N8nService {
  private client: AxiosInstance;
  private config: N8nConfig;
  private executionCache: Map<string, WorkflowExecution> = new Map();

  constructor(config: N8nConfig) {
    this.config = config;

    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Interceptor para logs
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[N8nService] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`[N8nService] Error:`, {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
        throw error;
      }
    );
  }

  /**
   * Executa um workflow
   */
  async executeWorkflow(dto: ExecuteWorkflowDTO): Promise<WorkflowExecutionResponse> {
    try {
      const startedAt = new Date();

      // Executa o workflow
      const response = await this.client.post(
        `/workflows/${dto.workflowId}/execute`,
        dto.payload,
        {
          timeout: dto.timeout || 30000
        }
      );

      const executionId = response.data.executionId || response.data.id;

      // Se deve aguardar conclusão
      if (dto.waitForCompletion) {
        const result = await this.waitForExecution(
          executionId,
          dto.timeout || 30000
        );

        return {
          success: result.status === 'success',
          executionId,
          status: result.status,
          data: result.data,
          startedAt,
          finishedAt: result.stoppedAt,
          error: result.error
        };
      }

      // Retorna imediatamente
      return {
        success: true,
        executionId,
        status: 'running',
        startedAt
      };
    } catch (error: any) {
      console.error('[N8nService] Error executing workflow:', error);
      return {
        success: false,
        executionId: '',
        status: 'error',
        startedAt: new Date(),
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Obtém status de uma execução
   */
  async getExecutionStatus(executionId: string): Promise<WorkflowExecution | null> {
    try {
      // Verifica cache
      const cached = this.executionCache.get(executionId);
      if (cached && cached.finished) {
        return cached;
      }

      const response = await this.client.get(`/executions/${executionId}`);

      const execution: WorkflowExecution = {
        id: response.data.id,
        workflowId: response.data.workflowId,
        status: this.mapExecutionStatus(response.data),
        mode: response.data.mode,
        startedAt: new Date(response.data.startedAt),
        stoppedAt: response.data.stoppedAt ? new Date(response.data.stoppedAt) : undefined,
        finished: response.data.finished,
        data: response.data.data,
        error: response.data.error
      };

      // Atualiza cache se finalizado
      if (execution.finished) {
        this.executionCache.set(executionId, execution);
      }

      return execution;
    } catch (error: any) {
      console.error('[N8nService] Error getting execution status:', error);
      return null;
    }
  }

  /**
   * Lista workflows
   */
  async listWorkflows(active?: boolean): Promise<N8nWorkflow[]> {
    try {
      const params: any = {};
      if (active !== undefined) {
        params.active = active;
      }

      const response = await this.client.get('/workflows', { params });

      return response.data.data.map((wf: any) => ({
        id: wf.id,
        name: wf.name,
        active: wf.active,
        tags: wf.tags,
        nodes: wf.nodes || [],
        connections: wf.connections,
        createdAt: new Date(wf.createdAt),
        updatedAt: new Date(wf.updatedAt)
      }));
    } catch (error: any) {
      console.error('[N8nService] Error listing workflows:', error);
      return [];
    }
  }

  /**
   * Obtém um workflow por ID
   */
  async getWorkflow(workflowId: string): Promise<N8nWorkflow | null> {
    try {
      const response = await this.client.get(`/workflows/${workflowId}`);

      return {
        id: response.data.id,
        name: response.data.name,
        active: response.data.active,
        tags: response.data.tags,
        nodes: response.data.nodes || [],
        connections: response.data.connections,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error: any) {
      console.error('[N8nService] Error getting workflow:', error);
      return null;
    }
  }

  /**
   * Cria um novo workflow
   */
  async createWorkflow(dto: CreateWorkflowDTO): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    try {
      const response = await this.client.post('/workflows', {
        name: dto.name,
        nodes: dto.nodes,
        connections: dto.connections || {},
        tags: dto.tags || [],
        active: dto.active ?? false,
        settings: {}
      });

      return {
        success: true,
        workflowId: response.data.id
      };
    } catch (error: any) {
      console.error('[N8nService] Error creating workflow:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Atualiza um workflow
   */
  async updateWorkflow(workflowId: string, dto: UpdateWorkflowDTO): Promise<{ success: boolean; error?: string }> {
    try {
      await this.client.patch(`/workflows/${workflowId}`, dto);

      return { success: true };
    } catch (error: any) {
      console.error('[N8nService] Error updating workflow:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Deleta um workflow
   */
  async deleteWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.client.delete(`/workflows/${workflowId}`);

      return { success: true };
    } catch (error: any) {
      console.error('[N8nService] Error deleting workflow:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Ativa um workflow
   */
  async activateWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.client.patch(`/workflows/${workflowId}`, {
        active: true
      });

      return { success: true };
    } catch (error: any) {
      console.error('[N8nService] Error activating workflow:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Desativa um workflow
   */
  async deactivateWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.client.patch(`/workflows/${workflowId}`, {
        active: false
      });

      return { success: true };
    } catch (error: any) {
      console.error('[N8nService] Error deactivating workflow:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Lista execuções de um workflow
   */
  async listExecutions(workflowId?: string, limit: number = 20): Promise<WorkflowExecution[]> {
    try {
      const params: any = { limit };
      if (workflowId) {
        params.workflowId = workflowId;
      }

      const response = await this.client.get('/executions', { params });

      return response.data.data.map((exec: any) => ({
        id: exec.id,
        workflowId: exec.workflowId,
        status: this.mapExecutionStatus(exec),
        mode: exec.mode,
        startedAt: new Date(exec.startedAt),
        stoppedAt: exec.stoppedAt ? new Date(exec.stoppedAt) : undefined,
        finished: exec.finished,
        data: exec.data,
        error: exec.error
      }));
    } catch (error: any) {
      console.error('[N8nService] Error listing executions:', error);
      return [];
    }
  }

  /**
   * Aguarda conclusão de uma execução
   */
  private async waitForExecution(executionId: string, timeout: number): Promise<WorkflowExecution> {
    const startTime = Date.now();
    const checkInterval = 1000; // 1 segundo

    while (Date.now() - startTime < timeout) {
      const execution = await this.getExecutionStatus(executionId);

      if (!execution) {
        throw new Error('Execution not found');
      }

      if (execution.finished) {
        return execution;
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    throw new Error('Execution timeout');
  }

  /**
   * Mapeia status da execução
   */
  private mapExecutionStatus(exec: any): 'running' | 'success' | 'error' | 'waiting' {
    if (exec.finished) {
      return exec.status === 'error' ? 'error' : 'success';
    }

    if (exec.waitTill) {
      return 'waiting';
    }

    return 'running';
  }

  /**
   * Verifica se n8n está acessível
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/workflows', { params: { limit: 1 } });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Estatísticas de uso
   */
  getStats() {
    return {
      apiUrl: this.config.apiUrl,
      cacheSize: this.executionCache.size
    };
  }
}
