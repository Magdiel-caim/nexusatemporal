"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const invoice_service_1 = require("./invoice.service");
class InvoiceController {
    invoiceService = new invoice_service_1.InvoiceService();
    createInvoice = async (req, res) => {
        try {
            const { tenantId, id: userId } = req.user;
            const invoice = await this.invoiceService.createInvoice({
                ...req.body,
                tenantId,
                issuedById: userId,
            });
            res.status(201).json(invoice);
        }
        catch (error) {
            console.error('Error creating invoice:', error);
            res.status(400).json({ error: error.message });
        }
    };
    getInvoices = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const filters = {
                type: req.query.type,
                status: req.query.status,
                leadId: req.query.leadId,
                dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom) : undefined,
                dateTo: req.query.dateTo ? new Date(req.query.dateTo) : undefined,
                search: req.query.search,
            };
            const invoices = await this.invoiceService.getInvoicesByTenant(tenantId, filters);
            res.json(invoices);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getInvoice = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const invoice = await this.invoiceService.getInvoiceById(id, tenantId);
            if (!invoice) {
                return res.status(404).json({ error: 'Recibo/Nota não encontrada' });
            }
            res.json(invoice);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getInvoiceByNumber = async (req, res) => {
        try {
            const { number } = req.params;
            const { tenantId } = req.user;
            const invoice = await this.invoiceService.getInvoiceByNumber(number, tenantId);
            if (!invoice) {
                return res.status(404).json({ error: 'Recibo/Nota não encontrada' });
            }
            res.json(invoice);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    updateInvoice = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const invoice = await this.invoiceService.updateInvoice(id, tenantId, req.body);
            res.json(invoice);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    cancelInvoice = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const { reason } = req.body;
            const invoice = await this.invoiceService.cancelInvoice(id, tenantId, reason);
            res.json(invoice);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    markAsSent = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const invoice = await this.invoiceService.markAsSent(id, tenantId, req.body);
            res.json(invoice);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    attachPdf = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const { pdfUrl } = req.body;
            const invoice = await this.invoiceService.attachPdf(id, tenantId, pdfUrl);
            res.json(invoice);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getInvoiceStats = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const year = req.query.year ? parseInt(req.query.year) : undefined;
            const stats = await this.invoiceService.getInvoiceStats(tenantId, year);
            res.json(stats);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.InvoiceController = InvoiceController;
//# sourceMappingURL=invoice.controller.js.map