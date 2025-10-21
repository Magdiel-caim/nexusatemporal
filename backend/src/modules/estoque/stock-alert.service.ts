import { Repository, LessThanOrEqual } from 'typeorm';
import { CrmDataSource } from '../../database/data-source';
import { StockAlert, AlertType, AlertStatus } from './stock-alert.entity';
import { Product } from './product.entity';
import { ProductService } from './product.service';

export interface AlertFilters {
  type?: AlertType;
  status?: AlertStatus;
  productId?: string;
  tenantId: string;
  limit?: number;
  offset?: number;
}

export class StockAlertService {
  private alertRepository: Repository<StockAlert>;
  private productRepository: Repository<Product>;
  private productService: ProductService;

  constructor() {
    this.alertRepository = CrmDataSource.getRepository(StockAlert);
    this.productRepository = CrmDataSource.getRepository(Product);
    this.productService = new ProductService();
  }

  // Método para verificar estoque baixo - pode ser chamado manualmente ou via cron
  async checkLowStockDaily() {
    console.log('🔍 Verificando estoques baixos...');

    // Buscar todos os tenants únicos
    const tenants = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.tenantId', 'tenantId')
      .getRawMany();

    for (const tenant of tenants) {
      await this.checkLowStockForTenant(tenant.tenantId);
      await this.checkExpiringProductsForTenant(tenant.tenantId);
    }

    console.log('✅ Verificação de estoque concluída');
  }

  async checkLowStockForTenant(tenantId: string): Promise<void> {
    const lowStockProducts = await this.productService.getLowStockProducts(tenantId);

    for (const product of lowStockProducts) {
      // Verificar se já existe alerta ativo para este produto
      const existingAlert = await this.alertRepository.findOne({
        where: {
          productId: product.id,
          type: product.currentStock === 0 ? AlertType.OUT_OF_STOCK : AlertType.LOW_STOCK,
          status: AlertStatus.ACTIVE,
          tenantId,
        },
      });

      if (!existingAlert) {
        // Criar novo alerta
        const alertType = product.currentStock === 0 ? AlertType.OUT_OF_STOCK : AlertType.LOW_STOCK;

        const suggestedOrder = this.calculateSuggestedOrder(
          product.minimumStock,
          product.maximumStock || product.minimumStock * 3
        );

        await this.createAlert({
          productId: product.id,
          type: alertType,
          currentStock: product.currentStock,
          minimumStock: product.minimumStock,
          suggestedOrderQuantity: suggestedOrder,
          tenantId,
          message: this.generateAlertMessage(product, alertType),
        });
      }
    }
  }

  async checkExpiringProductsForTenant(tenantId: string, daysAhead: number = 30): Promise<void> {
    const expiringProducts = await this.productService.getExpiringProducts(tenantId, daysAhead);

    for (const product of expiringProducts) {
      // Verificar se já existe alerta ativo
      const existingAlert = await this.alertRepository.findOne({
        where: {
          productId: product.id,
          type: AlertType.EXPIRING_SOON,
          status: AlertStatus.ACTIVE,
          tenantId,
        },
      });

      if (!existingAlert && product.expirationDate) {
        const daysUntilExpiration = this.getDaysUntilExpiration(product.expirationDate);
        const alertType = daysUntilExpiration <= 0 ? AlertType.EXPIRED : AlertType.EXPIRING_SOON;

        await this.createAlert({
          productId: product.id,
          type: alertType,
          currentStock: product.currentStock,
          tenantId,
          message: this.generateExpirationMessage(product, daysUntilExpiration),
        });
      }
    }
  }

  async createAlert(data: {
    productId: string;
    type: AlertType;
    currentStock?: number;
    minimumStock?: number;
    suggestedOrderQuantity?: number;
    message?: string;
    tenantId: string;
  }): Promise<StockAlert> {
    const alert = this.alertRepository.create({
      ...data,
      status: AlertStatus.ACTIVE,
    });

    const savedAlert = await this.alertRepository.save(alert);

    // TODO: Enviar notificação para responsáveis
    // await this.notificationService.sendLowStockAlert(savedAlert);

    return savedAlert;
  }

  async findAll(filters: AlertFilters): Promise<{ data: StockAlert[]; total: number }> {
    const query = this.alertRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.product', 'product')
      .where('alert.tenantId = :tenantId', { tenantId: filters.tenantId });

    // Type filter
    if (filters.type) {
      query.andWhere('alert.type = :type', { type: filters.type });
    }

    // Status filter
    if (filters.status) {
      query.andWhere('alert.status = :status', { status: filters.status });
    }

    // Product filter
    if (filters.productId) {
      query.andWhere('alert.productId = :productId', { productId: filters.productId });
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
    query.orderBy('alert.createdAt', 'DESC');

    const data = await query.getMany();

    return { data, total };
  }

  async resolveAlert(
    alertId: string,
    tenantId: string,
    resolvedBy: string,
    resolution: string
  ): Promise<StockAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId, tenantId },
    });

    if (!alert) {
      throw new Error('Alerta não encontrado');
    }

    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy;
    alert.resolution = resolution;

    return await this.alertRepository.save(alert);
  }

  async ignoreAlert(alertId: string, tenantId: string): Promise<StockAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId, tenantId },
    });

    if (!alert) {
      throw new Error('Alerta não encontrado');
    }

    alert.status = AlertStatus.IGNORED;
    return await this.alertRepository.save(alert);
  }

  async getActiveAlertsCount(tenantId: string): Promise<{
    total: number;
    byType: Record<AlertType, number>;
  }> {
    const alerts = await this.alertRepository.find({
      where: { tenantId, status: AlertStatus.ACTIVE },
    });

    const byType: Record<AlertType, number> = {
      [AlertType.LOW_STOCK]: 0,
      [AlertType.OUT_OF_STOCK]: 0,
      [AlertType.EXPIRING_SOON]: 0,
      [AlertType.EXPIRED]: 0,
    };

    alerts.forEach((alert) => {
      byType[alert.type]++;
    });

    return {
      total: alerts.length,
      byType,
    };
  }

  // Helper methods
  private calculateSuggestedOrder(minimumStock: number, maximumStock: number): number {
    // Sugerir quantidade para chegar ao máximo
    const suggested = maximumStock - minimumStock;
    return Math.max(suggested, minimumStock * 2);
  }

  private generateAlertMessage(product: Product, alertType: AlertType): string {
    if (alertType === AlertType.OUT_OF_STOCK) {
      return `Produto "${product.name}" está sem estoque! Sugerimos comprar ${this.calculateSuggestedOrder(product.minimumStock, product.maximumStock || product.minimumStock * 3)} ${product.unit}.`;
    } else {
      return `Produto "${product.name}" está com estoque baixo (${product.currentStock} ${product.unit}). Mínimo: ${product.minimumStock} ${product.unit}.`;
    }
  }

  private generateExpirationMessage(product: Product, daysUntilExpiration: number): string {
    if (daysUntilExpiration <= 0) {
      return `Produto "${product.name}" está vencido! Data de validade: ${product.expirationDate?.toLocaleDateString()}`;
    } else {
      return `Produto "${product.name}" vencerá em ${daysUntilExpiration} dias. Data de validade: ${product.expirationDate?.toLocaleDateString()}`;
    }
  }

  private getDaysUntilExpiration(expirationDate: Date): number {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
