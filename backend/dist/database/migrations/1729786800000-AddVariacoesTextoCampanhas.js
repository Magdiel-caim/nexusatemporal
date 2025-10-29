"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddVariacoesTextoCampanhas1729786800000 = void 0;
const typeorm_1 = require("typeorm");
class AddVariacoesTextoCampanhas1729786800000 {
    async up(queryRunner) {
        // Adicionar campos de variações de texto
        await queryRunner.addColumn('disparador_campanhas', new typeorm_1.TableColumn({
            name: 'usar_variacoes',
            type: 'boolean',
            default: false,
        }));
        await queryRunner.addColumn('disparador_campanhas', new typeorm_1.TableColumn({
            name: 'variacoes_texto',
            type: 'jsonb',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('disparador_campanhas', 'variacoes_texto');
        await queryRunner.dropColumn('disparador_campanhas', 'usar_variacoes');
    }
}
exports.AddVariacoesTextoCampanhas1729786800000 = AddVariacoesTextoCampanhas1729786800000;
//# sourceMappingURL=1729786800000-AddVariacoesTextoCampanhas.js.map