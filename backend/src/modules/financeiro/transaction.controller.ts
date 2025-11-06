import { Request, Response } from 'express';
import { TransactionService } from './transaction.service';

export class TransactionController {
  private transactionService = new TransactionService();

  createTransaction = async (req: Request, res: Response) => {
    try {
      const { tenantId, id: userId } = req.user as any;
      const transaction = await this.transactionService.createTransaction({
        ...req.body,
        tenantId,
        createdById: userId,
      });
      res.status(201).json(transaction);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      res.status(400).json({ error: error.message });
    }
  };

  getTransactions = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const filters = {
        type: req.query.type as any,
        category: req.query.category as any,
        status: req.query.status as any,
        paymentMethod: req.query.paymentMethod as any,
        leadId: req.query.leadId as string,
        appointmentId: req.query.appointmentId as string,
        supplierId: req.query.supplierId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        dueDateFrom: req.query.dueDateFrom ? new Date(req.query.dueDateFrom as string) : undefined,
        dueDateTo: req.query.dueDateTo ? new Date(req.query.dueDateTo as string) : undefined,
        search: req.query.search as string,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
      };

      const transactions = await this.transactionService.getTransactionsByTenant(tenantId, filters);
      res.json(transactions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getTransaction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const transaction = await this.transactionService.getTransactionById(id, tenantId);

      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateTransaction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, id: userId } = req.user as any;
      const transaction = await this.transactionService.updateTransaction(
        id,
        tenantId,
        req.body,
        userId
      );
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  confirmTransaction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, id: userId } = req.user as any;

      console.log('[DEBUG] confirmTransaction - id:', id);
      console.log('[DEBUG] confirmTransaction - tenantId:', tenantId);
      console.log('[DEBUG] confirmTransaction - userId:', userId);
      console.log('[DEBUG] confirmTransaction - req.body:', req.body);

      const transaction = await this.transactionService.confirmTransaction(
        id,
        tenantId,
        {
          ...req.body,
          approvedById: userId,
        }
      );
      res.json(transaction);
    } catch (error: any) {
      console.error('[ERROR] confirmTransaction failed:', error.message);
      console.error('[ERROR] Stack:', error.stack);
      res.status(400).json({ error: error.message });
    }
  };

  cancelTransaction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, id: userId } = req.user as any;
      const { reason } = req.body;
      const transaction = await this.transactionService.cancelTransaction(
        id,
        tenantId,
        userId,
        reason
      );
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  reverseTransaction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, id: userId } = req.user as any;
      const { reason } = req.body;
      const transaction = await this.transactionService.reverseTransaction(
        id,
        tenantId,
        userId,
        reason
      );
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteTransaction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      await this.transactionService.deleteTransaction(id, tenantId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  createInstallmentTransactions = async (req: Request, res: Response) => {
    try {
      const { tenantId, id: userId } = req.user as any;
      const transactions = await this.transactionService.createInstallmentTransactions({
        ...req.body,
        tenantId,
        createdById: userId,
      });
      res.status(201).json(transactions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // Analytics
  getTransactionStats = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : new Date();
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : new Date();

      const stats = await this.transactionService.getTransactionStats(tenantId, dateFrom, dateTo);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getAccountsReceivable = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const dateLimit = req.query.dateLimit ? new Date(req.query.dateLimit as string) : undefined;
      const accounts = await this.transactionService.getAccountsReceivable(tenantId, dateLimit);
      res.json(accounts);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getAccountsPayable = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const dateLimit = req.query.dateLimit ? new Date(req.query.dateLimit as string) : undefined;
      const accounts = await this.transactionService.getAccountsPayable(tenantId, dateLimit);
      res.json(accounts);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getOverdueTransactions = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const overdue = await this.transactionService.getOverdueTransactions(tenantId);
      res.json(overdue);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getCashFlow = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const cashFlow = await this.transactionService.getCashFlow(tenantId, month, year);
      res.json(cashFlow);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
