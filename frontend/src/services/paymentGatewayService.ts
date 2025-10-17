import api from './api';

export type PaymentGateway = 'asaas' | 'pagbank';
export type Environment = 'production' | 'sandbox';

export interface PaymentConfig {
  id: string;
  tenantId: string;
  gateway: PaymentGateway;
  environment: Environment;
  apiKey: string;
  apiSecret?: string;
  webhookSecret?: string;
  isActive: boolean;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PaymentCustomer {
  id: string;
  tenantId: string;
  gateway: PaymentGateway;
  leadId?: string;
  name: string;
  email?: string;
  cpfCnpj?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  gatewayCustomerId: string;
  externalReference?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

export interface PaymentCharge {
  id: string;
  tenantId: string;
  gateway: PaymentGateway;
  gatewayChargeId: string;
  gatewayCustomerId: string;
  leadId?: string;
  transactionId?: string;
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UNDEFINED';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  status: string;
  paymentDate?: string;
  confirmedDate?: string;
  creditDate?: string;
  estimatedCreditDate?: string;
  discount?: any;
  fine?: any;
  interest?: any;
  bankSlipUrl?: string;
  invoiceUrl?: string;
  invoiceNumber?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  creditCardToken?: string;
  refundedValue?: number;
  refundedDate?: string;
  refundReason?: string;
  webhookReceived: boolean;
  lastWebhookAt?: string;
  rawResponse?: any;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

class PaymentGatewayService {
  // ==========================================
  // CONFIGURATION METHODS
  // ==========================================

  /**
   * Save payment gateway configuration
   */
  async saveConfig(data: {
    gateway: PaymentGateway;
    environment: Environment;
    apiKey: string;
    apiSecret?: string;
    webhookSecret?: string;
    isActive: boolean;
    config?: Record<string, any>;
  }): Promise<PaymentConfig> {
    const { data: response } = await api.post('/payment-gateway/config', {
      ...data,
      config: data.config || {},
    });
    return response.data;
  }

  /**
   * Get configuration for a specific gateway and environment
   */
  async getConfig(gateway: PaymentGateway, environment: Environment): Promise<PaymentConfig | null> {
    try {
      const { data: response } = await api.get(
        `/payment-gateway/config/${gateway}/${environment}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get active configuration for a gateway
   */
  async getActiveConfig(gateway: PaymentGateway): Promise<PaymentConfig | null> {
    try {
      const { data: response } = await api.get(`/payment-gateway/config/${gateway}/active`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all configurations
   */
  async listConfigs(): Promise<PaymentConfig[]> {
    const { data: response } = await api.get('/payment-gateway/config');
    return response.data;
  }

  /**
   * Delete configuration
   */
  async deleteConfig(gateway: PaymentGateway, environment: Environment): Promise<void> {
    await api.delete(`/payment-gateway/config/${gateway}/${environment}`);
  }

  // ==========================================
  // CUSTOMER METHODS
  // ==========================================

  /**
   * Create or sync customer with payment gateway
   */
  async syncCustomer(
    gateway: PaymentGateway,
    data: {
      leadId?: string;
      name: string;
      email?: string;
      cpfCnpj?: string;
      phone?: string;
      mobilePhone?: string;
      address?: string;
      addressNumber?: string;
      complement?: string;
      province?: string;
      postalCode?: string;
      city?: string;
      state?: string;
      externalReference?: string;
      observations?: string;
    }
  ): Promise<PaymentCustomer> {
    const { data: response } = await api.post(`/payment-gateway/${gateway}/customers`, data);
    return response.data;
  }

  /**
   * Get customer by lead ID
   */
  async getCustomerByLeadId(gateway: PaymentGateway, leadId: string): Promise<PaymentCustomer | null> {
    try {
      const { data: response } = await api.get(`/payment-gateway/${gateway}/customers/lead/${leadId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // ==========================================
  // CHARGE METHODS
  // ==========================================

  /**
   * Create a payment charge
   */
  async createCharge(
    gateway: PaymentGateway,
    data: {
      customerId: string;
      billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';
      value: number;
      dueDate: string;
      description?: string;
      externalReference?: string;
      discount?: any;
      fine?: any;
      interest?: any;
    }
  ): Promise<PaymentCharge> {
    const { data: response } = await api.post(`/payment-gateway/${gateway}/charges`, data);
    return response.data;
  }

  /**
   * Get charge by ID
   */
  async getCharge(gateway: PaymentGateway, chargeId: string): Promise<PaymentCharge> {
    const { data: response } = await api.get(`/payment-gateway/${gateway}/charges/${chargeId}`);
    return response.data;
  }

  /**
   * List charges
   */
  async listCharges(gateway: PaymentGateway, filters?: {
    leadId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaymentCharge[]> {
    const params = new URLSearchParams();
    if (filters?.leadId) params.append('leadId', filters.leadId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const { data: response } = await api.get(
      `/payment-gateway/${gateway}/charges?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Cancel charge
   */
  async cancelCharge(gateway: PaymentGateway, chargeId: string): Promise<PaymentCharge> {
    const { data: response } = await api.post(
      `/payment-gateway/${gateway}/charges/${chargeId}/cancel`
    );
    return response.data;
  }

  /**
   * Refund charge
   */
  async refundCharge(
    gateway: PaymentGateway,
    chargeId: string,
    data?: {
      value?: number;
      description?: string;
    }
  ): Promise<PaymentCharge> {
    const { data: response } = await api.post(
      `/payment-gateway/${gateway}/charges/${chargeId}/refund`,
      data || {}
    );
    return response.data;
  }

  // ==========================================
  // PIX METHODS
  // ==========================================

  /**
   * Get PIX QR Code for a charge
   */
  async getPixQrCode(gateway: PaymentGateway, chargeId: string): Promise<{
    qrCode: string;
    copyPaste: string;
  }> {
    const { data: response } = await api.get(
      `/payment-gateway/${gateway}/charges/${chargeId}/pix-qrcode`
    );
    return response.data;
  }

  // ==========================================
  // WEBHOOK METHODS
  // ==========================================

  /**
   * Get webhook URL for a gateway
   */
  getWebhookUrl(gateway: PaymentGateway): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.nexusatemporal.com.br';
    return `${baseUrl}/payment-gateway/webhook/${gateway}`;
  }

  /**
   * Test webhook configuration
   */
  async testWebhook(gateway: PaymentGateway): Promise<{ success: boolean; message: string }> {
    const { data: response } = await api.post(`/payment-gateway/${gateway}/webhook/test`);
    return response.data;
  }
}

export default new PaymentGatewayService();
