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
exports.StockAuditLog = exports.AuditEntityType = exports.AuditAction = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../auth/user.entity");
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["ADJUST"] = "ADJUST";
    AuditAction["COMPLETE"] = "COMPLETE";
    AuditAction["CANCEL"] = "CANCEL";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var AuditEntityType;
(function (AuditEntityType) {
    AuditEntityType["PRODUCT"] = "PRODUCT";
    AuditEntityType["STOCK_MOVEMENT"] = "STOCK_MOVEMENT";
    AuditEntityType["INVENTORY_COUNT"] = "INVENTORY_COUNT";
    AuditEntityType["INVENTORY_COUNT_ITEM"] = "INVENTORY_COUNT_ITEM";
    AuditEntityType["STOCK_ALERT"] = "STOCK_ALERT";
    AuditEntityType["PROCEDURE_PRODUCT"] = "PROCEDURE_PRODUCT";
})(AuditEntityType || (exports.AuditEntityType = AuditEntityType = {}));
let StockAuditLog = class StockAuditLog {
    id;
    entityType;
    entityId;
    action;
    userId;
    user;
    userName;
    oldValues;
    newValues;
    metadata;
    description;
    ipAddress;
    userAgent;
    tenantId;
    createdAt;
};
exports.StockAuditLog = StockAuditLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StockAuditLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AuditEntityType,
    }),
    __metadata("design:type", String)
], StockAuditLog.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StockAuditLog.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AuditAction,
    }),
    __metadata("design:type", String)
], StockAuditLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], StockAuditLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], StockAuditLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], StockAuditLog.prototype, "userName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], StockAuditLog.prototype, "oldValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], StockAuditLog.prototype, "newValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], StockAuditLog.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StockAuditLog.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 45, nullable: true }),
    __metadata("design:type", String)
], StockAuditLog.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StockAuditLog.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StockAuditLog.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StockAuditLog.prototype, "createdAt", void 0);
exports.StockAuditLog = StockAuditLog = __decorate([
    (0, typeorm_1.Entity)('stock_audit_logs')
], StockAuditLog);
//# sourceMappingURL=audit-log.entity.js.map