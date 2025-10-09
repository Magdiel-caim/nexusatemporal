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
exports.Lead = exports.AttendanceLocation = exports.ClientStatus = exports.LeadChannel = exports.LeadStatus = exports.LeadPriority = exports.LeadSource = void 0;
const typeorm_1 = require("typeorm");
const stage_entity_1 = require("./stage.entity");
const user_entity_1 = require("../auth/user.entity");
const activity_entity_1 = require("./activity.entity");
const procedure_entity_1 = require("./procedure.entity");
var LeadSource;
(function (LeadSource) {
    LeadSource["WEBSITE"] = "website";
    LeadSource["FACEBOOK"] = "facebook";
    LeadSource["INSTAGRAM"] = "instagram";
    LeadSource["WHATSAPP"] = "whatsapp";
    LeadSource["EMAIL"] = "email";
    LeadSource["PHONE"] = "phone";
    LeadSource["REFERRAL"] = "referral";
    LeadSource["WALK_IN"] = "walk_in";
    LeadSource["OTHER"] = "other";
})(LeadSource || (exports.LeadSource = LeadSource = {}));
var LeadPriority;
(function (LeadPriority) {
    LeadPriority["LOW"] = "low";
    LeadPriority["MEDIUM"] = "medium";
    LeadPriority["HIGH"] = "high";
    LeadPriority["URGENT"] = "urgent";
})(LeadPriority || (exports.LeadPriority = LeadPriority = {}));
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "new";
    LeadStatus["CONTACTED"] = "contacted";
    LeadStatus["QUALIFIED"] = "qualified";
    LeadStatus["PROPOSAL"] = "proposal";
    LeadStatus["NEGOTIATION"] = "negotiation";
    LeadStatus["WON"] = "won";
    LeadStatus["LOST"] = "lost";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
var LeadChannel;
(function (LeadChannel) {
    LeadChannel["WHATSAPP"] = "whatsapp";
    LeadChannel["PHONE"] = "phone";
    LeadChannel["EMAIL"] = "email";
    LeadChannel["INSTAGRAM"] = "instagram";
    LeadChannel["FACEBOOK"] = "facebook";
    LeadChannel["WEBSITE"] = "website";
    LeadChannel["IN_PERSON"] = "in_person";
    LeadChannel["OTHER"] = "other";
})(LeadChannel || (exports.LeadChannel = LeadChannel = {}));
var ClientStatus;
(function (ClientStatus) {
    ClientStatus["CONVERSA_INICIADA"] = "conversa_iniciada";
    ClientStatus["AGENDAMENTO_PENDENTE"] = "agendamento_pendente";
    ClientStatus["AGENDADO"] = "agendado";
    ClientStatus["EM_TRATAMENTO"] = "em_tratamento";
    ClientStatus["FINALIZADO"] = "finalizado";
    ClientStatus["CANCELADO"] = "cancelado";
})(ClientStatus || (exports.ClientStatus = ClientStatus = {}));
var AttendanceLocation;
(function (AttendanceLocation) {
    AttendanceLocation["MOEMA"] = "moema";
    AttendanceLocation["PERDIZES"] = "perdizes";
    AttendanceLocation["ONLINE"] = "online";
    AttendanceLocation["A_DOMICILIO"] = "a_domicilio";
})(AttendanceLocation || (exports.AttendanceLocation = AttendanceLocation = {}));
let Lead = class Lead {
    id;
    name;
    email;
    phone;
    phone2;
    whatsapp;
    neighborhood;
    city;
    state;
    channel;
    clientStatus;
    attendanceLocation;
    company;
    position;
    tenantId;
    stageId;
    stage;
    procedureId;
    procedure;
    assignedToId;
    assignedTo;
    source;
    priority;
    status;
    estimatedValue;
    probability; // Probabilidade de conversão (0-100%)
    expectedCloseDate;
    lastContactDate;
    nextFollowUpDate;
    notes;
    customFields;
    tags;
    score; // Lead scoring
    isActive;
    activities;
    createdAt;
    updatedAt;
    createdById;
    createdBy;
};
exports.Lead = Lead;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Lead.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Lead.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "phone2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "whatsapp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "neighborhood", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LeadChannel,
        nullable: true,
    }),
    __metadata("design:type", String)
], Lead.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ClientStatus,
        nullable: true,
    }),
    __metadata("design:type", String)
], Lead.prototype, "clientStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AttendanceLocation,
        nullable: true,
    }),
    __metadata("design:type", String)
], Lead.prototype, "attendanceLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Lead.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Lead.prototype, "stageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stage_entity_1.Stage, (stage) => stage.leads),
    (0, typeorm_1.JoinColumn)({ name: 'stageId' }),
    __metadata("design:type", stage_entity_1.Stage)
], Lead.prototype, "stage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "procedureId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => procedure_entity_1.Procedure),
    (0, typeorm_1.JoinColumn)({ name: 'procedureId' }),
    __metadata("design:type", procedure_entity_1.Procedure)
], Lead.prototype, "procedure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "assignedToId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'assignedToId' }),
    __metadata("design:type", user_entity_1.User)
], Lead.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LeadSource,
        default: LeadSource.OTHER,
    }),
    __metadata("design:type", String)
], Lead.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LeadPriority,
        default: LeadPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], Lead.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LeadStatus,
        default: LeadStatus.NEW,
    }),
    __metadata("design:type", String)
], Lead.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Lead.prototype, "estimatedValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Lead.prototype, "probability", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "expectedCloseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "lastContactDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "nextFollowUpDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Lead.prototype, "customFields", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Lead.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Lead.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Lead.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => activity_entity_1.Activity, (activity) => activity.lead, { cascade: true }),
    __metadata("design:type", Array)
], Lead.prototype, "activities", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Lead.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Lead.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'createdById' }),
    __metadata("design:type", user_entity_1.User)
], Lead.prototype, "createdBy", void 0);
exports.Lead = Lead = __decorate([
    (0, typeorm_1.Entity)('leads')
], Lead);
//# sourceMappingURL=lead.entity.js.map