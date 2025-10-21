"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nService = void 0;
const axios_1 = __importDefault(require("axios"));
class N8nService {
    client;
    config;
    executionCache = new Map();
    constructor(config) {
        this.config = config;
        this.client = axios_1.default.create({
            baseURL: config.apiUrl,
            headers: {
                'X-N8N-API-KEY': config.apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        // Interceptor para logs
        this.client.interceptors.response.use((response) => {
            console.log(`[N8nService] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
            return response;
        }, (error) => {
            console.error(`[N8nService] Error:`, {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });
            throw error;
        });
    }
    /**
     * Executa um workflow
     */
    async executeWorkflow(dto) {
        try {
            const startedAt = new Date();
            // Executa o workflow
            const response = await this.client.post(`/workflows/${dto.workflowId}/execute`, dto.payload, {
                timeout: dto.timeout || 30000
            });
            const executionId = response.data.executionId || response.data.id;
            // Se deve aguardar conclusão
            if (dto.waitForCompletion) {
                const result = await this.waitForExecution(executionId, dto.timeout || 30000);
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
        }
        catch (error) {
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
    async getExecutionStatus(executionId) {
        try {
            // Verifica cache
            const cached = this.executionCache.get(executionId);
            if (cached && cached.finished) {
                return cached;
            }
            const response = await this.client.get(`/executions/${executionId}`);
            const execution = {
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
        }
        catch (error) {
            console.error('[N8nService] Error getting execution status:', error);
            return null;
        }
    }
    /**
     * Lista workflows
     */
    async listWorkflows(active) {
        try {
            const params = {};
            if (active !== undefined) {
                params.active = active;
            }
            const response = await this.client.get('/workflows', { params });
            return response.data.data.map((wf) => ({
                id: wf.id,
                name: wf.name,
                active: wf.active,
                tags: wf.tags,
                nodes: wf.nodes || [],
                connections: wf.connections,
                createdAt: new Date(wf.createdAt),
                updatedAt: new Date(wf.updatedAt)
            }));
        }
        catch (error) {
            console.error('[N8nService] Error listing workflows:', error);
            return [];
        }
    }
    /**
     * Obtém um workflow por ID
     */
    async getWorkflow(workflowId) {
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
        }
        catch (error) {
            console.error('[N8nService] Error getting workflow:', error);
            return null;
        }
    }
    /**
     * Cria um novo workflow
     */
    async createWorkflow(dto) {
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
        }
        catch (error) {
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
    async updateWorkflow(workflowId, dto) {
        try {
            await this.client.patch(`/workflows/${workflowId}`, dto);
            return { success: true };
        }
        catch (error) {
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
    async deleteWorkflow(workflowId) {
        try {
            await this.client.delete(`/workflows/${workflowId}`);
            return { success: true };
        }
        catch (error) {
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
    async activateWorkflow(workflowId) {
        try {
            await this.client.patch(`/workflows/${workflowId}`, {
                active: true
            });
            return { success: true };
        }
        catch (error) {
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
    async deactivateWorkflow(workflowId) {
        try {
            await this.client.patch(`/workflows/${workflowId}`, {
                active: false
            });
            return { success: true };
        }
        catch (error) {
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
    async listExecutions(workflowId, limit = 20) {
        try {
            const params = { limit };
            if (workflowId) {
                params.workflowId = workflowId;
            }
            const response = await this.client.get('/executions', { params });
            return response.data.data.map((exec) => ({
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
        }
        catch (error) {
            console.error('[N8nService] Error listing executions:', error);
            return [];
        }
    }
    /**
     * Aguarda conclusão de uma execução
     */
    async waitForExecution(executionId, timeout) {
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
    mapExecutionStatus(exec) {
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
    async healthCheck() {
        try {
            await this.client.get('/workflows', { params: { limit: 1 } });
            return true;
        }
        catch (error) {
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
exports.N8nService = N8nService;
//# sourceMappingURL=N8nService.js.map