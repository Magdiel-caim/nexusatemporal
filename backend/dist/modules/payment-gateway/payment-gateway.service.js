"use strict";
/**
 * Payment Gateway Service
 *
 * Main service that manages payment gateway configurations and operations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayService = void 0;
const asaas_service_1 = require("./asaas.service");
const crypto_1 = __importDefault(require("crypto"));
class PaymentGatewayService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    // ==========================================
    // CONFIGURATION METHODS
    // ==========================================
    /**
     * Create or update payment gateway configuration
     */
    async saveConfig(tenantId, userId, data) {
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
    async getConfig(tenantId, gateway, environment) {
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
    async getActiveConfig(tenantId, gateway) {
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
    async listConfigs(tenantId) {
        const query = `
      SELECT * FROM payment_configs
      WHERE "tenantId" = $1
      ORDER BY gateway, environment
    `;
        const result = await this.pool.query(query, [tenantId]);
        return result.rows.map((config) => {
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
    async deleteConfig(tenantId, gateway, environment) {
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
    async getAsaasService(tenantId, environment) {
        let config;
        if (environment) {
            config = await this.getConfig(tenantId, 'asaas', environment);
        }
        else {
            config = await this.getActiveConfig(tenantId, 'asaas');
        }
        if (!config) {
            throw new Error('Asaas configuration not found. Please configure your API key first.');
        }
        if (!config.isActive) {
            throw new Error('Asaas integration is not active.');
        }
        return new asaas_service_1.AsaasService(config);
    }
    // ==========================================
    // CUSTOMER METHODS
    // ==========================================
    /**
     * Create or sync customer with payment gateway
     */
    async syncCustomer(tenantId, gateway, data) {
        // Get gateway service
        let gatewayCustomerId;
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
        }
        else {
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
    async getCustomerByLeadId(tenantId, gateway, leadId) {
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
    encrypt(text) {
        const algorithm = 'aes-256-cbc';
        const key = crypto_1.default.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-me', 'salt', 32);
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    decrypt(text) {
        const algorithm = 'aes-256-cbc';
        const key = crypto_1.default.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-me', 'salt', 32);
        const parts = text.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    maskApiKey(apiKey) {
        if (apiKey.length <= 8)
            return '****';
        return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
    }
}
exports.PaymentGatewayService = PaymentGatewayService;
exports.default = PaymentGatewayService;
//# sourceMappingURL=payment-gateway.service.js.map