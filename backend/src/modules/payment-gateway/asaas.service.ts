/**
 * Asaas Payment Gateway Service
 *
 * Handles all interactions with Asaas API
 * Documentation: https://docs.asaas.com/reference
 */

import axios, { AxiosInstance } from 'axios';
import { PaymentConfig } from './payment-config.entity';

export class AsaasService {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private environment: 'production' | 'sandbox';

  constructor(config: PaymentConfig) {
    if (config.gateway !== 'asaas') {
      throw new Error('Invalid gateway. Expected "asaas"');
    }

    this.apiKey = config.apiKey;
    this.environment = config.environment;

    // BUG FIX #1: Use official Asaas sandbox URL
    const baseURL =
      config.environment === 'production'
        ? 'https://api.asaas.com/v3'
        : 'https://sandbox.asaas.com/api/v3';  // Official sandbox URL

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        // BUG FIX #13: Add charset to Content-Type
        'Content-Type': 'application/json; charset=utf-8',
        // BUG FIX #14: Add User-Agent for better identification
        'User-Agent': 'NexusAtemporal/1.0 (Asaas Payment Integration)',
        'Accept': 'application/json',
        access_token: this.apiKey,
      },
      // BUG FIX #10: Make timeout configurable via environment
      timeout: parseInt(process.env.PAYMENT_API_TIMEOUT || '30000', 10),
    });

    // BUG FIX #5: Improved error handling with specific HTTP codes
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          // Extract detailed error message
          const errorMessage = data?.errors?.[0]?.description ||
                              data?.message ||
                              error.response.statusText;

          // Create structured error with HTTP status
          const structuredError: any = new Error(`Asaas API Error (${status}): ${errorMessage}`);
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
          const timeoutError: any = new Error('Asaas API Timeout: Request took too long');
          timeoutError.type = 'TIMEOUT';
          timeoutError.retryable = true;
          throw timeoutError;
        }

        throw error;
      }
    );
  }

  // ==========================================
  // CUSTOMER METHODS
  // ==========================================

  /**
   * Create a new customer in Asaas
   */
  async createCustomer(data: {
    name: string;
    cpfCnpj?: string;
    email?: string;
    phone?: string;
    mobilePhone?: string;
    address?: string;
    addressNumber?: string;
    complement?: string;
    province?: string;
    postalCode?: string;
    externalReference?: string;
    notificationDisabled?: boolean;
    observations?: string;
  }) {
    const response = await this.axiosInstance.post('/customers', data);
    return response.data;
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string) {
    const response = await this.axiosInstance.get(`/customers/${customerId}`);
    return response.data;
  }

  /**
   * Update customer
   */
  async updateCustomer(
    customerId: string,
    data: {
      name?: string;
      cpfCnpj?: string;
      email?: string;
      phone?: string;
      mobilePhone?: string;
      address?: string;
      addressNumber?: string;
      complement?: string;
      province?: string;
      postalCode?: string;
      externalReference?: string;
      notificationDisabled?: boolean;
      observations?: string;
    }
  ) {
    const response = await this.axiosInstance.post(`/customers/${customerId}`, data);
    return response.data;
  }

  /**
   * List customers
   */
  async listCustomers(params?: {
    offset?: number;
    limit?: number;
    name?: string;
    email?: string;
    cpfCnpj?: string;
    groupName?: string;
    externalReference?: string;
  }) {
    const response = await this.axiosInstance.get('/customers', { params });
    return response.data;
  }

  /**
   * Delete customer
   */
  async deleteCustomer(customerId: string) {
    const response = await this.axiosInstance.delete(`/customers/${customerId}`);
    return response.data;
  }

  // ==========================================
  // PAYMENT/CHARGE METHODS
  // ==========================================

  /**
   * Create a new payment/charge
   */
  async createPayment(data: {
    customer: string; // Customer ID
    billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UNDEFINED';
    value: number;
    dueDate: string; // YYYY-MM-DD
    description?: string;
    externalReference?: string;
    installmentCount?: number;
    installmentValue?: number;
    discount?: {
      value: number;
      dueDateLimitDays?: number;
      type?: 'FIXED' | 'PERCENTAGE';
    };
    fine?: {
      value: number;
      type?: 'FIXED' | 'PERCENTAGE';
    };
    interest?: {
      value: number;
      type?: 'PERCENTAGE';
    };
    postalService?: boolean;
    split?: Array<{
      walletId: string;
      fixedValue?: number;
      percentualValue?: number;
      totalFixedValue?: number;
    }>;
  }) {
    const response = await this.axiosInstance.post('/payments', data);
    return response.data;
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string) {
    const response = await this.axiosInstance.get(`/payments/${paymentId}`);
    return response.data;
  }

  /**
   * Update payment
   */
  async updatePayment(
    paymentId: string,
    data: {
      billingType?: 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UNDEFINED';
      value?: number;
      dueDate?: string;
      description?: string;
      externalReference?: string;
      discount?: {
        value: number;
        dueDateLimitDays?: number;
        type?: 'FIXED' | 'PERCENTAGE';
      };
      fine?: {
        value: number;
        type?: 'FIXED' | 'PERCENTAGE';
      };
      interest?: {
        value: number;
        type?: 'PERCENTAGE';
      };
    }
  ) {
    const response = await this.axiosInstance.post(`/payments/${paymentId}`, data);
    return response.data;
  }

  /**
   * Delete payment
   */
  async deletePayment(paymentId: string) {
    const response = await this.axiosInstance.delete(`/payments/${paymentId}`);
    return response.data;
  }

  /**
   * List payments
   */
  async listPayments(params?: {
    offset?: number;
    limit?: number;
    customer?: string;
    billingType?: string;
    status?: string;
    subscription?: string;
    installment?: string;
    externalReference?: string;
    paymentDate?: string;
    estimatedCreditDate?: string;
    pixQrCodeId?: string;
    anticipated?: boolean;
    dateCreated_ge?: string; // Greater or equal
    dateCreated_le?: string; // Less or equal
    paymentDate_ge?: string;
    paymentDate_le?: string;
    estimatedCreditDate_ge?: string;
    estimatedCreditDate_le?: string;
  }) {
    const response = await this.axiosInstance.get('/payments', { params });
    return response.data;
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, data?: { value?: number; description?: string }) {
    const response = await this.axiosInstance.post(`/payments/${paymentId}/refund`, data);
    return response.data;
  }

  /**
   * Confirm payment received in cash
   */
  async confirmCashPayment(
    paymentId: string,
    data: {
      paymentDate?: string;
      value?: number;
      notifyCustomer?: boolean;
    }
  ) {
    const response = await this.axiosInstance.post(`/payments/${paymentId}/receiveInCash`, data);
    return response.data;
  }

  /**
   * Undo cash payment confirmation
   */
  async undoCashPayment(paymentId: string) {
    const response = await this.axiosInstance.post(`/payments/${paymentId}/undoReceivedInCash`);
    return response.data;
  }

  /**
   * Get payment identificationField (linha digitável do boleto)
   */
  async getPaymentIdentificationField(paymentId: string) {
    const response = await this.axiosInstance.get(`/payments/${paymentId}/identificationField`);
    return response.data;
  }

  /**
   * Get PIX QR Code
   */
  async getPixQrCode(paymentId: string) {
    const response = await this.axiosInstance.get(`/payments/${paymentId}/pixQrCode`);
    return response.data;
  }

  // ==========================================
  // SUBSCRIPTION METHODS
  // ==========================================

  /**
   * Create subscription
   */
  async createSubscription(data: {
    customer: string;
    billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UNDEFINED';
    value: number;
    nextDueDate: string; // YYYY-MM-DD
    cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
    description?: string;
    endDate?: string;
    maxPayments?: number;
    externalReference?: string;
    discount?: {
      value: number;
      dueDateLimitDays?: number;
      type?: 'FIXED' | 'PERCENTAGE';
    };
    fine?: {
      value: number;
      type?: 'FIXED' | 'PERCENTAGE';
    };
    interest?: {
      value: number;
      type?: 'PERCENTAGE';
    };
    split?: Array<{
      walletId: string;
      fixedValue?: number;
      percentualValue?: number;
    }>;
  }) {
    const response = await this.axiosInstance.post('/subscriptions', data);
    return response.data;
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string) {
    const response = await this.axiosInstance.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId: string, data: any) {
    const response = await this.axiosInstance.post(`/subscriptions/${subscriptionId}`, data);
    return response.data;
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(subscriptionId: string) {
    const response = await this.axiosInstance.delete(`/subscriptions/${subscriptionId}`);
    return response.data;
  }

  /**
   * List subscriptions
   */
  async listSubscriptions(params?: {
    offset?: number;
    limit?: number;
    customer?: string;
    billingType?: string;
    status?: string;
    deletedOnly?: boolean;
    includeDeleted?: boolean;
    externalReference?: string;
  }) {
    const response = await this.axiosInstance.get('/subscriptions', { params });
    return response.data;
  }

  // ==========================================
  // TRANSFER METHODS
  // ==========================================

  /**
   * Create transfer to bank account
   */
  async createTransfer(data: {
    value: number;
    bankAccount: {
      bank: {
        code: string;
      };
      accountName: string;
      ownerName: string;
      ownerBirthDate?: string;
      cpfCnpj: string;
      agency: string;
      account: string;
      accountDigit: string;
      bankAccountType: 'CONTA_CORRENTE' | 'CONTA_POUPANCA';
    };
    operationType?: 'PIX' | 'TED';
    description?: string;
    scheduleDate?: string;
  }) {
    const response = await this.axiosInstance.post('/transfers', data);
    return response.data;
  }

  /**
   * Get transfer by ID
   */
  async getTransfer(transferId: string) {
    const response = await this.axiosInstance.get(`/transfers/${transferId}`);
    return response.data;
  }

  /**
   * List transfers
   */
  async listTransfers(params?: {
    offset?: number;
    limit?: number;
    dateCreated_ge?: string;
    dateCreated_le?: string;
    transferDate_ge?: string;
    transferDate_le?: string;
  }) {
    const response = await this.axiosInstance.get('/transfers', { params });
    return response.data;
  }

  // ==========================================
  // FINANCIAL STATEMENTS
  // ==========================================

  /**
   * Get financial transactions
   */
  async getFinancialTransactions(params?: {
    offset?: number;
    limit?: number;
    startDate?: string;
    finishDate?: string;
    type?:
      | 'PAYMENT'
      | 'RECEIVED'
      | 'PAYMENT_FEE'
      | 'TRANSFER'
      | 'TRANSFER_FEE'
      | 'ANTICIPATION'
      | 'ANTICIPATION_FEE'
      | 'BILL_PAYMENT'
      | 'BILL_PAYMENT_FEE'
      | 'MOBILE_PHONE_RECHARGE';
  }) {
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
  validateWebhookSignature(payload: any, signature: string, secret: string): boolean {
    // Asaas webhook validation logic
    // This depends on how Asaas implements webhook signatures
    // For now, return true - implement actual validation when available
    return true;
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: string, payload: any) {
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

export default AsaasService;
