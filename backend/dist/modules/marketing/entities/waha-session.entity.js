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
exports.WahaSession = exports.WahaSessionStatus = void 0;
const typeorm_1 = require("typeorm");
var WahaSessionStatus;
(function (WahaSessionStatus) {
    WahaSessionStatus["STOPPED"] = "stopped";
    WahaSessionStatus["STARTING"] = "starting";
    WahaSessionStatus["SCAN_QR_CODE"] = "scan_qr_code";
    WahaSessionStatus["WORKING"] = "working";
    WahaSessionStatus["FAILED"] = "failed";
})(WahaSessionStatus || (exports.WahaSessionStatus = WahaSessionStatus = {}));
let WahaSession = class WahaSession {
    id;
    tenantId;
    name;
    displayName;
    phoneNumber;
    status;
    qrCode;
    wahaServerUrl;
    wahaApiKey;
    isPrimary;
    isActive;
    // Failover configuration
    failoverEnabled;
    failoverPriority; // Higher = higher priority
    // Sending configuration
    maxMessagesPerMinute;
    minDelaySeconds;
    maxDelaySeconds;
    // Metadata
    metadata;
    errorMessage;
    lastConnectedAt;
    lastErrorAt;
    createdBy;
    createdAt;
    updatedAt;
};
exports.WahaSession = WahaSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WahaSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], WahaSession.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], WahaSession.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], WahaSession.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], WahaSession.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: WahaSessionStatus.STOPPED }),
    __metadata("design:type", String)
], WahaSession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WahaSession.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'waha_server_url', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], WahaSession.prototype, "wahaServerUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'waha_api_key', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], WahaSession.prototype, "wahaApiKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_primary', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], WahaSession.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], WahaSession.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failover_enabled', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], WahaSession.prototype, "failoverEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failover_priority', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WahaSession.prototype, "failoverPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_messages_per_minute', type: 'int', default: 30 }),
    __metadata("design:type", Number)
], WahaSession.prototype, "maxMessagesPerMinute", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_delay_seconds', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], WahaSession.prototype, "minDelaySeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_delay_seconds', type: 'int', default: 5 }),
    __metadata("design:type", Number)
], WahaSession.prototype, "maxDelaySeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], WahaSession.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WahaSession.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_connected_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WahaSession.prototype, "lastConnectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_error_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WahaSession.prototype, "lastErrorAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], WahaSession.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WahaSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], WahaSession.prototype, "updatedAt", void 0);
exports.WahaSession = WahaSession = __decorate([
    (0, typeorm_1.Entity)('waha_sessions')
], WahaSession);
//# sourceMappingURL=waha-session.entity.js.map