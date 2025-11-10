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

export enum BatchStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  EXPIRING_SOON = 'expiring_soon',
  DEPLETED = 'depleted',
}

export interface StockBatch {
  id: string;
  productId: string;
  product?: Product;
  batchNumber: string;
  manufacturerBatchNumber?: string;
  manufactureDate?: string;
  expirationDate: string;
  receiptDate?: string;
  currentStock: number;
  initialStock: number;
  unitCost?: number;
  totalCost?: number;
  status: BatchStatus;
  supplierId?: string;
  invoiceNumber?: string;
  location?: string;
  notes?: string;
  alertSent: boolean;
  alertSentAt?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  daysUntilExpiration?: number;
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

export interface ProcedureProduct {
  id: string;
  procedureId: string;
  productId: string;
  product?: Product;
  quantityUsed: number;
  isOptional: boolean;
  notes?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockValidation {
  valid: boolean;
  insufficientStock: Array<{
    productId: string;
    productName: string;
    required: number;
    available: number;
  }>;
}

export interface ConsumeStockResult {
  success: boolean;
  message: string;
  movements: StockMovement[];
  errors?: string[];
}

export enum InventoryCountStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum DiscrepancyType {
  SURPLUS = 'SURPLUS',
  SHORTAGE = 'SHORTAGE',
  MATCH = 'MATCH',
}

export interface InventoryCount {
  id: string;
  description: string;
  location?: string;
  status: InventoryCountStatus;
  countDate?: string;
  completedAt?: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  tenantId: string;
  items: InventoryCountItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryCountItem {
  id: string;
  inventoryCountId: string;
  productId: string;
  product: Product;
  systemStock: number;
  countedStock: number;
  difference: number;
  discrepancyType: DiscrepancyType;
  adjusted: boolean;
  adjustedAt?: string;
  notes?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscrepancyReport {
  total: number;
  matches: number;
  surpluses: number;
  shortages: number;
  totalDifference: number;
  items: InventoryCountItem[];
}

export interface InventoryCountFilters {
  status?: InventoryCountStatus;
  startDate?: string;
  endDate?: string;
  location?: string;
  limit?: number;
  offset?: number;
}

export interface CreateInventoryCountDTO {
  description: string;
  location?: string;
  countDate?: string;
}

export interface CreateInventoryCountItemDTO {
  productId: string;
  countedStock: number;
  notes?: string;
}

export interface UpdateInventoryCountItemDTO {
  countedStock: number;
  notes?: string;
}

export interface BatchAdjustResult {
  adjusted: number;
  skipped: number;
  errors: string[];
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

  // REPORTS
  async getMovementsMonthly(months: number = 6) {
    const response = await api.get(`/stock/reports/movements-monthly?months=${months}`);
    return response.data;
  }

  async getMostUsedProducts(limit: number = 10) {
    const response = await api.get(`/stock/reports/most-used-products?limit=${limit}`);
    return response.data;
  }

  async getStockValueByCategory() {
    const response = await api.get('/stock/reports/stock-value-by-category');
    return response.data;
  }

  // PROCEDURE PRODUCTS
  async addProductToProcedure(data: {
    procedureId: string;
    productId: string;
    quantityUsed: number;
    isOptional?: boolean;
    notes?: string;
  }): Promise<ProcedureProduct> {
    const response = await api.post('/stock/procedure-products', data);
    return response.data;
  }

  async getProcedureProducts(procedureId: string) {
    const response = await api.get(`/stock/procedure-products/${procedureId}`);
    return response.data;
  }

  async removeProcedureProduct(id: string): Promise<void> {
    await api.delete(`/stock/procedure-products/${id}`);
  }

  async validateStockForProcedure(procedureId: string): Promise<StockValidation> {
    const response = await api.get(`/stock/procedures/${procedureId}/validate-stock`);
    return response.data;
  }

  async consumeStockForProcedure(procedureId: string, medicalRecordId?: string): Promise<ConsumeStockResult> {
    const response = await api.post(`/stock/procedures/${procedureId}/consume-stock`, { medicalRecordId });
    return response.data;
  }

  async updateProcedureProductQuantity(id: string, quantityUsed: number): Promise<ProcedureProduct> {
    const response = await api.put(`/stock/procedure-products/${id}/quantity`, { quantityUsed });
    return response.data;
  }

  // INVENTORY COUNTS
  async getInventoryCounts(filters?: InventoryCountFilters) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await api.get(`/stock/inventory-counts?${params.toString()}`);
    return response.data;
  }

  async createInventoryCount(data: CreateInventoryCountDTO): Promise<InventoryCount> {
    const response = await api.post('/stock/inventory-counts', data);
    return response.data;
  }

  async getInventoryCount(id: string): Promise<InventoryCount> {
    const response = await api.get(`/stock/inventory-counts/${id}`);
    return response.data;
  }

  async addInventoryCountItem(countId: string, data: CreateInventoryCountItemDTO): Promise<InventoryCountItem> {
    const response = await api.post(`/stock/inventory-counts/${countId}/items`, data);
    return response.data;
  }

  async updateInventoryCountItem(itemId: string, data: UpdateInventoryCountItemDTO): Promise<InventoryCountItem> {
    const response = await api.put(`/stock/inventory-count-items/${itemId}`, data);
    return response.data;
  }

  async deleteInventoryCountItem(itemId: string): Promise<void> {
    await api.delete(`/stock/inventory-count-items/${itemId}`);
  }

  async adjustInventoryItem(itemId: string): Promise<{ item: InventoryCountItem; message: string }> {
    const response = await api.post(`/stock/inventory-count-items/${itemId}/adjust`);
    return response.data;
  }

  async batchAdjustInventory(countId: string): Promise<BatchAdjustResult> {
    const response = await api.post(`/stock/inventory-counts/${countId}/adjust-all`);
    return response.data;
  }

  async completeInventoryCount(countId: string): Promise<InventoryCount> {
    const response = await api.post(`/stock/inventory-counts/${countId}/complete`);
    return response.data;
  }

  async cancelInventoryCount(countId: string): Promise<InventoryCount> {
    const response = await api.post(`/stock/inventory-counts/${countId}/cancel`);
    return response.data;
  }

  async getDiscrepancyReport(countId: string): Promise<DiscrepancyReport> {
    const response = await api.get(`/stock/inventory-counts/${countId}/discrepancies`);
    return response.data;
  }

  // STOCK BATCHES
  async getBatches(filters: {
    productId?: string;
    status?: string;
    expiringSoon?: boolean;
    expired?: boolean;
    active?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/stock/batches?${params.toString()}`);
    return response.data;
  }

  async getBatch(id: string) {
    const response = await api.get(`/stock/batches/${id}`);
    return response.data;
  }

  async createBatch(data: {
    productId: string;
    batchNumber: string;
    manufacturerBatchNumber?: string;
    manufactureDate?: string;
    expirationDate: string;
    receiptDate?: string;
    initialStock: number;
    unitCost?: number;
    totalCost?: number;
    supplierId?: string;
    invoiceNumber?: string;
    location?: string;
    notes?: string;
  }) {
    const response = await api.post('/stock/batches', data);
    return response.data;
  }

  async updateBatch(id: string, data: {
    batchNumber?: string;
    location?: string;
    notes?: string;
  }) {
    const response = await api.put(`/stock/batches/${id}`, data);
    return response.data;
  }

  async deleteBatch(id: string) {
    const response = await api.delete(`/stock/batches/${id}`);
    return response.data;
  }

  async getBatchesByProduct(productId: string, onlyActive: boolean = true) {
    const response = await api.get(`/stock/batches/product/${productId}?onlyActive=${onlyActive}`);
    return response.data;
  }

  async getBatchStatusReport() {
    const response = await api.get('/stock/batches/status-report');
    return response.data;
  }

  async updateBatchStock(id: string, quantity: number, operation: 'add' | 'subtract') {
    const response = await api.post(`/stock/batches/${id}/update-stock`, { quantity, operation });
    return response.data;
  }

  // PROCEDURES (simplified - assuming procedures exist in another module)
  async getProcedures(search?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', '100');

    // This would need to be implemented in the procedures module
    // For now, returning empty array as placeholder
    try {
      const response = await api.get(`/procedures?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Fallback if procedures endpoint doesn't exist yet
      return { data: [], total: 0 };
    }
  }
}

export const stockService = new StockService();
export default stockService;
