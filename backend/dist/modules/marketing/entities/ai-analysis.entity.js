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
exports.AIAnalysis = exports.RelatedType = exports.AnalysisType = exports.AIProvider = void 0;
const typeorm_1 = require("typeorm");
var AIProvider;
(function (AIProvider) {
    AIProvider["GROQ"] = "groq";
    AIProvider["OPENROUTER"] = "openrouter";
    AIProvider["DEEPSEEK"] = "deepseek";
    AIProvider["MISTRAL"] = "mistral";
    AIProvider["QWEN"] = "qwen";
    AIProvider["OLLAMA"] = "ollama";
})(AIProvider || (exports.AIProvider = AIProvider = {}));
var AnalysisType;
(function (AnalysisType) {
    AnalysisType["SENTIMENT"] = "sentiment";
    AnalysisType["OPTIMIZATION"] = "optimization";
    AnalysisType["PREDICTION"] = "prediction";
    AnalysisType["IMAGE_GEN"] = "image_gen";
    AnalysisType["COPYWRITING"] = "copywriting";
    AnalysisType["AB_TEST"] = "ab_test";
})(AnalysisType || (exports.AnalysisType = AnalysisType = {}));
var RelatedType;
(function (RelatedType) {
    RelatedType["CAMPAIGN"] = "campaign";
    RelatedType["POST"] = "post";
    RelatedType["MESSAGE"] = "message";
    RelatedType["LANDING_PAGE"] = "landing_page";
    RelatedType["GENERAL"] = "general";
})(RelatedType || (exports.RelatedType = RelatedType = {}));
let AIAnalysis = class AIAnalysis {
    id;
    tenantId;
    relatedType;
    relatedId;
    aiProvider;
    aiModel;
    analysisType;
    inputData;
    outputData;
    suggestions;
    score; // 0.00-1.00
    tokensUsed;
    cost;
    processingTimeMs;
    metadata;
    createdBy;
    createdAt;
};
exports.AIAnalysis = AIAnalysis;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AIAnalysis.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', type: 'uuid' }),
    __metadata("design:type", String)
], AIAnalysis.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'related_type', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], AIAnalysis.prototype, "relatedType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'related_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AIAnalysis.prototype, "relatedId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_provider', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], AIAnalysis.prototype, "aiProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_model', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], AIAnalysis.prototype, "aiModel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'analysis_type', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], AIAnalysis.prototype, "analysisType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'input_data', type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], AIAnalysis.prototype, "inputData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'output_data', type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], AIAnalysis.prototype, "outputData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], AIAnalysis.prototype, "suggestions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], AIAnalysis.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tokens_used', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AIAnalysis.prototype, "tokensUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], AIAnalysis.prototype, "cost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_time_ms', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AIAnalysis.prototype, "processingTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], AIAnalysis.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AIAnalysis.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AIAnalysis.prototype, "createdAt", void 0);
exports.AIAnalysis = AIAnalysis = __decorate([
    (0, typeorm_1.Entity)('ai_analyses')
], AIAnalysis);
//# sourceMappingURL=ai-analysis.entity.js.map