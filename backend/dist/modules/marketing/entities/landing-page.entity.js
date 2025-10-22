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
exports.LandingPage = exports.LandingPageStatus = void 0;
const typeorm_1 = require("typeorm");
const campaign_entity_1 = require("./campaign.entity");
const landing_page_event_entity_1 = require("./landing-page-event.entity");
var LandingPageStatus;
(function (LandingPageStatus) {
    LandingPageStatus["DRAFT"] = "draft";
    LandingPageStatus["PUBLISHED"] = "published";
    LandingPageStatus["ARCHIVED"] = "archived";
})(LandingPageStatus || (exports.LandingPageStatus = LandingPageStatus = {}));
let LandingPage = class LandingPage {
    id;
    tenantId;
    campaignId;
    name;
    slug;
    domain;
    htmlContent;
    cssContent;
    jsContent;
    grapesjsData;
    status;
    publishedAt;
    viewsCount;
    uniqueVisitors;
    conversionsCount;
    bounceRate;
    avgTimeOnPage; // seconds
    // SEO
    seoTitle;
    seoDescription;
    seoKeywords;
    ogImage;
    ogTitle;
    ogDescription;
    // Settings
    settings;
    metadata;
    createdBy;
    createdAt;
    updatedAt;
    // Relations
    campaign;
    events;
};
exports.LandingPage = LandingPage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LandingPage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], LandingPage.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'campaign_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], LandingPage.prototype, "campaignId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], LandingPage.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], LandingPage.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LandingPage.prototype, "domain", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'html_content', type: 'text', nullable: true }),
    __metadata("design:type", String)
], LandingPage.prototype, "htmlContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'css_content', type: 'text', nullable: true }),
    __metadata("design:type", String)
], LandingPage.prototype, "cssContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'js_content', type: 'text', nullable: true }),
    __metadata("design:type", String)
], LandingPage.prototype, "jsContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'grapesjs_data', type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], LandingPage.prototype, "grapesjsData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: LandingPageStatus.DRAFT }),
    __metadata("design:type", String)
], LandingPage.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'published_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], LandingPage.prototype, "publishedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'views_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], LandingPage.prototype, "viewsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unique_visitors', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], LandingPage.prototype, "uniqueVisitors", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversions_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], LandingPage.prototype, "conversionsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bounce_rate', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], LandingPage.prototype, "bounceRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avg_time_on_page', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], LandingPage.prototype, "avgTimeOnPage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seo_title', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LandingPage.prototype, "seoTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seo_description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], LandingPage.prototype, "seoDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seo_keywords', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], LandingPage.prototype, "seoKeywords", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'og_image', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], LandingPage.prototype, "ogImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'og_title', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LandingPage.prototype, "ogTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'og_description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], LandingPage.prototype, "ogDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], LandingPage.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], LandingPage.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], LandingPage.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LandingPage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], LandingPage.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => campaign_entity_1.Campaign, (campaign) => campaign.landingPages),
    (0, typeorm_1.JoinColumn)({ name: 'campaign_id' }),
    __metadata("design:type", campaign_entity_1.Campaign)
], LandingPage.prototype, "campaign", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => landing_page_event_entity_1.LandingPageEvent, (event) => event.landingPage),
    __metadata("design:type", Array)
], LandingPage.prototype, "events", void 0);
exports.LandingPage = LandingPage = __decorate([
    (0, typeorm_1.Entity)('landing_pages')
], LandingPage);
//# sourceMappingURL=landing-page.entity.js.map