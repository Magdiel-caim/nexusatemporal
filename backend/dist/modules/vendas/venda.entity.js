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
exports.Venda = exports.VendaStatus = void 0;
const typeorm_1 = require("typeorm");
const vendedor_entity_1 = require("./vendedor.entity");
const lead_entity_1 = require("../leads/lead.entity");
const appointment_entity_1 = require("../agenda/appointment.entity");
const procedure_entity_1 = require("../leads/procedure.entity");
const transaction_entity_1 = require("../financeiro/transaction.entity");
const user_entity_1 = require("../auth/user.entity");
const comissao_entity_1 = require("./comissao.entity");
var VendaStatus;
(function (VendaStatus) {
    VendaStatus["PENDENTE"] = "pendente";
    VendaStatus["CONFIRMADA"] = "confirmada";
    VendaStatus["CANCELADA"] = "cancelada";
})(VendaStatus || (exports.VendaStatus = VendaStatus = {}));
/**
 * Entidade Venda
 *
 * Representa uma venda realizada por um vendedor.
 * Uma venda pode estar vinculada a um Lead, Agendamento e/ou Procedimento.
 * Quando confirmada, gera automaticamente uma Comissão.
 *
 * @example
 * {
 *   id: "uuid",
 *   numeroVenda: "VND-2025-0001",
 *   vendedorId: "vendedor-uuid",
 *   leadId: "lead-uuid",
 *   valorBruto: 5000.00,
 *   desconto: 500.00,
 *   valorLiquido: 4500.00,
 *   percentualComissao: 10.00,
 *   valorComissao: 450.00,
 *   status: "confirmada",
 *   dataVenda: "2025-10-20T10:00:00Z",
 *   dataConfirmacao: "2025-10-20T14:30:00Z"
 * }
 */
let Venda = class Venda {
    id;
    /**
     * Número único da venda (auto-gerado)
     * Formato: VND-YYYY-NNNN
     */
    numeroVenda;
    /**
     * Relacionamento com Vendedor
     */
    vendedorId;
    vendedor;
    /**
     * Relacionamento com Lead (cliente)
     */
    leadId;
    lead;
    /**
     * Relacionamento com Agendamento (opcional)
     */
    appointmentId;
    appointment;
    /**
     * Relacionamento com Procedimento vendido
     */
    procedureId;
    procedure;
    /**
     * Valores da venda
     */
    valorBruto;
    desconto;
    valorLiquido;
    /**
     * Comissão
     * Percentual pode ser diferente do padrão do vendedor
     */
    percentualComissao;
    valorComissao;
    /**
     * Datas importantes
     */
    dataVenda;
    /**
     * Data de confirmação (quando pagamento foi confirmado)
     * Gatilho para gerar comissão
     */
    dataConfirmacao;
    dataCancelamento;
    /**
     * Status da venda
     */
    status;
    motivoCancelamento;
    /**
     * Relacionamento com Transaction (financeiro)
     */
    transactionId;
    transaction;
    /**
     * Forma de pagamento
     */
    formaPagamento;
    /**
     * Observações
     */
    observacoes;
    /**
     * Metadata adicional (JSONB)
     */
    metadata;
    /**
     * Tenant ID (multi-tenancy)
     */
    tenantId;
    /**
     * Usuário que criou a venda
     */
    createdById;
    createdBy;
    /**
     * Relacionamento com Comissões geradas
     */
    comissoes;
    createdAt;
    updatedAt;
    /**
     * Gera número da venda automaticamente antes de inserir
     */
    async gerarNumeroVenda() {
        if (!this.numeroVenda) {
            // Será implementado no service para buscar último número
            const ano = new Date().getFullYear();
            this.numeroVenda = `VND-${ano}-temp`;
        }
        // Calcula valor líquido se não foi informado
        if (!this.valorLiquido && this.valorBruto) {
            this.valorLiquido = this.valorBruto - (this.desconto || 0);
        }
    }
    /**
     * Verifica se a venda está confirmada
     */
    isConfirmada() {
        return this.status === VendaStatus.CONFIRMADA && !!this.dataConfirmacao;
    }
    /**
     * Verifica se a venda está cancelada
     */
    isCancelada() {
        return this.status === VendaStatus.CANCELADA && !!this.dataCancelamento;
    }
    /**
     * Verifica se a venda está pendente
     */
    isPendente() {
        return this.status === VendaStatus.PENDENTE;
    }
    /**
     * Calcula o valor líquido baseado no bruto e desconto
     */
    calcularValorLiquido() {
        return this.valorBruto - (this.desconto || 0);
    }
    /**
     * Retorna JSON formatado
     */
    toJSON() {
        return {
            id: this.id,
            numeroVenda: this.numeroVenda,
            vendedorId: this.vendedorId,
            vendedor: this.vendedor,
            leadId: this.leadId,
            lead: this.lead,
            appointmentId: this.appointmentId,
            procedureId: this.procedureId,
            valorBruto: this.valorBruto,
            desconto: this.desconto,
            valorLiquido: this.valorLiquido,
            percentualComissao: this.percentualComissao,
            valorComissao: this.valorComissao,
            dataVenda: this.dataVenda,
            dataConfirmacao: this.dataConfirmacao,
            dataCancelamento: this.dataCancelamento,
            status: this.status,
            formaPagamento: this.formaPagamento,
            transactionId: this.transactionId,
            tenantId: this.tenantId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
};
exports.Venda = Venda;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Venda.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, unique: true }),
    __metadata("design:type", String)
], Venda.prototype, "numeroVenda", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Venda.prototype, "vendedorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendedor_entity_1.Vendedor, (vendedor) => vendedor.vendas, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'vendedorId' }),
    __metadata("design:type", vendedor_entity_1.Vendedor)
], Venda.prototype, "vendedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Venda.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'leadId' }),
    __metadata("design:type", Object)
], Venda.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Venda.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appointment_entity_1.Appointment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'appointmentId' }),
    __metadata("design:type", Object)
], Venda.prototype, "appointment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Venda.prototype, "procedureId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => procedure_entity_1.Procedure, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'procedureId' }),
    __metadata("design:type", Object)
], Venda.prototype, "procedure", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], Venda.prototype, "valorBruto", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], Venda.prototype, "desconto", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], Venda.prototype, "valorLiquido", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Venda.prototype, "percentualComissao", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Venda.prototype, "valorComissao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Venda.prototype, "dataVenda", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Venda.prototype, "dataConfirmacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Venda.prototype, "dataCancelamento", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: VendaStatus,
        default: VendaStatus.PENDENTE,
    }),
    __metadata("design:type", String)
], Venda.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Venda.prototype, "motivoCancelamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Venda.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.Transaction, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'transactionId' }),
    __metadata("design:type", Object)
], Venda.prototype, "transaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], Venda.prototype, "formaPagamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Venda.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Venda.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Venda.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Venda.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'createdById' }),
    __metadata("design:type", Object)
], Venda.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comissao_entity_1.Comissao, (comissao) => comissao.venda),
    __metadata("design:type", Array)
], Venda.prototype, "comissoes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Venda.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Venda.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Venda.prototype, "gerarNumeroVenda", null);
exports.Venda = Venda = __decorate([
    (0, typeorm_1.Entity)('vendas')
], Venda);
//# sourceMappingURL=venda.entity.js.map