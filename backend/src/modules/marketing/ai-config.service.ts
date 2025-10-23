/**
 * AI Configuration Service
 *
 * Serviço para gerenciar configurações de múltiplas IAs
 */

import { getAutomationDbPool } from '../marketing/automation/database';

export interface AIConfig {
  id?: number;
  tenant_id: string;
  provider: string; // openai, anthropic, google, groq, openrouter
  api_key: string;
  model: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class AIConfigService {
  private get db() {
    return getAutomationDbPool();
  }

  /**
   * Inicializa a tabela de configurações de IA
   */
  async ensureTable(): Promise<void> {
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
  async listConfigs(tenantId: string): Promise<AIConfig[]> {
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
  async getConfig(tenantId: string, provider: string): Promise<AIConfig | null> {
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
  async upsertConfig(config: AIConfig): Promise<AIConfig> {
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
  async deleteConfig(tenantId: string, provider: string): Promise<boolean> {
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
  async getApiKey(tenantId: string, provider: string): Promise<string | null> {
    const config = await this.getConfig(tenantId, provider);
    return config?.api_key || null;
  }

  /**
   * Testa a conexão com uma IA
   */
  async testConnection(config: AIConfig): Promise<{ success: boolean; message: string }> {
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
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  private async testOpenAI(config: AIConfig): Promise<{ success: boolean; message: string }> {
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: config.api_key });
      await openai.models.list();
      return { success: true, message: 'Conexão com OpenAI bem-sucedida!' };
    } catch (error: any) {
      return { success: false, message: `Erro OpenAI: ${error.message}` };
    }
  }

  private async testAnthropic(config: AIConfig): Promise<{ success: boolean; message: string }> {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic({ apiKey: config.api_key });
      await anthropic.messages.create({
        model: config.model || 'claude-3-5-haiku-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return { success: true, message: 'Conexão com Claude (Anthropic) bem-sucedida!' };
    } catch (error: any) {
      return { success: false, message: `Erro Anthropic: ${error.message}` };
    }
  }

  private async testGemini(config: AIConfig): Promise<{ success: boolean; message: string }> {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.api_key);
      const model = genAI.getGenerativeModel({ model: config.model || 'gemini-1.5-flash' });
      await model.generateContent('Hi');
      return { success: true, message: 'Conexão com Google Gemini bem-sucedida!' };
    } catch (error: any) {
      return { success: false, message: `Erro Gemini: ${error.message}` };
    }
  }

  private async testGroq(config: AIConfig): Promise<{ success: boolean; message: string }> {
    try {
      const Groq = (await import('groq-sdk')).default;
      const groq = new Groq({ apiKey: config.api_key });
      await groq.chat.completions.create({
        model: config.model || 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10,
      });
      return { success: true, message: 'Conexão com Groq bem-sucedida!' };
    } catch (error: any) {
      return { success: false, message: `Erro Groq: ${error.message}` };
    }
  }

  private async testOpenRouter(config: AIConfig): Promise<{ success: boolean; message: string }> {
    try {
      const OpenAI = (await import('openai')).default;
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
    } catch (error: any) {
      return { success: false, message: `Erro OpenRouter: ${error.message}` };
    }
  }
}

// Export a singleton instance (lazy initialization)
let instance: AIConfigService | null = null;

export default {
  getInstance(): AIConfigService {
    if (!instance) {
      instance = new AIConfigService();
    }
    return instance;
  },
};
