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
exports.QuickReply = void 0;
const typeorm_1 = require("typeorm");
let QuickReply = class QuickReply {
    id;
    title; // Nome do template (ex: "Saudação Inicial")
    content; // Conteúdo da resposta rápida
    shortcut; // Atalho para digitar rápido (ex: "/oi")
    category; // Categoria (ex: "Saudações", "Agendamento")
    createdBy; // ID do usuário que criou
    isActive;
    isGlobal; // Se é global ou específico do usuário
    createdAt;
    updatedAt;
};
exports.QuickReply = QuickReply;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], QuickReply.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], QuickReply.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], QuickReply.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], QuickReply.prototype, "shortcut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], QuickReply.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], QuickReply.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], QuickReply.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_global', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], QuickReply.prototype, "isGlobal", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], QuickReply.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], QuickReply.prototype, "updatedAt", void 0);
exports.QuickReply = QuickReply = __decorate([
    (0, typeorm_1.Entity)('quick_replies')
], QuickReply);
//# sourceMappingURL=quick-reply.entity.js.map