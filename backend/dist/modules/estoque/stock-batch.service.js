"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockBatchService = void 0;
const data_source_1 = require("../../database/data-source");
const stock_batch_entity_1 = require("./stock-batch.entity");
const product_entity_1 = require("./product.entity");
const logger_1 = require("../../shared/utils/logger");
const stock_alert_service_1 = require("./stock-alert.service");
const stock_alert_entity_1 = require("./stock-alert.entity");
class StockBatchService {
    repository;
    productRepository;
    alertService;
    constructor() {
        this.repository = data_source_1.CrmDataSource.getRepository(stock_batch_entity_1.StockBatch);
        this.productRepository = data_source_1.CrmDataSource.getRepository(product_entity_1.Product);
        this.alertService = new stock_alert_service_1.StockAlertService();
    }
    /**
     * Cria um novo lote
     */
    async create(data) {
        // Validar produto
        const product = await this.productRepository.findOne({
            where: { id: data.productId, tenantId: data.tenantId },
        });
        if (!product) {
            throw new Error('Produto não encontrado');
        }
        // Validar se já existe lote com este número para este produto
        const existingBatch = await this.repository.findOne({
            where: {
                productId: data.productId,
                batchNumber: data.batchNumber,
                tenantId: data.tenantId,
            },
        });
        if (existingBatch) {
            throw new Error(`Já existe um lote com número ${data.batchNumber} para este produto`);
        }
        // Criar lote
        const batch = this.repository.create({
            ...data,
            currentStock: data.initialStock,
            expirationDate: new Date(data.expirationDate),
            manufactureDate: data.manufactureDate ? new Date(data.manufactureDate) : undefined,
            receiptDate: data.receiptDate ? new Date(data.receiptDate) : new Date(),
        });
        // Atualizar status
        batch.updateStatus();
        // Salvar
        const savedBatch = await this.repository.save(batch);
        // Verificar se precisa criar alerta
        if (batch.status === stock_batch_entity_1.BatchStatus.EXPIRING_SOON || batch.status === stock_batch_entity_1.BatchStatus.EXPIRED) {
            await this.createAlertForBatch(savedBatch);
        }
        logger_1.logger.info(`Lote criado: ${savedBatch.batchNumber} (produto: ${product.name})`);
        return savedBatch;
    }
    /**
     * Busca lotes com filtros
     */
    async findAll(filters) {
        const { tenantId, productId, status, expiringSoon, expired, active, limit = 50, offset = 0 } = filters;
        const queryBuilder = this.repository
            .createQueryBuilder('batch')
            .leftJoinAndSelect('batch.product', 'product')
            .where('batch.tenantId = :tenantId', { tenantId });
        if (productId) {
            queryBuilder.andWhere('batch.productId = :productId', { productId });
        }
        if (status) {
            queryBuilder.andWhere('batch.status = :status', { status });
        }
        if (active) {
            queryBuilder.andWhere('batch.currentStock > 0');
            queryBuilder.andWhere('batch.expirationDate >= :today', { today: new Date() });
        }
        if (expiringSoon) {
            const in30Days = new Date();
            in30Days.setDate(in30Days.getDate() + 30);
            queryBuilder.andWhere('batch.expirationDate BETWEEN :today AND :in30Days', {
                today: new Date(),
                in30Days,
            });
            queryBuilder.andWhere('batch.currentStock > 0');
        }
        if (expired) {
            queryBuilder.andWhere('batch.expirationDate < :today', { today: new Date() });
        }
        queryBuilder.orderBy('batch.expirationDate', 'ASC');
        queryBuilder.skip(offset).take(limit);
        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
    }
    /**
     * Busca um lote por ID
     */
    async findOne(id, tenantId) {
        const batch = await this.repository.findOne({
            where: { id, tenantId },
            relations: ['product', 'movements'],
        });
        if (!batch) {
            throw new Error('Lote não encontrado');
        }
        return batch;
    }
    /**
     * Busca lotes por produto
     */
    async findByProduct(productId, tenantId, onlyActive = true) {
        const query = {
            productId,
            tenantId,
        };
        if (onlyActive) {
            query.status = stock_batch_entity_1.BatchStatus.ACTIVE;
        }
        const batches = await this.repository.find({
            where: query,
            order: { expirationDate: 'ASC' }, // FIFO: First In, First Out
        });
        return batches;
    }
    /**
     * Atualiza estoque de um lote
     */
    async updateStock(id, tenantId, quantity, operation) {
        const batch = await this.findOne(id, tenantId);
        const newStock = operation === 'add'
            ? Number(batch.currentStock) + Number(quantity)
            : Number(batch.currentStock) - Number(quantity);
        if (newStock < 0) {
            throw new Error('Estoque insuficiente no lote');
        }
        batch.currentStock = newStock;
        batch.updateStatus();
        const updatedBatch = await this.repository.save(batch);
        logger_1.logger.info(`Estoque do lote ${batch.batchNumber} atualizado: ${batch.currentStock} → ${newStock}`);
        return updatedBatch;
    }
    /**
     * Atualiza informações de um lote
     */
    async update(id, tenantId, data) {
        const batch = await this.findOne(id, tenantId);
        Object.assign(batch, data);
        return await this.repository.save(batch);
    }
    /**
     * Deleta um lote (soft delete - apenas se estoque zerado)
     */
    async delete(id, tenantId) {
        const batch = await this.findOne(id, tenantId);
        if (batch.currentStock > 0) {
            throw new Error('Não é possível deletar um lote com estoque. Zere o estoque primeiro.');
        }
        await this.repository.delete({ id, tenantId });
        logger_1.logger.info(`Lote deletado: ${batch.batchNumber}`);
    }
    /**
     * Verifica lotes vencendo e cria alertas
     * Executado pelo cron job diariamente
     */
    async checkExpiringBatches(tenantId) {
        logger_1.logger.info('Verificando lotes vencendo...');
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        const queryBuilder = this.repository
            .createQueryBuilder('batch')
            .leftJoinAndSelect('batch.product', 'product')
            .where('batch.expirationDate <= :in30Days', { in30Days })
            .andWhere('batch.expirationDate >= :today', { today: new Date() })
            .andWhere('batch.currentStock > 0')
            .andWhere('batch.alertSent = false');
        if (tenantId) {
            queryBuilder.andWhere('batch.tenantId = :tenantId', { tenantId });
        }
        const expiringBatches = await queryBuilder.getMany();
        logger_1.logger.info(`Encontrados ${expiringBatches.length} lotes vencendo`);
        for (const batch of expiringBatches) {
            try {
                await this.createAlertForBatch(batch);
                batch.alertSent = true;
                batch.alertSentAt = new Date();
                await this.repository.save(batch);
                logger_1.logger.info(`Alerta criado para lote ${batch.batchNumber}`);
            }
            catch (error) {
                logger_1.logger.error(`Erro ao criar alerta para lote ${batch.batchNumber}:`, error.message);
            }
        }
    }
    /**
     * Cria alerta para um lote
     */
    async createAlertForBatch(batch) {
        const daysUntilExpiration = batch.daysUntilExpiration;
        let alertType;
        let message;
        if (daysUntilExpiration < 0) {
            alertType = stock_alert_entity_1.AlertType.EXPIRED;
            message = `Lote ${batch.batchNumber} VENCIDO há ${Math.abs(daysUntilExpiration)} dia(s). Data de validade: ${batch.expirationDate.toLocaleDateString('pt-BR')}. Estoque: ${batch.currentStock} unidades.`;
        }
        else {
            alertType = stock_alert_entity_1.AlertType.EXPIRING_SOON;
            message = `Lote ${batch.batchNumber} vence em ${daysUntilExpiration} dia(s). Data de validade: ${batch.expirationDate.toLocaleDateString('pt-BR')}. Estoque: ${batch.currentStock} unidades.`;
        }
        await this.alertService.createAlert({
            productId: batch.productId,
            type: alertType,
            currentStock: batch.currentStock,
            message,
            tenantId: batch.tenantId,
        });
    }
    /**
     * Atualiza status de todos os lotes
     */
    async updateAllStatuses(tenantId) {
        const queryBuilder = this.repository.createQueryBuilder('batch');
        if (tenantId) {
            queryBuilder.where('batch.tenantId = :tenantId', { tenantId });
        }
        const batches = await queryBuilder.getMany();
        for (const batch of batches) {
            const oldStatus = batch.status;
            batch.updateStatus();
            if (oldStatus !== batch.status) {
                await this.repository.save(batch);
                logger_1.logger.info(`Status do lote ${batch.batchNumber} atualizado: ${oldStatus} → ${batch.status}`);
            }
        }
    }
    /**
     * Busca lote mais antigo com estoque disponível (FIFO)
     */
    async findOldestAvailableBatch(productId, tenantId) {
        const batch = await this.repository.findOne({
            where: {
                productId,
                tenantId,
                status: stock_batch_entity_1.BatchStatus.ACTIVE,
            },
            order: {
                expirationDate: 'ASC',
            },
        });
        return batch;
    }
    /**
     * Relatório de lotes por status
     */
    async getStatusReport(tenantId) {
        const result = await this.repository
            .createQueryBuilder('batch')
            .select('batch.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('batch.tenantId = :tenantId', { tenantId })
            .groupBy('batch.status')
            .getRawMany();
        const report = {
            active: 0,
            expiring_soon: 0,
            expired: 0,
            depleted: 0,
            total: 0,
        };
        result.forEach((row) => {
            const count = parseInt(row.count);
            report[row.status] = count;
            report.total += count;
        });
        return report;
    }
}
exports.StockBatchService = StockBatchService;
//# sourceMappingURL=stock-batch.service.js.map