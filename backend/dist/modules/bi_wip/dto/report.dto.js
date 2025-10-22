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
exports.GenerateReportDto = exports.ScheduleReportDto = exports.UpdateCustomReportDto = exports.CreateCustomReportDto = exports.ReportFrequency = exports.ReportFormat = void 0;
const class_validator_1 = require("class-validator");
var ReportFormat;
(function (ReportFormat) {
    ReportFormat["PDF"] = "pdf";
    ReportFormat["EXCEL"] = "excel";
    ReportFormat["CSV"] = "csv";
})(ReportFormat || (exports.ReportFormat = ReportFormat = {}));
var ReportFrequency;
(function (ReportFrequency) {
    ReportFrequency["DAILY"] = "daily";
    ReportFrequency["WEEKLY"] = "weekly";
    ReportFrequency["MONTHLY"] = "monthly";
})(ReportFrequency || (exports.ReportFrequency = ReportFrequency = {}));
class CreateCustomReportDto {
    name;
    description;
    queryConfig;
    visualizationConfig;
    isPublic;
}
exports.CreateCustomReportDto = CreateCustomReportDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomReportDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomReportDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateCustomReportDto.prototype, "queryConfig", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateCustomReportDto.prototype, "visualizationConfig", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCustomReportDto.prototype, "isPublic", void 0);
class UpdateCustomReportDto {
    name;
    description;
    queryConfig;
    visualizationConfig;
    isPublic;
    isActive;
}
exports.UpdateCustomReportDto = UpdateCustomReportDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomReportDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomReportDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateCustomReportDto.prototype, "queryConfig", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateCustomReportDto.prototype, "visualizationConfig", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCustomReportDto.prototype, "isPublic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCustomReportDto.prototype, "isActive", void 0);
class ScheduleReportDto {
    frequency;
    recipients;
    format;
}
exports.ScheduleReportDto = ScheduleReportDto;
__decorate([
    (0, class_validator_1.IsEnum)(ReportFrequency),
    __metadata("design:type", String)
], ScheduleReportDto.prototype, "frequency", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ScheduleReportDto.prototype, "recipients", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ReportFormat),
    __metadata("design:type", String)
], ScheduleReportDto.prototype, "format", void 0);
class GenerateReportDto {
    parameters;
    format;
}
exports.GenerateReportDto = GenerateReportDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GenerateReportDto.prototype, "parameters", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ReportFormat),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "format", void 0);
//# sourceMappingURL=report.dto.js.map