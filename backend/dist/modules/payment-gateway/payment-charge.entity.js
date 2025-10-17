"use strict";
/**
 * Entity: Payment Charge
 *
 * Represents a payment/charge created in a payment gateway
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargeStatus = exports.BillingType = void 0;
var BillingType;
(function (BillingType) {
    BillingType["BOLETO"] = "BOLETO";
    BillingType["PIX"] = "PIX";
    BillingType["CREDIT_CARD"] = "CREDIT_CARD";
    BillingType["DEBIT_CARD"] = "DEBIT_CARD";
    BillingType["UNDEFINED"] = "UNDEFINED";
})(BillingType || (exports.BillingType = BillingType = {}));
var ChargeStatus;
(function (ChargeStatus) {
    ChargeStatus["PENDING"] = "PENDING";
    ChargeStatus["RECEIVED"] = "RECEIVED";
    ChargeStatus["CONFIRMED"] = "CONFIRMED";
    ChargeStatus["OVERDUE"] = "OVERDUE";
    ChargeStatus["REFUNDED"] = "REFUNDED";
    ChargeStatus["RECEIVED_IN_CASH"] = "RECEIVED_IN_CASH";
    ChargeStatus["REFUND_REQUESTED"] = "REFUND_REQUESTED";
    ChargeStatus["CHARGEBACK_REQUESTED"] = "CHARGEBACK_REQUESTED";
    ChargeStatus["CHARGEBACK_DISPUTE"] = "CHARGEBACK_DISPUTE";
    ChargeStatus["AWAITING_CHARGEBACK_REVERSAL"] = "AWAITING_CHARGEBACK_REVERSAL";
    ChargeStatus["DUNNING_REQUESTED"] = "DUNNING_REQUESTED";
    ChargeStatus["DUNNING_RECEIVED"] = "DUNNING_RECEIVED";
    ChargeStatus["AWAITING_RISK_ANALYSIS"] = "AWAITING_RISK_ANALYSIS";
})(ChargeStatus || (exports.ChargeStatus = ChargeStatus = {}));
//# sourceMappingURL=payment-charge.entity.js.map