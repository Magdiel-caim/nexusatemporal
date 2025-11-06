"use strict";
/**
 * Payment Gateway Controller
 *
 * Handles HTTP requests for payment gateway operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayController = void 0;
const payment_gateway_service_1 = require("./payment-gateway.service");
class PaymentGatewayController {
    service;
    constructor(pool) {
        this.service = new payment_gateway_service_1.PaymentGatewayService(pool);
    }
    // ==========================================
    // CONFIGURATION ENDPOINTS
    // ==========================================
    /**
     * Save payment gateway configuration
     * POST /api/payment-gateway/config
     */
    saveConfig = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const userId = req.user?.userId || '';
            const { gateway, environment, apiKey, apiSecret, webhookSecret, isActive, config } = req.body;
            if (!gateway || !environment || !apiKey) {
                return res.status(400).json({
                    error: 'Missing required fields: gateway, environment, apiKey',
                });
            }
            const result = await this.service.saveConfig(tenantId, userId, {
                gateway,
                environment,
                apiKey,
                apiSecret,
                webhookSecret,
                isActive: isActive !== undefined ? isActive : true,
                config: config || {},
            });
            // Don't return the full API key
            result.apiKey = '****' + result.apiKey.slice(-4);
            if (result.apiSecret) {
                result.apiSecret = '****';
            }
            res.json(result);
        }
        catch (error) {
            console.error('Error saving payment config:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Get payment gateway configuration
     * GET /api/payment-gateway/config/:gateway/:environment
     */
    getConfig = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const { gateway, environment } = req.params;
            const config = await this.service.getConfig(tenantId, gateway, environment);
            if (!config) {
                return res.status(404).json({ error: 'Configuration not found' });
            }
            // Mask sensitive data
            config.apiKey = '****' + config.apiKey.slice(-4);
            if (config.apiSecret) {
                config.apiSecret = '****';
            }
            res.json(config);
        }
        catch (error) {
            console.error('Error getting payment config:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * List all configurations
     * GET /api/payment-gateway/config
     */
    listConfigs = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const configs = await this.service.listConfigs(tenantId);
            res.json(configs);
        }
        catch (error) {
            console.error('Error listing payment configs:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Delete configuration
     * DELETE /api/payment-gateway/config/:gateway/:environment
     */
    deleteConfig = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const { gateway, environment } = req.params;
            await this.service.deleteConfig(tenantId, gateway, environment);
            res.json({ message: 'Configuration deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting payment config:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Test connection with gateway
     * POST /api/payment-gateway/test/:gateway
     */
    testConnection = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const { gateway } = req.params;
            if (gateway === 'asaas') {
                const asaasService = await this.service.getAsaasService(tenantId);
                const balance = await asaasService.getBalance();
                res.json({
                    success: true,
                    message: 'Connection successful',
                    balance: balance,
                });
            }
            else if (gateway === 'pagbank') {
                const pagbankService = await this.service.getPagBankService(tenantId);
                // Test by listing customers (lightweight operation)
                const customers = await pagbankService.listCustomers({ limit: 1 });
                res.json({
                    success: true,
                    message: 'PagBank connection successful',
                    gateway: 'pagbank',
                    environment: 'sandbox',
                    customersCount: customers?.customers?.length || 0,
                });
            }
            else {
                res.status(400).json({ error: 'Gateway not supported yet' });
            }
        }
        catch (error) {
            console.error('Error testing connection:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    };
    // ==========================================
    // PAGBANK TEST ENDPOINTS
    // ==========================================
    /**
     * Run PagBank integration tests
     * POST /api/payment-gateway/test/pagbank/full
     */
    testPagBankIntegration = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'test-environment';
            const pagbankService = await this.service.getPagBankService(tenantId, 'sandbox');
            const results = [];
            // Test 1: Create test customer
            try {
                const customer = await pagbankService.createCustomer({
                    name: 'Cliente Teste API',
                    email: `teste-${Date.now()}@example.com`,
                    tax_id: '12345678909',
                    phones: [{
                            country: '55',
                            area: '11',
                            number: '999999999',
                            type: 'MOBILE'
                        }]
                });
                results.push({
                    test: 'Create Customer',
                    status: 'PASSED',
                    data: { customerId: customer.id }
                });
            }
            catch (error) {
                results.push({
                    test: 'Create Customer',
                    status: 'FAILED',
                    error: error.message
                });
            }
            // Test 2: Create PIX order
            try {
                const order = await pagbankService.createOrder({
                    reference_id: `TEST-${Date.now()}`,
                    customer: {
                        name: 'Cliente Teste PIX',
                        email: 'pix@example.com',
                        tax_id: '12345678909'
                    },
                    items: [{
                            name: 'Produto Teste',
                            quantity: 1,
                            unit_amount: 10000 // R$ 100,00
                        }],
                    charges: [{
                            description: 'Teste de pagamento PIX',
                            amount: {
                                value: 10000,
                                currency: 'BRL'
                            },
                            payment_method: {
                                type: 'PIX'
                            }
                        }]
                });
                results.push({
                    test: 'Create PIX Order',
                    status: 'PASSED',
                    data: {
                        orderId: order.id,
                        chargeId: order.charges?.[0]?.id
                    }
                });
            }
            catch (error) {
                results.push({
                    test: 'Create PIX Order',
                    status: 'FAILED',
                    error: error.message
                });
            }
            // Test 3: Create checkout
            try {
                const checkout = await pagbankService.createCheckout({
                    reference_id: `CHECKOUT-${Date.now()}`,
                    items: [{
                            name: 'Produto Checkout',
                            quantity: 1,
                            unit_amount: 5000
                        }],
                    payment_methods: [
                        { type: 'PIX' },
                        { type: 'CREDIT_CARD' }
                    ]
                });
                results.push({
                    test: 'Create Checkout',
                    status: 'PASSED',
                    data: {
                        checkoutId: checkout.id,
                        paymentLink: checkout.links?.find((l) => l.rel === 'PAY')?.href
                    }
                });
            }
            catch (error) {
                results.push({
                    test: 'Create Checkout',
                    status: 'FAILED',
                    error: error.message
                });
            }
            const passed = results.filter(r => r.status === 'PASSED').length;
            const failed = results.filter(r => r.status === 'FAILED').length;
            res.json({
                summary: {
                    total: results.length,
                    passed,
                    failed,
                    successRate: `${((passed / results.length) * 100).toFixed(1)}%`
                },
                results,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Error running PagBank tests:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Create test PIX payment
     * POST /api/payment-gateway/test/pagbank/pix
     */
    createTestPixPayment = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'test-environment';
            const { amount, description } = req.body;
            const pagbankService = await this.service.getPagBankService(tenantId, 'sandbox');
            const order = await pagbankService.createOrder({
                reference_id: `PIX-TEST-${Date.now()}`,
                customer: {
                    name: 'Cliente Teste PIX',
                    email: 'pix-test@example.com',
                    tax_id: '12345678909'
                },
                items: [{
                        name: description || 'Produto Teste PIX',
                        quantity: 1,
                        unit_amount: amount || 10000
                    }],
                charges: [{
                        description: description || 'Pagamento PIX de teste',
                        amount: {
                            value: amount || 10000,
                            currency: 'BRL'
                        },
                        payment_method: {
                            type: 'PIX'
                        }
                    }]
            });
            // Get QR Code if charge was created
            let qrCode = null;
            if (order.charges?.[0]?.id) {
                try {
                    qrCode = await pagbankService.getPixQrCode(order.charges[0].id);
                }
                catch (error) {
                    console.warn('Could not get QR Code:', error);
                }
            }
            res.json({
                success: true,
                orderId: order.id,
                chargeId: order.charges?.[0]?.id,
                status: order.charges?.[0]?.status,
                amount: amount || 10000,
                qrCode,
                order
            });
        }
        catch (error) {
            console.error('Error creating test PIX payment:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };
    /**
     * List test orders
     * GET /api/payment-gateway/test/pagbank/orders
     */
    listTestOrders = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'test-environment';
            const pagbankService = await this.service.getPagBankService(tenantId, 'sandbox');
            // Note: PagBank doesn't have a direct list orders endpoint
            // This would need to be tracked in our database
            res.json({
                message: 'List orders functionality needs to be implemented with local database tracking',
                note: 'PagBank API does not provide a list orders endpoint. Orders should be tracked in payment_charges table.'
            });
        }
        catch (error) {
            console.error('Error listing test orders:', error);
            res.status(500).json({ error: error.message });
        }
    };
    // ==========================================
    // CUSTOMER ENDPOINTS
    // ==========================================
    /**
     * Create or sync customer
     * POST /api/payment-gateway/customers
     */
    syncCustomer = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const { gateway, ...customerData } = req.body;
            if (!gateway) {
                return res.status(400).json({ error: 'Gateway is required' });
            }
            const customer = await this.service.syncCustomer(tenantId, gateway, customerData);
            res.json(customer);
        }
        catch (error) {
            console.error('Error syncing customer:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Get customer by lead ID
     * GET /api/payment-gateway/customers/lead/:leadId
     */
    getCustomerByLeadId = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const { leadId } = req.params;
            const { gateway } = req.query;
            if (!gateway) {
                return res.status(400).json({ error: 'Gateway query parameter is required' });
            }
            const customer = await this.service.getCustomerByLeadId(tenantId, gateway, leadId);
            if (!customer) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            res.json(customer);
        }
        catch (error) {
            console.error('Error getting customer:', error);
            res.status(500).json({ error: error.message });
        }
    };
    // ==========================================
    // PAYMENT/CHARGE ENDPOINTS (Asaas)
    // ==========================================
    /**
     * Create payment/charge
     * POST /api/payment-gateway/charges
     */
    createCharge = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const { gateway, customer, billingType, value, dueDate, description, externalReference, discount, fine, interest } = req.body;
            if (!gateway || !customer || !billingType || !value || !dueDate) {
                return res.status(400).json({
                    error: 'Missing required fields: gateway, customer, billingType, value, dueDate',
                });
            }
            if (gateway === 'asaas') {
                const asaasService = await this.service.getAsaasService(tenantId);
                const charge = await asaasService.createPayment({
                    customer,
                    billingType,
                    value,
                    dueDate,
                    description,
                    externalReference,
                    discount,
                    fine,
                    interest,
                });
                res.json(charge);
            }
            else {
                res.status(400).json({ error: 'Gateway not supported yet' });
            }
        }
        catch (error) {
            console.error('Error creating charge:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Get payment/charge
     * GET /api/payment-gateway/charges/:gateway/:chargeId
     */
    getCharge = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const { gateway, chargeId } = req.params;
            if (gateway === 'asaas') {
                const asaasService = await this.service.getAsaasService(tenantId);
                const charge = await asaasService.getPayment(chargeId);
                res.json(charge);
            }
            else {
                res.status(400).json({ error: 'Gateway not supported yet' });
            }
        }
        catch (error) {
            console.error('Error getting charge:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * List payments/charges
     * GET /api/payment-gateway/charges/:gateway
     */
    listCharges = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const { gateway } = req.params;
            if (gateway === 'asaas') {
                const asaasService = await this.service.getAsaasService(tenantId);
                const charges = await asaasService.listPayments(req.query);
                res.json(charges);
            }
            else {
                res.status(400).json({ error: 'Gateway not supported yet' });
            }
        }
        catch (error) {
            console.error('Error listing charges:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Get PIX QR Code
     * GET /api/payment-gateway/charges/:gateway/:chargeId/pix
     */
    getPixQrCode = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const { gateway, chargeId } = req.params;
            if (gateway === 'asaas') {
                const asaasService = await this.service.getAsaasService(tenantId);
                const pixData = await asaasService.getPixQrCode(chargeId);
                res.json(pixData);
            }
            else {
                res.status(400).json({ error: 'Gateway not supported yet' });
            }
        }
        catch (error) {
            console.error('Error getting PIX QR Code:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Refund payment
     * POST /api/payment-gateway/charges/:gateway/:chargeId/refund
     */
    refundCharge = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const { gateway, chargeId } = req.params;
            const { value, description } = req.body;
            if (gateway === 'asaas') {
                const asaasService = await this.service.getAsaasService(tenantId);
                const refund = await asaasService.refundPayment(chargeId, { value, description });
                res.json(refund);
            }
            else {
                res.status(400).json({ error: 'Gateway not supported yet' });
            }
        }
        catch (error) {
            console.error('Error refunding charge:', error);
            res.status(500).json({ error: error.message });
        }
    };
}
exports.PaymentGatewayController = PaymentGatewayController;
exports.default = PaymentGatewayController;
//# sourceMappingURL=payment-gateway.controller.js.map