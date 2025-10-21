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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const analytics_service_1 = require("../services/analytics.service");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    /**
     * GET /api/bi/analytics/cohort
     * Análise de Cohort (Coorte)
     */
    async cohortAnalysis(req, startDate, endDate, groupBy) {
        const tenantId = req.user.tenantId;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.analyticsService.cohortAnalysis(tenantId, start, end, groupBy || 'month');
    }
    /**
     * GET /api/bi/analytics/trend
     * Análise de Tendências
     */
    async trendAnalysis(req, metric, startDate, endDate, period) {
        const tenantId = req.user.tenantId;
        if (!metric) {
            throw new common_1.BadRequestException('Parâmetro "metric" é obrigatório');
        }
        const validMetrics = ['revenue', 'sales', 'leads', 'conversion'];
        if (!validMetrics.includes(metric)) {
            throw new common_1.BadRequestException(`Métrica inválida. Use: ${validMetrics.join(', ')}`);
        }
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.analyticsService.trendAnalysis(tenantId, metric, start, end, period || 'day');
    }
    /**
     * GET /api/bi/analytics/segment
     * Análise por Segmentos
     */
    async segmentAnalysis(req, segmentBy, startDate, endDate) {
        const tenantId = req.user.tenantId;
        if (!segmentBy) {
            throw new common_1.BadRequestException('Parâmetro "segmentBy" é obrigatório');
        }
        const validSegments = ['source', 'priority', 'city', 'channel'];
        if (!validSegments.includes(segmentBy)) {
            throw new common_1.BadRequestException(`Segmento inválido. Use: ${validSegments.join(', ')}`);
        }
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.analyticsService.segmentAnalysis(tenantId, start, end, segmentBy);
    }
    /**
     * GET /api/bi/analytics/seller-performance
     * Análise de Performance de Vendedores
     */
    async sellerPerformance(req, startDate, endDate) {
        const tenantId = req.user.tenantId;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.analyticsService.sellerPerformance(tenantId, start, end);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('cohort'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('groupBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "cohortAnalysis", null);
__decorate([
    (0, common_1.Get)('trend'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('metric')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trendAnalysis", null);
__decorate([
    (0, common_1.Get)('segment'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('segmentBy')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "segmentAnalysis", null);
__decorate([
    (0, common_1.Get)('seller-performance'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "sellerPerformance", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('api/bi/analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map