import { Request, Response } from 'express';
import { CashFlowService } from './cash-flow.service';

export class CashFlowController {
  private cashFlowService = new CashFlowService();

  openCashFlow = async (req: Request, res: Response) => {
    try {
      const { tenantId, userId } = req.user as any;
      const cashFlow = await this.cashFlowService.openCashFlow({
        ...req.body,
        tenantId,
        openedById: userId,
      });
      res.status(201).json(cashFlow);
    } catch (error: any) {
      console.error('Error opening cash flow:', error);
      res.status(400).json({ error: error.message });
    }
  };

  closeCashFlow = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, userId } = req.user as any;
      const cashFlow = await this.cashFlowService.closeCashFlow({
        ...req.body,
        id,
        tenantId,
        closedById: userId,
      });
      res.json(cashFlow);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getCashFlow = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const cashFlow = await this.cashFlowService.getCashFlowById(id, tenantId);

      if (!cashFlow) {
        return res.status(404).json({ error: 'Fluxo de caixa não encontrado' });
      }

      res.json(cashFlow);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getCashFlowByDate = async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      const { tenantId } = req.user as any;
      const cashFlow = await this.cashFlowService.getCashFlowByDate(new Date(date), tenantId);

      if (!cashFlow) {
        return res.status(404).json({ error: 'Fluxo de caixa não encontrado para esta data' });
      }

      res.json(cashFlow);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getCashFlows = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const filters = {
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        isClosed: req.query.isClosed !== undefined
          ? req.query.isClosed === 'true'
          : undefined,
      };

      const cashFlows = await this.cashFlowService.getCashFlowsByTenant(tenantId, filters);
      res.json(cashFlows);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateFromTransactions = async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      const { tenantId } = req.user as any;
      const cashFlow = await this.cashFlowService.updateCashFlowFromTransactions(
        new Date(date),
        tenantId
      );
      res.json(cashFlow);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  recordWithdrawal = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const { amount, notes } = req.body;
      const cashFlow = await this.cashFlowService.recordWithdrawal(id, tenantId, amount, notes);
      res.json(cashFlow);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  recordDeposit = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const { amount, notes } = req.body;
      const cashFlow = await this.cashFlowService.recordDeposit(id, tenantId, amount, notes);
      res.json(cashFlow);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getCashFlowSummary = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const summary = await this.cashFlowService.getCashFlowSummary(tenantId, month, year);
      res.json(summary);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
