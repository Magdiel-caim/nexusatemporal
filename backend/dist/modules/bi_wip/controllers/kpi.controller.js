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
exports.KpiController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const kpi_service_1 = require("../services/kpi.service");
const kpi_dto_1 = require("../dto/kpi.dto");
let KpiController = class KpiController {
    kpiService;
    constructor(kpiService) {
        this.kpiService = kpiService;
    }
    /**
     * GET /api/bi/kpis/all
     * Obter todos os KPIs principais
     */
    async getAllKpis(req, startDate, endDate) {
        const tenantId = req.user.tenantId;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.kpiService.getAllMainKpis(tenantId, start, end);
    }
    /**
     * GET /api/bi/kpis/revenue
     * KPI de Receita Total
     */
    async getRevenue(req, startDate, endDate) {
        const tenantId = req.user.tenantId;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.kpiService.calculateTotalRevenue(tenantId, start, end);
    }
    /**
     * GET /api/bi/kpis/expenses
     * KPI de Despesas Totais
     */
    async getExpenses(req, startDate, endDate) {
        const tenantId = req.user.tenantId;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.kpiService.calculateTotalExpenses(tenantId, start, end);
    }
    /**
     * GET /api/bi/kpis/net-profit
     * KPI de Lucro Líquido
     */
    async getNetProfit(req, startDate, endDate) {
        const tenantId = req.user.tenantId;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.kpiService.calculateNetProfit(tenantId, start, end);
    }
    /**
     * GET /api/bi/kpis/profit-margin
     * KPI de Margem de Lucro
     */
    async getProfitMargin(req, startDate, endDate) {
        const tenantId = req.user.tenantId;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.kpiService.calculateProfitMargin(tenantId, start, end);
    }
    /**
     * GET /api/bi/kpis/conversion-rate
     * KPI de Taxa de Conversão
     */
    async getConversionRate(req, startDate, endDate) {
        const tenantId = req.user.tenantId;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.kpiService.calculateConversionRate(tenantId, start, end);
    }
    /**
     * GET /api/bi/kpis/average-ticket
     * KPI de Ticket Médio
     */
    async getAverageTicket(req, startDate, endDate) {
        const tenantId = req.user.tenantId;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.kpiService.calculateAverageTicket(tenantId, start, end);
    }
    /**
     * GET /api/bi/kpis/targets
     * Listar todas as metas
     */
    async getTargets(req, period) {
        const tenantId = req.user.tenantId;
        return this.kpiService.findActiveTargets(tenantId, period);
    }
    /**
     * POST /api/bi/kpis/targets
     * Criar meta de KPI
     */
    async createTarget(req, dto) {
        const tenantId = req.user.tenantId;
        const userId = req.user.userId;
        return this.kpiService.createTarget(tenantId, userId, dto);
    }
    /**
     * PUT /api/bi/kpis/targets/:id
     * Atualizar meta de KPI
     */
    async updateTarget(req, id, dto) {
        const tenantId = req.user.tenantId;
        return this.kpiService.updateTarget(id, tenantId, dto);
    }
    /**
     * DELETE /api/bi/kpis/targets/:id
     * Deletar meta
     */
    async deleteTarget(req, id) {
        const tenantId = req.user.tenantId;
        await this.kpiService.deleteTarget(id, tenantId);
        return { message: 'Meta deletada com sucesso' };
    }
};
exports.KpiController = KpiController;
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "getAllKpis", null);
__decorate([
    (0, common_1.Get)('revenue'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "getRevenue", null);
__decorate([
    (0, common_1.Get)('expenses'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "getExpenses", null);
__decorate([
    (0, common_1.Get)('net-profit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "getNetProfit", null);
__decorate([
    (0, common_1.Get)('profit-margin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "getProfitMargin", null);
__decorate([
    (0, common_1.Get)('conversion-rate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "getConversionRate", null);
__decorate([
    (0, common_1.Get)('average-ticket'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "getAverageTicket", null);
__decorate([
    (0, common_1.Get)('targets'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "getTargets", null);
__decorate([
    (0, common_1.Post)('targets'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, kpi_dto_1.CreateKpiTargetDto]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "createTarget", null);
__decorate([
    (0, common_1.Put)('targets/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, kpi_dto_1.UpdateKpiTargetDto]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "updateTarget", null);
__decorate([
    (0, common_1.Delete)('targets/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "deleteTarget", null);
exports.KpiController = KpiController = __decorate([
    (0, common_1.Controller)('api/bi/kpis'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [kpi_service_1.KpiService])
], KpiController);
//# sourceMappingURL=kpi.controller.js.map