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
exports.Product = exports.ProductCategory = exports.ProductUnit = void 0;
const typeorm_1 = require("typeorm");
const supplier_entity_1 = require("../financeiro/supplier.entity");
const stock_movement_entity_1 = require("./stock-movement.entity");
var ProductUnit;
(function (ProductUnit) {
    ProductUnit["UNIDADE"] = "unidade";
    ProductUnit["CAIXA"] = "caixa";
    ProductUnit["FRASCO"] = "frasco";
    ProductUnit["AMPOLA"] = "ampola";
    ProductUnit["ML"] = "ml";
    ProductUnit["G"] = "g";
    ProductUnit["KG"] = "kg";
    ProductUnit["LITRO"] = "litro";
    ProductUnit["METRO"] = "metro";
    ProductUnit["OUTRO"] = "outro";
})(ProductUnit || (exports.ProductUnit = ProductUnit = {}));
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["INSUMO"] = "insumo";
    ProductCategory["MEDICAMENTO"] = "medicamento";
    ProductCategory["MATERIAL"] = "material";
    ProductCategory["EQUIPAMENTO"] = "equipamento";
    ProductCategory["DESCARTAVEL"] = "descartavel";
    ProductCategory["COSMETICO"] = "cosmetico";
    ProductCategory["OUTRO"] = "outro";
})(ProductCategory || (exports.ProductCategory = ProductCategory = {}));
let Product = class Product {
    id;
    name;
    sku;
    barcode;
    description;
    category;
    unit;
    // Estoque
    currentStock;
    minimumStock;
    maximumStock;
    // Preços
    purchasePrice;
    salePrice;
    // Fornecedor principal
    mainSupplierId;
    mainSupplier;
    // Localização no estoque
    location;
    // Validade
    expirationDate;
    // Lote
    batchNumber;
    // Controle
    isActive;
    trackStock; // Se deve controlar estoque
    requiresPrescription;
    // Alertas
    hasLowStockAlert;
    lastAlertDate;
    tenantId;
    movements;
    createdAt;
    updatedAt;
    // Campo calculado para verificar se está abaixo do estoque mínimo
    get isLowStock() {
        return this.currentStock <= this.minimumStock;
    }
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "barcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProductCategory,
        default: ProductCategory.INSUMO,
    }),
    __metadata("design:type", String)
], Product.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProductUnit,
        default: ProductUnit.UNIDADE,
    }),
    __metadata("design:type", String)
], Product.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "currentStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "minimumStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "maximumStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "purchasePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "salePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "mainSupplierId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => supplier_entity_1.Supplier, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'mainSupplierId' }),
    __metadata("design:type", supplier_entity_1.Supplier)
], Product.prototype, "mainSupplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Product.prototype, "expirationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "trackStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "requiresPrescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "hasLowStockAlert", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Product.prototype, "lastAlertDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Product.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stock_movement_entity_1.StockMovement, (movement) => movement.product),
    __metadata("design:type", Array)
], Product.prototype, "movements", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Product.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Product.prototype, "updatedAt", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)('products')
], Product);
//# sourceMappingURL=product.entity.js.map