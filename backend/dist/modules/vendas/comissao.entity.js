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
exports.Comissao = exports.ComissaoStatus = void 0;
const typeorm_1 = require("typeorm");
const venda_entity_1 = require("./venda.entity");
const vendedor_entity_1 = require("./vendedor.entity");
const transaction_entity_1 = require("../financeiro/transaction.entity");
var ComissaoStatus;
(function (ComissaoStatus) {
    ComissaoStatus["PENDENTE"] = "pendente";
    ComissaoStatus["PAGA"] = "paga";
    ComissaoStatus["CANCELADA"] = "cancelada";
})(ComissaoStatus || (exports.ComissaoStatus = ComissaoStatus = {}));
/**
 * Entidade Comissao
 *
 * Representa uma comissão gerada a partir de uma venda confirmada.
 * Comissões são agrupadas por mês de competência para relatórios.
 *
 * @example
 * {
 *   id: "uuid",
 *   vendaId: "venda-uuid",
 *   vendedorId: "vendedor-uuid",
 *   valorBaseCalculo: 4500.00,
 *   percentualAplicado: 10.00,
 *   valorComissao: 450.00,
 *   mesCompetencia: 10,
 *   anoCompetencia: 2025,
 *   status: "pendente"
 * }
 */
let Comissao = class Comissao {
    id;
    /**
     * Relacionamento com Venda
     * Uma comissão está sempre vinculada a uma venda
     */
    vendaId;
    venda;
    /**
     * Relacionamento com Vendedor
     * Facilita consultas diretas por vendedor
     */
    vendedorId;
    vendedor;
    /**
     * Valores para cálculo
     */
    valorBaseCalculo;
    percentualAplicado;
    valorComissao;
    /**
     * Período de competência
     * Usado para agrupar comissões nos relatórios mensais
     */
    mesCompetencia; // 1-12
    anoCompetencia; // 2025
    /**
     * Status da comissão
     */
    status;
    /**
     * Pagamento da comissão
     */
    dataPagamento;
    /**
     * Relacionamento com Transaction (quando paga)
     */
    transactionId;
    transaction;
    /**
     * Observações
     */
    observacoes;
    /**
     * Tenant ID (multi-tenancy)
     */
    tenantId;
    createdAt;
    updatedAt;
    /**
     * Verifica se a comissão está pendente
     */
    isPendente() {
        return this.status === ComissaoStatus.PENDENTE;
    }
    /**
     * Verifica se a comissão foi paga
     */
    isPaga() {
        return this.status === ComissaoStatus.PAGA && !!this.dataPagamento;
    }
    /**
     * Verifica se a comissão foi cancelada
     */
    isCancelada() {
        return this.status === ComissaoStatus.CANCELADA;
    }
    /**
     * Retorna descrição do período de competência
     */
    getPeriodoCompetencia() {
        const meses = [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro',
        ];
        return `${meses[this.mesCompetencia - 1]}/${this.anoCompetencia}`;
    }
    /**
     * Retorna JSON formatado
     */
    toJSON() {
        return {
            id: this.id,
            vendaId: this.vendaId,
            venda: this.venda,
            vendedorId: this.vendedorId,
            vendedor: this.vendedor,
            valorBaseCalculo: this.valorBaseCalculo,
            percentualAplicado: this.percentualAplicado,
            valorComissao: this.valorComissao,
            mesCompetencia: this.mesCompetencia,
            anoCompetencia: this.anoCompetencia,
            periodoCompetencia: this.getPeriodoCompetencia(),
            status: this.status,
            dataPagamento: this.dataPagamento,
            transactionId: this.transactionId,
            tenantId: this.tenantId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
};
exports.Comissao = Comissao;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Comissao.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Comissao.prototype, "vendaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => venda_entity_1.Venda, (venda) => venda.comissoes, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'vendaId' }),
    __metadata("design:type", venda_entity_1.Venda)
], Comissao.prototype, "venda", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Comissao.prototype, "vendedorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendedor_entity_1.Vendedor, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'vendedorId' }),
    __metadata("design:type", vendedor_entity_1.Vendedor)
], Comissao.prototype, "vendedor", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], Comissao.prototype, "valorBaseCalculo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 5,
        scale: 2,
    }),
    __metadata("design:type", Number)
], Comissao.prototype, "percentualAplicado", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], Comissao.prototype, "valorComissao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Comissao.prototype, "mesCompetencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Comissao.prototype, "anoCompetencia", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ComissaoStatus,
        default: ComissaoStatus.PENDENTE,
    }),
    __metadata("design:type", String)
], Comissao.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Comissao.prototype, "dataPagamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Comissao.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.Transaction, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'transactionId' }),
    __metadata("design:type", Object)
], Comissao.prototype, "transaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Comissao.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Comissao.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Comissao.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Comissao.prototype, "updatedAt", void 0);
exports.Comissao = Comissao = __decorate([
    (0, typeorm_1.Entity)('comissoes')
], Comissao);
//# sourceMappingURL=comissao.entity.js.map