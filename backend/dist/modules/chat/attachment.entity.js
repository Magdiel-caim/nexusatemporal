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
exports.Attachment = void 0;
const typeorm_1 = require("typeorm");
const message_entity_1 = require("./message.entity");
let Attachment = class Attachment {
    id;
    messageId;
    message;
    type;
    fileName;
    fileUrl; // URL do arquivo (S3/iDrive)
    mimeType;
    fileSize; // Tamanho em bytes
    duration; // Duração em segundos (para áudio/vídeo)
    thumbnailUrl;
    createdAt;
};
exports.Attachment = Attachment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Attachment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'message_id', type: 'uuid' }),
    __metadata("design:type", String)
], Attachment.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => message_entity_1.Message, (message) => message.attachments, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'message_id' }),
    __metadata("design:type", message_entity_1.Message)
], Attachment.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Attachment.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_name', type: 'varchar' }),
    __metadata("design:type", String)
], Attachment.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_url', type: 'varchar' }),
    __metadata("design:type", String)
], Attachment.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mime_type', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Attachment.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Attachment.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Attachment.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'thumbnail_url', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Attachment.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Attachment.prototype, "createdAt", void 0);
exports.Attachment = Attachment = __decorate([
    (0, typeorm_1.Entity)('attachments')
], Attachment);
//# sourceMappingURL=attachment.entity.js.map