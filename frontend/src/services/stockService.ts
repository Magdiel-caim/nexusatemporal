import api from './api';

// ============================================
// TYPES & INTERFACES
// ============================================

export enum ProductCategory {
  MEDICAMENTO = 'MEDICAMENTO',
  MATERIAL = 'MATERIAL',
  EQUIPAMENTO = 'EQUIPAMENTO',
  COSMÉTICO = 'COSMETICO',
  SUPLEMENTO = 'SUPLEMENTO',
  OUTRO = 'OUTRO',
}

export enum ProductUnit {
  UNIDADE = 'UN',
  CAIXA = 'CX',
  FRASCO = 'FR',
  AMPOLA = 'AMP',
  COMPRIMIDO = 'CP',
  ML = 'ML',
  LITRO = 'L',
  GRAMA = 'G',
  KG = 'KG',
}

export enum MovementType {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  AJUSTE = 'AJUSTE',
  DEVOLUCAO = 'DEVOLUCAO',
  PERDA = 'PERDA',
}

export enum MovementReason {
  COMPRA = 'COMPRA',
  PROCEDIMENTO = 'PROCEDIMENTO',
  VENDA = 'VENDA',
  AJUSTE_INVENTARIO = 'AJUSTE_INVENTARIO',
  DEVOLUCAO_FORNECEDOR = 'DEVOLUCAO_FORNECEDOR',
  DEVOLUCAO_CLIENTE = 'DEVOLUCAO_CLIENTE',
  PERDA = 'PERDA',
  VENCIMENTO = 'VENCIMENTO',
  DANO = 'DANO',
  OUTRO = 'OUTRO',
}

export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  IGNORED = 'IGNORED',
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  category: ProductCategory;
  unit: ProductUnit;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  purchasePrice?: number;
  salePrice?: number;
  mainSupplierId?: string;
  mainSupplier?: {
    id: string;
    name: string;
  };
  location?: string;
  expirationDate?: string;
  batchNumber?: string;
  trackStock: boolean;
  requiresPrescription: boolean;
  hasLowStockAlert: boolean;
  lastAlertDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  type: MovementType;
  reason: MovementReason;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  previousStock: number;
  newStock: number;
  purchaseOrderId?: string;
  medicalRecordId?: string;
  procedureId?: string;
  invoiceNumber?: string;
  batchNumber?: string;
  expirationDate?: string;
  notes?: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
  };
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  product?: Product;
  type: AlertType;
  status: AlertStatus;
  currentStock?: number;
  minimumStock?: number;
  suggestedOrderQuantity?: number;
  message?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  category: ProductCategory;
  unit?: ProductUnit;
  minimumStock?: number;
  maximumStock?: number;
  purchasePrice?: number;
  salePrice?: number;
  mainSupplierId?: string;
  location?: string;
  expirationDate?: string;
  batchNumber?: string;
  trackStock?: boolean;
  requiresPrescription?: boolean;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface CreateMovementDTO {
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
  expirationDate?: string;
  notes?: string;
}

export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  isActive?: boolean;
  lowStock?: boolean;
  limit?: number;
  offset?: number;
}

export interface MovementFilters {
  productId?: string;
  type?: MovementType;
  reason?: MovementReason;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AlertFilters {
  type?: AlertType;
  status?: AlertStatus;
  productId?: string;
  limit?: number;
  offset?: number;
}

export interface StockValue {
  totalValue: number;
  totalProducts: number;
  totalItems: number;
}

export interface MovementSummary {
  totalEntries: number;
  totalExits: number;
  totalValueEntries: number;
  totalValueExits: number;
  movementsByType: Record<string, number>;
}

export interface AlertCount {
  total: number;
  byType: Record<AlertType, number>;
}

// ============================================
// SERVICE CLASS
// ============================================

class StockService {
  // PRODUCTS
  async getProducts(filters?: ProductFilters) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.lowStock) params.append('lowStock', String(filters.lowStock));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await api.get(`/stock/products?${params.toString()}`);
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/stock/products/${id}`);
    return response.data;
  }

  async createProduct(data: CreateProductDTO): Promise<Product> {
    const response = await api.post('/stock/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    const response = await api.put(`/stock/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/stock/products/${id}`);
  }

  async getProductBySku(sku: string): Promise<Product> {
    const response = await api.get(`/stock/products/sku/${sku}`);
    return response.data;
  }

  async getProductByBarcode(barcode: string): Promise<Product> {
    const response = await api.get(`/stock/products/barcode/${barcode}`);
    return response.data;
  }

  // DASHBOARD
  async getLowStockProducts(): Promise<Product[]> {
    const response = await api.get('/stock/dashboard/low-stock');
    return response.data;
  }

  async getOutOfStockProducts(): Promise<Product[]> {
    const response = await api.get('/stock/dashboard/out-of-stock');
    return response.data;
  }

  async getExpiringProducts(days: number = 30): Promise<Product[]> {
    const response = await api.get(`/stock/dashboard/expiring?days=${days}`);
    return response.data;
  }

  async getStockValue(): Promise<StockValue> {
    const response = await api.get('/stock/dashboard/stock-value');
    return response.data;
  }

  // MOVEMENTS
  async getMovements(filters?: MovementFilters) {
    const params = new URLSearchParams();
    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.reason) params.append('reason', filters.reason);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await api.get(`/stock/movements?${params.toString()}`);
    return response.data;
  }

  async getMovement(id: string): Promise<StockMovement> {
    const response = await api.get(`/stock/movements/${id}`);
    return response.data;
  }

  async createMovement(data: CreateMovementDTO): Promise<StockMovement> {
    const response = await api.post('/stock/movements', data);
    return response.data;
  }

  async getProductMovements(productId: string, limit: number = 50): Promise<StockMovement[]> {
    const response = await api.get(`/stock/movements/product/${productId}?limit=${limit}`);
    return response.data;
  }

  async getMovementSummary(startDate: string, endDate: string): Promise<MovementSummary> {
    const response = await api.get(`/stock/movements/summary?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  async getMostUsedProducts(limit: number = 10) {
    const response = await api.get(`/stock/movements/most-used?limit=${limit}`);
    return response.data;
  }

  // ALERTS
  async getAlerts(filters?: AlertFilters) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await api.get(`/stock/alerts?${params.toString()}`);
    return response.data;
  }

  async resolveAlert(id: string, resolution: string): Promise<StockAlert> {
    const response = await api.post(`/stock/alerts/${id}/resolve`, { resolution });
    return response.data;
  }

  async ignoreAlert(id: string): Promise<StockAlert> {
    const response = await api.post(`/stock/alerts/${id}/ignore`);
    return response.data;
  }

  async getAlertCount(): Promise<AlertCount> {
    const response = await api.get('/stock/alerts/count');
    return response.data;
  }

  // HEALTH CHECK
  async healthCheck() {
    const response = await api.get('/stock/health');
    return response.data;
  }
}

export const stockService = new StockService();
export default stockService;
