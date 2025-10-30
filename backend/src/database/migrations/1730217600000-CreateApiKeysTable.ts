import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateApiKeysTable1730217600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'api_keys',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'revoked'],
            default: "'active'",
          },
          {
            name: 'scopes',
            type: 'text',
            default: "'read'",
          },
          {
            name: 'allowed_ips',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'allowed_origins',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'rate_limit',
            type: 'int',
            default: 1000,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_used_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'usage_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'tenant_id',
            type: 'varchar',
          },
          {
            name: 'created_by_id',
            type: 'varchar',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Index para busca por key (mais usado)
    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'IDX_API_KEYS_KEY',
        columnNames: ['key'],
      })
    );

    // Index para busca por tenant
    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'IDX_API_KEYS_TENANT',
        columnNames: ['tenant_id'],
      })
    );

    // Index para busca por status e tenant
    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'IDX_API_KEYS_STATUS_TENANT',
        columnNames: ['status', 'tenant_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('api_keys', 'IDX_API_KEYS_STATUS_TENANT');
    await queryRunner.dropIndex('api_keys', 'IDX_API_KEYS_TENANT');
    await queryRunner.dropIndex('api_keys', 'IDX_API_KEYS_KEY');
    await queryRunner.dropTable('api_keys');
  }
}
