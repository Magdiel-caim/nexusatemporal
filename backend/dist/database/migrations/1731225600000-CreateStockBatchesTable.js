"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStockBatchesTable1731225600000 = void 0;
const typeorm_1 = require("typeorm");
class CreateStockBatchesTable1731225600000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'stock_batches',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'productId',
                    type: 'varchar',
                    isNullable: false,
                },
                {
                    name: 'batchNumber',
                    type: 'varchar',
                    length: '100',
                    isNullable: false,
                },
                {
                    name: 'manufacturerBatchNumber',
                    type: 'varchar',
                    length: '100',
                    isNullable: true,
                },
                {
                    name: 'manufactureDate',
                    type: 'date',
                    isNullable: true,
                },
                {
                    name: 'expirationDate',
                    type: 'date',
                    isNullable: false,
                },
                {
                    name: 'receiptDate',
                    type: 'date',
                    isNullable: true,
                },
                {
                    name: 'currentStock',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                    default: 0,
                },
                {
                    name: 'initialStock',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                    isNullable: false,
                },
                {
                    name: 'unitCost',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                    isNullable: true,
                },
                {
                    name: 'totalCost',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                    isNullable: true,
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['active', 'expired', 'expiring_soon', 'depleted'],
                    default: "'active'",
                },
                {
                    name: 'supplierId',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'invoiceNumber',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'location',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'notes',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'alertSent',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'alertSentAt',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'originMovementId',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'tenantId',
                    type: 'varchar',
                    isNullable: false,
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
                    name: 'IDX_STOCK_BATCH_PRODUCT',
                    columnNames: ['productId'],
                },
                {
                    name: 'IDX_STOCK_BATCH_TENANT',
                    columnNames: ['tenantId'],
                },
                {
                    name: 'IDX_STOCK_BATCH_STATUS',
                    columnNames: ['status'],
                },
                {
                    name: 'IDX_STOCK_BATCH_EXPIRATION',
                    columnNames: ['expirationDate'],
                },
                {
                    name: 'IDX_STOCK_BATCH_NUMBER',
                    columnNames: ['productId', 'batchNumber', 'tenantId'],
                    isUnique: true,
                },
            ],
        }), true);
        // Foreign key para products
        await queryRunner.createForeignKey('stock_batches', new typeorm_1.TableForeignKey({
            columnNames: ['productId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'products',
            onDelete: 'CASCADE',
        }));
        // Adicionar coluna batchId na tabela stock_movements (se não existir)
        const stockMovementsTable = await queryRunner.getTable('stock_movements');
        const batchIdColumn = stockMovementsTable?.findColumnByName('batchId');
        if (!batchIdColumn) {
            await queryRunner.query(`
        ALTER TABLE stock_movements
        ADD COLUMN "batchId" varchar NULL
      `);
            // Foreign key de stock_movements para stock_batches
            await queryRunner.createForeignKey('stock_movements', new typeorm_1.TableForeignKey({
                columnNames: ['batchId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'stock_batches',
                onDelete: 'SET NULL',
            }));
            // Índice para batchId
            await queryRunner.query(`
        CREATE INDEX "IDX_STOCK_MOVEMENT_BATCH" ON stock_movements ("batchId")
      `);
        }
    }
    async down(queryRunner) {
        // Remover foreign key e coluna batchId de stock_movements
        const stockMovementsTable = await queryRunner.getTable('stock_movements');
        const batchIdForeignKey = stockMovementsTable?.foreignKeys.find(fk => fk.columnNames.indexOf('batchId') !== -1);
        if (batchIdForeignKey) {
            await queryRunner.dropForeignKey('stock_movements', batchIdForeignKey);
        }
        const batchIdColumn = stockMovementsTable?.findColumnByName('batchId');
        if (batchIdColumn) {
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_STOCK_MOVEMENT_BATCH"`);
            await queryRunner.dropColumn('stock_movements', 'batchId');
        }
        // Remover tabela stock_batches
        await queryRunner.dropTable('stock_batches');
    }
}
exports.CreateStockBatchesTable1731225600000 = CreateStockBatchesTable1731225600000;
//# sourceMappingURL=1731225600000-CreateStockBatchesTable.js.map