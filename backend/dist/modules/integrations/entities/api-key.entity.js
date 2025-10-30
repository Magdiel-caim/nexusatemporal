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
exports.ApiKey = exports.ApiKeyScope = exports.ApiKeyStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../auth/user.entity");
var ApiKeyStatus;
(function (ApiKeyStatus) {
    ApiKeyStatus["ACTIVE"] = "active";
    ApiKeyStatus["INACTIVE"] = "inactive";
    ApiKeyStatus["REVOKED"] = "revoked";
})(ApiKeyStatus || (exports.ApiKeyStatus = ApiKeyStatus = {}));
var ApiKeyScope;
(function (ApiKeyScope) {
    ApiKeyScope["READ"] = "read";
    ApiKeyScope["WRITE"] = "write";
    ApiKeyScope["FULL"] = "full";
})(ApiKeyScope || (exports.ApiKeyScope = ApiKeyScope = {}));
let ApiKey = class ApiKey {
    id;
    name;
    key;
    description;
    status;
    scopes;
    allowedIps;
    allowedOrigins;
    rateLimit; // Requests per hour
    expiresAt;
    lastUsedAt;
    usageCount;
    tenantId;
    createdById;
    createdBy;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.ApiKey = ApiKey;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ApiKey.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], ApiKey.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], ApiKey.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ApiKey.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ApiKeyStatus,
        default: ApiKeyStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], ApiKey.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-array',
        default: 'read',
    }),
    __metadata("design:type", Array)
], ApiKey.prototype, "scopes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allowed_ips', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ApiKey.prototype, "allowedIps", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allowed_origins', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ApiKey.prototype, "allowedOrigins", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rate_limit', type: 'int', default: 1000 }),
    __metadata("design:type", Number)
], ApiKey.prototype, "rateLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ApiKey.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_used_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ApiKey.prototype, "lastUsedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usage_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ApiKey.prototype, "usageCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], ApiKey.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_id', type: 'uuid' }),
    __metadata("design:type", String)
], ApiKey.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], ApiKey.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ApiKey.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ApiKey.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ApiKey.prototype, "deletedAt", void 0);
exports.ApiKey = ApiKey = __decorate([
    (0, typeorm_1.Entity)('api_keys')
], ApiKey);
//# sourceMappingURL=api-key.entity.js.map