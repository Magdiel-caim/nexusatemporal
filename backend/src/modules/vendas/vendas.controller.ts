import { Request, Response } from 'express';
import { VendasService } from './vendas.service';
import { ComissaoService } from './comissao.service';
import { Pool } from 'pg';

export class VendasController {
  private vendasService: VendasService;
  private comissaoService: ComissaoService;

  constructor(db: Pool) {
    this.vendasService = new VendasService(db);
    this.comissaoService = new ComissaoService(db);
  }

  // ============================================
  // VENDEDORES
  // ============================================

  /**
   * POST /api/vendas/vendedores
   * Cria um novo vendedor
   */
  createVendedor = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;

      const vendedor = await this.vendasService.createVendedor({
        ...req.body,
        tenantId,
      });

      res.status(201).json(vendedor);
    } catch (error: any) {
      console.error('[VendasController] Error creating vendedor:', error);
      res.status(400).json({
        error: 'Failed to create vendedor',
        message: error.message,
      });
    }
  };

  /**
   * GET /api/vendas/vendedores
   * Lista todos os vendedores
   */
  listVendedores = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;

      const vendedores = await this.vendasService.findAllVendedores(tenantId);

      res.json(vendedores);
    } catch (error: any) {
      console.error('[VendasController] Error listing vendedores:', error);
      res.status(500).json({
        error: 'Failed to list vendedores',
        message: error.message,
      });
    }
  };

  /**
   * GET /api/vendas/vendedores/:id
   * Busca vendedor por ID
   */
  getVendedor = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const vendedor = await this.vendasService.findVendedorById(id);

      if (!vendedor) {
        return res.status(404).json({ error: 'Vendedor not found' });
      }

      res.json(vendedor);
    } catch (error: any) {
      console.error('[VendasController] Error getting vendedor:', error);
      res.status(500).json({
        error: 'Failed to get vendedor',
        message: error.message,
      });
    }
  };

  /**
   * PUT /api/vendas/vendedores/:id
   * Atualiza vendedor
   */
  updateVendedor = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const vendedor = await this.vendasService.updateVendedor(id, req.body);

      res.json(vendedor);
    } catch (error: any) {
      console.error('[VendasController] Error updating vendedor:', error);
      res.status(400).json({
        error: 'Failed to update vendedor',
        message: error.message,
      });
    }
  };

  /**
   * DELETE /api/vendas/vendedores/:id
   * Desativa vendedor
   */
  deleteVendedor = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await this.vendasService.desativarVendedor(id);

      res.status(204).send();
    } catch (error: any) {
      console.error('[VendasController] Error deleting vendedor:', error);
      res.status(500).json({
        error: 'Failed to delete vendedor',
        message: error.message,
      });
    }
  };

  /**
   * GET /api/vendas/vendedores/:id/vendas
   * Lista vendas de um vendedor
   */
  getVendasByVendedor = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const { status, dataInicio, dataFim } = req.query;

      const vendas = await this.vendasService.findAllVendas(tenantId, {
        vendedorId: id,
        status: status as any,
        dataInicio: dataInicio ? new Date(dataInicio as string) : undefined,
        dataFim: dataFim ? new Date(dataFim as string) : undefined,
      });

      res.json(vendas);
    } catch (error: any) {
      console.error('[VendasController] Error getting vendas by vendedor:', error);
      res.status(500).json({
        error: 'Failed to get vendas',
        message: error.message,
      });
    }
  };

  // ============================================
  // VENDAS
  // ============================================

  /**
   * POST /api/vendas
   * Cria uma nova venda
   */
  createVenda = async (req: Request, res: Response) => {
    try {
      const { tenantId, id: userId } = req.user as any;

      const venda = await this.vendasService.createVenda({
        ...req.body,
        tenantId,
        createdById: userId,
      });

      res.status(201).json(venda);
    } catch (error: any) {
      console.error('[VendasController] Error creating venda:', error);
      res.status(400).json({
        error: 'Failed to create venda',
        message: error.message,
      });
    }
  };

  /**
   * GET /api/vendas
   * Lista vendas com filtros
   */
  listVendas = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const { vendedorId, status, dataInicio, dataFim } = req.query;

      const vendas = await this.vendasService.findAllVendas(tenantId, {
        vendedorId: vendedorId as string,
        status: status as any,
        dataInicio: dataInicio ? new Date(dataInicio as string) : undefined,
        dataFim: dataFim ? new Date(dataFim as string) : undefined,
      });

      res.json(vendas);
    } catch (error: any) {
      console.error('[VendasController] Error listing vendas:', error);
      res.status(500).json({
        error: 'Failed to list vendas',
        message: error.message,
      });
    }
  };

  /**
   * GET /api/vendas/:id
   * Busca venda por ID
   */
  getVenda = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const venda = await this.vendasService.findVendaById(id);

      if (!venda) {
        return res.status(404).json({ error: 'Venda not found' });
      }

      res.json(venda);
    } catch (error: any) {
      console.error('[VendasController] Error getting venda:', error);
      res.status(500).json({
        error: 'Failed to get venda',
        message: error.message,
      });
    }
  };

  /**
   * POST /api/vendas/:id/confirmar
   * Confirma uma venda (gera comissão)
   */
  confirmarVenda = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const venda = await this.vendasService.confirmarVenda(id);

      res.json(venda);
    } catch (error: any) {
      console.error('[VendasController] Error confirming venda:', error);
      res.status(400).json({
        error: 'Failed to confirm venda',
        message: error.message,
      });
    }
  };

  /**
   * POST /api/vendas/:id/cancelar
   * Cancela uma venda
   */
  cancelarVenda = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      if (!motivo) {
        return res.status(400).json({ error: 'Motivo is required' });
      }

      const venda = await this.vendasService.cancelarVenda(id, motivo);

      res.json(venda);
    } catch (error: any) {
      console.error('[VendasController] Error canceling venda:', error);
      res.status(400).json({
        error: 'Failed to cancel venda',
        message: error.message,
      });
    }
  };

  /**
   * GET /api/vendas/stats
   * Estatísticas de vendas
   */
  getVendasStats = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const { vendedorId } = req.query;

      const stats = await this.vendasService.getVendasStats(
        tenantId,
        vendedorId as string
      );

      res.json(stats);
    } catch (error: any) {
      console.error('[VendasController] Error getting vendas stats:', error);
      res.status(500).json({
        error: 'Failed to get vendas stats',
        message: error.message,
      });
    }
  };

  // ============================================
  // COMISSÕES
  // ============================================

  /**
   * GET /api/vendas/comissoes
   * Lista comissões com filtros
   */
  listComissoes = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const { vendedorId, status, mes, ano } = req.query;

      const comissoes = await this.comissaoService.findAll(tenantId, {
        vendedorId: vendedorId as string,
        status: status as any,
        mes: mes ? parseInt(mes as string) : undefined,
        ano: ano ? parseInt(ano as string) : undefined,
      });

      res.json(comissoes);
    } catch (error: any) {
      console.error('[VendasController] Error listing comissoes:', error);
      res.status(500).json({
        error: 'Failed to list comissoes',
        message: error.message,
      });
    }
  };

  /**
   * GET /api/vendas/comissoes/:id
   * Busca comissão por ID
   */
  getComissao = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const comissao = await this.comissaoService.findById(id);

      if (!comissao) {
        return res.status(404).json({ error: 'Comissao not found' });
      }

      res.json(comissao);
    } catch (error: any) {
      console.error('[VendasController] Error getting comissao:', error);
      res.status(500).json({
        error: 'Failed to get comissao',
        message: error.message,
      });
    }
  };

  /**
   * POST /api/vendas/comissoes/:id/pagar
   * Marca comissão como paga
   */
  pagarComissao = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { transactionId } = req.body;

      const comissao = await this.comissaoService.marcarComoPaga(
        id,
        transactionId
      );

      res.json(comissao);
    } catch (error: any) {
      console.error('[VendasController] Error paying comissao:', error);
      res.status(400).json({
        error: 'Failed to pay comissao',
        message: error.message,
      });
    }
  };

  /**
   * GET /api/vendas/comissoes/relatorio
   * Relatório mensal de comissões
   */
  relatorioComissoes = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const { vendedorId, mes, ano } = req.query;

      if (!vendedorId || !mes || !ano) {
        return res.status(400).json({
          error: 'vendedorId, mes e ano são obrigatórios',
        });
      }

      const relatorio = await this.comissaoService.gerarRelatorioMensal({
        vendedorId: vendedorId as string,
        mes: parseInt(mes as string),
        ano: parseInt(ano as string),
        tenantId,
      });

      res.json(relatorio);
    } catch (error: any) {
      console.error('[VendasController] Error generating relatorio:', error);
      res.status(500).json({
        error: 'Failed to generate relatorio',
        message: error.message,
      });
    }
  };

  /**
   * GET /api/vendas/comissoes/stats
   * Estatísticas de comissões
   */
  getComissoesStats = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const { vendedorId } = req.query;

      const stats = await this.comissaoService.getStats(
        tenantId,
        vendedorId as string
      );

      res.json(stats);
    } catch (error: any) {
      console.error('[VendasController] Error getting comissoes stats:', error);
      res.status(500).json({
        error: 'Failed to get comissoes stats',
        message: error.message,
      });
    }
  };

  /**
   * GET /api/vendas/ranking
   * Ranking de vendedores
   */
  getRankingVendedores = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const { mes, ano } = req.query;

      const ranking = await this.comissaoService.getRankingVendedores(
        tenantId,
        mes ? parseInt(mes as string) : undefined,
        ano ? parseInt(ano as string) : undefined
      );

      res.json(ranking);
    } catch (error: any) {
      console.error('[VendasController] Error getting ranking:', error);
      res.status(500).json({
        error: 'Failed to get ranking',
        message: error.message,
      });
    }
  };
}
