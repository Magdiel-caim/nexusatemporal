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
exports.BulkMessageContact = exports.ContactStatus = void 0;
const typeorm_1 = require("typeorm");
const bulk_message_entity_1 = require("./bulk-message.entity");
var ContactStatus;
(function (ContactStatus) {
    ContactStatus["PENDING"] = "pending";
    ContactStatus["SENT"] = "sent";
    ContactStatus["DELIVERED"] = "delivered";
    ContactStatus["READ"] = "read";
    ContactStatus["FAILED"] = "failed";
    ContactStatus["CLICKED"] = "clicked";
})(ContactStatus || (exports.ContactStatus = ContactStatus = {}));
let BulkMessageContact = class BulkMessageContact {
    id;
    bulkMessageId;
    bulkMessage;
    name;
    phoneNumber;
    email;
    company;
    status;
    personalizedContent;
    wahaMessageId;
    sentAt;
    deliveredAt;
    readAt;
    failedAt;
    clickedAt;
    errorMessage;
    retryCount;
    metadata;
    createdAt;
    updatedAt;
};
exports.BulkMessageContact = BulkMessageContact;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BulkMessageContact.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bulk_message_id', type: 'uuid' }),
    __metadata("design:type", String)
], BulkMessageContact.prototype, "bulkMessageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bulk_message_entity_1.BulkMessage),
    (0, typeorm_1.JoinColumn)({ name: 'bulk_message_id' }),
    __metadata("design:type", bulk_message_entity_1.BulkMessage)
], BulkMessageContact.prototype, "bulkMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], BulkMessageContact.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], BulkMessageContact.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BulkMessageContact.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BulkMessageContact.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: ContactStatus.PENDING }),
    __metadata("design:type", String)
], BulkMessageContact.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'personalized_content', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BulkMessageContact.prototype, "personalizedContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'waha_message_id', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BulkMessageContact.prototype, "wahaMessageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessageContact.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivered_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessageContact.prototype, "deliveredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'read_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessageContact.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessageContact.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clicked_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BulkMessageContact.prototype, "clickedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BulkMessageContact.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BulkMessageContact.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], BulkMessageContact.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BulkMessageContact.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BulkMessageContact.prototype, "updatedAt", void 0);
exports.BulkMessageContact = BulkMessageContact = __decorate([
    (0, typeorm_1.Entity)('bulk_message_contacts')
], BulkMessageContact);
//# sourceMappingURL=bulk-message-contact.entity.js.map