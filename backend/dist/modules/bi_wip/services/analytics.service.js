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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("../../leads/lead.entity");
const venda_entity_1 = require("../../vendas/venda.entity");
const transaction_entity_1 = require("../../financeiro/transaction.entity");
let AnalyticsService = class AnalyticsService {
    leadRepo;
    vendaRepo;
    transactionRepo;
    constructor(leadRepo, vendaRepo, transactionRepo) {
        this.leadRepo = leadRepo;
        this.vendaRepo = vendaRepo;
        this.transactionRepo = transactionRepo;
    }
    /**
     * Análise de Cohort (Coorte)
     * Agrupa clientes por período de aquisição e analisa comportamento
     */
    async cohortAnalysis(tenantId, startDate, endDate, groupBy = 'month') {
        // Buscar leads convertidos agrupados por período de criação
        const leads = await this.leadRepo
            .createQueryBuilder('lead')
            .where('lead.tenantId = :tenantId', { tenantId })
            .andWhere('lead.status = :status', { status: lead_entity_1.LeadStatus.WON })
            .andWhere('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('lead.createdAt', 'ASC')
            .getMany();
        // Agrupar por cohort
        const cohorts = new Map();
        leads.forEach((lead) => {
            const cohortKey = this.getCohortKey(lead.createdAt, groupBy);
            if (!cohorts.has(cohortKey)) {
                cohorts.set(cohortKey, []);
            }
            cohorts.get(cohortKey).push(lead);
        });
        // Análise de cada cohort
        const analysis = [];
        for (const [cohort, cohortLeads] of cohorts.entries()) {
            const leadIds = cohortLeads.map((l) => l.id);
            // Buscar vendas desses leads ao longo do tempo
            const vendas = await this.vendaRepo
                .createQueryBuilder('venda')
                .where('venda.tenantId = :tenantId', { tenantId })
                .andWhere('venda.leadId IN (:...leadIds)', { leadIds })
                .andWhere('venda.status = :status', { status: venda_entity_1.VendaStatus.CONFIRMADA })
                .getMany();
            // Calcular retenção e receita por período
            const retentionRate = {};
            const revenue = {};
            vendas.forEach((venda) => {
                const periodKey = this.getCohortKey(venda.dataVenda, groupBy);
                revenue[periodKey] = (revenue[periodKey] || 0) + Number(venda.valorLiquido);
                retentionRate[periodKey] = (retentionRate[periodKey] || 0) + 1;
            });
            // Calcular taxa de retenção em %
            Object.keys(retentionRate).forEach((period) => {
                retentionRate[period] = (retentionRate[period] / leadIds.length) * 100;
            });
            analysis.push({
                cohort,
                totalCustomers: leadIds.length,
                retentionRate,
                revenue,
            });
        }
        return analysis;
    }
    /**
     * Análise de Tendências
     * Identifica padrões e tendências em métricas ao longo do tempo
     */
    async trendAnalysis(tenantId, metric, startDate, endDate, period = 'day') {
        let data = [];
        switch (metric) {
            case 'revenue':
                data = await this.getRevenueByPeriod(tenantId, startDate, endDate, period);
                break;
            case 'sales':
                data = await this.getSalesByPeriod(tenantId, startDate, endDate, period);
                break;
            case 'leads':
                data = await this.getLeadsByPeriod(tenantId, startDate, endDate, period);
                break;
            case 'conversion':
                data = await this.getConversionByPeriod(tenantId, startDate, endDate, period);
                break;
        }
        // Calcular tendência (% de mudança)
        const dataWithTrend = data.map((item, index) => {
            let trend = 0;
            if (index > 0) {
                const previous = data[index - 1].value;
                trend = previous > 0 ? ((item.value - previous) / previous) * 100 : 0;
            }
            return {
                period: item.period,
                value: item.value,
                trend,
            };
        });
        // Simples previsão (média móvel)
        const prediction = this.calculatePrediction(data, 3);
        return {
            metric,
            data: dataWithTrend,
            prediction,
        };
    }
    /**
     * Análise por Segmentos
     * Analisa performance por diferentes segmentos (fonte, região, etc)
     */
    async segmentAnalysis(tenantId, startDate, endDate, segmentBy) {
        const leads = await this.leadRepo
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.stage', 'stage')
            .where('lead.tenantId = :tenantId', { tenantId })
            .andWhere('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getMany();
        // Agrupar por segmento
        const segments = new Map();
        leads.forEach((lead) => {
            const segmentKey = lead[segmentBy] || 'Não especificado';
            if (!segments.has(segmentKey)) {
                segments.set(segmentKey, []);
            }
            segments.get(segmentKey).push(lead);
        });
        // Análise de cada segmento
        const analysis = [];
        for (const [segment, segmentLeads] of segments.entries()) {
            const leadIds = segmentLeads.map((l) => l.id);
            // Buscar vendas
            const vendas = await this.vendaRepo
                .createQueryBuilder('venda')
                .where('venda.tenantId = :tenantId', { tenantId })
                .andWhere('venda.leadId IN (:...leadIds)', { leadIds })
                .andWhere('venda.status = :status', { status: venda_entity_1.VendaStatus.CONFIRMADA })
                .getMany();
            const totalRevenue = vendas.reduce((sum, v) => sum + Number(v.valorLiquido), 0);
            const convertedCount = segmentLeads.filter((l) => l.status === lead_entity_1.LeadStatus.WON).length;
            analysis.push({
                segment,
                count: segmentLeads.length,
                revenue: totalRevenue,
                averageValue: vendas.length > 0 ? totalRevenue / vendas.length : 0,
                conversionRate: segmentLeads.length > 0 ? (convertedCount / segmentLeads.length) * 100 : 0,
            });
        }
        return analysis.sort((a, b) => b.revenue - a.revenue);
    }
    /**
     * Análise de Performance de Vendedores
     */
    async sellerPerformance(tenantId, startDate, endDate) {
        const vendas = await this.vendaRepo
            .createQueryBuilder('venda')
            .leftJoinAndSelect('venda.vendedor', 'vendedor')
            .where('venda.tenantId = :tenantId', { tenantId })
            .andWhere('venda.status = :status', { status: venda_entity_1.VendaStatus.CONFIRMADA })
            .andWhere('venda.dataVenda BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getMany();
        // Agrupar por vendedor
        const sellerMap = new Map();
        vendas.forEach((venda) => {
            const sellerId = venda.vendedorId;
            if (!sellerMap.has(sellerId)) {
                sellerMap.set(sellerId, {
                    sellerId,
                    sellerName: venda.vendedor?.nome || 'Desconhecido',
                    vendas: [],
                });
            }
            sellerMap.get(sellerId).vendas.push(venda);
        });
        // Calcular métricas
        const performance = [];
        for (const [sellerId, data] of sellerMap.entries()) {
            const totalRevenue = data.vendas.reduce((sum, v) => sum + Number(v.valorLiquido), 0);
            const totalSales = data.vendas.length;
            // Buscar leads do vendedor para calcular conversão
            const sellerLeads = await this.leadRepo.count({
                where: {
                    tenantId,
                    assignedToId: sellerId,
                    createdAt: (0, typeorm_2.Between)(startDate, endDate),
                },
            });
            performance.push({
                sellerId: data.sellerId,
                sellerName: data.sellerName,
                totalSales,
                totalRevenue,
                averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
                conversionRate: sellerLeads > 0 ? (totalSales / sellerLeads) * 100 : 0,
            });
        }
        return performance.sort((a, b) => b.totalRevenue - a.totalRevenue);
    }
    // Métodos auxiliares privados
    getCohortKey(date, groupBy) {
        const year = date.getFullYear();
        if (groupBy === 'month') {
            const month = date.getMonth() + 1;
            return `${year}-${month.toString().padStart(2, '0')}`;
        }
        else {
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            return `${year}-Q${quarter}`;
        }
    }
    async getRevenueByPeriod(tenantId, startDate, endDate, period) {
        const dateFormat = period === 'day' ? 'DATE' : period === 'week' ? 'YEARWEEK' : 'DATE_FORMAT';
        const formatArg = period === 'month' ? "'%Y-%m'" : '';
        const results = await this.transactionRepo
            .createQueryBuilder('t')
            .select(`${dateFormat}(t.referenceDate${formatArg ? `, ${formatArg}` : ''})`, 'period')
            .addSelect('SUM(t.amount)', 'value')
            .where('t.tenantId = :tenantId', { tenantId })
            .andWhere('t.type = :type', { type: transaction_entity_1.TransactionType.RECEITA })
            .andWhere('t.status = :status', { status: transaction_entity_1.TransactionStatus.CONFIRMADA })
            .andWhere('t.referenceDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy(`${dateFormat}(t.referenceDate${formatArg ? `, ${formatArg}` : ''})`)
            .orderBy('period', 'ASC')
            .getRawMany();
        return results.map((r) => ({
            period: r.period,
            value: parseFloat(r.value || '0'),
        }));
    }
    async getSalesByPeriod(tenantId, startDate, endDate, period) {
        const dateFormat = period === 'day' ? 'DATE' : period === 'week' ? 'YEARWEEK' : 'DATE_FORMAT';
        const formatArg = period === 'month' ? "'%Y-%m'" : '';
        const results = await this.vendaRepo
            .createQueryBuilder('venda')
            .select(`${dateFormat}(venda.dataVenda${formatArg ? `, ${formatArg}` : ''})`, 'period')
            .addSelect('COUNT(*)', 'value')
            .where('venda.tenantId = :tenantId', { tenantId })
            .andWhere('venda.status = :status', { status: venda_entity_1.VendaStatus.CONFIRMADA })
            .andWhere('venda.dataVenda BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy(`${dateFormat}(venda.dataVenda${formatArg ? `, ${formatArg}` : ''})`)
            .orderBy('period', 'ASC')
            .getRawMany();
        return results.map((r) => ({
            period: r.period,
            value: parseInt(r.value || '0'),
        }));
    }
    async getLeadsByPeriod(tenantId, startDate, endDate, period) {
        const dateFormat = period === 'day' ? 'DATE' : period === 'week' ? 'YEARWEEK' : 'DATE_FORMAT';
        const formatArg = period === 'month' ? "'%Y-%m'" : '';
        const results = await this.leadRepo
            .createQueryBuilder('lead')
            .select(`${dateFormat}(lead.createdAt${formatArg ? `, ${formatArg}` : ''})`, 'period')
            .addSelect('COUNT(*)', 'value')
            .where('lead.tenantId = :tenantId', { tenantId })
            .andWhere('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy(`${dateFormat}(lead.createdAt${formatArg ? `, ${formatArg}` : ''})`)
            .orderBy('period', 'ASC')
            .getRawMany();
        return results.map((r) => ({
            period: r.period,
            value: parseInt(r.value || '0'),
        }));
    }
    async getConversionByPeriod(tenantId, startDate, endDate, period) {
        // Simplificado: calcular conversão mensal
        const leads = await this.getLeadsByPeriod(tenantId, startDate, endDate, period);
        const sales = await this.getSalesByPeriod(tenantId, startDate, endDate, period);
        const conversionMap = new Map();
        leads.forEach((l) => {
            const sale = sales.find((s) => s.period === l.period);
            const conversionRate = l.value > 0 ? ((sale?.value || 0) / l.value) * 100 : 0;
            conversionMap.set(l.period, conversionRate);
        });
        return Array.from(conversionMap.entries()).map(([period, value]) => ({
            period,
            value,
        }));
    }
    calculatePrediction(data, periods) {
        if (data.length < 3)
            return [];
        // Média móvel simples
        const lastValues = data.slice(-3).map((d) => d.value);
        const average = lastValues.reduce((sum, v) => sum + v, 0) / lastValues.length;
        // Prever próximos períodos
        const predictions = [];
        for (let i = 1; i <= periods; i++) {
            predictions.push({
                period: `Previsão +${i}`,
                value: average,
            });
        }
        return predictions;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __param(1, (0, typeorm_1.InjectRepository)(venda_entity_1.Venda)),
    __param(2, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map