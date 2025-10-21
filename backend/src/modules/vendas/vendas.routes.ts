import { Router } from 'express';
import { VendasController } from './vendas.controller';
import { authenticateToken } from '../auth/auth.middleware';
import { Pool } from 'pg';

export function createVendasRoutes(db: Pool): Router {
  const router = Router();
  const controller = new VendasController(db);

  // Middleware de autenticação em todas as rotas
  router.use(authenticateToken);

  // ============================================
  // ROTAS DE VENDEDORES
  // ============================================

  // CRUD de Vendedores
  router.post('/vendedores', controller.createVendedor);
  router.get('/vendedores', controller.listVendedores);
  router.get('/vendedores/:id', controller.getVendedor);
  router.put('/vendedores/:id', controller.updateVendedor);
  router.delete('/vendedores/:id', controller.deleteVendedor);

  // Vendas de um vendedor específico
  router.get('/vendedores/:id/vendas', controller.getVendasByVendedor);

  // ============================================
  // ROTAS DE VENDAS
  // ============================================

  // Estatísticas ANTES de rotas dinâmicas
  router.get('/stats', controller.getVendasStats);

  // CRUD de Vendas
  router.post('/', controller.createVenda);
  router.get('/', controller.listVendas);
  router.get('/:id', controller.getVenda);

  // Ações em vendas
  router.post('/:id/confirmar', controller.confirmarVenda);
  router.post('/:id/cancelar', controller.cancelarVenda);

  // ============================================
  // ROTAS DE COMISSÕES
  // ============================================

  // Estatísticas e relatórios ANTES de rotas dinâmicas
  router.get('/comissoes/stats', controller.getComissoesStats);
  router.get('/comissoes/relatorio', controller.relatorioComissoes);

  // CRUD de Comissões
  router.get('/comissoes', controller.listComissoes);
  router.get('/comissoes/:id', controller.getComissao);

  // Ações em comissões
  router.post('/comissoes/:id/pagar', controller.pagarComissao);

  // ============================================
  // ROTAS DE RANKING E ANALYTICS
  // ============================================

  router.get('/ranking', controller.getRankingVendedores);

  return router;
}
