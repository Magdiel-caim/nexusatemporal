"use strict";
/**
 * CONTRATO: Workflow Controller
 *
 * Responsável pela gestão de workflows (fluxos de automação).
 *
 * SESSÃO A: Implementará este contrato
 * SESSÃO B: Poderá consumir após implementação
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=IWorkflowController.js.map