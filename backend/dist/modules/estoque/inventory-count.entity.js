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
exports.InventoryCountItem = exports.DiscrepancyType = exports.InventoryCount = exports.InventoryCountStatus = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
const user_entity_1 = require("../auth/user.entity");
var InventoryCountStatus;
(function (InventoryCountStatus) {
    InventoryCountStatus["IN_PROGRESS"] = "IN_PROGRESS";
    InventoryCountStatus["COMPLETED"] = "COMPLETED";
    InventoryCountStatus["CANCELLED"] = "CANCELLED";
})(InventoryCountStatus || (exports.InventoryCountStatus = InventoryCountStatus = {}));
let InventoryCount = class InventoryCount {
    id;
    status;
    description;
    location;
    countDate;
    completedAt;
    userId;
    user;
    tenantId;
    items;
    createdAt;
    updatedAt;
};
exports.InventoryCount = InventoryCount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InventoryCount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InventoryCountStatus,
        default: InventoryCountStatus.IN_PROGRESS,
    }),
    __metadata("design:type", String)
], InventoryCount.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryCount.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], InventoryCount.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryCount.prototype, "countDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryCount.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], InventoryCount.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], InventoryCount.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], InventoryCount.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => InventoryCountItem, (item) => item.inventoryCount, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], InventoryCount.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InventoryCount.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InventoryCount.prototype, "updatedAt", void 0);
exports.InventoryCount = InventoryCount = __decorate([
    (0, typeorm_1.Entity)('inventory_counts')
], InventoryCount);
var DiscrepancyType;
(function (DiscrepancyType) {
    DiscrepancyType["SURPLUS"] = "SURPLUS";
    DiscrepancyType["SHORTAGE"] = "SHORTAGE";
    DiscrepancyType["MATCH"] = "MATCH";
})(DiscrepancyType || (exports.DiscrepancyType = DiscrepancyType = {}));
let InventoryCountItem = class InventoryCountItem {
    id;
    inventoryCountId;
    inventoryCount;
    productId;
    product;
    systemStock; // Estoque no sistema no momento da contagem
    countedStock; // Estoque contado fisicamente
    difference; // Diferença (contado - sistema)
    discrepancyType;
    notes;
    adjusted; // Se já foi ajustado no estoque
    adjustedAt;
    tenantId;
    createdAt;
    updatedAt;
};
exports.InventoryCountItem = InventoryCountItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InventoryCountItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], InventoryCountItem.prototype, "inventoryCountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => InventoryCount, (count) => count.items),
    (0, typeorm_1.JoinColumn)({ name: 'inventoryCountId' }),
    __metadata("design:type", InventoryCount)
], InventoryCountItem.prototype, "inventoryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], InventoryCountItem.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    __metadata("design:type", product_entity_1.Product)
], InventoryCountItem.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], InventoryCountItem.prototype, "systemStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], InventoryCountItem.prototype, "countedStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], InventoryCountItem.prototype, "difference", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DiscrepancyType,
    }),
    __metadata("design:type", String)
], InventoryCountItem.prototype, "discrepancyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryCountItem.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InventoryCountItem.prototype, "adjusted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InventoryCountItem.prototype, "adjustedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], InventoryCountItem.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InventoryCountItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InventoryCountItem.prototype, "updatedAt", void 0);
exports.InventoryCountItem = InventoryCountItem = __decorate([
    (0, typeorm_1.Entity)('inventory_count_items')
], InventoryCountItem);
//# sourceMappingURL=inventory-count.entity.js.map