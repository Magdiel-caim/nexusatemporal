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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockAlert = exports.AlertStatus = exports.AlertType = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
var AlertType;
(function (AlertType) {
    AlertType["LOW_STOCK"] = "low_stock";
    AlertType["OUT_OF_STOCK"] = "out_of_stock";
    AlertType["EXPIRING_SOON"] = "expiring_soon";
    AlertType["EXPIRED"] = "expired";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["ACTIVE"] = "active";
    AlertStatus["RESOLVED"] = "resolved";
    AlertStatus["IGNORED"] = "ignored";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
let StockAlert = class StockAlert {
    id;
    productId;
    product;
    type;
    status;
    currentStock;
    minimumStock;
    suggestedOrderQuantity;
    message;
    tenantId;
    resolvedAt;
    resolvedBy;
    resolution;
    createdAt;
};
exports.StockAlert = StockAlert;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockAlert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], StockAlert.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    __metadata("design:type", product_entity_1.Product)
], StockAlert.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AlertType,
    }),
    __metadata("design:type", String)
], StockAlert.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AlertStatus,
        default: AlertStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], StockAlert.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StockAlert.prototype, "currentStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StockAlert.prototype, "minimumStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StockAlert.prototype, "suggestedOrderQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StockAlert.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], StockAlert.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], StockAlert.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], StockAlert.prototype, "resolvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StockAlert.prototype, "resolution", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StockAlert.prototype, "createdAt", void 0);
exports.StockAlert = StockAlert = __decorate([
    (0, typeorm_1.Entity)('stock_alerts')
], StockAlert);
//# sourceMappingURL=stock-alert.entity.js.map