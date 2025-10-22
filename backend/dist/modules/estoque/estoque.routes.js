"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("@/shared/middleware/auth.middleware");
const product_service_1 = require("./product.service");
const stock_movement_service_1 = require("./stock-movement.service");
const stock_alert_service_1 = require("./stock-alert.service");
const procedure_product_service_1 = require("./procedure-product.service");
const inventory_count_service_1 = require("./inventory-count.service");
const audit_log_service_1 = require("./audit-log.service");
const router = (0, express_1.Router)();
// Lazy initialization of services to avoid circular dependency issues
let productService;
let movementService;
let alertService;
let procedureProductService;
let inventoryCountService;
let auditLogService;
function getProductService() {
    if (!productService) {
        productService = new product_service_1.ProductService();
    }
    return productService;
}
function getMovementService() {
    if (!movementService) {
        movementService = new stock_movement_service_1.StockMovementService();
    }
    return movementService;
}
function getAlertService() {
    if (!alertService) {
        alertService = new stock_alert_service_1.StockAlertService();
    }
    return alertService;
}
function getProcedureProductService() {
    if (!procedureProductService) {
        procedureProductService = new procedure_product_service_1.ProcedureProductService();
    }
    return procedureProductService;
}
function getInventoryCountService() {
    if (!inventoryCountService) {
        inventoryCountService = new inventory_count_service_1.InventoryCountService();
    }
    return inventoryCountService;
}
function getAuditLogService() {
    if (!auditLogService) {
        auditLogService = new audit_log_service_1.AuditLogService();
    }
    return auditLogService;
}
// ============================================
// PUBLIC ROUTES (sem autenticação)
// ============================================
// Health check para o módulo
router.get('/health', (req, res) => {
    res.json({
        module: 'stock',
        status: 'ok',
        message: 'Stock module is running',
        timestamp: new Date().toISOString(),
        database: 'connected',
        entities: ['products', 'stock_movements', 'stock_alerts', 'procedure_products', 'inventory_counts', 'inventory_count_items']
    });
});
// ============================================
// PROTECTED ROUTES (com autenticação)
// ============================================
// PRODUCTS ROUTES
router.get('/products', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { search, category, isActive, lowStock, limit, offset } = req.query;
        const result = await getProductService().findAll({
            tenantId,
            search: search,
            category: category,
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
            lowStock: lowStock === 'true',
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/products', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const productData = { ...req.body, tenantId };
        const product = await getProductService().create(productData);
        res.status(201).json(product);
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/products/:id', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        const product = await getProductService().findOne(id, tenantId);
        res.json(product);
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(404).json({ error: error.message });
    }
});
router.put('/products/:id', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        const product = await getProductService().update(id, tenantId, req.body);
        res.json(product);
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ error: error.message });
    }
});
router.delete('/products/:id', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        await getProductService().delete(id, tenantId);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(400).json({ error: error.message });
    }
});
// Additional product endpoints
router.get('/products/sku/:sku', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { sku } = req.params;
        const product = await getProductService().findBySku(sku, tenantId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Error fetching product by SKU:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/products/barcode/:barcode', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { barcode } = req.params;
        const product = await getProductService().findByBarcode(barcode, tenantId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Error fetching product by barcode:', error);
        res.status(500).json({ error: error.message });
    }
});
// Dashboard endpoints
router.get('/dashboard/low-stock', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const products = await getProductService().getLowStockProducts(tenantId);
        res.json(products);
    }
    catch (error) {
        console.error('Error fetching low stock products:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/dashboard/out-of-stock', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const products = await getProductService().getOutOfStockProducts(tenantId);
        res.json(products);
    }
    catch (error) {
        console.error('Error fetching out of stock products:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/dashboard/expiring', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { days } = req.query;
        const daysAhead = days ? parseInt(days) : 30;
        const products = await getProductService().getExpiringProducts(tenantId, daysAhead);
        res.json(products);
    }
    catch (error) {
        console.error('Error fetching expiring products:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/dashboard/stock-value', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const value = await getProductService().getStockValue(tenantId);
        res.json(value);
    }
    catch (error) {
        console.error('Error calculating stock value:', error);
        res.status(500).json({ error: error.message });
    }
});
// STOCK MOVEMENTS ROUTES
router.get('/movements', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { productId, type, reason, startDate, endDate, limit, offset } = req.query;
        const result = await getMovementService().findAll({
            tenantId,
            productId: productId,
            type: type,
            reason: reason,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching stock movements:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/movements', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const userId = req.user?.userId;
        const movementData = { ...req.body, tenantId, userId };
        const movement = await getMovementService().createMovement(movementData);
        res.status(201).json(movement);
    }
    catch (error) {
        console.error('Error creating stock movement:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/movements/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        const movement = await getMovementService().findOne(id, tenantId);
        res.json(movement);
    }
    catch (error) {
        console.error('Error fetching movement:', error);
        res.status(404).json({ error: error.message });
    }
});
router.get('/movements/product/:productId', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { productId } = req.params;
        const { limit } = req.query;
        const movements = await getMovementService().getMovementsByProduct(productId, tenantId, limit ? parseInt(limit) : 50);
        res.json(movements);
    }
    catch (error) {
        console.error('Error fetching product movements:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/movements/summary', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }
        const summary = await getMovementService().getMovementsSummary(tenantId, new Date(startDate), new Date(endDate));
        res.json(summary);
    }
    catch (error) {
        console.error('Error fetching movements summary:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/movements/most-used', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { limit } = req.query;
        const products = await getMovementService().getMostUsedProducts(tenantId, limit ? parseInt(limit) : 10);
        res.json(products);
    }
    catch (error) {
        console.error('Error fetching most used products:', error);
        res.status(500).json({ error: error.message });
    }
});
// STOCK ALERTS ROUTES
router.get('/alerts', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { type, status, productId, limit, offset } = req.query;
        const result = await getAlertService().findAll({
            tenantId,
            type: type,
            status: status,
            productId: productId,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/alerts/:id/resolve', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const userId = req.user?.userId || 'system';
        const { id } = req.params;
        const { resolution } = req.body;
        if (!resolution) {
            return res.status(400).json({ error: 'Resolution is required' });
        }
        const alert = await getAlertService().resolveAlert(id, tenantId, userId, resolution);
        res.json(alert);
    }
    catch (error) {
        console.error('Error resolving alert:', error);
        res.status(400).json({ error: error.message });
    }
});
router.post('/alerts/:id/ignore', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        const alert = await getAlertService().ignoreAlert(id, tenantId);
        res.json(alert);
    }
    catch (error) {
        console.error('Error ignoring alert:', error);
        res.status(400).json({ error: error.message });
    }
});
router.get('/alerts/count', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const count = await getAlertService().getActiveAlertsCount(tenantId);
        res.json(count);
    }
    catch (error) {
        console.error('Error getting alerts count:', error);
        res.status(500).json({ error: error.message });
    }
});
// ============================================
// REPORTS ROUTES
// ============================================
// Relatório: Movimentações mensais (últimos 6 meses)
router.get('/reports/movements-monthly', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { months = '6' } = req.query;
        const query = `
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
        type,
        COUNT(*) as count,
        SUM(quantity) as total_quantity
      FROM stock_movements
      WHERE "tenantId" = $1
        AND "createdAt" >= NOW() - INTERVAL '${parseInt(months)} months'
      GROUP BY DATE_TRUNC('month', "createdAt"), type
      ORDER BY month DESC, type
    `;
        const result = await getMovementService().executeRawQuery(query, [tenantId]);
        res.json({ data: result });
    }
    catch (error) {
        console.error('Error getting monthly movements report:', error);
        res.status(500).json({ error: error.message });
    }
});
// Relatório: Produtos mais usados (top 10)
router.get('/reports/most-used-products', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { limit = '10' } = req.query;
        const query = `
      SELECT
        p.id,
        p.name,
        p.sku,
        p.unit,
        COUNT(sm.id) as movement_count,
        SUM(CASE WHEN sm.type = 'SAIDA' THEN sm.quantity ELSE 0 END) as total_output
      FROM products p
      INNER JOIN stock_movements sm ON p.id = sm."productId"
      WHERE p."tenantId" = $1
        AND sm."createdAt" >= NOW() - INTERVAL '3 months'
      GROUP BY p.id, p.name, p.sku, p.unit
      ORDER BY total_output DESC
      LIMIT $2
    `;
        const result = await getMovementService().executeRawQuery(query, [tenantId, parseInt(limit)]);
        res.json({ data: result });
    }
    catch (error) {
        console.error('Error getting most used products report:', error);
        res.status(500).json({ error: error.message });
    }
});
// Relatório: Valor do estoque por categoria
router.get('/reports/stock-value-by-category', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const query = `
      SELECT
        category,
        COUNT(*) as product_count,
        SUM("currentStock") as total_units,
        SUM("currentStock" * "purchasePrice") as total_value
      FROM products
      WHERE "tenantId" = $1
        AND "isActive" = true
      GROUP BY category
      ORDER BY total_value DESC
    `;
        const result = await getProductService().executeRawQuery(query, [tenantId]);
        res.json({ data: result });
    }
    catch (error) {
        console.error('Error getting stock value by category report:', error);
        res.status(500).json({ error: error.message });
    }
});
// ============================================
// PROCEDURE PRODUCTS ROUTES
// ============================================
// Adicionar produto a procedimento
router.post('/procedure-products', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { procedureId, productId, quantityUsed, isOptional, notes } = req.body;
        if (!procedureId || !productId || !quantityUsed) {
            return res.status(400).json({ error: 'procedureId, productId e quantityUsed são obrigatórios' });
        }
        const procedureProduct = await getProcedureProductService().addProductToProcedure({
            procedureId,
            productId,
            quantityUsed: Number(quantityUsed),
            isOptional: isOptional ?? true,
            notes,
            tenantId,
        });
        res.status(201).json(procedureProduct);
    }
    catch (error) {
        console.error('Error adding product to procedure:', error);
        res.status(400).json({ error: error.message });
    }
});
// Listar produtos de um procedimento
router.get('/procedure-products/:procedureId', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { procedureId } = req.params;
        const products = await getProcedureProductService().getProductsByProcedure(procedureId, tenantId);
        res.json({ data: products });
    }
    catch (error) {
        console.error('Error getting procedure products:', error);
        res.status(500).json({ error: error.message });
    }
});
// Remover produto de procedimento
router.delete('/procedure-products/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        await getProcedureProductService().removeProductFromProcedure(id, tenantId);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error removing product from procedure:', error);
        res.status(400).json({ error: error.message });
    }
});
// Validar estoque para procedimento
router.get('/procedures/:procedureId/validate-stock', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { procedureId } = req.params;
        const validation = await getProcedureProductService().validateStockForProcedure(procedureId, tenantId);
        res.json(validation);
    }
    catch (error) {
        console.error('Error validating stock for procedure:', error);
        res.status(500).json({ error: error.message });
    }
});
// Consumir estoque ao finalizar procedimento (BAIXA AUTOMÁTICA)
router.post('/procedures/:procedureId/consume-stock', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const userId = req.user?.userId;
        const { procedureId } = req.params;
        const { medicalRecordId } = req.body;
        const result = await getProcedureProductService().consumeStockForProcedure(procedureId, tenantId, userId, medicalRecordId);
        if (result.success) {
            res.json({
                success: true,
                message: 'Estoque consumido com sucesso',
                movements: result.movements,
            });
        }
        else {
            res.status(207).json({
                success: false,
                message: 'Estoque consumido com erros',
                movements: result.movements,
                errors: result.errors,
            });
        }
    }
    catch (error) {
        console.error('Error consuming stock for procedure:', error);
        res.status(400).json({ error: error.message });
    }
});
// Atualizar quantidade de produto em procedimento
router.put('/procedure-products/:id/quantity', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        const { quantityUsed } = req.body;
        if (!quantityUsed) {
            return res.status(400).json({ error: 'quantityUsed é obrigatório' });
        }
        const updated = await getProcedureProductService().updateProductQuantity(id, tenantId, Number(quantityUsed));
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating product quantity:', error);
        res.status(400).json({ error: error.message });
    }
});
// ============================================
// INVENTORY COUNT ROUTES
// ============================================
// Listar contagens de inventário
router.get('/inventory-counts', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { status, startDate, endDate, location, limit, offset } = req.query;
        const result = await getInventoryCountService().findAll({
            tenantId,
            status: status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            location: location,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching inventory counts:', error);
        res.status(500).json({ error: error.message });
    }
});
// Criar nova contagem de inventário
router.post('/inventory-counts', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const userId = req.user?.userId || 'system';
        const { description, location, countDate } = req.body;
        const inventoryCount = await getInventoryCountService().createInventoryCount({
            description,
            location,
            countDate: countDate ? new Date(countDate) : undefined,
            userId,
            tenantId,
        });
        res.status(201).json(inventoryCount);
    }
    catch (error) {
        console.error('Error creating inventory count:', error);
        res.status(400).json({ error: error.message });
    }
});
// Obter contagem específica com todos os itens
router.get('/inventory-counts/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        const inventoryCount = await getInventoryCountService().findOne(id, tenantId);
        res.json(inventoryCount);
    }
    catch (error) {
        console.error('Error fetching inventory count:', error);
        res.status(404).json({ error: error.message });
    }
});
// Adicionar item à contagem
router.post('/inventory-counts/:id/items', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id: inventoryCountId } = req.params;
        const { productId, countedStock, notes } = req.body;
        if (!productId || countedStock === undefined) {
            return res.status(400).json({ error: 'productId e countedStock são obrigatórios' });
        }
        const item = await getInventoryCountService().addCountItem({
            inventoryCountId,
            productId,
            countedStock: Number(countedStock),
            notes,
            tenantId,
        });
        res.status(201).json(item);
    }
    catch (error) {
        console.error('Error adding count item:', error);
        res.status(400).json({ error: error.message });
    }
});
// Atualizar item da contagem
router.put('/inventory-count-items/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        const { countedStock, notes } = req.body;
        if (countedStock === undefined) {
            return res.status(400).json({ error: 'countedStock é obrigatório' });
        }
        const item = await getInventoryCountService().updateCountItem(id, tenantId, Number(countedStock), notes);
        res.json(item);
    }
    catch (error) {
        console.error('Error updating count item:', error);
        res.status(400).json({ error: error.message });
    }
});
// Excluir item da contagem
router.delete('/inventory-count-items/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        await getInventoryCountService().deleteCountItem(id, tenantId);
        res.json({ message: 'Item removido com sucesso' });
    }
    catch (error) {
        console.error('Error deleting count item:', error);
        res.status(400).json({ error: error.message });
    }
});
// Ajustar estoque de um item
router.post('/inventory-count-items/:id/adjust', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const userId = req.user?.userId || 'system';
        const { id } = req.params;
        const result = await getInventoryCountService().adjustInventoryItem(id, tenantId, userId);
        res.json(result);
    }
    catch (error) {
        console.error('Error adjusting inventory item:', error);
        res.status(400).json({ error: error.message });
    }
});
// Ajustar todos os itens de uma contagem em lote
router.post('/inventory-counts/:id/adjust-all', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const userId = req.user?.userId || 'system';
        const { id: inventoryCountId } = req.params;
        const result = await getInventoryCountService().batchAdjustInventory(inventoryCountId, tenantId, userId);
        res.json(result);
    }
    catch (error) {
        console.error('Error adjusting inventory:', error);
        res.status(400).json({ error: error.message });
    }
});
// Concluir contagem de inventário
router.post('/inventory-counts/:id/complete', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        const inventoryCount = await getInventoryCountService().completeInventoryCount(id, tenantId);
        res.json(inventoryCount);
    }
    catch (error) {
        console.error('Error completing inventory count:', error);
        res.status(400).json({ error: error.message });
    }
});
// Cancelar contagem de inventário
router.post('/inventory-counts/:id/cancel', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        const inventoryCount = await getInventoryCountService().cancelInventoryCount(id, tenantId);
        res.json(inventoryCount);
    }
    catch (error) {
        console.error('Error cancelling inventory count:', error);
        res.status(400).json({ error: error.message });
    }
});
// Obter relatório de divergências
router.get('/inventory-counts/:id/discrepancies', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { id } = req.params;
        const report = await getInventoryCountService().getDiscrepancyReport(id, tenantId);
        res.json(report);
    }
    catch (error) {
        console.error('Error getting discrepancy report:', error);
        res.status(500).json({ error: error.message });
    }
});
// ============================================
// AUDIT LOG ROUTES
// ============================================
// Listar logs de auditoria
router.get('/audit-logs', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { entityType, entityId, action, userId, startDate, endDate, limit, offset } = req.query;
        const result = await getAuditLogService().findAll({
            tenantId,
            entityType: entityType,
            entityId: entityId,
            action: action,
            userId: userId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: error.message });
    }
});
// Obter histórico de uma entidade
router.get('/audit-logs/entity/:entityType/:entityId', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { entityType, entityId } = req.params;
        const logs = await getAuditLogService().getEntityHistory(entityType, entityId, tenantId);
        res.json(logs);
    }
    catch (error) {
        console.error('Error fetching entity history:', error);
        res.status(500).json({ error: error.message });
    }
});
// Obter atividade de um usuário
router.get('/audit-logs/user/:userId', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { userId } = req.params;
        const { days } = req.query;
        const logs = await getAuditLogService().getUserActivity(userId, tenantId, days ? parseInt(days) : 30);
        res.json(logs);
    }
    catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ error: error.message });
    }
});
// Obter resumo de auditoria
router.get('/audit-logs/summary', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 'default';
        const { days } = req.query;
        const summary = await getAuditLogService().getAuditSummary(tenantId, days ? parseInt(days) : 30);
        res.json(summary);
    }
    catch (error) {
        console.error('Error fetching audit summary:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=estoque.routes.js.map