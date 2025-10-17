"use strict";
/**
 * Payment Gateway Webhook Controller
 *
 * Handles webhook notifications from payment gateways
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const payment_gateway_service_1 = require("./payment-gateway.service");
class WebhookController {
    pool;
    service;
    constructor(pool) {
        this.pool = pool;
        this.service = new payment_gateway_service_1.PaymentGatewayService(pool);
    }
    /**
     * Handle Asaas webhook
     * POST /api/webhooks/asaas
     */
    asaasWebhook = async (req, res) => {
        try {
            const payload = req.body;
            const headers = req.headers;
            const ipAddress = req.ip;
            console.log('Asaas webhook received:', {
                event: payload.event,
                payment: payload.payment?.id,
                ip: ipAddress,
            });
            // Extract tenant from webhook data or use default
            // In production, you might want to include tenantId in the webhook URL
            const tenantId = 'default';
            // Store webhook in database
            const webhookQuery = `
        INSERT INTO payment_webhooks (
          "tenantId", gateway, event, "gatewayChargeId", "gatewayCustomerId",
          status, payload, headers, "ipAddress", "retryCount", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, NOW(), NOW())
        RETURNING id
      `;
            const webhookResult = await this.pool.query(webhookQuery, [
                tenantId,
                'asaas',
                payload.event,
                payload.payment?.id || null,
                payload.payment?.customer || null,
                'pending',
                JSON.stringify(payload),
                JSON.stringify(headers),
                ipAddress,
            ]);
            const webhookId = webhookResult.rows[0].id;
            // Process webhook asynchronously
            this.processAsaasWebhook(webhookId, tenantId, payload).catch((error) => {
                console.error('Error processing webhook:', error);
            });
            // Respond immediately to avoid timeout
            res.status(200).json({ received: true });
        }
        catch (error) {
            console.error('Error handling Asaas webhook:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Process Asaas webhook (async)
     */
    async processAsaasWebhook(webhookId, tenantId, payload) {
        try {
            // Update webhook status
            await this.pool.query(`UPDATE payment_webhooks SET status = 'processing', "updatedAt" = NOW() WHERE id = $1`, [webhookId]);
            const event = payload.event;
            const payment = payload.payment;
            if (!payment || !payment.id) {
                console.log('Webhook has no payment data, marking as ignored');
                await this.pool.query(`UPDATE payment_webhooks SET status = 'ignored', "processedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1`, [webhookId]);
                return;
            }
            // Update or create payment_charges record
            const chargeQuery = `
        INSERT INTO payment_charges (
          "tenantId", gateway, "gatewayChargeId", "gatewayCustomerId",
          "billingType", value, "dueDate", description, status,
          "paymentDate", "confirmedDate", "bankSlipUrl", "invoiceUrl",
          "invoiceNumber", "pixQrCode", "pixCopyPaste", "webhookReceived",
          "lastWebhookAt", "rawResponse", "createdAt", "updatedAt", "syncedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          true, NOW(), $17, NOW(), NOW(), NOW()
        )
        ON CONFLICT ("tenantId", gateway, "gatewayChargeId")
        DO UPDATE SET
          status = EXCLUDED.status,
          "paymentDate" = EXCLUDED."paymentDate",
          "confirmedDate" = EXCLUDED."confirmedDate",
          "webhookReceived" = true,
          "lastWebhookAt" = NOW(),
          "rawResponse" = EXCLUDED."rawResponse",
          "updatedAt" = NOW(),
          "syncedAt" = NOW()
        RETURNING id, "transactionId"
      `;
            const chargeResult = await this.pool.query(chargeQuery, [
                tenantId,
                'asaas',
                payment.id,
                payment.customer,
                payment.billingType || 'UNDEFINED',
                payment.value,
                payment.dueDate,
                payment.description || null,
                payment.status,
                payment.paymentDate || null,
                payment.confirmedDate || null,
                payment.bankSlipUrl || null,
                payment.invoiceUrl || null,
                payment.invoiceNumber || null,
                payment.pixQrCode || null,
                payment.pixCopyPaste || null,
                JSON.stringify(payment),
            ]);
            const charge = chargeResult.rows[0];
            // If payment was received, update linked financial transaction
            if (charge.transactionId && (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED')) {
                await this.pool.query(`
          UPDATE transactions
          SET status = 'confirmada', "confirmedAt" = NOW(), "updatedAt" = NOW()
          WHERE id = $1 AND status = 'pendente'
        `, [charge.transactionId]);
            }
            // Mark webhook as processed
            await this.pool.query(`UPDATE payment_webhooks SET status = 'processed', "processedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1`, [webhookId]);
            console.log(`Webhook ${webhookId} processed successfully for payment ${payment.id}`);
        }
        catch (error) {
            console.error('Error processing webhook:', error);
            // Mark webhook as failed
            await this.pool.query(`
        UPDATE payment_webhooks
        SET status = 'failed', "errorMessage" = $1, "retryCount" = "retryCount" + 1, "updatedAt" = NOW()
        WHERE id = $2
      `, [error.message, webhookId]);
        }
    }
    /**
     * Handle PagBank webhook
     * POST /api/webhooks/pagbank
     */
    pagbankWebhook = async (req, res) => {
        try {
            const payload = req.body;
            console.log('PagBank webhook received:', payload);
            // TODO: Implement PagBank webhook processing
            res.status(200).json({ received: true });
        }
        catch (error) {
            console.error('Error handling PagBank webhook:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Get webhook logs
     * GET /api/webhooks/logs
     */
    getWebhookLogs = async (req, res) => {
        try {
            const tenantId = req.user?.tenantId || 'default';
            const { gateway, status, limit = 50, offset = 0 } = req.query;
            let query = `
        SELECT * FROM payment_webhooks
        WHERE "tenantId" = $1
      `;
            const params = [tenantId];
            let paramIndex = 2;
            if (gateway) {
                query += ` AND gateway = $${paramIndex}`;
                params.push(gateway);
                paramIndex++;
            }
            if (status) {
                query += ` AND status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }
            query += ` ORDER BY "createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);
            const result = await this.pool.query(query, params);
            res.json({
                webhooks: result.rows,
                limit: Number(limit),
                offset: Number(offset),
            });
        }
        catch (error) {
            console.error('Error getting webhook logs:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Retry failed webhook
     * POST /api/webhooks/:id/retry
     */
    retryWebhook = async (req, res) => {
        try {
            const { id } = req.params;
            const tenantId = req.user?.tenantId || 'default';
            // Get webhook
            const webhookResult = await this.pool.query(`SELECT * FROM payment_webhooks WHERE id = $1 AND "tenantId" = $2`, [id, tenantId]);
            if (webhookResult.rows.length === 0) {
                return res.status(404).json({ error: 'Webhook not found' });
            }
            const webhook = webhookResult.rows[0];
            if (webhook.status === 'processed') {
                return res.status(400).json({ error: 'Webhook already processed' });
            }
            // Reset status and retry
            await this.pool.query(`UPDATE payment_webhooks SET status = 'pending', "updatedAt" = NOW() WHERE id = $1`, [id]);
            // Process based on gateway
            if (webhook.gateway === 'asaas') {
                this.processAsaasWebhook(id, tenantId, webhook.payload).catch((error) => {
                    console.error('Error retrying webhook:', error);
                });
            }
            res.json({ message: 'Webhook retry initiated' });
        }
        catch (error) {
            console.error('Error retrying webhook:', error);
            res.status(500).json({ error: error.message });
        }
    };
}
exports.WebhookController = WebhookController;
exports.default = WebhookController;
//# sourceMappingURL=webhook.controller.js.map