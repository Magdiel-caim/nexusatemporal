"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationService = void 0;
const WahaService_1 = require("../../services/WahaService");
const OpenAIService_1 = require("../../services/OpenAIService");
const N8nService_1 = require("../../services/N8nService");
class IntegrationService {
    db;
    constructor(db) {
        this.db = db;
    }
    /**
     * Lista todas as integrações
     */
    async findAll(tenantId, type) {
        let query = `
      SELECT * FROM integrations
      WHERE tenant_id = $1
    `;
        const params = [tenantId];
        if (type) {
            params.push(type);
            query += ` AND type = $${params.length}`;
        }
        query += ` ORDER BY created_at DESC`;
        const result = await this.db.query(query, params);
        // Remove dados sensíveis das credenciais
        return result.rows.map(row => this.sanitizeCredentials(row));
    }
    /**
     * Busca integração por ID
     */
    async findById(id, tenantId) {
        const query = `
      SELECT * FROM integrations
      WHERE id = $1 AND tenant_id = $2
    `;
        const result = await this.db.query(query, [id, tenantId]);
        if (!result.rows[0]) {
            return null;
        }
        return this.sanitizeCredentials(result.rows[0]);
    }
    /**
     * Cria nova integração
     */
    async create(dto, tenantId) {
        const query = `
      INSERT INTO integrations (
        tenant_id, type, name, description, credentials, config, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const values = [
            tenantId,
            dto.type,
            dto.name,
            dto.description || null,
            JSON.stringify(dto.credentials),
            dto.config ? JSON.stringify(dto.config) : null,
            dto.is_active !== undefined ? dto.is_active : true
        ];
        const result = await this.db.query(query, values);
        return this.sanitizeCredentials(result.rows[0]);
    }
    /**
     * Atualiza integração
     */
    async update(id, dto, tenantId) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (dto.name !== undefined) {
            fields.push(`name = $${paramCount++}`);
            values.push(dto.name);
        }
        if (dto.description !== undefined) {
            fields.push(`description = $${paramCount++}`);
            values.push(dto.description);
        }
        if (dto.credentials !== undefined) {
            fields.push(`credentials = $${paramCount++}`);
            values.push(JSON.stringify(dto.credentials));
        }
        if (dto.config !== undefined) {
            fields.push(`config = $${paramCount++}`);
            values.push(JSON.stringify(dto.config));
        }
        if (dto.is_active !== undefined) {
            fields.push(`is_active = $${paramCount++}`);
            values.push(dto.is_active);
        }
        if (fields.length === 0) {
            return this.findById(id, tenantId);
        }
        fields.push(`updated_at = NOW()`);
        values.push(id, tenantId);
        const query = `
      UPDATE integrations
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++} AND tenant_id = $${paramCount++}
      RETURNING *
    `;
        const result = await this.db.query(query, values);
        if (!result.rows[0]) {
            return null;
        }
        return this.sanitizeCredentials(result.rows[0]);
    }
    /**
     * Deleta integração
     */
    async delete(id, tenantId) {
        const query = `
      DELETE FROM integrations
      WHERE id = $1 AND tenant_id = $2
    `;
        const result = await this.db.query(query, [id, tenantId]);
        return (result.rowCount || 0) > 0;
    }
    /**
     * Testa uma integração
     */
    async testIntegration(id, tenantId) {
        const integration = await this.findByIdWithCredentials(id, tenantId);
        if (!integration) {
            return {
                success: false,
                message: 'Integration not found',
                tested_at: new Date()
            };
        }
        let result;
        try {
            switch (integration.type) {
                case 'waha':
                    result = await this.testWaha(integration);
                    break;
                case 'n8n':
                    result = await this.testN8n(integration);
                    break;
                case 'openai':
                    result = await this.testOpenAI(integration);
                    break;
                case 'webhook':
                    result = await this.testWebhook(integration);
                    break;
                default:
                    result = {
                        success: false,
                        message: `Test not implemented for type: ${integration.type}`,
                        tested_at: new Date()
                    };
            }
        }
        catch (error) {
            result = {
                success: false,
                message: error.message,
                tested_at: new Date()
            };
        }
        // Atualiza status do teste no banco
        await this.updateTestStatus(id, result);
        return result;
    }
    /**
     * Testa integração WAHA
     */
    async testWaha(integration) {
        const creds = integration.credentials;
        if (!creds.waha_api_url || !creds.waha_api_key) {
            return {
                success: false,
                message: 'Missing WAHA credentials',
                tested_at: new Date()
            };
        }
        const wahaService = new WahaService_1.WahaService({
            apiUrl: creds.waha_api_url,
            apiKey: creds.waha_api_key,
            sessionName: creds.waha_session_name || 'default'
        });
        try {
            const status = await wahaService.getSessionStatus();
            return {
                success: true,
                message: `WAHA connection successful. Session status: ${status.status}`,
                details: { status: status.status, session: status.name },
                tested_at: new Date()
            };
        }
        catch (error) {
            return {
                success: false,
                message: `WAHA test failed: ${error.message}`,
                tested_at: new Date()
            };
        }
    }
    /**
     * Testa integração n8n
     */
    async testN8n(integration) {
        const creds = integration.credentials;
        if (!creds.n8n_api_url || !creds.n8n_api_key) {
            return {
                success: false,
                message: 'Missing n8n credentials',
                tested_at: new Date()
            };
        }
        const n8nService = new N8nService_1.N8nService({
            apiUrl: creds.n8n_api_url,
            apiKey: creds.n8n_api_key
        });
        try {
            const isHealthy = await n8nService.healthCheck();
            if (isHealthy) {
                const workflows = await n8nService.listWorkflows();
                return {
                    success: true,
                    message: `n8n connection successful. Found ${workflows.length} workflows.`,
                    details: { workflowCount: workflows.length },
                    tested_at: new Date()
                };
            }
            else {
                return {
                    success: false,
                    message: 'n8n health check failed',
                    tested_at: new Date()
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: `n8n test failed: ${error.message}`,
                tested_at: new Date()
            };
        }
    }
    /**
     * Testa integração OpenAI
     */
    async testOpenAI(integration) {
        const creds = integration.credentials;
        if (!creds.openai_api_key) {
            return {
                success: false,
                message: 'Missing OpenAI API key',
                tested_at: new Date()
            };
        }
        const openaiService = new OpenAIService_1.OpenAIService({
            apiKey: creds.openai_api_key,
            organization: creds.openai_organization,
            model: creds.openai_model
        });
        try {
            const response = await openaiService.generateText({
                prompt: 'Say "Hello" in one word.',
                maxTokens: 10
            });
            if (response.success) {
                return {
                    success: true,
                    message: 'OpenAI connection successful',
                    details: { model: response.model, tokensUsed: response.tokensUsed },
                    tested_at: new Date()
                };
            }
            else {
                return {
                    success: false,
                    message: `OpenAI test failed: ${response.error}`,
                    tested_at: new Date()
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: `OpenAI test failed: ${error.message}`,
                tested_at: new Date()
            };
        }
    }
    /**
     * Testa webhook
     */
    async testWebhook(integration) {
        const creds = integration.credentials;
        if (!creds.webhook_url) {
            return {
                success: false,
                message: 'Missing webhook URL',
                tested_at: new Date()
            };
        }
        // TODO: Implementar teste de webhook (fazer POST com payload de teste)
        return {
            success: true,
            message: 'Webhook test not fully implemented yet',
            tested_at: new Date()
        };
    }
    /**
     * Atualiza status do teste
     */
    async updateTestStatus(id, result) {
        const query = `
      UPDATE integrations
      SET
        last_tested_at = $1,
        test_status = $2,
        test_message = $3,
        updated_at = NOW()
      WHERE id = $4
    `;
        await this.db.query(query, [
            result.tested_at,
            result.success ? 'success' : 'failed',
            result.message,
            id
        ]);
    }
    /**
     * Busca integração com credenciais completas (uso interno)
     */
    async findByIdWithCredentials(id, tenantId) {
        const query = `
      SELECT * FROM integrations
      WHERE id = $1 AND tenant_id = $2
    `;
        const result = await this.db.query(query, [id, tenantId]);
        return result.rows[0] || null;
    }
    /**
     * Remove dados sensíveis das credenciais
     */
    sanitizeCredentials(integration) {
        const sanitized = { ...integration };
        if (sanitized.credentials) {
            const creds = { ...sanitized.credentials };
            // Mascara API keys
            if (creds.waha_api_key) {
                creds.waha_api_key = this.maskApiKey(creds.waha_api_key);
            }
            if (creds.n8n_api_key) {
                creds.n8n_api_key = this.maskApiKey(creds.n8n_api_key);
            }
            if (creds.openai_api_key) {
                creds.openai_api_key = this.maskApiKey(creds.openai_api_key);
            }
            if (creds.notificame_api_key) {
                creds.notificame_api_key = this.maskApiKey(creds.notificame_api_key);
            }
            if (creds.webhook_secret) {
                creds.webhook_secret = this.maskApiKey(creds.webhook_secret);
            }
            sanitized.credentials = creds;
        }
        return sanitized;
    }
    /**
     * Mascara API key (mostra apenas os últimos 4 caracteres)
     */
    maskApiKey(apiKey) {
        if (!apiKey || apiKey.length < 8) {
            return '****';
        }
        return '****' + apiKey.slice(-4);
    }
}
exports.IntegrationService = IntegrationService;
//# sourceMappingURL=integration.service.js.map