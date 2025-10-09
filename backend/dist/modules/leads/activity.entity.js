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
exports.Activity = exports.ActivityType = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("./lead.entity");
const user_entity_1 = require("../auth/user.entity");
var ActivityType;
(function (ActivityType) {
    ActivityType["CALL"] = "call";
    ActivityType["EMAIL"] = "email";
    ActivityType["MEETING"] = "meeting";
    ActivityType["TASK"] = "task";
    ActivityType["NOTE"] = "note";
    ActivityType["WHATSAPP"] = "whatsapp";
    ActivityType["SMS"] = "sms";
    ActivityType["STAGE_CHANGE"] = "stage_change";
    ActivityType["STATUS_CHANGE"] = "status_change";
    ActivityType["LEAD_CREATED"] = "lead_created";
    ActivityType["LEAD_ASSIGNED"] = "lead_assigned";
    ActivityType["FIELD_CHANGE"] = "field_change";
    ActivityType["OTHER"] = "other";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
let Activity = class Activity {
    id;
    leadId;
    lead;
    type;
    title;
    description;
    scheduledAt;
    completedAt;
    isCompleted;
    userId;
    user;
    metadata;
    createdAt;
};
exports.Activity = Activity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Activity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Activity.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead, (lead) => lead.activities, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'leadId' }),
    __metadata("design:type", lead_entity_1.Lead)
], Activity.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ActivityType,
        default: ActivityType.NOTE,
    }),
    __metadata("design:type", String)
], Activity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Activity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Activity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Activity.prototype, "scheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Activity.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Activity.prototype, "isCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Activity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Activity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Activity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Activity.prototype, "createdAt", void 0);
exports.Activity = Activity = __decorate([
    (0, typeorm_1.Entity)('lead_activities')
], Activity);
//# sourceMappingURL=activity.entity.js.map