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
exports.Campaign = exports.CampaignStatus = exports.CampaignType = void 0;
const typeorm_1 = require("typeorm");
const social_post_entity_1 = require("./social-post.entity");
const bulk_message_entity_1 = require("./bulk-message.entity");
const landing_page_entity_1 = require("./landing-page.entity");
const campaign_metric_entity_1 = require("./campaign-metric.entity");
var CampaignType;
(function (CampaignType) {
    CampaignType["SOCIAL"] = "social";
    CampaignType["EMAIL"] = "email";
    CampaignType["WHATSAPP"] = "whatsapp";
    CampaignType["LANDING_PAGE"] = "landing_page";
    CampaignType["MULTI"] = "multi";
})(CampaignType || (exports.CampaignType = CampaignType = {}));
var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["DRAFT"] = "draft";
    CampaignStatus["ACTIVE"] = "active";
    CampaignStatus["PAUSED"] = "paused";
    CampaignStatus["COMPLETED"] = "completed";
    CampaignStatus["ARCHIVED"] = "archived";
})(CampaignStatus || (exports.CampaignStatus = CampaignStatus = {}));
let Campaign = class Campaign {
    id;
    tenantId;
    name;
    description;
    type;
    status;
    startDate;
    endDate;
    budget;
    spent;
    metadata;
    createdBy;
    createdAt;
    updatedAt;
    // Relations
    socialPosts;
    bulkMessages;
    landingPages;
    metrics;
};
exports.Campaign = Campaign;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Campaign.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], Campaign.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Campaign.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Campaign.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Campaign.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: CampaignStatus.DRAFT }),
    __metadata("design:type", String)
], Campaign.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Campaign.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Campaign.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Campaign.prototype, "budget", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Campaign.prototype, "spent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], Campaign.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Campaign.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Campaign.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Campaign.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => social_post_entity_1.SocialPost, (post) => post.campaign),
    __metadata("design:type", Array)
], Campaign.prototype, "socialPosts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => bulk_message_entity_1.BulkMessage, (message) => message.campaign),
    __metadata("design:type", Array)
], Campaign.prototype, "bulkMessages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => landing_page_entity_1.LandingPage, (page) => page.campaign),
    __metadata("design:type", Array)
], Campaign.prototype, "landingPages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => campaign_metric_entity_1.CampaignMetric, (metric) => metric.campaign),
    __metadata("design:type", Array)
], Campaign.prototype, "metrics", void 0);
exports.Campaign = Campaign = __decorate([
    (0, typeorm_1.Entity)('marketing_campaigns')
], Campaign);
//# sourceMappingURL=campaign.entity.js.map