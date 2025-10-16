import { Request, Response } from 'express';
import { InvoiceService } from './invoice.service';

export class InvoiceController {
  private invoiceService = new InvoiceService();

  createInvoice = async (req: Request, res: Response) => {
    try {
      const { tenantId, id: userId } = req.user as any;
      const invoice = await this.invoiceService.createInvoice({
        ...req.body,
        tenantId,
        issuedById: userId,
      });
      res.status(201).json(invoice);
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      res.status(400).json({ error: error.message });
    }
  };

  getInvoices = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const filters = {
        type: req.query.type as any,
        status: req.query.status as any,
        leadId: req.query.leadId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        search: req.query.search as string,
      };

      const invoices = await this.invoiceService.getInvoicesByTenant(tenantId, filters);
      res.json(invoices);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getInvoice = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const invoice = await this.invoiceService.getInvoiceById(id, tenantId);

      if (!invoice) {
        return res.status(404).json({ error: 'Recibo/Nota não encontrada' });
      }

      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getInvoiceByNumber = async (req: Request, res: Response) => {
    try {
      const { number } = req.params;
      const { tenantId } = req.user as any;
      const invoice = await this.invoiceService.getInvoiceByNumber(number, tenantId);

      if (!invoice) {
        return res.status(404).json({ error: 'Recibo/Nota não encontrada' });
      }

      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateInvoice = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const invoice = await this.invoiceService.updateInvoice(id, tenantId, req.body);
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  cancelInvoice = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const { reason } = req.body;
      const invoice = await this.invoiceService.cancelInvoice(id, tenantId, reason);
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  markAsSent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const invoice = await this.invoiceService.markAsSent(id, tenantId, req.body);
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  attachPdf = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const { pdfUrl } = req.body;
      const invoice = await this.invoiceService.attachPdf(id, tenantId, pdfUrl);
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getInvoiceStats = async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.user as any;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const stats = await this.invoiceService.getInvoiceStats(tenantId, year);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
