import { Router } from 'express';
import { authenticate } from '@/shared/middleware/auth.middleware';
import { ProductService } from './product.service';
import { StockMovementService } from './stock-movement.service';
import { StockAlertService } from './stock-alert.service';
import { Pool } from 'pg';

const router = Router();

// Lazy initialization of services to avoid circular dependency issues
let productService: ProductService;
let movementService: StockMovementService;
let alertService: StockAlertService;

function getProductService(): ProductService {
  if (!productService) {
    productService = new ProductService();
  }
  return productService;
}

function getMovementService(): StockMovementService {
  if (!movementService) {
    movementService = new StockMovementService();
  }
  return movementService;
}

function getAlertService(): StockAlertService {
  if (!alertService) {
    alertService = new StockAlertService();
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
router.get('/products', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { search, category, isActive, lowStock, limit, offset } = req.query;

    const result = await getProductService().findAll({
      tenantId,
      search: search as string,
      category: category as any,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      lowStock: lowStock === 'true',
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/products', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const productData = { ...req.body, tenantId };

    const product = await getProductService().create(productData);
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/products/:id', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { id } = req.params;

    const product = await getProductService().findOne(id, tenantId);
    res.json(product);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    res.status(404).json({ error: error.message });
  }
});

router.put('/products/:id', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { id } = req.params;

    const product = await getProductService().update(id, tenantId, req.body);
    res.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/products/:id', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { id } = req.params;

    await getProductService().delete(id, tenantId);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(400).json({ error: error.message });
  }
});

// Additional product endpoints
router.get('/products/sku/:sku', authenticate, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { sku } = req.params;

    const product = await getProductService().findBySku(sku, tenantId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    console.error('Error fetching product by SKU:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/products/barcode/:barcode', authenticate, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { barcode } = req.params;

    const product = await getProductService().findByBarcode(barcode, tenantId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    console.error('Error fetching product by barcode:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard endpoints
router.get('/dashboard/low-stock', authenticate, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const products = await getProductService().getLowStockProducts(tenantId);
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard/out-of-stock', authenticate, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const products = await getProductService().getOutOfStockProducts(tenantId);
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching out of stock products:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard/expiring', authenticate, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { days } = req.query;
    const daysAhead = days ? parseInt(days as string) : 30;

    const products = await getProductService().getExpiringProducts(tenantId, daysAhead);
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching expiring products:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard/stock-value', authenticate, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const value = await getProductService().getStockValue(tenantId);
    res.json(value);
  } catch (error: any) {
    console.error('Error calculating stock value:', error);
    res.status(500).json({ error: error.message });
  }
});

// STOCK MOVEMENTS ROUTES
router.get('/movements', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { productId, type, reason, startDate, endDate, limit, offset } = req.query;

    const result = await getMovementService().findAll({
      tenantId,
      productId: productId as string,
      type: type as any,
      reason: reason as any,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/movements', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const userId = req.user?.userId;
    const movementData = { ...req.body, tenantId, userId };

    const movement = await getMovementService().createMovement(movementData);
    res.status(201).json(movement);
  } catch (error: any) {
    console.error('Error creating stock movement:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/movements/:id', authenticate, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { id } = req.params;

    const movement = await getMovementService().findOne(id, tenantId);
    res.json(movement);
  } catch (error: any) {
    console.error('Error fetching movement:', error);
    res.status(404).json({ error: error.message });
  }
});

router.get('/movements/product/:productId', authenticate, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { productId } = req.params;
    const { limit } = req.query;

    const movements = await getMovementService().getMovementsByProduct(
      productId,
      tenantId,
      limit ? parseInt(limit as string) : 50
    );
    res.json(movements);
  } catch (error: any) {
    console.error('Error fetching product movements:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/movements/summary', authenticate, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const summary = await getMovementService().getMovementsSummary(
      tenantId,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json(summary);
  } catch (error: any) {
    console.error('Error fetching movements summary:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/movements/most-used', authenticate, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { limit } = req.query;

    const products = await getMovementService().getMostUsedProducts(
      tenantId,
      limit ? parseInt(limit as string) : 10
    );
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching most used products:', error);
    res.status(500).json({ error: error.message });
  }
});

// STOCK ALERTS ROUTES
router.get('/alerts', authenticate, async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { type, status, productId, limit, offset } = req.query;

    const result = await getAlertService().findAll({
      tenantId,
      type: type as any,
      status: status as any,
      productId: productId as string,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/alerts/:id/resolve', authenticate, async (req, res) => {
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
  } catch (error: any) {
    console.error('Error resolving alert:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/alerts/:id/ignore', authenticate, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const { id } = req.params;

    const alert = await getAlertService().ignoreAlert(id, tenantId);
    res.json(alert);
  } catch (error: any) {
    console.error('Error ignoring alert:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/alerts/count', authenticate, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'default';
    const count = await getAlertService().getActiveAlertsCount(tenantId);
    res.json(count);
  } catch (error: any) {
    console.error('Error getting alerts count:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
