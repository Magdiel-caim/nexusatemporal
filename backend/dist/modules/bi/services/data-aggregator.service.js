"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAggregatorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../financeiro/transaction.entity");
const venda_entity_1 = require("../../vendas/venda.entity");
const lead_entity_1 = require("../../leads/lead.entity");
const procedure_entity_1 = require("../../leads/procedure.entity");
const vendedor_entity_1 = require("../../vendas/vendedor.entity");
const dashboard_interface_1 = require("../interfaces/dashboard.interface");
let DataAggregatorService = class DataAggregatorService {
    transactionRepo;
    vendaRepo;
    leadRepo;
    procedureRepo;
    vendedorRepo;
    constructor(transactionRepo, vendaRepo, leadRepo, procedureRepo, vendedorRepo) {
        this.transactionRepo = transactionRepo;
        this.vendaRepo = vendaRepo;
        this.leadRepo = leadRepo;
        this.procedureRepo = procedureRepo;
        this.vendedorRepo = vendedorRepo;
    }
    /**
     * Calcular range de datas baseado no tipo
     */
    calculateDateRange(type, startDate, endDate) {
        const now = new Date();
        if (type === dashboard_interface_1.DateRangeType.CUSTOM && startDate && endDate) {
            return {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            };
        }
        switch (type) {
            case dashboard_interface_1.DateRangeType.TODAY:
                return {
                    startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                    endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
                };
            case dashboard_interface_1.DateRangeType.YESTERDAY:
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                return {
                    startDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
                    endDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59),
                };
            case dashboard_interface_1.DateRangeType.LAST_7_DAYS:
                const last7Days = new Date(now);
                last7Days.setDate(last7Days.getDate() - 7);
                return { startDate: last7Days, endDate: now };
            case dashboard_interface_1.DateRangeType.LAST_30_DAYS:
                const last30Days = new Date(now);
                last30Days.setDate(last30Days.getDate() - 30);
                return { startDate: last30Days, endDate: now };
            case dashboard_interface_1.DateRangeType.THIS_MONTH:
                return {
                    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
                    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
                };
            case dashboard_interface_1.DateRangeType.LAST_MONTH:
                return {
                    startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                    endDate: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
                };
            case dashboard_interface_1.DateRangeType.THIS_YEAR:
                return {
                    startDate: new Date(now.getFullYear(), 0, 1),
                    endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
                };
            default:
                // Default: últimos 30 dias
                const defaultStart = new Date(now);
                defaultStart.setDate(defaultStart.getDate() - 30);
                return { startDate: defaultStart, endDate: now };
        }
    }
    /**
     * Total de receitas
     */
    async getTotalRevenue(tenantId, startDate, endDate) {
        const result = await this.transactionRepo
            .createQueryBuilder('t')
            .select('SUM(t.amount)', 'total')
            .where('t.tenantId = :tenantId', { tenantId })
            .andWhere('t.type = :type', { type: transaction_entity_1.TransactionType.RECEITA })
            .andWhere('t.status = :status', { status: transaction_entity_1.TransactionStatus.CONFIRMADA })
            .andWhere('t.referenceDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getRawOne();
        return parseFloat(result?.total || '0');
    }
    /**
     * Total de vendas (quantidade)
     */
    async getSalesCount(tenantId, startDate, endDate) {
        return this.vendaRepo.count({
            where: {
                tenantId,
                status: venda_entity_1.VendaStatus.CONFIRMADA,
                dataVenda: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
    }
    /**
     * Novos leads
     */
    async getNewLeads(tenantId, startDate, endDate) {
        return this.leadRepo.count({
            where: {
                tenantId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
    }
    /**
     * Vendas ao longo do tempo (série temporal)
     */
    async getSalesOverTime(tenantId, startDate, endDate) {
        const results = await this.vendaRepo
            .createQueryBuilder('venda')
            .select('DATE(venda.dataVenda)', 'date')
            .addSelect('SUM(venda.valorLiquido)', 'value')
            .addSelect('COUNT(*)', 'count')
            .where('venda.tenantId = :tenantId', { tenantId })
            .andWhere('venda.status = :status', { status: venda_entity_1.VendaStatus.CONFIRMADA })
            .andWhere('venda.dataVenda BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('DATE(venda.dataVenda)')
            .orderBy('DATE(venda.dataVenda)', 'ASC')
            .getRawMany();
        return results.map((r) => ({
            date: r.date,
            value: parseFloat(r.value),
            count: parseInt(r.count),
        }));
    }
    /**
     * Vendas por produto/procedimento
     */
    async getSalesByProduct(tenantId, startDate, endDate) {
        const results = await this.vendaRepo
            .createQueryBuilder('venda')
            .leftJoinAndSelect('venda.procedure', 'procedure')
            .select('procedure.name', 'name')
            .addSelect('SUM(venda.valorLiquido)', 'value')
            .addSelect('COUNT(*)', 'count')
            .where('venda.tenantId = :tenantId', { tenantId })
            .andWhere('venda.status = :status', { status: venda_entity_1.VendaStatus.CONFIRMADA })
            .andWhere('venda.dataVenda BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('venda.procedureId IS NOT NULL')
            .groupBy('procedure.id, procedure.name')
            .orderBy('SUM(venda.valorLiquido)', 'DESC')
            .limit(10)
            .getRawMany();
        return results.map((r) => ({
            name: r.name || 'Não especificado',
            value: parseFloat(r.value || '0'),
            count: parseInt(r.count || '0'),
        }));
    }
    /**
     * Vendas por vendedor
     */
    async getSalesBySeller(tenantId, startDate, endDate) {
        const results = await this.vendaRepo
            .createQueryBuilder('venda')
            .leftJoinAndSelect('venda.vendedor', 'vendedor')
            .select('vendedor.nome', 'name')
            .addSelect('SUM(venda.valorLiquido)', 'value')
            .addSelect('COUNT(*)', 'count')
            .where('venda.tenantId = :tenantId', { tenantId })
            .andWhere('venda.status = :status', { status: venda_entity_1.VendaStatus.CONFIRMADA })
            .andWhere('venda.dataVenda BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('vendedor.id, vendedor.nome')
            .orderBy('SUM(venda.valorLiquido)', 'DESC')
            .getRawMany();
        return results.map((r) => ({
            name: r.name || 'Sem vendedor',
            value: parseFloat(r.value || '0'),
            count: parseInt(r.count || '0'),
        }));
    }
    /**
     * Funil de vendas (por status de lead)
     */
    async getSalesFunnel(tenantId, startDate, endDate) {
        const statusOrder = [
            lead_entity_1.LeadStatus.NEW,
            lead_entity_1.LeadStatus.CONTACTED,
            lead_entity_1.LeadStatus.QUALIFIED,
            lead_entity_1.LeadStatus.PROPOSAL,
            lead_entity_1.LeadStatus.NEGOTIATION,
            lead_entity_1.LeadStatus.WON,
        ];
        const results = await this.leadRepo
            .createQueryBuilder('lead')
            .select('lead.status', 'stage')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(lead.estimatedValue)', 'value')
            .where('lead.tenantId = :tenantId', { tenantId })
            .andWhere('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('lead.status IN (:...statuses)', { statuses: statusOrder })
            .groupBy('lead.status')
            .getRawMany();
        const resultMap = new Map(results.map((r) => [r.stage, r]));
        return statusOrder.map((status) => {
            const data = resultMap.get(status);
            return {
                stage: status,
                count: parseInt(data?.count || '0'),
                value: parseFloat(data?.value || '0'),
            };
        });
    }
    /**
     * Leads por origem
     */
    async getLeadsBySource(tenantId, startDate, endDate) {
        const results = await this.leadRepo
            .createQueryBuilder('lead')
            .select('lead.source', 'source')
            .addSelect('COUNT(*)', 'count')
            .where('lead.tenantId = :tenantId', { tenantId })
            .andWhere('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('lead.source')
            .orderBy('COUNT(*)', 'DESC')
            .getRawMany();
        return results.map((r) => ({
            source: r.source,
            count: parseInt(r.count),
        }));
    }
    /**
     * Leads por status
     */
    async getLeadsByStatus(tenantId, startDate, endDate) {
        const results = await this.leadRepo
            .createQueryBuilder('lead')
            .select('lead.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('lead.tenantId = :tenantId', { tenantId })
            .andWhere('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('lead.status')
            .orderBy('COUNT(*)', 'DESC')
            .getRawMany();
        return results.map((r) => ({
            status: r.status,
            count: parseInt(r.count),
        }));
    }
    /**
     * Receitas vs Despesas
     */
    async getRevenueVsExpenses(tenantId, startDate, endDate) {
        const results = await this.transactionRepo
            .createQueryBuilder('t')
            .select('t.type', 'type')
            .addSelect('SUM(t.amount)', 'total')
            .where('t.tenantId = :tenantId', { tenantId })
            .andWhere('t.status = :status', { status: transaction_entity_1.TransactionStatus.CONFIRMADA })
            .andWhere('t.referenceDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('t.type IN (:...types)', { types: [transaction_entity_1.TransactionType.RECEITA, transaction_entity_1.TransactionType.DESPESA] })
            .groupBy('t.type')
            .getRawMany();
        const revenue = parseFloat(results.find((r) => r.type === transaction_entity_1.TransactionType.RECEITA)?.total || '0') || 0;
        const expenses = parseFloat(results.find((r) => r.type === transaction_entity_1.TransactionType.DESPESA)?.total || '0') || 0;
        return { revenue, expenses };
    }
    /**
     * Fluxo de caixa (série temporal)
     */
    async getCashFlow(tenantId, startDate, endDate) {
        const results = await this.transactionRepo
            .createQueryBuilder('t')
            .select('DATE(t.referenceDate)', 'date')
            .addSelect('t.type', 'type')
            .addSelect('SUM(t.amount)', 'total')
            .where('t.tenantId = :tenantId', { tenantId })
            .andWhere('t.status = :status', { status: transaction_entity_1.TransactionStatus.CONFIRMADA })
            .andWhere('t.referenceDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('DATE(t.referenceDate), t.type')
            .orderBy('DATE(t.referenceDate)', 'ASC')
            .getRawMany();
        // Agrupar por data
        const dataMap = new Map();
        results.forEach((r) => {
            const date = r.date;
            if (!dataMap.has(date)) {
                dataMap.set(date, { revenue: 0, expenses: 0 });
            }
            const data = dataMap.get(date);
            const amount = parseFloat(r.total);
            if (r.type === transaction_entity_1.TransactionType.RECEITA) {
                data.revenue += amount;
            }
            else if (r.type === transaction_entity_1.TransactionType.DESPESA) {
                data.expenses += amount;
            }
        });
        // Converter para array e calcular balanço
        return Array.from(dataMap.entries()).map(([date, data]) => ({
            date,
            revenue: data.revenue,
            expenses: data.expenses,
            balance: data.revenue - data.expenses,
        }));
    }
    /**
     * Transações por categoria
     */
    async getTransactionsByCategory(tenantId, startDate, endDate) {
        const results = await this.transactionRepo
            .createQueryBuilder('t')
            .select('t.category', 'category')
            .addSelect('SUM(t.amount)', 'amount')
            .addSelect('COUNT(*)', 'count')
            .where('t.tenantId = :tenantId', { tenantId })
            .andWhere('t.status = :status', { status: transaction_entity_1.TransactionStatus.CONFIRMADA })
            .andWhere('t.referenceDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('t.category')
            .orderBy('SUM(t.amount)', 'DESC')
            .getRawMany();
        return results.map((r) => ({
            category: r.category,
            amount: parseFloat(r.amount),
            count: parseInt(r.count),
        }));
    }
};
exports.DataAggregatorService = DataAggregatorService;
exports.DataAggregatorService = DataAggregatorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(venda_entity_1.Venda)),
    __param(2, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __param(3, (0, typeorm_1.InjectRepository)(procedure_entity_1.Procedure)),
    __param(4, (0, typeorm_1.InjectRepository)(vendedor_entity_1.Vendedor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DataAggregatorService);
//# sourceMappingURL=data-aggregator.service.js.map