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
exports.BulkMessageRecipient = exports.RecipientStatus = void 0;
const typeorm_1 = require("typeorm");
const bulk_message_entity_1 = require("./bulk-message.entity");
var RecipientStatus;
(function (RecipientStatus) {
    RecipientStatus["PENDING"] = "pending";
    RecipientStatus["SENT"] = "sent";
    RecipientStatus["DELIVERED"] = "delivered";
    RecipientStatus["FAILED"] = "failed";
    RecipientStatus["OPENED"] = "opened";
    RecipientStatus["CLICKED"] = "clicked";
    RecipientStatus["BOUNCED"] = "bounced";
    RecipientStatus["UNSUBSCRIBED"] = "unsubscribed";
})(RecipientStatus || (exports.RecipientStatus = RecipientStatus = {}));
let BulkMessageRecipient = class BulkMessageRecipient {
    id;
    bulkMessageId;
    recipientIdentifier; // phone, email, or instagram_id
    recipientName;
    status;
    sentAt;
    deliveredAt;
    openedAt;
    clickedAt;
    failedAt;
    errorMessage;
    platformMessageId;
    metadata;
    createdAt;
    updatedAt;
    // Relations
    bulkMessage;
};
exports.BulkMessageRecipient = BulkMessageRecipient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BulkMessageRecipient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bulk_message_id', type: 'uuid' }),
    __metadata("design:type", String)
], BulkMessageRecipient.prototype, "bulkMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recipient_identifier', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], BulkMessageRecipient.prototype, "recipientIdentifier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recipient_name', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BulkMessageRecipient.prototype, "recipientName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: RecipientStatus.PENDING }),
    __metadata("design:type", String)
], BulkMessageRecipient.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessageRecipient.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivered_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessageRecipient.prototype, "deliveredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'opened_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessageRecipient.prototype, "openedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clicked_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessageRecipient.prototype, "clickedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessageRecipient.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BulkMessageRecipient.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'platform_message_id', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BulkMessageRecipient.prototype, "platformMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], BulkMessageRecipient.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BulkMessageRecipient.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BulkMessageRecipient.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bulk_message_entity_1.BulkMessage, (bulkMessage) => bulkMessage.recipientTracking),
    (0, typeorm_1.JoinColumn)({ name: 'bulk_message_id' }),
    __metadata("design:type", bulk_message_entity_1.BulkMessage)
], BulkMessageRecipient.prototype, "bulkMessage", void 0);
exports.BulkMessageRecipient = BulkMessageRecipient = __decorate([
    (0, typeorm_1.Entity)('bulk_message_recipients')
], BulkMessageRecipient);
//# sourceMappingURL=bulk-message-recipient.entity.js.map