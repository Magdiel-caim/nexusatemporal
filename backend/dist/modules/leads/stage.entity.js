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
exports.Stage = void 0;
const typeorm_1 = require("typeorm");
const pipeline_entity_1 = require("./pipeline.entity");
const lead_entity_1 = require("./lead.entity");
let Stage = class Stage {
    id;
    name;
    description;
    pipelineId;
    pipeline;
    order;
    color;
    probability; // Probabilidade de conversão (0-100%)
    isWon; // Estágio de vitória
    isLost; // Estágio de perda
    leads;
    createdAt;
    updatedAt;
};
exports.Stage = Stage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Stage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Stage.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Stage.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Stage.prototype, "pipelineId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pipeline_entity_1.Pipeline, (pipeline) => pipeline.stages, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'pipelineId' }),
    __metadata("design:type", pipeline_entity_1.Pipeline)
], Stage.prototype, "pipeline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Stage.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Stage.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Stage.prototype, "probability", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Stage.prototype, "isWon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Stage.prototype, "isLost", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lead_entity_1.Lead, (lead) => lead.stage),
    __metadata("design:type", Array)
], Stage.prototype, "leads", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Stage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Stage.prototype, "updatedAt", void 0);
exports.Stage = Stage = __decorate([
    (0, typeorm_1.Entity)('stages')
], Stage);
//# sourceMappingURL=stage.entity.js.map