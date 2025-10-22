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
exports.SocialPost = exports.MediaType = exports.SocialPostStatus = exports.SocialPostType = exports.SocialPlatform = void 0;
const typeorm_1 = require("typeorm");
const campaign_entity_1 = require("./campaign.entity");
var SocialPlatform;
(function (SocialPlatform) {
    SocialPlatform["INSTAGRAM"] = "instagram";
    SocialPlatform["FACEBOOK"] = "facebook";
    SocialPlatform["LINKEDIN"] = "linkedin";
    SocialPlatform["TIKTOK"] = "tiktok";
})(SocialPlatform || (exports.SocialPlatform = SocialPlatform = {}));
var SocialPostType;
(function (SocialPostType) {
    SocialPostType["FEED"] = "feed";
    SocialPostType["STORY"] = "story";
    SocialPostType["REEL"] = "reel";
    SocialPostType["CAROUSEL"] = "carousel";
})(SocialPostType || (exports.SocialPostType = SocialPostType = {}));
var SocialPostStatus;
(function (SocialPostStatus) {
    SocialPostStatus["DRAFT"] = "draft";
    SocialPostStatus["SCHEDULED"] = "scheduled";
    SocialPostStatus["PUBLISHED"] = "published";
    SocialPostStatus["FAILED"] = "failed";
    SocialPostStatus["DELETED"] = "deleted";
})(SocialPostStatus || (exports.SocialPostStatus = SocialPostStatus = {}));
var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "image";
    MediaType["VIDEO"] = "video";
    MediaType["CAROUSEL"] = "carousel";
})(MediaType || (exports.MediaType = MediaType = {}));
let SocialPost = class SocialPost {
    id;
    tenantId;
    campaignId;
    platform;
    postType;
    content;
    mediaUrls;
    mediaType;
    scheduledAt;
    publishedAt;
    status;
    platformPostId;
    platformUrl;
    errorMessage;
    metrics;
    hashtags;
    mentions;
    createdBy;
    createdAt;
    updatedAt;
    // Relations
    campaign;
};
exports.SocialPost = SocialPost;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SocialPost.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], SocialPost.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'campaign_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SocialPost.prototype, "campaignId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], SocialPost.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'post_type', type: 'varchar', length: 50, default: SocialPostType.FEED }),
    __metadata("design:type", String)
], SocialPost.prototype, "postType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SocialPost.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'media_urls', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], SocialPost.prototype, "mediaUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'media_type', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], SocialPost.prototype, "mediaType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SocialPost.prototype, "scheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'published_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SocialPost.prototype, "publishedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: SocialPostStatus.DRAFT }),
    __metadata("design:type", String)
], SocialPost.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'platform_post_id', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], SocialPost.prototype, "platformPostId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'platform_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SocialPost.prototype, "platformUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SocialPost.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], SocialPost.prototype, "metrics", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], SocialPost.prototype, "hashtags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], SocialPost.prototype, "mentions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SocialPost.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SocialPost.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SocialPost.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => campaign_entity_1.Campaign, (campaign) => campaign.socialPosts),
    (0, typeorm_1.JoinColumn)({ name: 'campaign_id' }),
    __metadata("design:type", campaign_entity_1.Campaign)
], SocialPost.prototype, "campaign", void 0);
exports.SocialPost = SocialPost = __decorate([
    (0, typeorm_1.Entity)('social_posts')
], SocialPost);
//# sourceMappingURL=social-post.entity.js.map