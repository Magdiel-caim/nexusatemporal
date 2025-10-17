"use strict";
/**
 * Asaas Payment Gateway Service
 *
 * Handles all interactions with Asaas API
 * Documentation: https://docs.asaas.com/reference
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsaasService = void 0;
const axios_1 = __importDefault(require("axios"));
class AsaasService {
    axiosInstance;
    apiKey;
    environment;
    constructor(config) {
        if (config.gateway !== 'asaas') {
            throw new Error('Invalid gateway. Expected "asaas"');
        }
        this.apiKey = config.apiKey;
        this.environment = config.environment;
        const baseURL = config.environment === 'production'
            ? 'https://api.asaas.com/v3'
            : 'https://api-sandbox.asaas.com/v3';
        this.axiosInstance = axios_1.default.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                access_token: this.apiKey,
            },
            timeout: 30000,
        });
        // Response interceptor for error handling
        this.axiosInstance.interceptors.response.use((response) => response, (error) => {
            if (error.response) {
                throw new Error(`Asaas API Error: ${error.response.data?.errors?.[0]?.description || error.response.statusText}`);
            }
            throw error;
        });
    }
    // ==========================================
    // CUSTOMER METHODS
    // ==========================================
    /**
     * Create a new customer in Asaas
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
     * Update customer
     */
    async updateCustomer(customerId, data) {
        const response = await this.axiosInstance.post(`/customers/${customerId}`, data);
        return response.data;
    }
    /**
     * List customers
     */
    async listCustomers(params) {
        const response = await this.axiosInstance.get('/customers', { params });
        return response.data;
    }
    /**
     * Delete customer
     */
    async deleteCustomer(customerId) {
        const response = await this.axiosInstance.delete(`/customers/${customerId}`);
        return response.data;
    }
    // ==========================================
    // PAYMENT/CHARGE METHODS
    // ==========================================
    /**
     * Create a new payment/charge
     */
    async createPayment(data) {
        const response = await this.axiosInstance.post('/payments', data);
        return response.data;
    }
    /**
     * Get payment by ID
     */
    async getPayment(paymentId) {
        const response = await this.axiosInstance.get(`/payments/${paymentId}`);
        return response.data;
    }
    /**
     * Update payment
     */
    async updatePayment(paymentId, data) {
        const response = await this.axiosInstance.post(`/payments/${paymentId}`, data);
        return response.data;
    }
    /**
     * Delete payment
     */
    async deletePayment(paymentId) {
        const response = await this.axiosInstance.delete(`/payments/${paymentId}`);
        return response.data;
    }
    /**
     * List payments
     */
    async listPayments(params) {
        const response = await this.axiosInstance.get('/payments', { params });
        return response.data;
    }
    /**
     * Refund payment
     */
    async refundPayment(paymentId, data) {
        const response = await this.axiosInstance.post(`/payments/${paymentId}/refund`, data);
        return response.data;
    }
    /**
     * Confirm payment received in cash
     */
    async confirmCashPayment(paymentId, data) {
        const response = await this.axiosInstance.post(`/payments/${paymentId}/receiveInCash`, data);
        return response.data;
    }
    /**
     * Undo cash payment confirmation
     */
    async undoCashPayment(paymentId) {
        const response = await this.axiosInstance.post(`/payments/${paymentId}/undoReceivedInCash`);
        return response.data;
    }
    /**
     * Get payment identificationField (linha digitável do boleto)
     */
    async getPaymentIdentificationField(paymentId) {
        const response = await this.axiosInstance.get(`/payments/${paymentId}/identificationField`);
        return response.data;
    }
    /**
     * Get PIX QR Code
     */
    async getPixQrCode(paymentId) {
        const response = await this.axiosInstance.get(`/payments/${paymentId}/pixQrCode`);
        return response.data;
    }
    // ==========================================
    // SUBSCRIPTION METHODS
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
     * Update subscription
     */
    async updateSubscription(subscriptionId, data) {
        const response = await this.axiosInstance.post(`/subscriptions/${subscriptionId}`, data);
        return response.data;
    }
    /**
     * Delete subscription
     */
    async deleteSubscription(subscriptionId) {
        const response = await this.axiosInstance.delete(`/subscriptions/${subscriptionId}`);
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
    // TRANSFER METHODS
    // ==========================================
    /**
     * Create transfer to bank account
     */
    async createTransfer(data) {
        const response = await this.axiosInstance.post('/transfers', data);
        return response.data;
    }
    /**
     * Get transfer by ID
     */
    async getTransfer(transferId) {
        const response = await this.axiosInstance.get(`/transfers/${transferId}`);
        return response.data;
    }
    /**
     * List transfers
     */
    async listTransfers(params) {
        const response = await this.axiosInstance.get('/transfers', { params });
        return response.data;
    }
    // ==========================================
    // FINANCIAL STATEMENTS
    // ==========================================
    /**
     * Get financial transactions
     */
    async getFinancialTransactions(params) {
        const response = await this.axiosInstance.get('/financialTransactions', { params });
        return response.data;
    }
    /**
     * Get account balance
     */
    async getBalance() {
        const response = await this.axiosInstance.get('/finance/balance');
        return response.data;
    }
    // ==========================================
    // WEBHOOK METHODS
    // ==========================================
    /**
     * Validate webhook signature (if Asaas provides signature validation)
     */
    validateWebhookSignature(payload, signature, secret) {
        // Asaas webhook validation logic
        // This depends on how Asaas implements webhook signatures
        // For now, return true - implement actual validation when available
        return true;
    }
    /**
     * Process webhook event
     */
    async processWebhookEvent(event, payload) {
        // This will be called by the webhook controller
        // Returns processed data or throws error
        switch (event) {
            case 'PAYMENT_RECEIVED':
            case 'PAYMENT_CONFIRMED':
                return {
                    paymentId: payload.payment?.id,
                    status: 'RECEIVED',
                    paymentDate: payload.payment?.paymentDate,
                    value: payload.payment?.value,
                };
            case 'PAYMENT_OVERDUE':
                return {
                    paymentId: payload.payment?.id,
                    status: 'OVERDUE',
                };
            case 'PAYMENT_DELETED':
            case 'PAYMENT_REFUNDED':
                return {
                    paymentId: payload.payment?.id,
                    status: payload.event === 'PAYMENT_REFUNDED' ? 'REFUNDED' : 'DELETED',
                };
            default:
                return { event, payload };
        }
    }
}
exports.AsaasService = AsaasService;
exports.default = AsaasService;
//# sourceMappingURL=asaas.service.js.map