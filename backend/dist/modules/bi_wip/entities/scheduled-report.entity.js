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
exports.ScheduledReport = void 0;
const typeorm_1 = require("typeorm");
const custom_report_entity_1 = require("./custom-report.entity");
let ScheduledReport = class ScheduledReport {
    id;
    tenantId;
    reportId;
    report;
    frequency; // 'daily', 'weekly', 'monthly'
    recipients; // Array de emails
    format; // 'pdf', 'excel', 'csv'
    nextRunAt;
    lastRunAt;
    isActive;
    createdAt;
    updatedAt;
};
exports.ScheduledReport = ScheduledReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScheduledReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ScheduledReport.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ScheduledReport.prototype, "reportId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => custom_report_entity_1.CustomReport),
    (0, typeorm_1.JoinColumn)({ name: 'reportId' }),
    __metadata("design:type", custom_report_entity_1.CustomReport)
], ScheduledReport.prototype, "report", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], ScheduledReport.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array' }),
    __metadata("design:type", Array)
], ScheduledReport.prototype, "recipients", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], ScheduledReport.prototype, "format", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ScheduledReport.prototype, "nextRunAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ScheduledReport.prototype, "lastRunAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ScheduledReport.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ScheduledReport.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ScheduledReport.prototype, "updatedAt", void 0);
exports.ScheduledReport = ScheduledReport = __decorate([
    (0, typeorm_1.Entity)('bi_scheduled_reports')
], ScheduledReport);
//# sourceMappingURL=scheduled-report.entity.js.map