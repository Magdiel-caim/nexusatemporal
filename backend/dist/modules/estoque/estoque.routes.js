"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const product_service_1 = require("./product.service");
const stock_movement_service_1 = require("./stock-movement.service");
const stock_alert_service_1 = require("./stock-alert.service");
const router = (0, express_1.Router)();
// Lazy initialization of services to avoid circular dependency issues
let productService;
let movementService;
let alertService;
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
        entities: ['products', 'stock_movements', 'stock_alerts', 'procedure_products']
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
exports.default = router;
//# sourceMappingURL=estoque.routes.js.map