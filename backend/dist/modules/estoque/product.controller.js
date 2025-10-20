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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const product_service_1 = require("./product.service");
let ProductController = class ProductController {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    async create(req, data) {
        return await this.productService.create({
            ...data,
            tenantId: req.user.tenantId,
        });
    }
    async findAll(req, query) {
        const filters = {
            tenantId: req.user.tenantId,
            search: query.search,
            category: query.category,
            isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
            lowStock: query.lowStock === 'true',
            limit: query.limit ? parseInt(query.limit) : 50,
            offset: query.offset ? parseInt(query.offset) : 0,
        };
        return await this.productService.findAll(filters);
    }
    async getLowStock(req) {
        return await this.productService.getLowStockProducts(req.user.tenantId);
    }
    async getOutOfStock(req) {
        return await this.productService.getOutOfStockProducts(req.user.tenantId);
    }
    async getExpiring(req, days) {
        const daysNumber = days ? parseInt(days) : 30;
        return await this.productService.getExpiringProducts(req.user.tenantId, daysNumber);
    }
    async getStockValue(req) {
        return await this.productService.getStockValue(req.user.tenantId);
    }
    async findBySku(req, sku) {
        return await this.productService.findBySku(sku, req.user.tenantId);
    }
    async findByBarcode(req, barcode) {
        return await this.productService.findByBarcode(barcode, req.user.tenantId);
    }
    async findOne(req, id) {
        return await this.productService.findOne(id, req.user.tenantId);
    }
    async update(req, id, data) {
        return await this.productService.update(id, req.user.tenantId, data);
    }
    async delete(req, id) {
        await this.productService.delete(id, req.user.tenantId);
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Get)('out-of-stock'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getOutOfStock", null);
__decorate([
    (0, common_1.Get)('expiring'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getExpiring", null);
__decorate([
    (0, common_1.Get)('stock-value'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getStockValue", null);
__decorate([
    (0, common_1.Get)('by-sku/:sku'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sku')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findBySku", null);
__decorate([
    (0, common_1.Get)('by-barcode/:barcode'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('barcode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findByBarcode", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "delete", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map