import { Repository, LessThanOrEqual, MoreThan, Between } from 'typeorm';
import { CrmDataSource } from '@/database/data-source';
import { StockBatch, BatchStatus } from './stock-batch.entity';
import { Product } from './product.entity';
import { logger } from '@/shared/utils/logger';
import { StockAlertService } from './stock-alert.service';
import { AlertType } from './stock-alert.entity';

interface CreateBatchDTO {
  productId: string;
  batchNumber: string;
  manufacturerBatchNumber?: string;
  manufactureDate?: Date | string;
  expirationDate: Date | string;
  receiptDate?: Date | string;
  initialStock: number;
  unitCost?: number;
  totalCost?: number;
  supplierId?: string;
  invoiceNumber?: string;
  location?: string;
  notes?: string;
  tenantId: string;
}

interface UpdateBatchDTO {
  batchNumber?: string;
  location?: string;
  notes?: string;
}

interface BatchFilters {
  tenantId: string;
  productId?: string;
  status?: BatchStatus;
  expiringSoon?: boolean; // < 30 dias
  expired?: boolean;
  active?: boolean;
  limit?: number;
  offset?: number;
}

export class StockBatchService {
  private repository: Repository<StockBatch>;
  private productRepository: Repository<Product>;
  private alertService: StockAlertService;

  constructor() {
    this.repository = CrmDataSource.getRepository(StockBatch);
    this.productRepository = CrmDataSource.getRepository(Product);
    this.alertService = new StockAlertService();
  }

  /**
   * Cria um novo lote
   */
  async create(data: CreateBatchDTO): Promise<StockBatch> {
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
    if (batch.status === BatchStatus.EXPIRING_SOON || batch.status === BatchStatus.EXPIRED) {
      await this.createAlertForBatch(savedBatch);
    }

    logger.info(`Lote criado: ${savedBatch.batchNumber} (produto: ${product.name})`);

    return savedBatch;
  }

  /**
   * Busca lotes com filtros
   */
  async findAll(filters: BatchFilters): Promise<{ data: StockBatch[]; total: number }> {
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
  async findOne(id: string, tenantId: string): Promise<StockBatch> {
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
  async findByProduct(productId: string, tenantId: string, onlyActive = true): Promise<StockBatch[]> {
    const query: any = {
      productId,
      tenantId,
    };

    if (onlyActive) {
      query.status = BatchStatus.ACTIVE;
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
  async updateStock(id: string, tenantId: string, quantity: number, operation: 'add' | 'subtract'): Promise<StockBatch> {
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

    logger.info(`Estoque do lote ${batch.batchNumber} atualizado: ${batch.currentStock} → ${newStock}`);

    return updatedBatch;
  }

  /**
   * Atualiza informações de um lote
   */
  async update(id: string, tenantId: string, data: UpdateBatchDTO): Promise<StockBatch> {
    const batch = await this.findOne(id, tenantId);

    Object.assign(batch, data);

    return await this.repository.save(batch);
  }

  /**
   * Deleta um lote (soft delete - apenas se estoque zerado)
   */
  async delete(id: string, tenantId: string): Promise<void> {
    const batch = await this.findOne(id, tenantId);

    if (batch.currentStock > 0) {
      throw new Error('Não é possível deletar um lote com estoque. Zere o estoque primeiro.');
    }

    await this.repository.delete({ id, tenantId });

    logger.info(`Lote deletado: ${batch.batchNumber}`);
  }

  /**
   * Verifica lotes vencendo e cria alertas
   * Executado pelo cron job diariamente
   */
  async checkExpiringBatches(tenantId?: string): Promise<void> {
    logger.info('Verificando lotes vencendo...');

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

    logger.info(`Encontrados ${expiringBatches.length} lotes vencendo`);

    for (const batch of expiringBatches) {
      try {
        await this.createAlertForBatch(batch);

        batch.alertSent = true;
        batch.alertSentAt = new Date();
        await this.repository.save(batch);

        logger.info(`Alerta criado para lote ${batch.batchNumber}`);
      } catch (error: any) {
        logger.error(`Erro ao criar alerta para lote ${batch.batchNumber}:`, error.message);
      }
    }
  }

  /**
   * Cria alerta para um lote
   */
  private async createAlertForBatch(batch: StockBatch): Promise<void> {
    const daysUntilExpiration = batch.daysUntilExpiration;

    let alertType: AlertType;
    let message: string;

    if (daysUntilExpiration < 0) {
      alertType = AlertType.EXPIRED;
      message = `Lote ${batch.batchNumber} VENCIDO há ${Math.abs(daysUntilExpiration)} dia(s). Data de validade: ${batch.expirationDate.toLocaleDateString('pt-BR')}. Estoque: ${batch.currentStock} unidades.`;
    } else {
      alertType = AlertType.EXPIRING_SOON;
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
  async updateAllStatuses(tenantId?: string): Promise<void> {
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
        logger.info(`Status do lote ${batch.batchNumber} atualizado: ${oldStatus} → ${batch.status}`);
      }
    }
  }

  /**
   * Busca lote mais antigo com estoque disponível (FIFO)
   */
  async findOldestAvailableBatch(productId: string, tenantId: string): Promise<StockBatch | null> {
    const batch = await this.repository.findOne({
      where: {
        productId,
        tenantId,
        status: BatchStatus.ACTIVE,
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
  async getStatusReport(tenantId: string): Promise<{
    active: number;
    expiring_soon: number;
    expired: number;
    depleted: number;
    total: number;
  }> {
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

    result.forEach((row: any) => {
      const count = parseInt(row.count);
      report[row.status as keyof typeof report] = count;
      report.total += count;
    });

    return report;
  }
}
