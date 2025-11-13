import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateGoogleCalendarIntegrations1730400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'google_calendar_integrations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'tenantId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'accessToken',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'refreshToken',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'tokenExpiry',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'calendarId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'error'],
            default: "'active'",
          },
          {
            name: 'syncEnabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'settings',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'lastSyncAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lastError',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_GOOGLE_CALENDAR_USER_TENANT',
            columnNames: ['userId', 'tenantId'],
            isUnique: true,
          },
          {
            name: 'IDX_GOOGLE_CALENDAR_TENANT',
            columnNames: ['tenantId'],
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('google_calendar_integrations');
  }
}
