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
exports.LandingPageEvent = exports.LandingPageEventType = void 0;
const typeorm_1 = require("typeorm");
const landing_page_entity_1 = require("./landing-page.entity");
var LandingPageEventType;
(function (LandingPageEventType) {
    LandingPageEventType["VIEW"] = "view";
    LandingPageEventType["CLICK"] = "click";
    LandingPageEventType["CONVERSION"] = "conversion";
    LandingPageEventType["FORM_SUBMIT"] = "form_submit";
})(LandingPageEventType || (exports.LandingPageEventType = LandingPageEventType = {}));
let LandingPageEvent = class LandingPageEvent {
    id;
    landingPageId;
    eventType;
    visitorId;
    ipAddress;
    userAgent;
    referrer;
    utmSource;
    utmMedium;
    utmCampaign;
    utmTerm;
    utmContent;
    metadata;
    createdAt;
    // Relations
    landingPage;
};
exports.LandingPageEvent = LandingPageEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LandingPageEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'landing_page_id', type: 'uuid' }),
    __metadata("design:type", String)
], LandingPageEvent.prototype, "landingPageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_type', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], LandingPageEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'visitor_id', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LandingPageEvent.prototype, "visitorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', type: 'inet', nullable: true }),
    __metadata("design:type", String)
], LandingPageEvent.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", String)
], LandingPageEvent.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LandingPageEvent.prototype, "referrer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utm_source', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LandingPageEvent.prototype, "utmSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utm_medium', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LandingPageEvent.prototype, "utmMedium", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utm_campaign', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LandingPageEvent.prototype, "utmCampaign", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utm_term', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LandingPageEvent.prototype, "utmTerm", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utm_content', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LandingPageEvent.prototype, "utmContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], LandingPageEvent.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LandingPageEvent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => landing_page_entity_1.LandingPage, (landingPage) => landingPage.events),
    (0, typeorm_1.JoinColumn)({ name: 'landing_page_id' }),
    __metadata("design:type", landing_page_entity_1.LandingPage)
], LandingPageEvent.prototype, "landingPage", void 0);
exports.LandingPageEvent = LandingPageEvent = __decorate([
    (0, typeorm_1.Entity)('landing_page_events')
], LandingPageEvent);
//# sourceMappingURL=landing-page-event.entity.js.map