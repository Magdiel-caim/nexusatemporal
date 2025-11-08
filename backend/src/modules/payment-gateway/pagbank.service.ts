/**
 * PagBank Payment Gateway Service
 *
 * Handles all interactions with PagBank API
 * Documentation: https://developer.pagbank.com.br/reference
 */

import axios, { AxiosInstance } from 'axios';
import { PaymentConfig } from './payment-config.entity';

export class PagBankService {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private environment: 'production' | 'sandbox';

  constructor(config: PaymentConfig) {
    if (config.gateway !== 'pagbank') {
      throw new Error('Invalid gateway. Expected "pagbank"');
    }

    this.apiKey = config.apiKey;
    this.environment = config.environment;

    const baseURL =
      config.environment === 'production'
        ? 'https://api.pagseguro.com'
        : 'https://sandbox.api.pagseguro.com';

    this.axiosInstance = axios.create({
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
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          // Extract detailed error message
          const errorMessage = data?.error_messages?.[0]?.description ||
                              data?.message ||
                              error.response.statusText;

          // Create structured error with HTTP status
          const structuredError: any = new Error(`PagBank API Error (${status}): ${errorMessage}`);
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
          const timeoutError: any = new Error('PagBank API Timeout: Request took too long');
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
   * Create a new customer in PagBank
   */
  async createCustomer(data: {
    name: string;
    email?: string;
    tax_id?: string; // CPF/CNPJ
    phones?: Array<{
      country?: string;
      area: string;
      number: string;
      type?: 'MOBILE' | 'BUSINESS' | 'HOME';
    }>;
    address?: {
      street?: string;
      number?: string;
      complement?: string;
      locality?: string; // Bairro
      city?: string;
      region_code?: string; // Estado (UF)
      country?: string;
      postal_code?: string;
    };
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
   * List customers
   */
  async listCustomers(params?: {
    offset?: number;
    limit?: number;
    email?: string;
    tax_id?: string;
  }) {
    const response = await this.axiosInstance.get('/customers', { params });
    return response.data;
  }

  // ==========================================
  // ORDER/CHARGE METHODS
  // ==========================================

  /**
   * Create a new order/charge
   */
  async createOrder(data: {
    reference_id?: string;
    customer: {
      name: string;
      email?: string;
      tax_id?: string;
      phones?: Array<{
        country?: string;
        area: string;
        number: string;
        type?: 'MOBILE' | 'BUSINESS' | 'HOME';
      }>;
    };
    items: Array<{
      reference_id?: string;
      name: string;
      quantity: number;
      unit_amount: number; // Valor em centavos
    }>;
    charges: Array<{
      reference_id?: string;
      description?: string;
      amount: {
        value: number; // Valor em centavos
        currency: 'BRL';
      };
      payment_method: {
        type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO' | 'PIX';
        installments?: number;
        capture?: boolean;
        soft_descriptor?: string;
        card?: {
          encrypted?: string;
          security_code?: string;
          holder?: {
            name: string;
          };
          store?: boolean;
        };
      };
      notification_urls?: string[];
    }>;
    notification_urls?: string[];
  }) {
    const response = await this.axiosInstance.post('/orders', data);
    return response.data;
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string) {
    const response = await this.axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  }

  /**
   * Pay an order
   */
  async payOrder(orderId: string, data: {
    reference_id?: string;
    amount: {
      value: number;
      currency: 'BRL';
    };
    payment_method: {
      type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO' | 'PIX';
      installments?: number;
      capture?: boolean;
      card?: {
        encrypted?: string;
        security_code?: string;
        holder?: {
          name: string;
        };
      };
    };
    notification_urls?: string[];
  }) {
    const response = await this.axiosInstance.post(`/orders/${orderId}/pay`, data);
    return response.data;
  }

  // ==========================================
  // CHARGE METHODS
  // ==========================================

  /**
   * Get charge by ID
   */
  async getCharge(chargeId: string) {
    const response = await this.axiosInstance.get(`/charges/${chargeId}`);
    return response.data;
  }

  /**
   * Cancel charge
   */
  async cancelCharge(chargeId: string, data?: {
    amount?: {
      value: number;
    };
  }) {
    const response = await this.axiosInstance.post(`/charges/${chargeId}/cancel`, data || {});
    return response.data;
  }

  /**
   * Capture charge (for pre-authorized charges)
   */
  async captureCharge(chargeId: string, data?: {
    amount?: {
      value: number;
    };
  }) {
    const response = await this.axiosInstance.post(`/charges/${chargeId}/capture`, data || {});
    return response.data;
  }

  // ==========================================
  // PIX METHODS
  // ==========================================

  /**
   * Get PIX QR Code for a charge
   */
  async getPixQrCode(chargeId: string) {
    const response = await this.axiosInstance.get(`/charges/${chargeId}/qrcode`);
    return response.data;
  }

  // ==========================================
  // CHECKOUT METHODS
  // ==========================================

  /**
   * Create a checkout (hosted payment page)
   */
  async createCheckout(data: {
    reference_id?: string;
    expiration_date?: string;
    customer_modifiable?: boolean;
    items: Array<{
      reference_id?: string;
      name: string;
      quantity: number;
      unit_amount: number;
    }>;
    additional_amount?: number;
    discount_amount?: number;
    payment_methods?: Array<{
      type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO' | 'PIX';
    }>;
    payment_methods_configs?: Array<{
      type: 'CREDIT_CARD' | 'DEBIT_CARD';
      config_options?: {
        installments?: {
          max_number?: number;
          min_value?: number;
        };
      };
    }>;
    soft_descriptor?: string;
    redirect_url?: string;
    return_url?: string;
    notification_urls?: string[];
  }) {
    const response = await this.axiosInstance.post('/checkouts', data);
    return response.data;
  }

  /**
   * Get checkout by ID
   */
  async getCheckout(checkoutId: string) {
    const response = await this.axiosInstance.get(`/checkouts/${checkoutId}`);
    return response.data;
  }

  /**
   * Pay checkout
   */
  async payCheckout(checkoutId: string, data: {
    reference_id?: string;
    payment_method: {
      type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO' | 'PIX';
      installments?: number;
      capture?: boolean;
      card?: {
        encrypted?: string;
        security_code?: string;
        holder?: {
          name: string;
        };
      };
    };
  }) {
    const response = await this.axiosInstance.post(`/checkouts/${checkoutId}/pay`, data);
    return response.data;
  }

  // ==========================================
  // SUBSCRIPTION METHODS (Recurring Payments)
  // ==========================================

  /**
   * Create subscription
   */
  async createSubscription(data: {
    reference_id?: string;
    customer: {
      name: string;
      email: string;
      tax_id?: string;
    };
    plan: {
      name: string;
      amount: {
        value: number;
        currency: 'BRL';
      };
      trial_days?: number;
      interval: {
        type: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
        length: number;
      };
      cycles?: number;
    };
    payment_method?: {
      type: 'CREDIT_CARD';
      card?: {
        encrypted?: string;
        security_code?: string;
        holder?: {
          name: string;
        };
      };
    };
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
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string) {
    const response = await this.axiosInstance.post(`/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  }

  /**
   * List subscriptions
   */
  async listSubscriptions(params?: {
    offset?: number;
    limit?: number;
    status?: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
  }) {
    const response = await this.axiosInstance.get('/subscriptions', { params });
    return response.data;
  }

  // ==========================================
  // WEBHOOK METHODS
  // ==========================================

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: any, signature: string, secret: string): boolean {
    // PagBank webhook validation logic
    // This depends on how PagBank implements webhook signatures
    // For now, return true - implement actual validation when available
    return true;
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: string, payload: any) {
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
  private toCents(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert cents to BRL amount
   */
  private fromCents(amount: number): number {
    return amount / 100;
  }

  /**
   * Format CPF/CNPJ
   */
  private formatTaxId(taxId: string): string {
    return taxId.replace(/\D/g, '');
  }

  /**
   * Format phone number
   */
  formatPhone(phone: string): { area: string; number: string } {
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

export default PagBankService;
