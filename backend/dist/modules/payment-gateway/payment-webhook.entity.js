"use strict";
/**
 * Entity: Payment Webhook
 *
 * Stores webhook notifications received from payment gateways
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsaasWebhookEvent = exports.WebhookStatus = void 0;
var WebhookStatus;
(function (WebhookStatus) {
    WebhookStatus["PENDING"] = "pending";
    WebhookStatus["PROCESSING"] = "processing";
    WebhookStatus["PROCESSED"] = "processed";
    WebhookStatus["FAILED"] = "failed";
    WebhookStatus["IGNORED"] = "ignored";
})(WebhookStatus || (exports.WebhookStatus = WebhookStatus = {}));
// Asaas webhook events
var AsaasWebhookEvent;
(function (AsaasWebhookEvent) {
    AsaasWebhookEvent["PAYMENT_CREATED"] = "PAYMENT_CREATED";
    AsaasWebhookEvent["PAYMENT_UPDATED"] = "PAYMENT_UPDATED";
    AsaasWebhookEvent["PAYMENT_CONFIRMED"] = "PAYMENT_CONFIRMED";
    AsaasWebhookEvent["PAYMENT_RECEIVED"] = "PAYMENT_RECEIVED";
    AsaasWebhookEvent["PAYMENT_OVERDUE"] = "PAYMENT_OVERDUE";
    AsaasWebhookEvent["PAYMENT_DELETED"] = "PAYMENT_DELETED";
    AsaasWebhookEvent["PAYMENT_RESTORED"] = "PAYMENT_RESTORED";
    AsaasWebhookEvent["PAYMENT_REFUNDED"] = "PAYMENT_REFUNDED";
    AsaasWebhookEvent["PAYMENT_RECEIVED_IN_CASH_UNDONE"] = "PAYMENT_RECEIVED_IN_CASH_UNDONE";
    AsaasWebhookEvent["PAYMENT_CHARGEBACK_REQUESTED"] = "PAYMENT_CHARGEBACK_REQUESTED";
    AsaasWebhookEvent["PAYMENT_CHARGEBACK_DISPUTE"] = "PAYMENT_CHARGEBACK_DISPUTE";
    AsaasWebhookEvent["PAYMENT_AWAITING_CHARGEBACK_REVERSAL"] = "PAYMENT_AWAITING_CHARGEBACK_REVERSAL";
    AsaasWebhookEvent["PAYMENT_DUNNING_RECEIVED"] = "PAYMENT_DUNNING_RECEIVED";
    AsaasWebhookEvent["PAYMENT_DUNNING_REQUESTED"] = "PAYMENT_DUNNING_REQUESTED";
    AsaasWebhookEvent["PAYMENT_BANK_SLIP_VIEWED"] = "PAYMENT_BANK_SLIP_VIEWED";
    AsaasWebhookEvent["PAYMENT_CHECKOUT_VIEWED"] = "PAYMENT_CHECKOUT_VIEWED";
})(AsaasWebhookEvent || (exports.AsaasWebhookEvent = AsaasWebhookEvent = {}));
//# sourceMappingURL=payment-webhook.entity.js.map