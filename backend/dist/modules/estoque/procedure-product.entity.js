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
exports.ProcedureProduct = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
const procedure_entity_1 = require("../leads/procedure.entity");
let ProcedureProduct = class ProcedureProduct {
    id;
    procedureId;
    procedure;
    productId;
    product;
    quantityUsed;
    isOptional; // Se é opcional ou obrigatório no procedimento
    notes;
    tenantId;
    createdAt;
    updatedAt;
};
exports.ProcedureProduct = ProcedureProduct;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProcedureProduct.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], ProcedureProduct.prototype, "procedureId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => procedure_entity_1.Procedure),
    (0, typeorm_1.JoinColumn)({ name: 'procedureId' }),
    __metadata("design:type", procedure_entity_1.Procedure)
], ProcedureProduct.prototype, "procedure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], ProcedureProduct.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    __metadata("design:type", product_entity_1.Product)
], ProcedureProduct.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ProcedureProduct.prototype, "quantityUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ProcedureProduct.prototype, "isOptional", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProcedureProduct.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], ProcedureProduct.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProcedureProduct.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProcedureProduct.prototype, "updatedAt", void 0);
exports.ProcedureProduct = ProcedureProduct = __decorate([
    (0, typeorm_1.Entity)('procedure_products')
], ProcedureProduct);
//# sourceMappingURL=procedure-product.entity.js.map