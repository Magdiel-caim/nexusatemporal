"use strict";
/**
 * Entity: Payment Gateway Configuration
 *
 * Stores API credentials and settings for payment gateways (Asaas, PagBank)
 * Credentials are encrypted at rest for security
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentEnvironment = exports.PaymentGateway = void 0;
var PaymentGateway;
(function (PaymentGateway) {
    PaymentGateway["ASAAS"] = "asaas";
    PaymentGateway["PAGBANK"] = "pagbank";
})(PaymentGateway || (exports.PaymentGateway = PaymentGateway = {}));
var PaymentEnvironment;
(function (PaymentEnvironment) {
    PaymentEnvironment["PRODUCTION"] = "production";
    PaymentEnvironment["SANDBOX"] = "sandbox";
})(PaymentEnvironment || (exports.PaymentEnvironment = PaymentEnvironment = {}));
//# sourceMappingURL=payment-config.entity.js.map