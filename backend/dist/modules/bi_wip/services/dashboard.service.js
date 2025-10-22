"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
class DashboardService {
    dashboardConfigRepo;
    dataAggregatorService;
    kpiService;
    constructor(dashboardConfigRepo, dataAggregatorService, kpiService) {
        this.dashboardConfigRepo = dashboardConfigRepo;
        this.dataAggregatorService = dataAggregatorService;
        this.kpiService = kpiService;
    }
    /**
     * Criar nova configuração de dashboard
     */
    async create(userId, tenantId, dto) {
        const dashboard = this.dashboardConfigRepo.create({
            ...dto,
            userId,
            tenantId,
        });
        return this.dashboardConfigRepo.save(dashboard);
    }
    /**
     * Atualizar configuração de dashboard
     */
    async update(id, userId, tenantId, dto) {
        const dashboard = await this.findOne(id, userId, tenantId);
        Object.assign(dashboard, dto);
        return this.dashboardConfigRepo.save(dashboard);
    }
    /**
     * Buscar dashboard por ID
     */
    async findOne(id, userId, tenantId) {
        const dashboard = await this.dashboardConfigRepo.findOne({
            where: { id, userId, tenantId },
            relations: ['user'],
        });
        if (!dashboard) {
            throw new Error(`Dashboard ${id} não encontrado`);
        }
        return dashboard;
    }
    /**
     * Listar todos dashboards do usuário
     */
    async findAll(userId, tenantId) {
        return this.dashboardConfigRepo.find({
            where: { userId, tenantId, isActive: true },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
    }
    /**
     * Buscar dashboard padrão por tipo
     */
    async findDefaultByType(userId, tenantId, type) {
        return this.dashboardConfigRepo.findOne({
            where: { userId, tenantId, type, isDefault: true, isActive: true },
        });
    }
    /**
     * Deletar dashboard
     */
    async delete(id, userId, tenantId) {
        const dashboard = await this.findOne(id, userId, tenantId);
        dashboard.isActive = false;
        await this.dashboardConfigRepo.save(dashboard);
    }
    /**
     * Obter dados do dashboard
     * Busca dados de todos os widgets configurados
     */
    async getDashboardData(id, userId, tenantId, filters) {
        const startTime = Date.now();
        const config = await this.findOne(id, userId, tenantId);
        // Determinar datas do filtro
        const dateRange = this.dataAggregatorService.calculateDateRange(filters.dateRangeType, filters.startDate, filters.endDate);
        // Buscar dados para cada widget
        const widgetData = {};
        let totalDataPoints = 0;
        for (const widget of config.config.widgets || []) {
            try {
                const data = await this.getWidgetData(widget, tenantId, dateRange.startDate, dateRange.endDate, filters.filters);
                widgetData[widget.id] = data;
                totalDataPoints += Array.isArray(data) ? data.length : 1;
            }
            catch (error) {
                console.error(`Erro ao buscar dados do widget ${widget.id}:`, error);
                widgetData[widget.id] = null;
            }
        }
        const executionTime = Date.now() - startTime;
        return {
            config: config.config,
            data: widgetData,
            metadata: {
                generatedAt: new Date(),
                executionTime,
                dataPoints: totalDataPoints,
            },
        };
    }
    /**
     * Buscar dados de um widget específico
     */
    async getWidgetData(widget, tenantId, startDate, endDate, filters) {
        const { dataSource, type } = widget;
        // Mapear dataSource para o método correto
        switch (dataSource) {
            // KPIs
            case 'revenue':
                return this.dataAggregatorService.getTotalRevenue(tenantId, startDate, endDate);
            case 'sales_count':
                return this.dataAggregatorService.getSalesCount(tenantId, startDate, endDate);
            case 'new_leads':
                return this.dataAggregatorService.getNewLeads(tenantId, startDate, endDate);
            case 'conversion_rate':
                return this.kpiService.calculateConversionRate(tenantId, startDate, endDate);
            case 'average_ticket':
                return this.kpiService.calculateAverageTicket(tenantId, startDate, endDate);
            // Gráficos de vendas
            case 'sales_over_time':
                return this.dataAggregatorService.getSalesOverTime(tenantId, startDate, endDate);
            case 'sales_by_product':
                return this.dataAggregatorService.getSalesByProduct(tenantId, startDate, endDate);
            case 'sales_by_seller':
                return this.dataAggregatorService.getSalesBySeller(tenantId, startDate, endDate);
            // Funil de vendas
            case 'sales_funnel':
                return this.dataAggregatorService.getSalesFunnel(tenantId, startDate, endDate);
            // Leads
            case 'leads_by_source':
                return this.dataAggregatorService.getLeadsBySource(tenantId, startDate, endDate);
            case 'leads_by_status':
                return this.dataAggregatorService.getLeadsByStatus(tenantId, startDate, endDate);
            // Financeiro
            case 'revenue_vs_expenses':
                return this.dataAggregatorService.getRevenueVsExpenses(tenantId, startDate, endDate);
            case 'cash_flow':
                return this.dataAggregatorService.getCashFlow(tenantId, startDate, endDate);
            case 'transactions_by_category':
                return this.dataAggregatorService.getTransactionsByCategory(tenantId, startDate, endDate);
            default:
                console.warn(`DataSource não reconhecido: ${dataSource}`);
                return null;
        }
    }
    /**
     * Clonar dashboard
     */
    async clone(id, userId, tenantId, newName) {
        const original = await this.findOne(id, userId, tenantId);
        const clone = this.dashboardConfigRepo.create({
            ...original,
            id: undefined,
            name: newName || `${original.name} (Cópia)`,
            isDefault: false,
            createdAt: undefined,
            updatedAt: undefined,
        });
        return this.dashboardConfigRepo.save(clone);
    }
    /**
     * Definir dashboard como padrão
     */
    async setAsDefault(id, userId, tenantId) {
        const dashboard = await this.findOne(id, userId, tenantId);
        // Remover isDefault de outros dashboards do mesmo tipo
        await this.dashboardConfigRepo.update({ userId, tenantId, type: dashboard.type, isDefault: true }, { isDefault: false });
        dashboard.isDefault = true;
        return this.dashboardConfigRepo.save(dashboard);
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map