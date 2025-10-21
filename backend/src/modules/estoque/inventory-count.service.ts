import { Repository } from 'typeorm';
import { CrmDataSource } from '../../database/data-source';
import {
  InventoryCount,
  InventoryCountItem,
  InventoryCountStatus,
  DiscrepancyType,
} from './inventory-count.entity';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { StockMovementService, CreateMovementDto } from './stock-movement.service';
import { MovementType, MovementReason } from './stock-movement.entity';

export interface CreateInventoryCountDto {
  description?: string;
  location?: string;
  countDate?: Date;
  userId: string;
  tenantId: string;
}

export interface CreateInventoryCountItemDto {
  inventoryCountId: string;
  productId: string;
  countedStock: number;
  notes?: string;
  tenantId: string;
}

export interface InventoryCountFilters {
  status?: InventoryCountStatus;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  tenantId: string;
  limit?: number;
  offset?: number;
}

export class InventoryCountService {
  private inventoryCountRepository: Repository<InventoryCount>;
  private inventoryCountItemRepository: Repository<InventoryCountItem>;
  private productRepository: Repository<Product>;
  private productService: ProductService;
  private stockMovementService: StockMovementService;

  constructor() {
    this.inventoryCountRepository = CrmDataSource.getRepository(InventoryCount);
    this.inventoryCountItemRepository = CrmDataSource.getRepository(InventoryCountItem);
    this.productRepository = CrmDataSource.getRepository(Product);
    this.productService = new ProductService();
    this.stockMovementService = new StockMovementService();
  }

  async createInventoryCount(data: CreateInventoryCountDto): Promise<InventoryCount> {
    const inventoryCount = this.inventoryCountRepository.create({
      ...data,
      status: InventoryCountStatus.IN_PROGRESS,
    });

    return await this.inventoryCountRepository.save(inventoryCount);
  }

  async addCountItem(data: CreateInventoryCountItemDto): Promise<InventoryCountItem> {
    // Buscar produto para obter estoque atual
    const product = await this.productService.findOne(data.productId, data.tenantId);

    // Verificar se item já existe nesta contagem
    const existing = await this.inventoryCountItemRepository.findOne({
      where: {
        inventoryCountId: data.inventoryCountId,
        productId: data.productId,
        tenantId: data.tenantId,
      },
    });

    if (existing) {
      throw new Error('Produto já foi contado nesta contagem');
    }

    const systemStock = product.currentStock;
    const countedStock = data.countedStock;
    const difference = countedStock - systemStock;

    let discrepancyType: DiscrepancyType;
    if (difference > 0) {
      discrepancyType = DiscrepancyType.SURPLUS;
    } else if (difference < 0) {
      discrepancyType = DiscrepancyType.SHORTAGE;
    } else {
      discrepancyType = DiscrepancyType.MATCH;
    }

    const item = this.inventoryCountItemRepository.create({
      ...data,
      systemStock,
      countedStock,
      difference,
      discrepancyType,
      adjusted: false,
    });

    return await this.inventoryCountItemRepository.save(item);
  }

  async updateCountItem(
    id: string,
    tenantId: string,
    countedStock: number,
    notes?: string
  ): Promise<InventoryCountItem> {
    const item = await this.inventoryCountItemRepository.findOne({
      where: { id, tenantId },
      relations: ['product'],
    });

    if (!item) {
      throw new Error('Item de contagem não encontrado');
    }

    if (item.adjusted) {
      throw new Error('Item já foi ajustado e não pode ser modificado');
    }

    const difference = countedStock - item.systemStock;

    let discrepancyType: DiscrepancyType;
    if (difference > 0) {
      discrepancyType = DiscrepancyType.SURPLUS;
    } else if (difference < 0) {
      discrepancyType = DiscrepancyType.SHORTAGE;
    } else {
      discrepancyType = DiscrepancyType.MATCH;
    }

    item.countedStock = countedStock;
    item.difference = difference;
    item.discrepancyType = discrepancyType;
    if (notes !== undefined) {
      item.notes = notes;
    }

    return await this.inventoryCountItemRepository.save(item);
  }

  async deleteCountItem(id: string, tenantId: string): Promise<void> {
    const item = await this.inventoryCountItemRepository.findOne({
      where: { id, tenantId },
    });

    if (!item) {
      throw new Error('Item de contagem não encontrado');
    }

    if (item.adjusted) {
      throw new Error('Item já foi ajustado e não pode ser excluído');
    }

    await this.inventoryCountItemRepository.remove(item);
  }

  async adjustInventoryItem(
    id: string,
    tenantId: string,
    userId: string
  ): Promise<{ item: InventoryCountItem; message: string }> {
    const item = await this.inventoryCountItemRepository.findOne({
      where: { id, tenantId },
      relations: ['product', 'inventoryCount'],
    });

    if (!item) {
      throw new Error('Item de contagem não encontrado');
    }

    if (item.adjusted) {
      throw new Error('Item já foi ajustado');
    }

    if (item.discrepancyType === DiscrepancyType.MATCH) {
      item.adjusted = true;
      item.adjustedAt = new Date();
      await this.inventoryCountItemRepository.save(item);
      return {
        item,
        message: 'Nenhum ajuste necessário - estoque correto',
      };
    }

    // Criar movimento de ajuste
    const movementData: CreateMovementDto = {
      productId: item.productId,
      type: MovementType.AJUSTE,
      reason: MovementReason.AJUSTE_INVENTARIO,
      quantity: item.countedStock, // O ajuste define o novo valor absoluto
      notes: `Ajuste de inventário: ${item.notes || 'Contagem física'}`,
      userId,
      tenantId,
    };

    await this.stockMovementService.createMovement(movementData);

    // Marcar item como ajustado
    item.adjusted = true;
    item.adjustedAt = new Date();
    await this.inventoryCountItemRepository.save(item);

    const typeText =
      item.discrepancyType === DiscrepancyType.SURPLUS
        ? 'sobra'
        : 'falta';

    return {
      item,
      message: `Ajuste realizado: ${typeText} de ${Math.abs(item.difference)} ${item.product.unit}`,
    };
  }

