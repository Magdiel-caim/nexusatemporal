"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashFlowService = void 0;
const data_source_1 = require("../../database/data-source");
const cash_flow_entity_1 = require("./cash-flow.entity");
const transaction_entity_1 = require("./transaction.entity");
const typeorm_1 = require("typeorm");
class CashFlowService {
    cashFlowRepository = data_source_1.CrmDataSource.getRepository(cash_flow_entity_1.CashFlow);
    transactionRepository = data_source_1.CrmDataSource.getRepository(transaction_entity_1.Transaction);
    async openCashFlow(data) {
        // Verificar se já existe fluxo de caixa para esta data
        const existing = await this.cashFlowRepository.findOne({
            where: { date: data.date, tenantId: data.tenantId },
        });
        if (existing) {
            throw new Error('Já existe um fluxo de caixa para esta data');
        }
        const cashFlow = this.cashFlowRepository.create({
            ...data,
            type: cash_flow_entity_1.CashFlowType.ABERTURA,
            openedAt: new Date(),
            isClosed: false,
        });
        const savedCashFlow = await this.cashFlowRepository.save(cashFlow);
        return this.getCashFlowById(savedCashFlow.id, data.tenantId);
    }
    async closeCashFlow(data) {
        const cashFlow = await this.getCashFlowById(data.id, data.tenantId);
        if (!cashFlow) {
            throw new Error('Fluxo de caixa não encontrado');
        }
        if (cashFlow.isClosed) {
            throw new Error('Fluxo de caixa já está fechado');
        }
        await this.cashFlowRepository.update({ id: data.id, tenantId: data.tenantId }, {
            type: cash_flow_entity_1.CashFlowType.FECHAMENTO,
            closingBalance: data.closingBalance,
            cashAmount: data.cashAmount,
            pixAmount: data.pixAmount,
            creditCardAmount: data.creditCardAmount,
            debitCardAmount: data.debitCardAmount,
            transferAmount: data.transferAmount,
            otherAmount: data.otherAmount,
            withdrawals: data.withdrawals || 0,
            deposits: data.deposits || 0,
            notes: data.notes,
            isClosed: true,
            closedAt: new Date(),
            closedById: data.closedById,
        });
        return this.getCashFlowById(data.id, data.tenantId);
    }
    async getCashFlowById(id, tenantId) {
        return this.cashFlowRepository.findOne({
            where: { id, tenantId },
            relations: ['openedBy', 'closedBy'],
        });
    }
    async getCashFlowByDate(date, tenantId) {
        return this.cashFlowRepository.findOne({
            where: { date, tenantId },
            relations: ['openedBy', 'closedBy'],
        });
    }
    async getCashFlowsByTenant(tenantId, filters) {
        const where = { tenantId };
        if (filters?.isClosed !== undefined) {
            where.isClosed = filters.isClosed;
        }
        if (filters?.dateFrom && filters?.dateTo) {
            where.date = (0, typeorm_1.Between)(filters.dateFrom, filters.dateTo);
        }
        return this.cashFlowRepository.find({
            where,
            relations: ['openedBy', 'closedBy'],
            order: { date: 'DESC' },
        });
    }
    async updateCashFlowFromTransactions(date, tenantId) {
        const cashFlow = await this.getCashFlowByDate(date, tenantId);
        if (!cashFlow) {
            throw new Error('Fluxo de caixa não encontrado para esta data');
        }
        if (cashFlow.isClosed) {
            throw new Error('Fluxo de caixa fechado não pode ser atualizado automaticamente');
        }
        // Buscar todas as transações confirmadas do dia
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const transactions = await this.transactionRepository.find({
            where: {
                tenantId,
                status: transaction_entity_1.TransactionStatus.CONFIRMADA,
                paymentDate: (0, typeorm_1.Between)(startOfDay, endOfDay),
            },
        });
        // Helper para garantir valor numérico válido
        const safeAmount = (amount) => {
            const num = Number(amount);
            return isNaN(num) ? 0 : num;
        };
        // Calcular totais
        let totalIncome = 0;
        let totalExpense = 0;
        let cashAmount = 0;
        let pixAmount = 0;
        let creditCardAmount = 0;
        let debitCardAmount = 0;
        let transferAmount = 0;
        let otherAmount = 0;
        for (const t of transactions) {
            const amount = safeAmount(t.amount);
            if (t.type === transaction_entity_1.TransactionType.RECEITA) {
                totalIncome += amount;
            }
            else if (t.type === transaction_entity_1.TransactionType.DESPESA) {
                totalExpense += amount;
            }
            // Distribuir por forma de pagamento
            switch (t.paymentMethod) {
                case transaction_entity_1.PaymentMethod.DINHEIRO:
                    cashAmount += amount;
                    break;
                case transaction_entity_1.PaymentMethod.PIX:
                    pixAmount += amount;
                    break;
                case transaction_entity_1.PaymentMethod.CARTAO_CREDITO:
                    creditCardAmount += amount;
                    break;
                case transaction_entity_1.PaymentMethod.CARTAO_DEBITO:
                    debitCardAmount += amount;
                    break;
                case transaction_entity_1.PaymentMethod.TRANSFERENCIA_BANCARIA:
                    transferAmount += amount;
                    break;
                default:
                    otherAmount += amount;
            }
        }
        const closingBalance = safeAmount(cashFlow.openingBalance) +
            totalIncome -
            totalExpense +
            safeAmount(cashFlow.deposits) -
            safeAmount(cashFlow.withdrawals);
        await this.cashFlowRepository.update({ id: cashFlow.id }, {
            totalIncome,
            totalExpense,
            cashAmount,
            pixAmount,
            creditCardAmount,
            debitCardAmount,
            transferAmount,
            otherAmount,
            closingBalance,
        });
        return this.getCashFlowById(cashFlow.id, tenantId);
    }
    async recordWithdrawal(id, tenantId, amount, notes) {
        const cashFlow = await this.getCashFlowById(id, tenantId);
        if (!cashFlow) {
            throw new Error('Fluxo de caixa não encontrado');
        }
        if (cashFlow.isClosed) {
            throw new Error('Fluxo de caixa fechado não pode ser alterado');
        }
        const currentWithdrawals = Number(cashFlow.withdrawals || 0);
        const newWithdrawals = currentWithdrawals + amount;
        await this.cashFlowRepository.update({ id, tenantId }, {
            type: cash_flow_entity_1.CashFlowType.SANGRIA,
            withdrawals: newWithdrawals,
            notes: notes
                ? `${cashFlow.notes || ''}\nSangria: ${notes}`
                : cashFlow.notes,
        });
        // Recalcular saldo
        await this.updateCashFlowFromTransactions(cashFlow.date, tenantId);
        return this.getCashFlowById(id, tenantId);
    }
    async recordDeposit(id, tenantId, amount, notes) {
        const cashFlow = await this.getCashFlowById(id, tenantId);
        if (!cashFlow) {
            throw new Error('Fluxo de caixa não encontrado');
        }
        if (cashFlow.isClosed) {
            throw new Error('Fluxo de caixa fechado não pode ser alterado');
        }
        const currentDeposits = Number(cashFlow.deposits || 0);
        const newDeposits = currentDeposits + amount;
        await this.cashFlowRepository.update({ id, tenantId }, {
            type: cash_flow_entity_1.CashFlowType.REFORCO,
            deposits: newDeposits,
            notes: notes
                ? `${cashFlow.notes || ''}\nReforço: ${notes}`
                : cashFlow.notes,
        });
        // Recalcular saldo
        await this.updateCashFlowFromTransactions(cashFlow.date, tenantId);
        return this.getCashFlowById(id, tenantId);
    }
    async getCashFlowSummary(tenantId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const cashFlows = await this.getCashFlowsByTenant(tenantId, {
            dateFrom: startDate,
            dateTo: endDate,
        });
        const totalDays = cashFlows.length;
        const closedDays = cashFlows.filter((cf) => cf.isClosed).length;
        const openDays = totalDays - closedDays;
        // Helper para garantir valor numérico válido
        const safeAmount = (amount) => {
            const num = Number(amount);
            return isNaN(num) ? 0 : num;
        };
        const totalIncome = cashFlows.reduce((sum, cf) => sum + safeAmount(cf.totalIncome), 0);
        const totalExpense = cashFlows.reduce((sum, cf) => sum + safeAmount(cf.totalExpense), 0);
        const totalWithdrawals = cashFlows.reduce((sum, cf) => sum + safeAmount(cf.withdrawals), 0);
        const totalDeposits = cashFlows.reduce((sum, cf) => sum + safeAmount(cf.deposits), 0);
        const currentBalance = cashFlows.length > 0
            ? safeAmount(cashFlows[0].closingBalance)
            : 0;
        return {
            totalDays,
            closedDays,
            openDays,
            totalIncome,
            totalExpense,
            totalWithdrawals,
            totalDeposits,
            currentBalance,
            netFlow: totalIncome - totalExpense,
        };
    }
}
exports.CashFlowService = CashFlowService;
//# sourceMappingURL=cash-flow.service.js.map