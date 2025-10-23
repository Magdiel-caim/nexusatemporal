import { Pool } from 'pg';
import {
  Integration,
  CreateIntegrationDTO,
  UpdateIntegrationDTO,
  TestIntegrationResult
} from './integration.entity';
import { WahaService } from '@/services/WahaService';
import { OpenAIService } from '@/services/OpenAIService';
import { N8nService } from '@/services/N8nService';

export class IntegrationService {
  constructor(private db: Pool) {}

  /**
   * Transforma dados do banco (snake_case) para formato da interface (camelCase)
   */
  private transformIntegration(row: any): Integration {
    return {
      id: row.id,
      tenant_id: row.tenant_id,
      type: row.integration_type,
      name: row.name,
      description: row.description,
      credentials: typeof row.credentials === 'string' ? JSON.parse(row.credentials) : row.credentials,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      is_active: row.status === 'active',
      last_tested_at: row.last_tested_at,
      test_status: row.test_status,
      test_message: row.test_message,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  /**
   * Lista todas as integrações
   */
  async findAll(tenantId: string, type?: string): Promise<Integration[]> {
    let query = `
      SELECT * FROM integrations
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];

    if (type) {
      params.push(type);
      query += ` AND integration_type = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.db.query(query, params);

    // Transforma e remove dados sensíveis das credenciais
    return result.rows.map(row => this.sanitizeCredentials(this.transformIntegration(row)));
  }

  /**
   * Busca integração por ID
   */
  async findById(id: string, tenantId: string): Promise<Integration | null> {
    const query = `
      SELECT * FROM integrations
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await this.db.query(query, [id, tenantId]);

    if (!result.rows[0]) {
      return null;
    }

    return this.sanitizeCredentials(this.transformIntegration(result.rows[0]));
  }

  /**
   * Cria nova integração
   */
  async create(dto: CreateIntegrationDTO, tenantId: string): Promise<Integration> {
    const query = `
      INSERT INTO integrations (
        tenant_id, integration_type, name, status, credentials, config
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      tenantId,
      dto.type,
      dto.name,
      dto.is_active !== undefined ? (dto.is_active ? 'active' : 'inactive') : 'active',
      JSON.stringify(dto.credentials),
      dto.config ? JSON.stringify(dto.config) : '{}'
    ];

    const result = await this.db.query(query, values);
    return this.sanitizeCredentials(this.transformIntegration(result.rows[0]));
  }

  /**
   * Atualiza integração
   */
  async update(
    id: string,
    dto: UpdateIntegrationDTO,
    tenantId: string
  ): Promise<Integration | null> {
    const fields: string[] = [];
    const values: any[] = [];
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
      fields.push(`status = $${paramCount++}`);
      values.push(dto.is_active ? 'active' : 'inactive');
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

    return this.sanitizeCredentials(this.transformIntegration(result.rows[0]));
  }

  /**
   * Deleta integração
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
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
  async testIntegration(id: string, tenantId: string): Promise<TestIntegrationResult> {
    const integration = await this.findByIdWithCredentials(id, tenantId);

    if (!integration) {
      return {
        success: false,
        message: 'Integration not found',
        tested_at: new Date()
      };
    }

    let result: TestIntegrationResult;

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
        case 'notificame':
          result = await this.testNotificaMe(integration);
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
    } catch (error: any) {
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
  private async testWaha(integration: Integration): Promise<TestIntegrationResult> {
    const creds = integration.credentials;

    if (!creds.waha_api_url || !creds.waha_api_key) {
      return {
        success: false,
        message: 'Missing WAHA credentials',
        tested_at: new Date()
      };
    }

    const wahaService = new WahaService({
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
    } catch (error: any) {
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
  private async testN8n(integration: Integration): Promise<TestIntegrationResult> {
    const creds = integration.credentials;

    if (!creds.n8n_api_url || !creds.n8n_api_key) {
      return {
        success: false,
        message: 'Missing n8n credentials',
        tested_at: new Date()
      };
    }

    const n8nService = new N8nService({
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
      } else {
        return {
          success: false,
          message: 'n8n health check failed',
          tested_at: new Date()
        };
      }
    } catch (error: any) {
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
  private async testOpenAI(integration: Integration): Promise<TestIntegrationResult> {
    const creds = integration.credentials;

    if (!creds.openai_api_key) {
      return {
        success: false,
        message: 'Missing OpenAI API key',
        tested_at: new Date()
      };
    }

    const openaiService = new OpenAIService({
      apiKey: creds.openai_api_key,
      organization: creds.openai_organization,
      model: creds.openai_model as any
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
      } else {
        return {
          success: false,
          message: `OpenAI test failed: ${response.error}`,
          tested_at: new Date()
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `OpenAI test failed: ${error.message}`,
        tested_at: new Date()
      };
    }
  }

  /**
   * Testa integração Notifica.me
   * @deprecated NotificaMe service was removed - this method is kept for backward compatibility
   */
  private async testNotificaMe(integration: Integration): Promise<TestIntegrationResult> {
    return {
      success: false,
      message: 'Notifica.me integration is no longer supported',
      tested_at: new Date()
    };
  }

  /**
   * Testa webhook
   */
  private async testWebhook(integration: Integration): Promise<TestIntegrationResult> {
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
  private async updateTestStatus(id: string, result: TestIntegrationResult): Promise<void> {
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
  private async findByIdWithCredentials(id: string, tenantId: string): Promise<Integration | null> {
    const query = `
      SELECT * FROM integrations
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await this.db.query(query, [id, tenantId]);
    if (!result.rows[0]) return null;
    return this.transformIntegration(result.rows[0]);
  }

  /**
   * Remove dados sensíveis das credenciais
   */
  private sanitizeCredentials(integration: Integration): Integration {
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
  private maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '****';
    }
    return '****' + apiKey.slice(-4);
  }
}
