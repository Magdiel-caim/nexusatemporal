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
  private db = getAutomationDbPool();

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
      // Implementação básica - pode ser expandida para testar cada provider
      if (!config.api_key || config.api_key.length < 10) {
        return { success: false, message: 'API Key inválida' };
      }

      // Aqui você pode adicionar lógica específica para testar cada provider
      // Por exemplo, fazer uma chamada simples à API para validar a chave

      return { success: true, message: 'Configuração salva com sucesso' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }
}

export default new AIConfigService();
