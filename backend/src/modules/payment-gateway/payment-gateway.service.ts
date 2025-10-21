/**
 * Payment Gateway Service
 *
 * Main service that manages payment gateway configurations and operations
 */

import { Pool } from 'pg';
import { PaymentConfig, PaymentGateway } from './payment-config.entity';
import { PaymentCustomer } from './payment-customer.entity';
import { PaymentCharge } from './payment-charge.entity';
import { PaymentWebhook } from './payment-webhook.entity';
import { AsaasService } from './asaas.service';
import { PagBankService } from './pagbank.service';
import crypto from 'crypto';

export class PaymentGatewayService {
  constructor(private pool: Pool) {}

  // ==========================================
  // CONFIGURATION METHODS
  // ==========================================

  /**
   * Create or update payment gateway configuration
   */
  async saveConfig(
    tenantId: string,
    userId: string,
    data: {
      gateway: 'asaas' | 'pagbank';
      environment: 'production' | 'sandbox';
      apiKey: string;
      apiSecret?: string;
      webhookSecret?: string;
      isActive: boolean;
      config: any;
    }
  ): Promise<PaymentConfig> {
    // Encrypt sensitive data
    const encryptedApiKey = this.encrypt(data.apiKey);
    const encryptedApiSecret = data.apiSecret ? this.encrypt(data.apiSecret) : null;

    const query = `
      INSERT INTO payment_configs (
        "tenantId", gateway, environment, "apiKey", "apiSecret",
        "webhookSecret", "isActive", config, "createdBy", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      ON CONFLICT ("tenantId", gateway, environment)
      DO UPDATE SET
        "apiKey" = EXCLUDED."apiKey",
        "apiSecret" = EXCLUDED."apiSecret",
        "webhookSecret" = EXCLUDED."webhookSecret",
        "isActive" = EXCLUDED."isActive",
        config = EXCLUDED.config,
        "updatedBy" = $9,
        "updatedAt" = NOW()
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      tenantId,
      data.gateway,
      data.environment,
      encryptedApiKey,
      encryptedApiSecret,
      data.webhookSecret,
      data.isActive,
      JSON.stringify(data.config),
      userId,
    ]);

    const config = result.rows[0];
    // Decrypt before returning
    config.apiKey = this.decrypt(config.apiKey);
    if (config.apiSecret) {
      config.apiSecret = this.decrypt(config.apiSecret);
    }

    return config;
  }

  /**
   * Get payment gateway configuration
   */
  async getConfig(
    tenantId: string,
    gateway: 'asaas' | 'pagbank',
    environment: 'production' | 'sandbox'
  ): Promise<PaymentConfig | null> {
    const query = `
      SELECT * FROM payment_configs
      WHERE "tenantId" = $1 AND gateway = $2 AND environment = $3
    `;

    const result = await this.pool.query(query, [tenantId, gateway, environment]);

    if (result.rows.length === 0) {
      return null;
    }

    const config = result.rows[0];
    // Decrypt sensitive data
    config.apiKey = this.decrypt(config.apiKey);
    if (config.apiSecret) {
      config.apiSecret = this.decrypt(config.apiSecret);
    }

    return config;
  }

  /**
   * Get active configuration for a gateway
   */
  async getActiveConfig(tenantId: string, gateway: 'asaas' | 'pagbank'): Promise<PaymentConfig | null> {
    const query = `
      SELECT * FROM payment_configs
      WHERE "tenantId" = $1 AND gateway = $2 AND "isActive" = true
      ORDER BY environment DESC -- Prefer production over sandbox
      LIMIT 1
    `;

    const result = await this.pool.query(query, [tenantId, gateway]);

    if (result.rows.length === 0) {
      return null;
    }

    const config = result.rows[0];
    config.apiKey = this.decrypt(config.apiKey);
    if (config.apiSecret) {
      config.apiSecret = this.decrypt(config.apiSecret);
    }

    return config;
  }

  /**
   * List all configurations for a tenant
   */
  async listConfigs(tenantId: string): Promise<PaymentConfig[]> {
    const query = `
      SELECT * FROM payment_configs
      WHERE "tenantId" = $1
      ORDER BY gateway, environment
    `;

    const result = await this.pool.query(query, [tenantId]);

    return result.rows.map((config: any) => {
      // Don't decrypt for list view - just mask
      config.apiKey = this.maskApiKey(config.apiKey);
      if (config.apiSecret) {
        config.apiSecret = this.maskApiKey(config.apiSecret);
      }
      return config;
    });
  }

  /**
   * Delete configuration
   */
  async deleteConfig(tenantId: string, gateway: 'asaas' | 'pagbank', environment: 'production' | 'sandbox'): Promise<void> {
    const query = `
      DELETE FROM payment_configs
      WHERE "tenantId" = $1 AND gateway = $2 AND environment = $3
    `;

    await this.pool.query(query, [tenantId, gateway, environment]);
  }

  // ==========================================
  // GATEWAY SERVICE INSTANCES
  // ==========================================

  /**
   * Get Asaas service instance
   */
  async getAsaasService(tenantId: string, environment?: 'production' | 'sandbox'): Promise<AsaasService> {
    let config: PaymentConfig | null;

    if (environment) {
      config = await this.getConfig(tenantId, 'asaas', environment);
    } else {
      config = await this.getActiveConfig(tenantId, 'asaas');
    }

    if (!config) {
      throw new Error('Asaas configuration not found. Please configure your API key first.');
    }

    if (!config.isActive) {
      throw new Error('Asaas integration is not active.');
    }

    return new AsaasService(config);
  }

  /**
   * Get PagBank service instance
   */
  async getPagBankService(tenantId: string, environment?: 'production' | 'sandbox'): Promise<PagBankService> {
    let config: PaymentConfig | null;

    if (environment) {
      config = await this.getConfig(tenantId, 'pagbank', environment);
    } else {
      config = await this.getActiveConfig(tenantId, 'pagbank');
    }

    if (!config) {
      throw new Error('PagBank configuration not found. Please configure your API key first.');
    }

    if (!config.isActive) {
      throw new Error('PagBank integration is not active.');
    }

    return new PagBankService(config);
  }

  // ==========================================
  // CUSTOMER METHODS
  // ==========================================

  /**
   * Create or sync customer with payment gateway
   */
  async syncCustomer(
    tenantId: string,
    gateway: 'asaas' | 'pagbank',
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
    // Get gateway service
    let gatewayCustomerId: string;

    if (gateway === 'asaas') {
      const asaasService = await this.getAsaasService(tenantId);
      const response = await asaasService.createCustomer({
        name: data.name,
        cpfCnpj: data.cpfCnpj,
        email: data.email,
        phone: data.phone,
        mobilePhone: data.mobilePhone,
        address: data.address,
        addressNumber: data.addressNumber,
        complement: data.complement,
        province: data.province,
        postalCode: data.postalCode?.replace(/\D/g, ''),
        externalReference: data.externalReference,
        observations: data.observations,
      });
      gatewayCustomerId = response.id;
    } else if (gateway === 'pagbank') {
      const pagbankService = await this.getPagBankService(tenantId);

      // Format phone for PagBank
      const phones = [];
      if (data.mobilePhone) {
        const phoneData = pagbankService.formatPhone(data.mobilePhone);
        phones.push({
          country: '55',
          area: phoneData.area,
          number: phoneData.number,
          type: 'MOBILE' as const,
        });
      }

      const response = await pagbankService.createCustomer({
        name: data.name,
        email: data.email,
        tax_id: data.cpfCnpj?.replace(/\D/g, ''),
        phones: phones.length > 0 ? phones : undefined,
        address: data.address ? {
          street: data.address,
          number: data.addressNumber,
          complement: data.complement,
          locality: data.province,
          city: data.city,
          region_code: data.state,
          country: 'BRA',
          postal_code: data.postalCode?.replace(/\D/g, ''),
        } : undefined,
      });
      gatewayCustomerId = response.id;
    } else {
      throw new Error(`Gateway ${gateway} not implemented yet`);
    }

    // Save to database
    const query = `
      INSERT INTO payment_customers (
        "tenantId", gateway, "leadId", name, email, "cpfCnpj", phone,
        "mobilePhone", address, "addressNumber", complement, province,
        "postalCode", city, state, "gatewayCustomerId", "externalReference",
        observations, "createdAt", "updatedAt", "syncedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        NOW(), NOW(), NOW()
      )
      ON CONFLICT ("tenantId", gateway, "gatewayCustomerId")
      DO UPDATE SET
        "leadId" = EXCLUDED."leadId",
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        "cpfCnpj" = EXCLUDED."cpfCnpj",
        phone = EXCLUDED.phone,
        "mobilePhone" = EXCLUDED."mobilePhone",
        address = EXCLUDED.address,
        "addressNumber" = EXCLUDED."addressNumber",
        complement = EXCLUDED.complement,
        province = EXCLUDED.province,
        "postalCode" = EXCLUDED."postalCode",
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        "externalReference" = EXCLUDED."externalReference",
        observations = EXCLUDED.observations,
        "updatedAt" = NOW(),
        "syncedAt" = NOW()
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      tenantId,
      gateway,
      data.leadId || null,
      data.name,
      data.email || null,
      data.cpfCnpj || null,
      data.phone || null,
      data.mobilePhone || null,
      data.address || null,
      data.addressNumber || null,
      data.complement || null,
      data.province || null,
      data.postalCode || null,
      data.city || null,
      data.state || null,
      gatewayCustomerId,
      data.externalReference || null,
      data.observations || null,
    ]);

    return result.rows[0];
  }

  /**
   * Get customer by lead ID
   */
  async getCustomerByLeadId(tenantId: string, gateway: 'asaas' | 'pagbank', leadId: string): Promise<PaymentCustomer | null> {
    const query = `
      SELECT * FROM payment_customers
      WHERE "tenantId" = $1 AND gateway = $2 AND "leadId" = $3
      ORDER BY "syncedAt" DESC
      LIMIT 1
    `;

    const result = await this.pool.query(query, [tenantId, gateway, leadId]);
    return result.rows[0] || null;
  }

  // ==========================================
  // ENCRYPTION HELPERS
  // ==========================================

  private encrypt(text: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-me', 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-me', 'salt', 32);

    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) return '****';
    return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
  }
}

export default PaymentGatewayService;
