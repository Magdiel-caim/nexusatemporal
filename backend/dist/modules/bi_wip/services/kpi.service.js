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
exports.KpiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const kpi_target_entity_1 = require("../entities/kpi-target.entity");
const transaction_entity_1 = require("../../financeiro/transaction.entity");
const venda_entity_1 = require("../../vendas/venda.entity");
const lead_entity_1 = require("../../leads/lead.entity");
let KpiService = class KpiService {
    kpiTargetRepo;
    transactionRepo;
    vendaRepo;
    leadRepo;
    constructor(kpiTargetRepo, transactionRepo, vendaRepo, leadRepo) {
        this.kpiTargetRepo = kpiTargetRepo;
        this.transactionRepo = transactionRepo;
        this.vendaRepo = vendaRepo;
        this.leadRepo = leadRepo;
    }
    /**
     * Criar meta de KPI
     */
    async createTarget(tenantId, userId, dto) {
        const target = this.kpiTargetRepo.create({
            ...dto,
            tenantId,
            createdById: userId,
        });
        return this.kpiTargetRepo.save(target);
    }
    /**
     * Atualizar meta de KPI
     */
    async updateTarget(id, tenantId, dto) {
        const target = await this.kpiTargetRepo.findOne({
            where: { id, tenantId },
        });
        if (!target) {
            throw new Error('Meta não encontrada');
        }
        Object.assign(target, dto);
        return this.kpiTargetRepo.save(target);
    }
    /**
     * Listar metas ativas
     */
    async findActiveTargets(tenantId, period) {
        const where = { tenantId, isActive: true };
        if (period) {
            where.period = period;
        }
        return this.kpiTargetRepo.find({
            where,
            relations: ['createdBy'],
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Calcular Taxa de Conversão (Leads -> Vendas)
     */
    async calculateConversionRate(tenantId, startDate, endDate) {
        // Total de leads no período
        const totalLeads = await this.leadRepo.count({
            where: {
                tenantId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        // Leads convertidos (status WON)
        const convertedLeads = await this.leadRepo.count({
            where: {
                tenantId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
                status: lead_entity_1.LeadStatus.WON,
            },
        });
        const currentValue = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
        // Buscar meta
        const target = await this.findTargetByKpiName(tenantId, 'conversion_rate');
        return {
            name: 'Taxa de Conversão',
            value: currentValue,
            unit: '%',
            target: target?.targetValue || null,
            trend: await this.calculateTrend('conversion_rate', tenantId, startDate, endDate),
            period: 'custom',
            metadata: {
                totalLeads,
                convertedLeads,
            },
        };
    }
    /**
     * Calcular Ticket Médio
     */
    async calculateAverageTicket(tenantId, startDate, endDate) {
        const result = await this.vendaRepo
            .createQueryBuilder('venda')
            .select('AVG(venda.valorLiquido)', 'avgTicket')
            .addSelect('COUNT(*)', 'totalVendas')
            .where('venda.tenantId = :tenantId', { tenantId })
            .andWhere('venda.status = :status', { status: venda_entity_1.VendaStatus.CONFIRMADA })
            .andWhere('venda.dataVenda BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getRawOne();
        const currentValue = parseFloat(result?.avgTicket || '0');
        const target = await this.findTargetByKpiName(tenantId, 'average_ticket');
        return {
            name: 'Ticket Médio',
            value: currentValue,
            unit: 'R$',
            target: target?.targetValue || null,
            trend: await this.calculateTrend('average_ticket', tenantId, startDate, endDate),
            period: 'custom',
            metadata: {
                totalVendas: parseInt(result?.totalVendas || '0'),
            },
        };
    }
    /**
     * Calcular Receita Total
     */
    async calculateTotalRevenue(tenantId, startDate, endDate) {
        const result = await this.transactionRepo
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .where('transaction.tenantId = :tenantId', { tenantId })
            .andWhere('transaction.type = :type', { type: transaction_entity_1.TransactionType.RECEITA })
            .andWhere('transaction.status = :status', { status: transaction_entity_1.TransactionStatus.CONFIRMADA })
            .andWhere('transaction.referenceDate BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        })
            .getRawOne();
        const currentValue = parseFloat(result?.total || '0');
        const target = await this.findTargetByKpiName(tenantId, 'revenue');
        return {
            name: 'Receita Total',
            value: currentValue,
            unit: 'R$',
            target: target?.targetValue || null,
            trend: await this.calculateTrend('revenue', tenantId, startDate, endDate),
            period: 'custom',
        };
    }
    /**
     * Calcular Total de Despesas
     */
    async calculateTotalExpenses(tenantId, startDate, endDate) {
        const result = await this.transactionRepo
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .where('transaction.tenantId = :tenantId', { tenantId })
            .andWhere('transaction.type = :type', { type: transaction_entity_1.TransactionType.DESPESA })
            .andWhere('transaction.status = :status', { status: transaction_entity_1.TransactionStatus.CONFIRMADA })
            .andWhere('transaction.referenceDate BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        })
            .getRawOne();
        const currentValue = parseFloat(result?.total || '0');
        const target = await this.findTargetByKpiName(tenantId, 'expenses');
        return {
            name: 'Despesas Totais',
            value: currentValue,
            unit: 'R$',
            target: target?.targetValue || null,
            trend: await this.calculateTrend('expenses', tenantId, startDate, endDate),
            period: 'custom',
        };
    }
    /**
     * Calcular Lucro Líquido
     */
    async calculateNetProfit(tenantId, startDate, endDate) {
        const revenue = await this.calculateTotalRevenue(tenantId, startDate, endDate);
        const expenses = await this.calculateTotalExpenses(tenantId, startDate, endDate);
        const currentValue = revenue.value - expenses.value;
        const target = await this.findTargetByKpiName(tenantId, 'net_profit');
        return {
            name: 'Lucro Líquido',
            value: currentValue,
            unit: 'R$',
            target: target?.targetValue || null,
            trend: await this.calculateTrend('net_profit', tenantId, startDate, endDate),
            period: 'custom',
            metadata: {
                revenue: revenue.value,
                expenses: expenses.value,
            },
        };
    }
    /**
     * Calcular Margem de Lucro
     */
    async calculateProfitMargin(tenantId, startDate, endDate) {
        const netProfit = await this.calculateNetProfit(tenantId, startDate, endDate);
        const revenue = netProfit.metadata.revenue;
        const currentValue = revenue > 0 ? (netProfit.value / revenue) * 100 : 0;
        const target = await this.findTargetByKpiName(tenantId, 'profit_margin');
        return {
            name: 'Margem de Lucro',
            value: currentValue,
            unit: '%',
            target: target?.targetValue || null,
            trend: await this.calculateTrend('profit_margin', tenantId, startDate, endDate),
            period: 'custom',
        };
    }
    /**
     * Obter todos os KPIs principais
     */
    async getAllMainKpis(tenantId, startDate, endDate) {
        const [revenue, expenses, netProfit, profitMargin, conversionRate, averageTicket] = await Promise.all([
            this.calculateTotalRevenue(tenantId, startDate, endDate),
            this.calculateTotalExpenses(tenantId, startDate, endDate),
            this.calculateNetProfit(tenantId, startDate, endDate),
            this.calculateProfitMargin(tenantId, startDate, endDate),
            this.calculateConversionRate(tenantId, startDate, endDate),
            this.calculateAverageTicket(tenantId, startDate, endDate),
        ]);
        return {
            revenue,
            expenses,
            netProfit,
            profitMargin,
            conversionRate,
            averageTicket,
        };
    }
    /**
     * Calcular tendência (comparação com período anterior)
     */
    async calculateTrend(kpiName, tenantId, startDate, endDate) {
        const periodDuration = endDate.getTime() - startDate.getTime();
        const previousStartDate = new Date(startDate.getTime() - periodDuration);
        const previousEndDate = new Date(startDate.getTime() - 1);
        let currentValue = 0;
        let previousValue = 0;
        // Buscar valores atual e anterior baseado no KPI
        switch (kpiName) {
            case 'revenue':
                currentValue = (await this.calculateTotalRevenue(tenantId, startDate, endDate)).value;
                previousValue = (await this.calculateTotalRevenue(tenantId, previousStartDate, previousEndDate)).value;
                break;
            case 'conversion_rate':
                currentValue = (await this.calculateConversionRate(tenantId, startDate, endDate)).value;
                previousValue = (await this.calculateConversionRate(tenantId, previousStartDate, previousEndDate)).value;
                break;
            // Adicionar outros KPIs conforme necessário
        }
        if (previousValue === 0)
            return 0;
        return ((currentValue - previousValue) / previousValue) * 100;
    }
    /**
     * Buscar meta por nome do KPI
     */
    async findTargetByKpiName(tenantId, kpiName) {
        return this.kpiTargetRepo.findOne({
            where: {
                tenantId,
                kpiName,
                isActive: true,
            },
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Deletar meta
     */
    async deleteTarget(id, tenantId) {
        await this.kpiTargetRepo.update({ id, tenantId }, { isActive: false });
    }
};
exports.KpiService = KpiService;
exports.KpiService = KpiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(kpi_target_entity_1.KpiTarget)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(2, (0, typeorm_1.InjectRepository)(venda_entity_1.Venda)),
    __param(3, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], KpiService);
//# sourceMappingURL=kpi.service.js.map