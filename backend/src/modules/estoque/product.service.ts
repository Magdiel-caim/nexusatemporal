import { Repository, Like, LessThanOrEqual } from 'typeorm';
import { CrmDataSource } from '../../database/data-source';
import { Product, ProductCategory, ProductUnit } from './product.entity';

export interface CreateProductDto {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  category?: ProductCategory;
  unit?: ProductUnit;
  minimumStock?: number;
  maximumStock?: number;
  purchasePrice?: number;
  salePrice?: number;
  mainSupplierId?: string;
  location?: string;
  expirationDate?: Date;
  batchNumber?: string;
  trackStock?: boolean;
  requiresPrescription?: boolean;
  tenantId: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  isActive?: boolean;
  lowStock?: boolean;
  tenantId: string;
  limit?: number;
  offset?: number;
}

export class ProductService {
  private productRepository: Repository<Product>;

  constructor() {
    this.productRepository = CrmDataSource.getRepository(Product);
  }

  async create(data: CreateProductDto): Promise<Product> {
    // Verificar se SKU já existe (se fornecido)
    if (data.sku) {
      const existing = await this.productRepository.findOne({
        where: { sku: data.sku, tenantId: data.tenantId },
      });
      if (existing) {
        throw new Error('SKU já existe para este tenant');
      }
    }

    // Verificar se código de barras já existe (se fornecido)
    if (data.barcode) {
      const existing = await this.productRepository.findOne({
        where: { barcode: data.barcode, tenantId: data.tenantId },
      });
      if (existing) {
        throw new Error('Código de barras já existe para este tenant');
      }
    }

    const product = this.productRepository.create({
      ...data,
      currentStock: 0, // Estoque inicial zerado
    });

    return await this.productRepository.save(product);
  }

  async findAll(filters: ProductFilters): Promise<{ data: Product[]; total: number }> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.mainSupplier', 'supplier')
      .where('product.tenantId = :tenantId', { tenantId: filters.tenantId });

    // Search filter
    if (filters.search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Category filter
    if (filters.category) {
      query.andWhere('product.category = :category', { category: filters.category });
    }

    // Active filter
    if (filters.isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', { isActive: filters.isActive });
    }

    // Low stock filter
    if (filters.lowStock) {
      query.andWhere('product.currentStock <= product.minimumStock');
      query.andWhere('product.trackStock = true');
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

    // Order
    query.orderBy('product.name', 'ASC');

    const data = await query.getMany();

    return { data, total };
  }

  async findOne(id: string, tenantId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, tenantId },
      relations: ['mainSupplier'],
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return product;
  }

  async findBySku(sku: string, tenantId: string): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { sku, tenantId },
      relations: ['mainSupplier'],
    });
  }

  async findByBarcode(barcode: string, tenantId: string): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { barcode, tenantId },
      relations: ['mainSupplier'],
    });
  }

  async update(id: string, tenantId: string, data: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id, tenantId);

    // Verificar SKU único (se mudou)
    if (data.sku && data.sku !== product.sku) {
      const existing = await this.productRepository.findOne({
        where: { sku: data.sku, tenantId },
      });
      if (existing && existing.id !== id) {
        throw new Error('SKU já existe para outro produto');
      }
    }

    // Verificar barcode único (se mudou)
    if (data.barcode && data.barcode !== product.barcode) {
      const existing = await this.productRepository.findOne({
        where: { barcode: data.barcode, tenantId },
      });
      if (existing && existing.id !== id) {
        throw new Error('Código de barras já existe para outro produto');
      }
    }

    Object.assign(product, data);
    return await this.productRepository.save(product);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const product = await this.findOne(id, tenantId);

    // Soft delete - apenas desativar
    product.isActive = false;
    await this.productRepository.save(product);
  }

  async updateStock(
    productId: string,
    tenantId: string,
    newStock: number
  ): Promise<Product> {
    const product = await this.findOne(productId, tenantId);
    product.currentStock = newStock;

    // Verificar se está abaixo do mínimo e atualizar flag
    if (newStock <= product.minimumStock && product.trackStock) {
      product.hasLowStockAlert = true;
      product.lastAlertDate = new Date();
    } else {
      product.hasLowStockAlert = false;
    }

    return await this.productRepository.save(product);
  }

  async getLowStockProducts(tenantId: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.mainSupplier', 'supplier')
      .where('product.tenantId = :tenantId', { tenantId })
      .andWhere('product.currentStock <= product.minimumStock')
      .andWhere('product.trackStock = true')
      .andWhere('product.isActive = true')
      .orderBy('product.currentStock', 'ASC')
      .getMany();
  }

  async getOutOfStockProducts(tenantId: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.mainSupplier', 'supplier')
      .where('product.tenantId = :tenantId', { tenantId })
      .andWhere('product.currentStock = 0')
      .andWhere('product.trackStock = true')
      .andWhere('product.isActive = true')
      .orderBy('product.name', 'ASC')
      .getMany();
  }

  async getExpiringProducts(tenantId: string, days: number = 30): Promise<Product[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.mainSupplier', 'supplier')
      .where('product.tenantId = :tenantId', { tenantId })
      .andWhere('product.expirationDate IS NOT NULL')
      .andWhere('product.expirationDate <= :futureDate', { futureDate })
      .andWhere('product.isActive = true')
      .orderBy('product.expirationDate', 'ASC')
      .getMany();
  }

  async getStockValue(tenantId: string): Promise<{
    totalValue: number;
    totalProducts: number;
    totalItems: number;
  }> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.currentStock * product.purchasePrice)', 'totalValue')
      .addSelect('COUNT(product.id)', 'totalProducts')
      .addSelect('SUM(product.currentStock)', 'totalItems')
      .where('product.tenantId = :tenantId', { tenantId })
      .andWhere('product.isActive = true')
      .andWhere('product.trackStock = true')
      .getRawOne();

    return {
      totalValue: parseFloat(result.totalValue) || 0,
      totalProducts: parseInt(result.totalProducts) || 0,
      totalItems: parseFloat(result.totalItems) || 0,
    };
  }

  // Método para query raw (relatórios)
  async executeRawQuery(query: string, parameters: any[]): Promise<any[]> {
    return await this.productRepository.query(query, parameters);
  }
}
