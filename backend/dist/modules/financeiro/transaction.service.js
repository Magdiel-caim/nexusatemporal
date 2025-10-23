"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const data_source_1 = require("../../database/data-source");
const transaction_entity_1 = require("./transaction.entity");
const lead_entity_1 = require("../leads/lead.entity");
const appointment_entity_1 = require("../agenda/appointment.entity");
const typeorm_1 = require("typeorm");
class TransactionService {
    transactionRepository = data_source_1.CrmDataSource.getRepository(transaction_entity_1.Transaction);
    leadRepository = data_source_1.CrmDataSource.getRepository(lead_entity_1.Lead);
    appointmentRepository = data_source_1.CrmDataSource.getRepository(appointment_entity_1.Appointment);
    async createTransaction(data) {
        const transaction = this.transactionRepository.create({
            ...data,
            status: data.status || transaction_entity_1.TransactionStatus.PENDENTE,
        });
        const savedTransaction = await this.transactionRepository.save(transaction);
        return this.getTransactionById(savedTransaction.id, data.tenantId);
    }
    async getTransactionsByTenant(tenantId, filters) {
        const where = { tenantId };
        if (filters?.type)
            where.type = filters.type;
        if (filters?.category)
            where.category = filters.category;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.paymentMethod)
            where.paymentMethod = filters.paymentMethod;
        if (filters?.leadId)
            where.leadId = filters.leadId;
        if (filters?.appointmentId)
            where.appointmentId = filters.appointmentId;
        if (filters?.supplierId)
            where.supplierId = filters.supplierId;
        if (filters?.dateFrom && filters?.dateTo) {
            where.paymentDate = (0, typeorm_1.Between)(filters.dateFrom, filters.dateTo);
        }
        if (filters?.dueDateFrom && filters?.dueDateTo) {
            where.dueDate = (0, typeorm_1.Between)(filters.dueDateFrom, filters.dueDateTo);
        }
        if (filters?.search) {
            where.description = (0, typeorm_1.Like)(`%${filters.search}%`);
        }
        const query = this.transactionRepository
            .createQueryBuilder('transaction')
            .where(where)
            .leftJoinAndSelect('transaction.lead', 'lead')
            .leftJoinAndSelect('transaction.appointment', 'appointment')
            .leftJoinAndSelect('transaction.procedure', 'procedure')
            .leftJoinAndSelect('transaction.supplier', 'supplier')
            .leftJoinAndSelect('transaction.createdBy', 'createdBy')
            .leftJoinAndSelect('transaction.approvedBy', 'approvedBy');
        if (filters?.minAmount !== undefined) {
            query.andWhere('transaction.amount >= :minAmount', {
                minAmount: filters.minAmount,
            });
        }
        if (filters?.maxAmount !== undefined) {
            query.andWhere('transaction.amount <= :maxAmount', {
                maxAmount: filters.maxAmount,
            });
        }
        query.orderBy('transaction.dueDate', 'DESC');
        return query.getMany();
    }
    async getTransactionById(id, tenantId) {
        return this.transactionRepository.findOne({
            where: { id, tenantId },
            relations: [
                'lead',
                'appointment',
                'procedure',
                'supplier',
                'createdBy',
                'approvedBy',
            ],
        });
    }
    async updateTransaction(id, tenantId, data, userId) {
        const transaction = await this.transactionRepository.findOne({
            where: { id, tenantId },
        });
        if (!transaction) {
            throw new Error('Transação não encontrada');
        }
        // Não permitir edição de transação confirmada (apenas estornar)
        if (transaction.status === transaction_entity_1.TransactionStatus.CONFIRMADA &&
            data.status !== transaction_entity_1.TransactionStatus.ESTORNADA) {
            throw new Error('Transação confirmada não pode ser editada. Use a opção de estorno.');
        }
        await this.transactionRepository.update({ id, tenantId }, data);
        return this.getTransactionById(id, tenantId);
    }
    async confirmTransaction(id, tenantId, data) {
        const transaction = await this.getTransactionById(id, tenantId);
        if (!transaction) {
            throw new Error('Transação não encontrada');
        }
        if (transaction.status === transaction_entity_1.TransactionStatus.CONFIRMADA) {
            throw new Error('Transação já confirmada');
        }
        await this.transactionRepository.update({ id, tenantId }, {
            status: transaction_entity_1.TransactionStatus.CONFIRMADA,
            paymentDate: data.paymentDate,
            paymentMethod: data.paymentMethod || transaction.paymentMethod,
            approvedById: data.approvedById,
            approvedAt: new Date(),
        });
        return this.getTransactionById(id, tenantId);
    }
    async cancelTransaction(id, tenantId, userId, reason) {
        const transaction = await this.getTransactionById(id, tenantId);
        if (!transaction) {
            throw new Error('Transação não encontrada');
        }
        if (transaction.status === transaction_entity_1.TransactionStatus.CONFIRMADA) {
            throw new Error('Transação confirmada não pode ser cancelada. Use a opção de estorno.');
        }
        await this.transactionRepository.update({ id, tenantId }, {
            status: transaction_entity_1.TransactionStatus.CANCELADA,
            notes: reason
                ? `${transaction.notes || ''}\n\nMotivo do cancelamento: ${reason}`
                : transaction.notes,
        });
        return this.getTransactionById(id, tenantId);
    }
    async reverseTransaction(id, tenantId, userId, reason) {
        const transaction = await this.getTransactionById(id, tenantId);
        if (!transaction) {
            throw new Error('Transação não encontrada');
        }
        if (transaction.status !== transaction_entity_1.TransactionStatus.CONFIRMADA) {
            throw new Error('Apenas transações confirmadas podem ser estornadas');
        }
        await this.transactionRepository.update({ id, tenantId }, {
            status: transaction_entity_1.TransactionStatus.ESTORNADA,
            notes: `${transaction.notes || ''}\n\nMotivo do estorno: ${reason}`,
        });
        return this.getTransactionById(id, tenantId);
    }
    async deleteTransaction(id, tenantId) {
        const transaction = await this.getTransactionById(id, tenantId);
        if (!transaction) {
            throw new Error('Transação não encontrada');
        }
        if (transaction.status === transaction_entity_1.TransactionStatus.CONFIRMADA) {
            throw new Error('Transação confirmada não pode ser excluída. Use a opção de estorno.');
        }
        // Soft delete (cancelar ao invés de excluir)
        await this.transactionRepository.update({ id, tenantId }, {
            status: transaction_entity_1.TransactionStatus.CANCELADA,
            notes: `${transaction.notes || ''}\n\nTransação excluída`,
        });
        return { success: true };
    }
    async createInstallmentTransactions(data) {
        const installmentAmount = data.totalAmount / data.totalInstallments;
        const transactions = [];
        const parentTransaction = await this.createTransaction({
            type: data.type,
            category: data.category,
            amount: data.totalAmount,
            description: `${data.description} (Total ${data.totalInstallments}x)`,
            paymentMethod: data.paymentMethod,
            status: transaction_entity_1.TransactionStatus.CONFIRMADA,
            leadId: data.leadId,
            appointmentId: data.appointmentId,
            procedureId: data.procedureId,
            supplierId: data.supplierId,
            dueDate: data.firstDueDate,
            referenceDate: data.referenceDate,
            isInstallment: true,
            totalInstallments: data.totalInstallments,
            tenantId: data.tenantId,
            createdById: data.createdById,
        });
        if (!parentTransaction) {
            throw new Error('Erro ao criar transação pai do parcelamento');
        }
        for (let i = 1; i <= data.totalInstallments; i++) {
            const dueDate = new Date(data.firstDueDate);
            dueDate.setMonth(dueDate.getMonth() + (i - 1));
            const transaction = await this.createTransaction({
                type: data.type,
                category: data.category,
                amount: installmentAmount,
                description: `${data.description} (${i}/${data.totalInstallments})`,
                paymentMethod: data.paymentMethod,
                status: transaction_entity_1.TransactionStatus.PENDENTE,
                leadId: data.leadId,
                appointmentId: data.appointmentId,
                procedureId: data.procedureId,
                supplierId: data.supplierId,
                dueDate,
                referenceDate: data.referenceDate,
                isInstallment: true,
                installmentNumber: i,
                totalInstallments: data.totalInstallments,
                parentTransactionId: parentTransaction.id,
                tenantId: data.tenantId,
                createdById: data.createdById,
            });
            if (transaction) {
                transactions.push(transaction);
            }
        }
        return transactions;
    }
    // Analytics and Reports
    async getTransactionStats(tenantId, dateFrom, dateTo) {
        const transactions = await this.getTransactionsByTenant(tenantId, {
            dateFrom,
            dateTo,
            status: transaction_entity_1.TransactionStatus.CONFIRMADA,
        });
        const totalIncome = transactions
            .filter((t) => t.type === transaction_entity_1.TransactionType.RECEITA)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = transactions
            .filter((t) => t.type === transaction_entity_1.TransactionType.DESPESA)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const balance = totalIncome - totalExpense;
        const byCategory = transactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
            return acc;
        }, {});
        const byPaymentMethod = transactions.reduce((acc, t) => {
            if (t.paymentMethod) {
                acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + Number(t.amount);
            }
            return acc;
        }, {});
        return {
            totalIncome,
            totalExpense,
            balance,
            transactionCount: transactions.length,
            byCategory,
            byPaymentMethod,
        };
    }
    async getAccountsReceivable(tenantId, dateLimit) {
        const limit = dateLimit || new Date();
        limit.setDate(limit.getDate() + 30); // Próximos 30 dias por padrão
        return this.getTransactionsByTenant(tenantId, {
            type: transaction_entity_1.TransactionType.RECEITA,
            status: transaction_entity_1.TransactionStatus.PENDENTE,
            dueDateTo: limit,
        });
    }
    async getAccountsPayable(tenantId, dateLimit) {
        const limit = dateLimit || new Date();
        limit.setDate(limit.getDate() + 30); // Próximos 30 dias por padrão
        return this.getTransactionsByTenant(tenantId, {
            type: transaction_entity_1.TransactionType.DESPESA,
            status: transaction_entity_1.TransactionStatus.PENDENTE,
            dueDateTo: limit,
        });
    }
    async getOverdueTransactions(tenantId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const query = this.transactionRepository
            .createQueryBuilder('transaction')
            .where('transaction.tenantId = :tenantId', { tenantId })
            .andWhere('transaction.status = :status', {
            status: transaction_entity_1.TransactionStatus.PENDENTE,
        })
            .andWhere('transaction.dueDate < :today', { today })
            .leftJoinAndSelect('transaction.lead', 'lead')
            .leftJoinAndSelect('transaction.supplier', 'supplier')
            .orderBy('transaction.dueDate', 'ASC');
        return query.getMany();
    }
    async getCashFlow(tenantId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const transactions = await this.getTransactionsByTenant(tenantId, {
            dateFrom: startDate,
            dateTo: endDate,
            status: transaction_entity_1.TransactionStatus.CONFIRMADA,
        });
        const dailyFlow = {};
        for (const t of transactions) {
            const dateKey = t.paymentDate.toISOString().split('T')[0];
            if (!dailyFlow[dateKey]) {
                dailyFlow[dateKey] = { income: 0, expense: 0, balance: 0 };
            }
            if (t.type === transaction_entity_1.TransactionType.RECEITA) {
                dailyFlow[dateKey].income += Number(t.amount);
            }
            else if (t.type === transaction_entity_1.TransactionType.DESPESA) {
                dailyFlow[dateKey].expense += Number(t.amount);
            }
            dailyFlow[dateKey].balance =
                dailyFlow[dateKey].income - dailyFlow[dateKey].expense;
        }
        return dailyFlow;
    }
}
exports.TransactionService = TransactionService;
//# sourceMappingURL=transaction.service.js.map