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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const report_service_1 = require("../services/report.service");
const export_service_1 = require("../services/export.service");
const report_dto_1 = require("../dto/report.dto");
let ReportController = class ReportController {
    reportService;
    exportService;
    constructor(reportService, exportService) {
        this.reportService = reportService;
        this.exportService = exportService;
    }
    /**
     * GET /api/bi/reports/custom
     * Listar relatórios customizados
     */
    async findAllCustom(req, userId) {
        const tenantId = req.user.tenantId;
        return this.reportService.findAllCustomReports(tenantId, userId);
    }
    /**
     * GET /api/bi/reports/custom/:id
     * Buscar relatório customizado
     */
    async findCustomById(req, id) {
        const tenantId = req.user.tenantId;
        return this.reportService.findCustomReportById(id, tenantId);
    }
    /**
     * POST /api/bi/reports/custom
     * Criar relatório customizado
     */
    async createCustom(req, dto) {
        const tenantId = req.user.tenantId;
        const userId = req.user.userId;
        return this.reportService.createCustomReport(tenantId, userId, dto);
    }
    /**
     * PUT /api/bi/reports/custom/:id
     * Atualizar relatório customizado
     */
    async updateCustom(req, id, dto) {
        const tenantId = req.user.tenantId;
        return this.reportService.updateCustomReport(id, tenantId, dto);
    }
    /**
     * DELETE /api/bi/reports/custom/:id
     * Deletar relatório customizado
     */
    async deleteCustom(req, id) {
        const tenantId = req.user.tenantId;
        await this.reportService.deleteCustomReport(id, tenantId);
        return { message: 'Relatório deletado com sucesso' };
    }
    /**
     * POST /api/bi/reports/custom/:id/generate
     * Gerar dados do relatório customizado
     */
    async generateCustom(req, id, startDate, endDate) {
        const tenantId = req.user.tenantId;
        const report = await this.reportService.findCustomReportById(id, tenantId);
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.reportService.generateReportData(report.config, tenantId, start, end);
    }
    /**
     * GET /api/bi/reports/executive
     * Relatório Executivo pré-configurado
     */
    async getExecutiveReport(req, startDate, endDate) {
        const tenantId = req.user.tenantId;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.reportService.getExecutiveReport(tenantId, start, end);
    }
    /**
     * GET /api/bi/reports/sales
     * Relatório de Vendas pré-configurado
     */
    async getSalesReport(req, startDate, endDate) {
        const tenantId = req.user.tenantId;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.reportService.getSalesReport(tenantId, start, end);
    }
    /**
     * POST /api/bi/reports/export
     * Exportar relatório em PDF/Excel/CSV
     */
    async exportReport(req, res, reportData, format, filename) {
        if (!reportData) {
            throw new common_1.BadRequestException('reportData é obrigatório');
        }
        const options = {
            format: format || 'pdf',
            filename,
            includeCharts: true,
            includeMetadata: true,
        };
        const exported = await this.exportService.exportReport(reportData, options);
        res.setHeader('Content-Type', exported.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
        res.send(exported.buffer);
    }
    // ===== SCHEDULED REPORTS =====
    /**
     * GET /api/bi/reports/scheduled
     * Listar agendamentos ativos
     */
    async findScheduled(req) {
        const tenantId = req.user.tenantId;
        return this.reportService.findActiveSchedules(tenantId);
    }
    /**
     * POST /api/bi/reports/scheduled
     * Criar agendamento de relatório
     */
    async scheduleReport(req, dto) {
        const tenantId = req.user.tenantId;
        const userId = req.user.userId;
        return this.reportService.scheduleReport(tenantId, userId, dto);
    }
    /**
     * PUT /api/bi/reports/scheduled/:id
     * Atualizar agendamento
     */
    async updateSchedule(req, id, dto) {
        const tenantId = req.user.tenantId;
        return this.reportService.updateSchedule(id, tenantId, dto);
    }
    /**
     * DELETE /api/bi/reports/scheduled/:id
     * Desativar agendamento
     */
    async deactivateSchedule(req, id) {
        const tenantId = req.user.tenantId;
        await this.reportService.deactivateSchedule(id, tenantId);
        return { message: 'Agendamento desativado com sucesso' };
    }
};
exports.ReportController = ReportController;
__decorate([
    (0, common_1.Get)('custom'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "findAllCustom", null);
__decorate([
    (0, common_1.Get)('custom/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "findCustomById", null);
__decorate([
    (0, common_1.Post)('custom'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof report_dto_1.CreateReportDto !== "undefined" && report_dto_1.CreateReportDto) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "createCustom", null);
__decorate([
    (0, common_1.Put)('custom/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_b = typeof report_dto_1.UpdateReportDto !== "undefined" && report_dto_1.UpdateReportDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "updateCustom", null);
__decorate([
    (0, common_1.Delete)('custom/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "deleteCustom", null);
__decorate([
    (0, common_1.Post)('custom/:id/generate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('startDate')),
    __param(3, (0, common_1.Body)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "generateCustom", null);
__decorate([
    (0, common_1.Get)('executive'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getExecutiveReport", null);
__decorate([
    (0, common_1.Get)('sales'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getSalesReport", null);
__decorate([
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)('reportData')),
    __param(3, (0, common_1.Body)('format')),
    __param(4, (0, common_1.Body)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "exportReport", null);
__decorate([
    (0, common_1.Get)('scheduled'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "findScheduled", null);
__decorate([
    (0, common_1.Post)('scheduled'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, report_dto_1.ScheduleReportDto]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "scheduleReport", null);
__decorate([
    (0, common_1.Put)('scheduled/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "updateSchedule", null);
__decorate([
    (0, common_1.Delete)('scheduled/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "deactivateSchedule", null);
exports.ReportController = ReportController = __decorate([
    (0, common_1.Controller)('api/bi/reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [report_service_1.ReportService,
        export_service_1.ExportService])
], ReportController);
//# sourceMappingURL=report.controller.js.map