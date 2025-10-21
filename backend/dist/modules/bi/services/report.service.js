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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const custom_report_entity_1 = require("../entities/custom-report.entity");
const scheduled_report_entity_1 = require("../entities/scheduled-report.entity");
const data_aggregator_service_1 = require("./data-aggregator.service");
const kpi_service_1 = require("./kpi.service");
const analytics_service_1 = require("./analytics.service");
let ReportService = class ReportService {
    customReportRepo;
    scheduledReportRepo;
    dataAggregatorService;
    kpiService;
    analyticsService;
    constructor(customReportRepo, scheduledReportRepo, dataAggregatorService, kpiService, analyticsService) {
        this.customReportRepo = customReportRepo;
        this.scheduledReportRepo = scheduledReportRepo;
        this.dataAggregatorService = dataAggregatorService;
        this.kpiService = kpiService;
        this.analyticsService = analyticsService;
    }
    /**
     * Criar relatório customizado
     */
    async createCustomReport(tenantId, userId, dto) {
        const report = this.customReportRepo.create({
            ...dto,
            tenantId,
            createdById: userId,
        });
        return this.customReportRepo.save(report);
    }
    /**
     * Atualizar relatório customizado
     */
    async updateCustomReport(id, tenantId, dto) {
        const report = await this.customReportRepo.findOne({
            where: { id, tenantId },
        });
        if (!report) {
            throw new common_1.NotFoundException('Relatório não encontrado');
        }
        Object.assign(report, dto);
        return this.customReportRepo.save(report);
    }
    /**
     * Listar relatórios customizados
     */
    async findAllCustomReports(tenantId, userId) {
        const where = { tenantId };
        if (userId) {
            where.createdById = userId;
        }
        return this.customReportRepo.find({
            where,
            relations: ['createdBy'],
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Buscar relatório customizado por ID
     */
    async findCustomReportById(id, tenantId) {
        const report = await this.customReportRepo.findOne({
            where: { id, tenantId },
            relations: ['createdBy'],
        });
        if (!report) {
            throw new common_1.NotFoundException('Relatório não encontrado');
        }
        return report;
    }
    /**
     * Deletar relatório customizado
     */
    async deleteCustomReport(id, tenantId) {
        await this.customReportRepo.delete({ id, tenantId });
    }
    /**
     * Gerar dados do relatório
     */
    async generateReportData(reportConfig, tenantId, startDate, endDate) {
        const sections = [];
        // Processar cada seção configurada
        for (const sectionConfig of reportConfig.sections || []) {
            try {
                const sectionData = await this.generateSectionData(sectionConfig, tenantId, startDate, endDate);
                sections.push(sectionData);
            }
            catch (error) {
                console.error(`Erro ao gerar seção ${sectionConfig.title}:`, error);
            }
        }
        return {
            title: reportConfig.title || 'Relatório',
            description: reportConfig.description,
            generatedAt: new Date(),
            period: { startDate, endDate },
            sections,
        };
    }
    /**
     * Gerar dados de uma seção
     */
    async generateSectionData(sectionConfig, tenantId, startDate, endDate) {
        const { type, dataSource } = sectionConfig;
        let data = null;
        switch (type) {
            case 'kpi':
                data = await this.generateKpiData(dataSource, tenantId, startDate, endDate);
                break;
            case 'chart':
                data = await this.generateChartData(dataSource, tenantId, startDate, endDate);
                break;
            case 'table':
                data = await this.generateTableData(dataSource, tenantId, startDate, endDate);
                break;
            case 'text':
                data = sectionConfig.content || '';
                break;
            default:
                data = null;
        }
        return {
            title: sectionConfig.title,
            type,
            data,
        };
    }
    /**
     * Gerar dados de KPI
     */
    async generateKpiData(dataSource, tenantId, startDate, endDate) {
        switch (dataSource) {
            case 'all_kpis':
                return this.kpiService.getAllMainKpis(tenantId, startDate, endDate);
            case 'revenue':
                return this.kpiService.calculateTotalRevenue(tenantId, startDate, endDate);
            case 'conversion_rate':
                return this.kpiService.calculateConversionRate(tenantId, startDate, endDate);
            case 'average_ticket':
                return this.kpiService.calculateAverageTicket(tenantId, startDate, endDate);
            default:
                return null;
        }
    }
    /**
     * Gerar dados de gráfico
     */
    async generateChartData(dataSource, tenantId, startDate, endDate) {
        switch (dataSource) {
            case 'sales_over_time':
                return this.dataAggregatorService.getSalesOverTime(tenantId, startDate, endDate);
            case 'sales_by_product':
                return this.dataAggregatorService.getSalesByProduct(tenantId, startDate, endDate);
            case 'sales_funnel':
                return this.dataAggregatorService.getSalesFunnel(tenantId, startDate, endDate);
            case 'revenue_vs_expenses':
                return this.dataAggregatorService.getRevenueVsExpenses(tenantId, startDate, endDate);
            default:
                return null;
        }
    }
    /**
     * Gerar dados de tabela
     */
    async generateTableData(dataSource, tenantId, startDate, endDate) {
        switch (dataSource) {
            case 'seller_performance':
                return this.analyticsService.sellerPerformance(tenantId, startDate, endDate);
            case 'segment_analysis':
                return this.analyticsService.segmentAnalysis(tenantId, startDate, endDate, 'source');
            default:
                return null;
        }
    }
    // ===== SCHEDULED REPORTS =====
    /**
     * Criar agendamento de relatório
     */
    async scheduleReport(tenantId, userId, dto) {
        const scheduled = this.scheduledReportRepo.create({
            ...dto,
            tenantId,
            createdById: userId,
        });
        return this.scheduledReportRepo.save(scheduled);
    }
    /**
     * Atualizar agendamento
     */
    async updateSchedule(id, tenantId, dto) {
        const scheduled = await this.scheduledReportRepo.findOne({
            where: { id, tenantId },
        });
        if (!scheduled) {
            throw new common_1.NotFoundException('Agendamento não encontrado');
        }
        Object.assign(scheduled, dto);
        return this.scheduledReportRepo.save(scheduled);
    }
    /**
     * Listar agendamentos ativos
     */
    async findActiveSchedules(tenantId) {
        return this.scheduledReportRepo.find({
            where: { tenantId, isActive: true },
            relations: ['createdBy'],
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Buscar agendamentos que precisam ser executados
     */
    async findSchedulesToRun() {
        const now = new Date();
        return this.scheduledReportRepo.find({
            where: {
                isActive: true,
                nextRunAt: (0, typeorm_2.LessThanOrEqual)(now),
            },
            relations: ['createdBy'],
        });
    }
    /**
     * Marcar agendamento como executado
     */
    async markScheduleAsRun(id) {
        const schedule = await this.scheduledReportRepo.findOne({
            where: { id },
        });
        if (!schedule) {
            throw new common_1.NotFoundException('Agendamento não encontrado');
        }
        // Atualizar lastRunAt e calcular nextRunAt
        schedule.lastRunAt = new Date();
        schedule.nextRunAt = this.calculateNextRunDate(schedule.frequency, schedule.dayOfWeek);
        await this.scheduledReportRepo.save(schedule);
    }
    /**
     * Calcular próxima data de execução
     */
    calculateNextRunDate(frequency, dayOfWeek) {
        const now = new Date();
        switch (frequency) {
            case 'daily':
                now.setDate(now.getDate() + 1);
                break;
            case 'weekly':
                now.setDate(now.getDate() + 7);
                break;
            case 'monthly':
                now.setMonth(now.getMonth() + 1);
                break;
            default:
                now.setDate(now.getDate() + 1);
        }
        // Resetar hora
        now.setHours(8, 0, 0, 0);
        return now;
    }
    /**
     * Desativar agendamento
     */
    async deactivateSchedule(id, tenantId) {
        await this.scheduledReportRepo.update({ id, tenantId }, { isActive: false });
    }
    /**
     * Relatórios pré-configurados
     */
    async getExecutiveReport(tenantId, startDate, endDate) {
        const kpis = await this.kpiService.getAllMainKpis(tenantId, startDate, endDate);
        const salesOverTime = await this.dataAggregatorService.getSalesOverTime(tenantId, startDate, endDate);
        const revenueVsExpenses = await this.dataAggregatorService.getRevenueVsExpenses(tenantId, startDate, endDate);
        return {
            title: 'Relatório Executivo',
            description: 'Visão geral dos principais indicadores de negócio',
            generatedAt: new Date(),
            period: { startDate, endDate },
            sections: [
                {
                    title: 'KPIs Principais',
                    type: 'kpi',
                    data: kpis,
                },
                {
                    title: 'Evolução de Vendas',
                    type: 'chart',
                    data: salesOverTime,
                },
                {
                    title: 'Receitas vs Despesas',
                    type: 'chart',
                    data: revenueVsExpenses,
                },
            ],
        };
    }
    async getSalesReport(tenantId, startDate, endDate) {
        const salesOverTime = await this.dataAggregatorService.getSalesOverTime(tenantId, startDate, endDate);
        const salesByProduct = await this.dataAggregatorService.getSalesByProduct(tenantId, startDate, endDate);
        const salesBySeller = await this.dataAggregatorService.getSalesBySeller(tenantId, startDate, endDate);
        return {
            title: 'Relatório de Vendas',
            description: 'Análise detalhada de vendas',
            generatedAt: new Date(),
            period: { startDate, endDate },
            sections: [
                {
                    title: 'Vendas ao Longo do Tempo',
                    type: 'chart',
                    data: salesOverTime,
                },
                {
                    title: 'Vendas por Produto',
                    type: 'chart',
                    data: salesByProduct,
                },
                {
                    title: 'Performance dos Vendedores',
                    type: 'table',
                    data: salesBySeller,
                },
            ],
        };
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(custom_report_entity_1.CustomReport)),
    __param(1, (0, typeorm_1.InjectRepository)(scheduled_report_entity_1.ScheduledReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        data_aggregator_service_1.DataAggregatorService,
        kpi_service_1.KpiService,
        analytics_service_1.AnalyticsService])
], ReportService);
//# sourceMappingURL=report.service.js.map