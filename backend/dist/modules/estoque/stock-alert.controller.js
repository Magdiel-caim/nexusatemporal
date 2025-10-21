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
exports.StockAlertController = void 0;
const common_1 = require("@nestjs/common");
const stock_alert_service_1 = require("./stock-alert.service");
let StockAlertController = class StockAlertController {
    alertService;
    constructor(alertService) {
        this.alertService = alertService;
    }
    async findAll(req, query) {
        const filters = {
            tenantId: req.user.tenantId,
            type: query.type,
            status: query.status,
            productId: query.productId,
            limit: query.limit ? parseInt(query.limit) : 50,
            offset: query.offset ? parseInt(query.offset) : 0,
        };
        return await this.alertService.findAll(filters);
    }
    async getActiveCount(req) {
        return await this.alertService.getActiveAlertsCount(req.user.tenantId);
    }
    async checkLowStock(req) {
        await this.alertService.checkLowStockForTenant(req.user.tenantId);
        return { message: 'Verificação de estoque baixo executada com sucesso' };
    }
    async checkExpiring(req, days) {
        const daysNumber = days ? parseInt(days) : 30;
        await this.alertService.checkExpiringProductsForTenant(req.user.tenantId, daysNumber);
        return { message: 'Verificação de produtos vencendo executada com sucesso' };
    }
    async resolve(req, id, body) {
        return await this.alertService.resolveAlert(id, req.user.tenantId, req.user.id, body.resolution);
    }
    async ignore(req, id) {
        return await this.alertService.ignoreAlert(id, req.user.tenantId);
    }
};
exports.StockAlertController = StockAlertController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "getActiveCount", null);
__decorate([
    (0, common_1.Post)('check-low-stock'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "checkLowStock", null);
__decorate([
    (0, common_1.Post)('check-expiring'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "checkExpiring", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "resolve", null);
__decorate([
    (0, common_1.Patch)(':id/ignore'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "ignore", null);
exports.StockAlertController = StockAlertController = __decorate([
    (0, common_1.Controller)('stock-alerts'),
    __metadata("design:paramtypes", [stock_alert_service_1.StockAlertService])
], StockAlertController);
//# sourceMappingURL=stock-alert.controller.js.map