"use strict";
/**
 * Payment Gateway Routes
 *
 * API routes for payment gateway integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("@/database/data-source");
const payment_gateway_controller_1 = require("./payment-gateway.controller");
const webhook_controller_1 = require("./webhook.controller");
const auth_middleware_1 = require("@/shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get database connection pool from CrmDataSource
const getPool = () => {
    if (!data_source_1.CrmDataSource.isInitialized) {
        throw new Error('CRM Database not initialized');
    }
    return data_source_1.CrmDataSource.driver.master; // Get underlying pg Pool
};
// Initialize controllers (will be done when routes are accessed)
let controller;
let webhookController;
const initControllers = () => {
    if (!controller) {
        const pool = getPool();
        controller = new payment_gateway_controller_1.PaymentGatewayController(pool);
        webhookController = new webhook_controller_1.WebhookController(pool);
    }
};
// ==========================================
// PUBLIC WEBHOOK ROUTES (No authentication)
// ==========================================
// Asaas webhook
router.post('/webhooks/asaas', (req, res) => {
    initControllers();
    webhookController.asaasWebhook(req, res);
});
// PagBank webhook
router.post('/webhooks/pagbank', (req, res) => {
    initControllers();
    webhookController.pagbankWebhook(req, res);
});
// ==========================================
// PROTECTED ROUTES (Require authentication)
// ==========================================
router.use(auth_middleware_1.authenticate);
// Configuration routes
router.post('/config', (req, res) => {
    initControllers();
    controller.saveConfig(req, res);
});
router.get('/config', (req, res) => {
    initControllers();
    controller.listConfigs(req, res);
});
router.get('/config/:gateway/:environment', (req, res) => {
    initControllers();
    controller.getConfig(req, res);
});
router.delete('/config/:gateway/:environment', (req, res) => {
    initControllers();
    controller.deleteConfig(req, res);
});
router.post('/test/:gateway', (req, res) => {
    initControllers();
    controller.testConnection(req, res);
});
// Customer routes
router.post('/customers', (req, res) => {
    initControllers();
    controller.syncCustomer(req, res);
});
router.get('/customers/lead/:leadId', (req, res) => {
    initControllers();
    controller.getCustomerByLeadId(req, res);
});
// Charge routes
router.post('/charges', (req, res) => {
    initControllers();
    controller.createCharge(req, res);
});
router.get('/charges/:gateway', (req, res) => {
    initControllers();
    controller.listCharges(req, res);
});
router.get('/charges/:gateway/:chargeId', (req, res) => {
    initControllers();
    controller.getCharge(req, res);
});
router.get('/charges/:gateway/:chargeId/pix', (req, res) => {
    initControllers();
    controller.getPixQrCode(req, res);
});
router.post('/charges/:gateway/:chargeId/refund', (req, res) => {
    initControllers();
    controller.refundCharge(req, res);
});
// Webhook management routes
router.get('/webhooks/logs', (req, res) => {
    initControllers();
    webhookController.getWebhookLogs(req, res);
});
router.post('/webhooks/:id/retry', (req, res) => {
    initControllers();
    webhookController.retryWebhook(req, res);
});
exports.default = router;
//# sourceMappingURL=payment-gateway.routes.js.map