  async batchAdjustInventory(
    inventoryCountId: string,
    tenantId: string,
    userId: string
  ): Promise<{
    adjusted: number;
    skipped: number;
    errors: string[];
  }> {
    const items = await this.inventoryCountItemRepository.find({
      where: {
        inventoryCountId,
        tenantId,
        adjusted: false,
      },
      relations: ['product'],
    });

    let adjusted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        await this.adjustInventoryItem(item.id, tenantId, userId);
        adjusted++;
      } catch (error: any) {
        errors.push(`${item.product?.name}: ${error.message}`);
        skipped++;
      }
    }

    return { adjusted, skipped, errors };
  }

  async completeInventoryCount(
    id: string,
    tenantId: string
  ): Promise<InventoryCount> {
    const inventoryCount = await this.inventoryCountRepository.findOne({
      where: { id, tenantId },
      relations: ['items'],
    });

    if (!inventoryCount) {
      throw new Error('Contagem de inventário não encontrada');
    }

    if (inventoryCount.status === InventoryCountStatus.COMPLETED) {
      throw new Error('Contagem já foi concluída');
    }

    // Verificar se todos os itens foram ajustados
    const unadjustedCount = inventoryCount.items.filter((item) => !item.adjusted).length;

    if (unadjustedCount > 0) {
      throw new Error(
        `Ainda existem ${unadjustedCount} itens não ajustados. Ajuste todos antes de finalizar.`
      );
    }

    inventoryCount.status = InventoryCountStatus.COMPLETED;
    inventoryCount.completedAt = new Date();

    return await this.inventoryCountRepository.save(inventoryCount);
  }

  async cancelInventoryCount(
    id: string,
    tenantId: string
  ): Promise<InventoryCount> {
    const inventoryCount = await this.inventoryCountRepository.findOne({
      where: { id, tenantId },
      relations: ['items'],
    });

    if (!inventoryCount) {
      throw new Error('Contagem de inventário não encontrada');
    }

    if (inventoryCount.status === InventoryCountStatus.COMPLETED) {
      throw new Error('Não é possível cancelar uma contagem concluída');
    }

    // Verificar se há itens ajustados
    const adjustedCount = inventoryCount.items.filter((item) => item.adjusted).length;

    if (adjustedCount > 0) {
      throw new Error(
        `Não é possível cancelar: ${adjustedCount} itens já foram ajustados no estoque`
      );
    }

    inventoryCount.status = InventoryCountStatus.CANCELLED;

    return await this.inventoryCountRepository.save(inventoryCount);
  }

  async findAll(
    filters: InventoryCountFilters
  ): Promise<{ data: InventoryCount[]; total: number }> {
    const query = this.inventoryCountRepository
      .createQueryBuilder('count')
      .leftJoinAndSelect('count.user', 'user')
      .leftJoinAndSelect('count.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('count.tenantId = :tenantId', { tenantId: filters.tenantId });

    if (filters.status) {
      query.andWhere('count.status = :status', { status: filters.status });
    }

    if (filters.location) {
      query.andWhere('count.location ILIKE :location', {
        location: `%${filters.location}%`,
      });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('count.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const total = await query.getCount();

    if (filters.limit) {
      query.limit(filters.limit);
    }
    if (filters.offset) {
      query.offset(filters.offset);
    }

    query.orderBy('count.createdAt', 'DESC');

    const data = await query.getMany();

    return { data, total };
  }

  async findOne(id: string, tenantId: string): Promise<InventoryCount> {
    const inventoryCount = await this.inventoryCountRepository.findOne({
      where: { id, tenantId },
      relations: ['user', 'items', 'items.product'],
    });

    if (!inventoryCount) {
      throw new Error('Contagem de inventário não encontrada');
    }

    return inventoryCount;
  }

  async getDiscrepancyReport(
    id: string,
    tenantId: string
  ): Promise<{
    total: number;
    matches: number;
    surpluses: number;
    shortages: number;
    totalDifference: number;
    items: InventoryCountItem[];
  }> {
    const inventoryCount = await this.findOne(id, tenantId);

    const total = inventoryCount.items.length;
    const matches = inventoryCount.items.filter(
      (item) => item.discrepancyType === DiscrepancyType.MATCH
    ).length;
    const surpluses = inventoryCount.items.filter(
      (item) => item.discrepancyType === DiscrepancyType.SURPLUS
    ).length;
    const shortages = inventoryCount.items.filter(
      (item) => item.discrepancyType === DiscrepancyType.SHORTAGE
    ).length;

    const totalDifference = inventoryCount.items.reduce(
      (sum, item) => sum + parseFloat(item.difference.toString()),
      0
    );

    return {
      total,
      matches,
      surpluses,
      shortages,
      totalDifference,
      items: inventoryCount.items,
    };
  }
}
