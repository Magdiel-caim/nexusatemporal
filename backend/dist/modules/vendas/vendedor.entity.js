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
exports.Vendedor = exports.TipoComissao = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../auth/user.entity");
const venda_entity_1 = require("./venda.entity");
var TipoComissao;
(function (TipoComissao) {
    TipoComissao["PERCENTUAL"] = "percentual";
    TipoComissao["FIXO"] = "fixo";
    TipoComissao["MISTO"] = "misto";
})(TipoComissao || (exports.TipoComissao = TipoComissao = {}));
/**
 * Entidade Vendedor
 *
 * Representa um vendedor no sistema com suas configurações de comissionamento.
 * Um vendedor está vinculado a um usuário do sistema.
 *
 * @example
 * {
 *   id: "uuid",
 *   codigoVendedor: "VND-0001",
 *   userId: "user-uuid",
 *   percentualComissaoPadrao: 10.00, // 10%
 *   tipoComissao: "percentual",
 *   metaMensal: 50000.00,
 *   ativo: true
 * }
 */
let Vendedor = class Vendedor {
    id;
    /**
     * Código único do vendedor (auto-gerado)
     * Formato: VND-0001, VND-0002, etc.
     */
    codigoVendedor;
    /**
     * Relacionamento com User
     * Um vendedor é sempre um usuário do sistema
     */
    userId;
    user;
    /**
     * Percentual de comissão padrão (em decimais)
     * Exemplo: 10.00 = 10%, 5.50 = 5.5%
     */
    percentualComissaoPadrao;
    /**
     * Tipo de comissionamento
     */
    tipoComissao;
    /**
     * Valor fixo de comissão (se tipoComissao = 'fixo' ou 'misto')
     */
    valorFixoComissao;
    /**
     * Meta mensal de vendas (em reais)
     */
    metaMensal;
    /**
     * Status do vendedor
     */
    ativo;
    /**
     * Data de início como vendedor
     */
    dataInicio;
    /**
     * Data de término (se inativo)
     */
    dataFim;
    /**
     * Observações sobre o vendedor
     */
    observacoes;
    /**
     * Tenant ID (multi-tenancy)
     */
    tenantId;
    /**
     * Relacionamento com Vendas
     */
    vendas;
    createdAt;
    updatedAt;
    /**
     * Gera código do vendedor automaticamente antes de inserir
     */
    async gerarCodigoVendedor() {
        if (!this.codigoVendedor) {
            // Será implementado no service para buscar último número
            // Formato: VND-YYYY-NNNN
            const ano = new Date().getFullYear();
            this.codigoVendedor = `VND-${ano}-temp`;
        }
    }
    /**
     * Calcula comissão baseada em um valor
     *
     * @param valorVenda - Valor da venda
     * @returns Valor da comissão calculada
     */
    calcularComissao(valorVenda) {
        switch (this.tipoComissao) {
            case TipoComissao.PERCENTUAL:
                return (valorVenda * this.percentualComissaoPadrao) / 100;
            case TipoComissao.FIXO:
                return this.valorFixoComissao || 0;
            case TipoComissao.MISTO:
                const percentual = (valorVenda * this.percentualComissaoPadrao) / 100;
                const fixo = this.valorFixoComissao || 0;
                return percentual + fixo;
            default:
                return 0;
        }
    }
    /**
     * Retorna JSON sem campos sensíveis
     */
    toJSON() {
        return {
            id: this.id,
            codigoVendedor: this.codigoVendedor,
            userId: this.userId,
            user: this.user,
            percentualComissaoPadrao: this.percentualComissaoPadrao,
            tipoComissao: this.tipoComissao,
            valorFixoComissao: this.valorFixoComissao,
            metaMensal: this.metaMensal,
            ativo: this.ativo,
            dataInicio: this.dataInicio,
            dataFim: this.dataFim,
            tenantId: this.tenantId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
};
exports.Vendedor = Vendedor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Vendedor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, unique: true }),
    __metadata("design:type", String)
], Vendedor.prototype, "codigoVendedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Vendedor.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Vendedor.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], Vendedor.prototype, "percentualComissaoPadrao", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TipoComissao,
        default: TipoComissao.PERCENTUAL,
    }),
    __metadata("design:type", String)
], Vendedor.prototype, "tipoComissao", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Vendedor.prototype, "valorFixoComissao", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Vendedor.prototype, "metaMensal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Vendedor.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Vendedor.prototype, "dataInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Vendedor.prototype, "dataFim", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Vendedor.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Vendedor.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => venda_entity_1.Venda, (venda) => venda.vendedor),
    __metadata("design:type", Array)
], Vendedor.prototype, "vendas", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Vendedor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Vendedor.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Vendedor.prototype, "gerarCodigoVendedor", null);
exports.Vendedor = Vendedor = __decorate([
    (0, typeorm_1.Entity)('vendedores')
], Vendedor);
//# sourceMappingURL=vendedor.entity.js.map