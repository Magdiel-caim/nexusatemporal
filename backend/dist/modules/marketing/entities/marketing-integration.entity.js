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
exports.MarketingIntegration = exports.IntegrationStatus = exports.IntegrationPlatform = void 0;
const typeorm_1 = require("typeorm");
var IntegrationPlatform;
(function (IntegrationPlatform) {
    // Social Media
    IntegrationPlatform["FACEBOOK"] = "facebook";
    IntegrationPlatform["INSTAGRAM"] = "instagram";
    IntegrationPlatform["TIKTOK"] = "tiktok";
    IntegrationPlatform["LINKEDIN"] = "linkedin";
    // Analytics
    IntegrationPlatform["GOOGLE_ADS"] = "google_ads";
    IntegrationPlatform["GOOGLE_ANALYTICS"] = "google_analytics";
    // Email
    IntegrationPlatform["SENDGRID"] = "sendgrid";
    IntegrationPlatform["RESEND"] = "resend";
    // Messaging
    IntegrationPlatform["WHATSAPP"] = "whatsapp";
    IntegrationPlatform["WAHA"] = "waha";
    // AI Providers
    IntegrationPlatform["GROQ"] = "groq";
    IntegrationPlatform["OPENROUTER"] = "openrouter";
    IntegrationPlatform["DEEPSEEK"] = "deepseek";
    IntegrationPlatform["MISTRAL"] = "mistral";
    IntegrationPlatform["QWEN"] = "qwen";
    IntegrationPlatform["OLLAMA"] = "ollama";
})(IntegrationPlatform || (exports.IntegrationPlatform = IntegrationPlatform = {}));
var IntegrationStatus;
(function (IntegrationStatus) {
    IntegrationStatus["ACTIVE"] = "active";
    IntegrationStatus["INACTIVE"] = "inactive";
    IntegrationStatus["EXPIRED"] = "expired";
    IntegrationStatus["ERROR"] = "error";
})(IntegrationStatus || (exports.IntegrationStatus = IntegrationStatus = {}));
let MarketingIntegration = class MarketingIntegration {
    id;
    tenantId;
    platform;
    name;
    credentials;
    config;
    status;
    lastSyncAt;
    expiresAt;
    errorMessage;
    metadata;
    createdBy;
    createdAt;
    updatedAt;
};
exports.MarketingIntegration = MarketingIntegration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MarketingIntegration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], MarketingIntegration.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], MarketingIntegration.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], MarketingIntegration.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], MarketingIntegration.prototype, "credentials", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], MarketingIntegration.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: IntegrationStatus.ACTIVE }),
    __metadata("design:type", String)
], MarketingIntegration.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_sync_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MarketingIntegration.prototype, "lastSyncAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MarketingIntegration.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketingIntegration.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], MarketingIntegration.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], MarketingIntegration.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MarketingIntegration.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MarketingIntegration.prototype, "updatedAt", void 0);
exports.MarketingIntegration = MarketingIntegration = __decorate([
    (0, typeorm_1.Entity)('marketing_integrations')
], MarketingIntegration);
//# sourceMappingURL=marketing-integration.entity.js.map