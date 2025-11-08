"use strict";
/**
 * PagBank Payment Gateway Service
 *
 * Handles all interactions with PagBank API
 * Documentation: https://developer.pagbank.com.br/reference
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagBankService = void 0;
const axios_1 = __importDefault(require("axios"));
class PagBankService {
    axiosInstance;
    apiKey;
    environment;
    constructor(config) {
        if (config.gateway !== 'pagbank') {
            throw new Error('Invalid gateway. Expected "pagbank"');
        }
        this.apiKey = config.apiKey;
        this.environment = config.environment;
        const baseURL = config.environment === 'production'
            ? 'https://api.pagseguro.com'
            : 'https://sandbox.api.pagseguro.com';
        this.axiosInstance = axios_1.default.create({
            baseURL,
            headers: {
                // BUG FIX #13: Add charset to Content-Type
                'Content-Type': 'application/json; charset=utf-8',
                // BUG FIX #14: Add User-Agent to help with Cloudflare and identification
                'User-Agent': 'NexusAtemporal/1.0 (PagBank Payment Integration)',
                'Accept': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            // BUG FIX #10: Make timeout configurable via environment
            timeout: parseInt(process.env.PAYMENT_API_TIMEOUT || '30000', 10),
        });
        // BUG FIX #5: Improved error handling with specific HTTP codes
        this.axiosInstance.interceptors.response.use((response) => response, (error) => {
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                // Extract detailed error message
                const errorMessage = data?.error_messages?.[0]?.description ||
                    data?.message ||
                    error.response.statusText;
                // Create structured error with HTTP status
                const structuredError = new Error(`PagBank API Error (${status}): ${errorMessage}`);
                structuredError.statusCode = status;
                structuredError.originalError = data;
                // Handle specific HTTP codes
                switch (status) {
                    case 400:
                        structuredError.type = 'VALIDATION_ERROR';
                        break;
                    case 401:
                        structuredError.type = 'AUTHENTICATION_ERROR';
                        break;
                    case 403:
                        structuredError.type = 'AUTHORIZATION_ERROR';
                        break;
                    case 404:
                        structuredError.type = 'NOT_FOUND';
                        break;
                    case 429:
                        structuredError.type = 'RATE_LIMIT_EXCEEDED';
                        structuredError.retryAfter = error.response.headers['retry-after'];
                        break;
                    case 500:
                    case 502:
                    case 503:
                        structuredError.type = 'SERVER_ERROR';
                        structuredError.retryable = true;
                        break;
                    default:
                        structuredError.type = 'UNKNOWN_ERROR';
                }
                throw structuredError;
            }
            // Network or timeout error
            if (error.code === 'ECONNABORTED') {
                const timeoutError = new Error('PagBank API Timeout: Request took too long');
                timeoutError.type = 'TIMEOUT';
                timeoutError.retryable = true;
                throw timeoutError;
            }
            throw error;
        });
    }
    // ==========================================
    // CUSTOMER METHODS
    // ==========================================
    /**
     * Create a new customer in PagBank
     */
    async createCustomer(data) {
        const response = await this.axiosInstance.post('/customers', data);
        return response.data;
    }
    /**
     * Get customer by ID
     */
    async getCustomer(customerId) {
        const response = await this.axiosInstance.get(`/customers/${customerId}`);
        return response.data;
    }
    /**
     * List customers
     */
    async listCustomers(params) {
        const response = await this.axiosInstance.get('/customers', { params });
        return response.data;
    }
    // ==========================================
    // ORDER/CHARGE METHODS
    // ==========================================
    /**
     * Create a new order/charge
     */
    async createOrder(data) {
        const response = await this.axiosInstance.post('/orders', data);
        return response.data;
    }
    /**
     * Get order by ID
     */
    async getOrder(orderId) {
        const response = await this.axiosInstance.get(`/orders/${orderId}`);
        return response.data;
    }
    /**
     * Pay an order
     */
    async payOrder(orderId, data) {
        const response = await this.axiosInstance.post(`/orders/${orderId}/pay`, data);
        return response.data;
    }
    // ==========================================
    // CHARGE METHODS
    // ==========================================
    /**
     * Get charge by ID
     */
    async getCharge(chargeId) {
        const response = await this.axiosInstance.get(`/charges/${chargeId}`);
        return response.data;
    }
    /**
     * Cancel charge
     */
    async cancelCharge(chargeId, data) {
        const response = await this.axiosInstance.post(`/charges/${chargeId}/cancel`, data || {});
        return response.data;
    }
    /**
     * Capture charge (for pre-authorized charges)
     */
    async captureCharge(chargeId, data) {
        const response = await this.axiosInstance.post(`/charges/${chargeId}/capture`, data || {});
        return response.data;
    }
    // ==========================================
    // PIX METHODS
    // ==========================================
    /**
     * Get PIX QR Code for a charge
     */
    async getPixQrCode(chargeId) {
        const response = await this.axiosInstance.get(`/charges/${chargeId}/qrcode`);
        return response.data;
    }
    // ==========================================
    // CHECKOUT METHODS
    // ==========================================
    /**
     * Create a checkout (hosted payment page)
     */
    async createCheckout(data) {
        const response = await this.axiosInstance.post('/checkouts', data);
        return response.data;
    }
    /**
     * Get checkout by ID
     */
    async getCheckout(checkoutId) {
        const response = await this.axiosInstance.get(`/checkouts/${checkoutId}`);
        return response.data;
    }
    /**
     * Pay checkout
     */
    async payCheckout(checkoutId, data) {
        const response = await this.axiosInstance.post(`/checkouts/${checkoutId}/pay`, data);
        return response.data;
    }
    // ==========================================
    // SUBSCRIPTION METHODS (Recurring Payments)
    // ==========================================
    /**
     * Create subscription
     */
    async createSubscription(data) {
        const response = await this.axiosInstance.post('/subscriptions', data);
        return response.data;
    }
    /**
     * Get subscription by ID
     */
    async getSubscription(subscriptionId) {
        const response = await this.axiosInstance.get(`/subscriptions/${subscriptionId}`);
        return response.data;
    }
    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId) {
        const response = await this.axiosInstance.post(`/subscriptions/${subscriptionId}/cancel`);
        return response.data;
    }
    /**
     * List subscriptions
     */
    async listSubscriptions(params) {
        const response = await this.axiosInstance.get('/subscriptions', { params });
        return response.data;
    }
    // ==========================================
    // WEBHOOK METHODS
    // ==========================================
    /**
     * Validate webhook signature
     */
    validateWebhookSignature(payload, signature, secret) {
        // PagBank webhook validation logic
        // This depends on how PagBank implements webhook signatures
        // For now, return true - implement actual validation when available
        return true;
    }
    /**
     * Process webhook event
     */
    async processWebhookEvent(event, payload) {
        // This will be called by the webhook controller
        // Returns processed data or throws error
        const chargeData = payload.charges?.[0];
        switch (event) {
            case 'CHARGE.PAID':
            case 'CHARGE.AUTHORIZED':
                return {
                    chargeId: chargeData?.id,
                    status: 'PAID',
                    paymentDate: chargeData?.paid_at,
                    value: chargeData?.amount?.value / 100, // Convert from cents
                };
            case 'CHARGE.CANCELED':
                return {
                    chargeId: chargeData?.id,
                    status: 'CANCELLED',
                };
            case 'CHARGE.IN_ANALYSIS':
                return {
                    chargeId: chargeData?.id,
                    status: 'IN_ANALYSIS',
                };
            case 'CHARGE.REFUNDED':
                return {
                    chargeId: chargeData?.id,
                    status: 'REFUNDED',
                    refundedDate: chargeData?.updated_at,
                };
            default:
                return { event, payload };
        }
    }
    // ==========================================
    // HELPER METHODS
    // ==========================================
    /**
     * Convert BRL amount to cents (PagBank uses cents)
     */
    toCents(amount) {
        return Math.round(amount * 100);
    }
    /**
     * Convert cents to BRL amount
     */
    fromCents(amount) {
        return amount / 100;
    }
    /**
     * Format CPF/CNPJ
     */
    formatTaxId(taxId) {
        return taxId.replace(/\D/g, '');
    }
    /**
     * Format phone number
     */
    formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length >= 10) {
            return {
                area: cleaned.substring(0, 2),
                number: cleaned.substring(2),
            };
        }
        return {
            area: '',
            number: cleaned,
        };
    }
}
exports.PagBankService = PagBankService;
exports.default = PagBankService;
//# sourceMappingURL=pagbank.service.js.map