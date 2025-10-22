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
exports.BulkMessage = exports.BulkMessageStatus = exports.BulkMessageType = exports.BulkMessagePlatform = void 0;
const typeorm_1 = require("typeorm");
const campaign_entity_1 = require("./campaign.entity");
const bulk_message_recipient_entity_1 = require("./bulk-message-recipient.entity");
var BulkMessagePlatform;
(function (BulkMessagePlatform) {
    BulkMessagePlatform["WHATSAPP"] = "whatsapp";
    BulkMessagePlatform["INSTAGRAM_DM"] = "instagram_dm";
    BulkMessagePlatform["EMAIL"] = "email";
})(BulkMessagePlatform || (exports.BulkMessagePlatform = BulkMessagePlatform = {}));
var BulkMessageType;
(function (BulkMessageType) {
    BulkMessageType["MARKETING"] = "marketing";
    BulkMessageType["TRANSACTIONAL"] = "transactional";
    BulkMessageType["NOTIFICATION"] = "notification";
})(BulkMessageType || (exports.BulkMessageType = BulkMessageType = {}));
var BulkMessageStatus;
(function (BulkMessageStatus) {
    BulkMessageStatus["DRAFT"] = "draft";
    BulkMessageStatus["SCHEDULED"] = "scheduled";
    BulkMessageStatus["SENDING"] = "sending";
    BulkMessageStatus["SENT"] = "sent";
    BulkMessageStatus["FAILED"] = "failed";
    BulkMessageStatus["CANCELLED"] = "cancelled";
})(BulkMessageStatus || (exports.BulkMessageStatus = BulkMessageStatus = {}));
let BulkMessage = class BulkMessage {
    id;
    tenantId;
    campaignId;
    platform;
    messageType;
    subject; // for emails
    templateId;
    templateName;
    content;
    mediaUrls;
    recipients;
    variables;
    scheduledAt;
    sentAt;
    completedAt;
    status;
    totalRecipients;
    sentCount;
    deliveredCount;
    failedCount;
    openedCount;
    clickedCount;
    bouncedCount;
    unsubscribedCount;
    cost;
    metadata;
    errorMessage;
    createdBy;
    createdAt;
    updatedAt;
    // Relations
    campaign;
    recipientTracking;
};
exports.BulkMessage = BulkMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BulkMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], BulkMessage.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'campaign_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BulkMessage.prototype, "campaignId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], BulkMessage.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'message_type', type: 'varchar', length: 50, default: BulkMessageType.MARKETING }),
    __metadata("design:type", String)
], BulkMessage.prototype, "messageType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BulkMessage.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'template_id', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BulkMessage.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'template_name', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BulkMessage.prototype, "templateName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], BulkMessage.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'media_urls', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], BulkMessage.prototype, "mediaUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], BulkMessage.prototype, "recipients", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], BulkMessage.prototype, "variables", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessage.prototype, "scheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessage.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessage.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: BulkMessageStatus.DRAFT }),
    __metadata("design:type", String)
], BulkMessage.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_recipients', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BulkMessage.prototype, "totalRecipients", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BulkMessage.prototype, "sentCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivered_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BulkMessage.prototype, "deliveredCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BulkMessage.prototype, "failedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opened_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BulkMessage.prototype, "openedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clicked_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BulkMessage.prototype, "clickedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bounced_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BulkMessage.prototype, "bouncedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unsubscribed_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BulkMessage.prototype, "unsubscribedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], BulkMessage.prototype, "cost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], BulkMessage.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BulkMessage.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BulkMessage.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BulkMessage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BulkMessage.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => campaign_entity_1.Campaign, (campaign) => campaign.bulkMessages),
    (0, typeorm_1.JoinColumn)({ name: 'campaign_id' }),
    __metadata("design:type", campaign_entity_1.Campaign)
], BulkMessage.prototype, "campaign", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => bulk_message_recipient_entity_1.BulkMessageRecipient, (recipient) => recipient.bulkMessage),
    __metadata("design:type", Array)
], BulkMessage.prototype, "recipientTracking", void 0);
exports.BulkMessage = BulkMessage = __decorate([
    (0, typeorm_1.Entity)('bulk_messages')
], BulkMessage);
//# sourceMappingURL=bulk-message.entity.js.map