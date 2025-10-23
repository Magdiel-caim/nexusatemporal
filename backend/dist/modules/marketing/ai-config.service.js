"use strict";
/**
 * AI Configuration Service
 *
 * Serviço para gerenciar configurações de múltiplas IAs
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIConfigService = void 0;
const database_1 = require("../marketing/automation/database");
class AIConfigService {
    get db() {
        return (0, database_1.getAutomationDbPool)();
    }
    /**
     * Inicializa a tabela de configurações de IA
     */
    async ensureTable() {
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ai_configs (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        api_key TEXT NOT NULL,
        model VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, provider)
      );

      CREATE INDEX IF NOT EXISTS idx_ai_configs_tenant ON ai_configs(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_ai_configs_provider ON ai_configs(provider);
    `;
        await this.db.query(createTableQuery);
    }
    /**
     * Lista todas as configurações de IA de um tenant
     */
    async listConfigs(tenantId) {
        await this.ensureTable();
        const query = `
      SELECT
        id,
        tenant_id,
        provider,
        model,
        is_active,
        created_at,
        updated_at,
        CONCAT(SUBSTRING(api_key, 1, 8), '...') as api_key
      FROM ai_configs
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `;
        const result = await this.db.query(query, [tenantId]);
        return result.rows;
    }
    /**
     * Obtém uma configuração de IA por provider
     */
    async getConfig(tenantId, provider) {
        await this.ensureTable();
        const query = `
      SELECT *
      FROM ai_configs
      WHERE tenant_id = $1 AND provider = $2
      LIMIT 1
    `;
        const result = await this.db.query(query, [tenantId, provider]);
        return result.rows[0] || null;
    }
    /**
     * Cria ou atualiza uma configuração de IA
     */
    async upsertConfig(config) {
        await this.ensureTable();
        const query = `
      INSERT INTO ai_configs (tenant_id, provider, api_key, model, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (tenant_id, provider)
      DO UPDATE SET
        api_key = EXCLUDED.api_key,
        model = EXCLUDED.model,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
        const result = await this.db.query(query, [
            config.tenant_id,
            config.provider,
            config.api_key,
            config.model,
            config.is_active,
        ]);
        return result.rows[0];
    }
    /**
     * Deleta uma configuração de IA
     */
    async deleteConfig(tenantId, provider) {
        await this.ensureTable();
        const query = `
      DELETE FROM ai_configs
      WHERE tenant_id = $1 AND provider = $2
    `;
        const result = await this.db.query(query, [tenantId, provider]);
        return (result.rowCount || 0) > 0;
    }
    /**
     * Obtém a API key completa para uso (sem mascaramento)
     */
    async getApiKey(tenantId, provider) {
        const config = await this.getConfig(tenantId, provider);
        return config?.api_key || null;
    }
    /**
     * Testa a conexão com uma IA
     */
    async testConnection(config) {
        try {
            if (!config.api_key || config.api_key.length < 10) {
                return { success: false, message: 'API Key inválida' };
            }
            switch (config.provider.toLowerCase()) {
                case 'openai':
                    return await this.testOpenAI(config);
                case 'anthropic':
                    return await this.testAnthropic(config);
                case 'google':
                case 'gemini':
                    return await this.testGemini(config);
                case 'groq':
                    return await this.testGroq(config);
                case 'openrouter':
                    return await this.testOpenRouter(config);
                default:
                    return { success: false, message: `Provedor ${config.provider} não suportado` };
            }
        }
        catch (error) {
            return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido' };
        }
    }
    async testOpenAI(config) {
        try {
            const OpenAI = (await Promise.resolve().then(() => __importStar(require('openai')))).default;
            const openai = new OpenAI({ apiKey: config.api_key });
            await openai.models.list();
            return { success: true, message: 'Conexão com OpenAI bem-sucedida!' };
        }
        catch (error) {
            return { success: false, message: `Erro OpenAI: ${error.message}` };
        }
    }
    async testAnthropic(config) {
        try {
            const Anthropic = (await Promise.resolve().then(() => __importStar(require('@anthropic-ai/sdk')))).default;
            const anthropic = new Anthropic({ apiKey: config.api_key });
            await anthropic.messages.create({
                model: config.model || 'claude-3-5-haiku-20241022',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Hi' }],
            });
            return { success: true, message: 'Conexão com Claude (Anthropic) bem-sucedida!' };
        }
        catch (error) {
            return { success: false, message: `Erro Anthropic: ${error.message}` };
        }
    }
    async testGemini(config) {
        try {
            const { GoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@google/generative-ai')));
            const genAI = new GoogleGenerativeAI(config.api_key);
            const model = genAI.getGenerativeModel({ model: config.model || 'gemini-1.5-flash' });
            await model.generateContent('Hi');
            return { success: true, message: 'Conexão com Google Gemini bem-sucedida!' };
        }
        catch (error) {
            return { success: false, message: `Erro Gemini: ${error.message}` };
        }
    }
    async testGroq(config) {
        try {
            const Groq = (await Promise.resolve().then(() => __importStar(require('groq-sdk')))).default;
            const groq = new Groq({ apiKey: config.api_key });
            await groq.chat.completions.create({
                model: config.model || 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'Hi' }],
                max_tokens: 10,
            });
            return { success: true, message: 'Conexão com Groq bem-sucedida!' };
        }
        catch (error) {
            return { success: false, message: `Erro Groq: ${error.message}` };
        }
    }
    async testOpenRouter(config) {
        try {
            const OpenAI = (await Promise.resolve().then(() => __importStar(require('openai')))).default;
            const openrouter = new OpenAI({
                baseURL: 'https://openrouter.ai/api/v1',
                apiKey: config.api_key,
                defaultHeaders: {
                    'HTTP-Referer': 'https://nexus-crm.com',
                    'X-Title': 'Nexus CRM',
                },
            });
            await openrouter.chat.completions.create({
                model: config.model || 'google/gemini-2.0-flash-001:free',
                messages: [{ role: 'user', content: 'Hi' }],
                max_tokens: 10,
            });
            return { success: true, message: 'Conexão com OpenRouter bem-sucedida!' };
        }
        catch (error) {
            return { success: false, message: `Erro OpenRouter: ${error.message}` };
        }
    }
}
exports.AIConfigService = AIConfigService;
// Export a singleton instance (lazy initialization)
let instance = null;
exports.default = {
    getInstance() {
        if (!instance) {
            instance = new AIConfigService();
        }
        return instance;
    },
};
//# sourceMappingURL=ai-config.service.js.map