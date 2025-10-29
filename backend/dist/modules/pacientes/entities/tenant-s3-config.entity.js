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
exports.TenantS3Config = void 0;
const typeorm_1 = require("typeorm");
let TenantS3Config = class TenantS3Config {
    id;
    tenantId;
    endpoint;
    accessKeyId; // Criptografado
    secretAccessKey; // Criptografado
    bucketName;
    region;
    isActive;
    createdAt;
    updatedAt;
};
exports.TenantS3Config = TenantS3Config;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TenantS3Config.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], TenantS3Config.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], TenantS3Config.prototype, "endpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'access_key_id', type: 'text' }),
    __metadata("design:type", String)
], TenantS3Config.prototype, "accessKeyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'secret_access_key', type: 'text' }),
    __metadata("design:type", String)
], TenantS3Config.prototype, "secretAccessKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bucket_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], TenantS3Config.prototype, "bucketName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: 'us-east-1' }),
    __metadata("design:type", String)
], TenantS3Config.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], TenantS3Config.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TenantS3Config.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TenantS3Config.prototype, "updatedAt", void 0);
exports.TenantS3Config = TenantS3Config = __decorate([
    (0, typeorm_1.Entity)('tenant_s3_configs'),
    (0, typeorm_1.Index)(['tenantId'], { unique: true })
], TenantS3Config);
//# sourceMappingURL=tenant-s3-config.entity.js.map