import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddVariacoesTextoCampanhas1729786800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar campos de variações de texto
    await queryRunner.addColumn(
      'disparador_campanhas',
      new TableColumn({
        name: 'usar_variacoes',
        type: 'boolean',
        default: false,
      })
    );

    await queryRunner.addColumn(
      'disparador_campanhas',
      new TableColumn({
        name: 'variacoes_texto',
        type: 'jsonb',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('disparador_campanhas', 'variacoes_texto');
    await queryRunner.dropColumn('disparador_campanhas', 'usar_variacoes');
  }
}
