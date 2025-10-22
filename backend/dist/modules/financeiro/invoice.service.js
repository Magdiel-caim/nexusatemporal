"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const data_source_1 = require("@/database/data-source");
const invoice_entity_1 = require("./invoice.entity");
const transaction_entity_1 = require("./transaction.entity");
const typeorm_1 = require("typeorm");
class InvoiceService {
    invoiceRepository = data_source_1.CrmDataSource.getRepository(invoice_entity_1.Invoice);
    transactionRepository = data_source_1.CrmDataSource.getRepository(transaction_entity_1.Transaction);
    async generateInvoiceNumber(tenantId, type) {
        const year = new Date().getFullYear();
        const prefix = type === invoice_entity_1.InvoiceType.RECIBO ? 'REC' : type === invoice_entity_1.InvoiceType.NOTA_FISCAL ? 'NF' : 'NS';
        const lastInvoice = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.invoiceNumber LIKE :pattern', {
            pattern: `${prefix}-${year}%`,
        })
            .orderBy('invoice.invoiceNumber', 'DESC')
            .getOne();
        let number = 1;
        if (lastInvoice) {
            const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
            number = lastNumber + 1;
        }
        return `${prefix}-${year}-${number.toString().padStart(6, '0')}`;
    }
    async createInvoice(data) {
        // Verificar se a transação existe
        const transaction = await this.transactionRepository.findOne({
            where: { id: data.transactionId, tenantId: data.tenantId },
        });
        if (!transaction) {
            throw new Error('Transação não encontrada');
        }
        // Gerar número do recibo/nota
        const invoiceNumber = await this.generateInvoiceNumber(data.tenantId, data.type);
        const invoice = this.invoiceRepository.create({
            ...data,
            invoiceNumber,
            status: invoice_entity_1.InvoiceStatus.EMITIDA,
        });
        const savedInvoice = await this.invoiceRepository.save(invoice);
        return this.getInvoiceById(savedInvoice.id, data.tenantId);
    }
    async getInvoicesByTenant(tenantId, filters) {
        const where = { tenantId };
        if (filters?.type)
            where.type = filters.type;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.leadId)
            where.leadId = filters.leadId;
        if (filters?.dateFrom && filters?.dateTo) {
            where.issueDate = (0, typeorm_1.Between)(filters.dateFrom, filters.dateTo);
        }
        const query = this.invoiceRepository
            .createQueryBuilder('invoice')
            .where(where)
            .leftJoinAndSelect('invoice.transaction', 'transaction')
            .leftJoinAndSelect('invoice.lead', 'lead')
            .leftJoinAndSelect('invoice.issuedBy', 'issuedBy');
        if (filters?.search) {
            query.andWhere('(invoice.invoiceNumber ILIKE :search OR invoice.description ILIKE :search)', { search: `%${filters.search}%` });
        }
        query.orderBy('invoice.issueDate', 'DESC');
        return query.getMany();
    }
    async getInvoiceById(id, tenantId) {
        return this.invoiceRepository.findOne({
            where: { id, tenantId },
            relations: ['transaction', 'lead', 'issuedBy'],
        });
    }
    async getInvoiceByNumber(invoiceNumber, tenantId) {
        return this.invoiceRepository.findOne({
            where: { invoiceNumber, tenantId },
            relations: ['transaction', 'lead', 'issuedBy'],
        });
    }
    async updateInvoice(id, tenantId, data) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id, tenantId },
        });
        if (!invoice) {
            throw new Error('Recibo/Nota não encontrada');
        }
        if (invoice.status === invoice_entity_1.InvoiceStatus.CANCELADA) {
            throw new Error('Recibo/Nota cancelada não pode ser editada');
        }
        await this.invoiceRepository.update({ id, tenantId }, data);
        return this.getInvoiceById(id, tenantId);
    }
    async cancelInvoice(id, tenantId, reason) {
        const invoice = await this.getInvoiceById(id, tenantId);
        if (!invoice) {
            throw new Error('Recibo/Nota não encontrada');
        }
        if (invoice.status === invoice_entity_1.InvoiceStatus.CANCELADA) {
            throw new Error('Recibo/Nota já está cancelada');
        }
        await this.invoiceRepository.update({ id, tenantId }, {
            status: invoice_entity_1.InvoiceStatus.CANCELADA,
            canceledAt: new Date(),
            cancelReason: reason,
        });
        return this.getInvoiceById(id, tenantId);
    }
    async markAsSent(id, tenantId, data) {
        const invoice = await this.getInvoiceById(id, tenantId);
        if (!invoice) {
            throw new Error('Recibo/Nota não encontrada');
        }
        await this.invoiceRepository.update({ id, tenantId }, {
            status: invoice_entity_1.InvoiceStatus.ENVIADA,
            sentAt: new Date(),
            sentTo: data.sentTo,
            sentMethod: data.sentMethod,
        });
        return this.getInvoiceById(id, tenantId);
    }
    async attachPdf(id, tenantId, pdfUrl) {
        const invoice = await this.getInvoiceById(id, tenantId);
        if (!invoice) {
            throw new Error('Recibo/Nota não encontrada');
        }
        await this.invoiceRepository.update({ id, tenantId }, { pdfUrl });
        return this.getInvoiceById(id, tenantId);
    }
    async getInvoiceStats(tenantId, year) {
        const currentYear = year || new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31);
        const invoices = await this.getInvoicesByTenant(tenantId, {
            dateFrom: startDate,
            dateTo: endDate,
        });
        const totalInvoices = invoices.length;
        const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
        const byType = invoices.reduce((acc, inv) => {
            acc[inv.type] = (acc[inv.type] || 0) + 1;
            return acc;
        }, {});
        const byStatus = invoices.reduce((acc, inv) => {
            acc[inv.status] = (acc[inv.status] || 0) + 1;
            return acc;
        }, {});
        return {
            totalInvoices,
            totalAmount,
            byType,
            byStatus,
        };
    }
}
exports.InvoiceService = InvoiceService;
//# sourceMappingURL=invoice.service.js.map