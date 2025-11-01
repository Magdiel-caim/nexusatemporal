import { Router } from 'express';
import { LeadController } from './lead.controller';
import { authenticateApiKey, requireApiKeyScope } from '@/middleware/api-key-auth.middleware';

const router = Router();
const leadController = new LeadController();

/**
 * ROTAS PÚBLICAS DE API PARA LEADS
 * Requer autenticação via API Key
 *
 * Todas as rotas estão sob /api/public/leads
 *
 * Autenticação:
 * - Header: Authorization: Bearer nxs_xxxxx
 * - Query: ?api_key=nxs_xxxxx
 * - Header: X-API-Key: nxs_xxxxx
 */

// Aplicar autenticação via API Key em todas as rotas
router.use(authenticateApiKey);

/**
 * GET /api/public/leads
 * Lista todos os leads do tenant
 *
 * Query Params:
 * - search: string (busca por nome, email, telefone, empresa)
 * - phone: string (busca específica por telefone - ID ÚNICO)
 * - email: string (busca específica por email)
 * - stageId: UUID
 * - status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
 * - priority: 'low' | 'medium' | 'high'
 * - source: 'website' | 'referral' | 'cold_call' | 'social_media' | 'other'
 * - dateFrom: ISO date
 * - dateTo: ISO date
 *
 * Exemplo:
 * GET /api/public/leads?phone=5511999999999
 * GET /api/public/leads?email=cliente@email.com
 * GET /api/public/leads?search=João
 */
router.get('/', requireApiKeyScope(['read', 'full']), leadController.getLeads);

/**
 * POST /api/public/leads
 * Cria um novo lead
 *
 * Body:
 * {
 *   "name": "Nome do Lead",
 *   "email": "lead@email.com",
 *   "phone": "5511999999999",
 *   "stageId": "uuid-do-estagio",
 *   "source": "website",
 *   "priority": "high",
 *   "notes": "Observações"
 * }
 */
router.post('/', requireApiKeyScope(['write', 'full']), leadController.createLead);

/**
 * GET /api/public/leads/:id
 * Busca um lead por ID
 */
router.get('/:id', requireApiKeyScope(['read', 'full']), leadController.getLead);

/**
 * PUT /api/public/leads/:id
 * Atualiza um lead
 */
router.put('/:id', requireApiKeyScope(['write', 'full']), leadController.updateLead);

/**
 * DELETE /api/public/leads/:id
 * Deleta um lead (soft delete)
 */
router.delete('/:id', requireApiKeyScope(['write', 'full']), leadController.deleteLead);

/**
 * POST /api/public/leads/:id/move
 * Move um lead para outro estágio
 *
 * Body:
 * {
 *   "stageId": "uuid-novo-estagio"
 * }
 */
router.post('/:id/move', requireApiKeyScope(['write', 'full']), leadController.moveLeadToStage);

/**
 * GET /api/public/leads/stats
 * Obtém estatísticas de leads
 */
router.get('/stats', requireApiKeyScope(['read', 'full']), leadController.getLeadStats);

export default router;
