import { Repository, Between } from 'typeorm';
import { CrmDataSource } from '../../database/data-source';
import { StockMovement, MovementType, MovementReason } from './stock-movement.entity';
import { Product } from './product.entity';
import { ProductService } from './product.service';

export interface CreateMovementDto {
  productId: string;
  type: MovementType;
  reason: MovementReason;
  quantity: number;
  unitPrice?: number;
  purchaseOrderId?: string;
  medicalRecordId?: string;
  procedureId?: string;
  invoiceNumber?: string;
  batchNumber?: string;
  expirationDate?: Date;
  notes?: string;
  userId?: string;
  tenantId: string;
}

export interface MovementFilters {
  productId?: string;
  type?: MovementType;
  reason?: MovementReason;
  startDate?: Date;
  endDate?: Date;
  tenantId: string;
  limit?: number;
  offset?: number;
}

export class StockMovementService {
  private movementRepository: Repository<StockMovement>;
  private productRepository: Repository<Product>;
  private productService: ProductService;

  constructor() {
    this.movementRepository = CrmDataSource.getRepository(StockMovement);
    this.productRepository = CrmDataSource.getRepository(Product);
    this.productService = new ProductService();
  }

  async createMovement(data: CreateMovementDto): Promise<StockMovement> {
    // Buscar produto
    const product = await this.productService.findOne(data.productId, data.tenantId);

    if (!product.trackStock) {
      throw new Error('Este produto não possui controle de estoque');
    }

    // Validar quantidade
    if (data.quantity <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    // Validar saída (não pode ficar negativo)
    if (data.type === MovementType.SAIDA && product.currentStock < data.quantity) {
      throw new Error(
        `Estoque insuficiente. Disponível: ${product.currentStock} ${product.unit}`
      );
    }

    const previousStock = product.currentStock;
    let newStock: number;

    // Calcular novo estoque
    switch (data.type) {
      case MovementType.ENTRADA:
      case MovementType.DEVOLUCAO:
        newStock = previousStock + data.quantity;
        break;
      case MovementType.SAIDA:
      case MovementType.PERDA:
        newStock = previousStock - data.quantity;
        break;
      case MovementType.AJUSTE:
        newStock = data.quantity; // No ajuste, a quantidade é o novo valor absoluto
        break;
      default:
        throw new Error('Tipo de movimentação inválido');
    }

    // Criar movimentação
    const movement = this.movementRepository.create({
      ...data,
      previousStock,
      newStock,
      totalPrice: data.unitPrice ? data.unitPrice * data.quantity : undefined,
    });

    // Salvar movimentação
    const savedMovement = await this.movementRepository.save(movement);

    // Atualizar estoque do produto
    await this.productService.updateStock(product.id, data.tenantId, newStock);

    return savedMovement;
  }

  async createEntryFromPurchaseOrder(
    productId: string,
    purchaseOrderId: string,
    quantity: number,
    unitPrice: number,
    invoiceNumber: string,
    batchNumber: string | null,
    expirationDate: Date | null,
    userId: string,
    tenantId: string
  ): Promise<StockMovement> {
    return await this.createMovement({
      productId,
      type: MovementType.ENTRADA,
      reason: MovementReason.COMPRA,
      quantity,
      unitPrice,
      purchaseOrderId,
      invoiceNumber,
      batchNumber: batchNumber || undefined,
      expirationDate: expirationDate || undefined,
      userId,
      tenantId,
      notes: `Entrada via ordem de compra #${purchaseOrderId}`,
    });
  }

  async createExitFromProcedure(
    productId: string,
    quantity: number,
    medicalRecordId: string,
    procedureId: string,
    userId: string,
    tenantId: string
  ): Promise<StockMovement> {
    return await this.createMovement({
      productId,
      type: MovementType.SAIDA,
      reason: MovementReason.PROCEDIMENTO,
      quantity,
      medicalRecordId,
      procedureId,
      userId,
      tenantId,
      notes: `Saída automática por procedimento`,
    });
  }

  async findAll(filters: MovementFilters): Promise<{ data: StockMovement[]; total: number }> {
    const query = this.movementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.user', 'user')
      .leftJoinAndSelect('movement.purchaseOrder', 'purchaseOrder')
      .where('movement.tenantId = :tenantId', { tenantId: filters.tenantId });

    // Product filter
    if (filters.productId) {
      query.andWhere('movement.productId = :productId', { productId: filters.productId });
    }

    // Type filter
    if (filters.type) {
      query.andWhere('movement.type = :type', { type: filters.type });
    }

    // Reason filter
    if (filters.reason) {
      query.andWhere('movement.reason = :reason', { reason: filters.reason });
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      query.andWhere('movement.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    // Count total
    const total = await query.getCount();

    // Pagination
    if (filters.limit) {
      query.limit(filters.limit);
    }
    if (filters.offset) {
      query.offset(filters.offset);
    }

    // Order by date (most recent first)
    query.orderBy('movement.createdAt', 'DESC');

    const data = await query.getMany();

    return { data, total };
  }

  async findOne(id: string, tenantId: string): Promise<StockMovement> {
    const movement = await this.movementRepository.findOne({
      where: { id, tenantId },
      relations: ['product', 'user', 'purchaseOrder'],
    });

    if (!movement) {
      throw new Error('Movimentação não encontrada');
    }

    return movement;
  }

  async getMovementsByProduct(
    productId: string,
    tenantId: string,
    limit: number = 50
  ): Promise<StockMovement[]> {
    return await this.movementRepository.find({
      where: { productId, tenantId },
      relations: ['user', 'purchaseOrder'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getMovementsByMedicalRecord(
    medicalRecordId: string,
    tenantId: string
  ): Promise<StockMovement[]> {
    return await this.movementRepository.find({
      where: { medicalRecordId, tenantId },
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMovementsSummary(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalEntries: number;
    totalExits: number;
    totalValueEntries: number;
    totalValueExits: number;
    movementsByType: Record<string, number>;
  }> {
    const movements = await this.movementRepository.find({
      where: {
        tenantId,
        createdAt: Between(startDate, endDate),
      },
    });

    let totalEntries = 0;
    let totalExits = 0;
    let totalValueEntries = 0;
    let totalValueExits = 0;
    const movementsByType: Record<string, number> = {};

    movements.forEach((movement) => {
      // Contabilizar por tipo
      if (!movementsByType[movement.type]) {
        movementsByType[movement.type] = 0;
      }
      movementsByType[movement.type]++;

      // Contabilizar entradas/saídas
      if (movement.type === MovementType.ENTRADA || movement.type === MovementType.DEVOLUCAO) {
        totalEntries += parseFloat(movement.quantity.toString());
        if (movement.totalPrice) {
          totalValueEntries += parseFloat(movement.totalPrice.toString());
        }
      } else if (movement.type === MovementType.SAIDA || movement.type === MovementType.PERDA) {
        totalExits += parseFloat(movement.quantity.toString());
        if (movement.totalPrice) {
          totalValueExits += parseFloat(movement.totalPrice.toString());
        }
      }
    });

    return {
      totalEntries,
      totalExits,
      totalValueEntries,
      totalValueExits,
      movementsByType,
    };
  }

  async getMostUsedProducts(
    tenantId: string,
    limit: number = 10
  ): Promise<Array<{ product: Product; totalQuantity: number; movementCount: number }>> {
    const result = await this.movementRepository
      .createQueryBuilder('movement')
      .select('movement.productId', 'productId')
      .addSelect('SUM(movement.quantity)', 'totalQuantity')
      .addSelect('COUNT(movement.id)', 'movementCount')
      .where('movement.tenantId = :tenantId', { tenantId })
      .andWhere('movement.type = :type', { type: MovementType.SAIDA })
      .groupBy('movement.productId')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit)
      .getRawMany();

    const productsData = await Promise.all(
      result.map(async (item) => {
        const product = await this.productService.findOne(item.productId, tenantId);
        return {
          product,
          totalQuantity: parseFloat(item.totalQuantity),
          movementCount: parseInt(item.movementCount),
        };
      })
    );

    return productsData;
  }
}
