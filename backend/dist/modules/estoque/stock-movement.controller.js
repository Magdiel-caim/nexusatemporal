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
exports.StockMovementController = void 0;
const common_1 = require("@nestjs/common");
const stock_movement_service_1 = require("./stock-movement.service");
let StockMovementController = class StockMovementController {
    movementService;
    constructor(movementService) {
        this.movementService = movementService;
    }
    async create(req, data) {
        return await this.movementService.createMovement({
            ...data,
            userId: req.user.id,
            tenantId: req.user.tenantId,
        });
    }
    async createEntryFromPurchaseOrder(req, data) {
        return await this.movementService.createEntryFromPurchaseOrder(data.productId, data.purchaseOrderId, data.quantity, data.unitPrice, data.invoiceNumber, data.batchNumber || null, data.expirationDate ? new Date(data.expirationDate) : null, req.user.id, req.user.tenantId);
    }
    async createExitFromProcedure(req, data) {
        return await this.movementService.createExitFromProcedure(data.productId, data.quantity, data.medicalRecordId, data.procedureId, req.user.id, req.user.tenantId);
    }
    async findAll(req, query) {
        const filters = {
            tenantId: req.user.tenantId,
            productId: query.productId,
            type: query.type,
            reason: query.reason,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            limit: query.limit ? parseInt(query.limit) : 50,
            offset: query.offset ? parseInt(query.offset) : 0,
        };
        return await this.movementService.findAll(filters);
    }
    async getSummary(req, startDate, endDate) {
        return await this.movementService.getMovementsSummary(req.user.tenantId, new Date(startDate), new Date(endDate));
    }
    async getMostUsed(req, limit) {
        const limitNumber = limit ? parseInt(limit) : 10;
        return await this.movementService.getMostUsedProducts(req.user.tenantId, limitNumber);
    }
    async getByProduct(req, productId, limit) {
        const limitNumber = limit ? parseInt(limit) : 50;
        return await this.movementService.getMovementsByProduct(productId, req.user.tenantId, limitNumber);
    }
    async getByMedicalRecord(req, medicalRecordId) {
        return await this.movementService.getMovementsByMedicalRecord(medicalRecordId, req.user.tenantId);
    }
    async findOne(req, id) {
        return await this.movementService.findOne(id, req.user.tenantId);
    }
};
exports.StockMovementController = StockMovementController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StockMovementController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('entry/purchase-order'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StockMovementController.prototype, "createEntryFromPurchaseOrder", null);
__decorate([
    (0, common_1.Post)('exit/procedure'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StockMovementController.prototype, "createExitFromProcedure", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StockMovementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], StockMovementController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('most-used'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StockMovementController.prototype, "getMostUsed", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], StockMovementController.prototype, "getByProduct", null);
__decorate([
    (0, common_1.Get)('medical-record/:medicalRecordId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('medicalRecordId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StockMovementController.prototype, "getByMedicalRecord", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StockMovementController.prototype, "findOne", null);
exports.StockMovementController = StockMovementController = __decorate([
    (0, common_1.Controller)('stock-movements'),
    __metadata("design:paramtypes", [stock_movement_service_1.StockMovementService])
], StockMovementController);
//# sourceMappingURL=stock-movement.controller.js.map