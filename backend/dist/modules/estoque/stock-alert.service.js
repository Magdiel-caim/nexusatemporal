"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockAlertService = void 0;
const data_source_1 = require("../../database/data-source");
const stock_alert_entity_1 = require("./stock-alert.entity");
const product_entity_1 = require("./product.entity");
const product_service_1 = require("./product.service");
class StockAlertService {
    alertRepository;
    productRepository;
    productService;
    constructor() {
        this.alertRepository = data_source_1.CrmDataSource.getRepository(stock_alert_entity_1.StockAlert);
        this.productRepository = data_source_1.CrmDataSource.getRepository(product_entity_1.Product);
        this.productService = new product_service_1.ProductService();
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
    async checkLowStockForTenant(tenantId) {
        const lowStockProducts = await this.productService.getLowStockProducts(tenantId);
        for (const product of lowStockProducts) {
            // Verificar se já existe alerta ativo para este produto
            const existingAlert = await this.alertRepository.findOne({
                where: {
                    productId: product.id,
                    type: product.currentStock === 0 ? stock_alert_entity_1.AlertType.OUT_OF_STOCK : stock_alert_entity_1.AlertType.LOW_STOCK,
                    status: stock_alert_entity_1.AlertStatus.ACTIVE,
                    tenantId,
                },
            });
            if (!existingAlert) {
                // Criar novo alerta
                const alertType = product.currentStock === 0 ? stock_alert_entity_1.AlertType.OUT_OF_STOCK : stock_alert_entity_1.AlertType.LOW_STOCK;
                const suggestedOrder = this.calculateSuggestedOrder(product.minimumStock, product.maximumStock || product.minimumStock * 3);
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
    async checkExpiringProductsForTenant(tenantId, daysAhead = 30) {
        const expiringProducts = await this.productService.getExpiringProducts(tenantId, daysAhead);
        for (const product of expiringProducts) {
            // Verificar se já existe alerta ativo
            const existingAlert = await this.alertRepository.findOne({
                where: {
                    productId: product.id,
                    type: stock_alert_entity_1.AlertType.EXPIRING_SOON,
                    status: stock_alert_entity_1.AlertStatus.ACTIVE,
                    tenantId,
                },
            });
            if (!existingAlert && product.expirationDate) {
                const daysUntilExpiration = this.getDaysUntilExpiration(product.expirationDate);
                const alertType = daysUntilExpiration <= 0 ? stock_alert_entity_1.AlertType.EXPIRED : stock_alert_entity_1.AlertType.EXPIRING_SOON;
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
    async createAlert(data) {
        const alert = this.alertRepository.create({
            ...data,
            status: stock_alert_entity_1.AlertStatus.ACTIVE,
        });
        const savedAlert = await this.alertRepository.save(alert);
        // TODO: Enviar notificação para responsáveis
        // await this.notificationService.sendLowStockAlert(savedAlert);
        return savedAlert;
    }
    async findAll(filters) {
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
    async resolveAlert(alertId, tenantId, resolvedBy, resolution) {
        const alert = await this.alertRepository.findOne({
            where: { id: alertId, tenantId },
        });
        if (!alert) {
            throw new Error('Alerta não encontrado');
        }
        alert.status = stock_alert_entity_1.AlertStatus.RESOLVED;
        alert.resolvedAt = new Date();
        alert.resolvedBy = resolvedBy;
        alert.resolution = resolution;
        return await this.alertRepository.save(alert);
    }
    async ignoreAlert(alertId, tenantId) {
        const alert = await this.alertRepository.findOne({
            where: { id: alertId, tenantId },
        });
        if (!alert) {
            throw new Error('Alerta não encontrado');
        }
        alert.status = stock_alert_entity_1.AlertStatus.IGNORED;
        return await this.alertRepository.save(alert);
    }
    async getActiveAlertsCount(tenantId) {
        const alerts = await this.alertRepository.find({
            where: { tenantId, status: stock_alert_entity_1.AlertStatus.ACTIVE },
        });
        const byType = {
            [stock_alert_entity_1.AlertType.LOW_STOCK]: 0,
            [stock_alert_entity_1.AlertType.OUT_OF_STOCK]: 0,
            [stock_alert_entity_1.AlertType.EXPIRING_SOON]: 0,
            [stock_alert_entity_1.AlertType.EXPIRED]: 0,
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
    calculateSuggestedOrder(minimumStock, maximumStock) {
        // Sugerir quantidade para chegar ao máximo
        const suggested = maximumStock - minimumStock;
        return Math.max(suggested, minimumStock * 2);
    }
    generateAlertMessage(product, alertType) {
        if (alertType === stock_alert_entity_1.AlertType.OUT_OF_STOCK) {
            return `Produto "${product.name}" está sem estoque! Sugerimos comprar ${this.calculateSuggestedOrder(product.minimumStock, product.maximumStock || product.minimumStock * 3)} ${product.unit}.`;
        }
        else {
            return `Produto "${product.name}" está com estoque baixo (${product.currentStock} ${product.unit}). Mínimo: ${product.minimumStock} ${product.unit}.`;
        }
    }
    generateExpirationMessage(product, daysUntilExpiration) {
        if (daysUntilExpiration <= 0) {
            return `Produto "${product.name}" está vencido! Data de validade: ${product.expirationDate?.toLocaleDateString()}`;
        }
        else {
            return `Produto "${product.name}" vencerá em ${daysUntilExpiration} dias. Data de validade: ${product.expirationDate?.toLocaleDateString()}`;
        }
    }
    getDaysUntilExpiration(expirationDate) {
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
}
exports.StockAlertService = StockAlertService;
//# sourceMappingURL=stock-alert.service.js.map