import { getRepository } from 'typeorm';
import { MarketingIntegration, IntegrationPlatform, IntegrationStatus } from '../entities';

export class MarketingIntegrationService {
  private repository = getRepository(MarketingIntegration);

  /**
   * Create or update integration
   */
  async upsert(
    tenantId: string,
    platform: IntegrationPlatform,
    data: {
      name?: string;
      credentials?: Record<string, any>;
      config?: Record<string, any>;
      status?: IntegrationStatus;
    },
    userId?: string
  ): Promise<MarketingIntegration> {
    // Check if integration already exists
    let integration = await this.repository.findOne({
      where: { tenantId, platform },
    });

    if (integration) {
      // Update existing
      integration.name = data.name || integration.name;
      integration.credentials = { ...integration.credentials, ...data.credentials };
      integration.config = { ...integration.config, ...data.config };
      integration.status = data.status || integration.status;
      integration.lastSyncAt = new Date();
    } else {
      // Create new
      integration = this.repository.create({
        tenantId,
        platform,
        name: data.name || platform,
        credentials: data.credentials || {},
        config: data.config || {},
        status: data.status || IntegrationStatus.ACTIVE,
        createdBy: userId,
      });
    }

    return await this.repository.save(integration);
  }

  /**
   * Get integration by platform
   */
  async getByPlatform(tenantId: string, platform: IntegrationPlatform): Promise<MarketingIntegration | undefined> {
    const result = await this.repository.findOne({
      where: { tenantId, platform },
    });
    return result || undefined;
  }

  /**
   * Get all integrations for a tenant
   */
  async getAll(tenantId: string, filters?: { status?: IntegrationStatus }): Promise<MarketingIntegration[]> {
    const query: any = { tenantId };

    if (filters?.status) {
      query.status = filters.status;
    }

    return await this.repository.find({
      where: query,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all AI provider integrations
   */
  async getAIProviders(tenantId: string): Promise<MarketingIntegration[]> {
    const aiPlatforms = [
      IntegrationPlatform.GROQ,
      IntegrationPlatform.OPENROUTER,
      IntegrationPlatform.DEEPSEEK,
      IntegrationPlatform.MISTRAL,
      IntegrationPlatform.QWEN,
      IntegrationPlatform.OLLAMA,
    ];

    return await this.repository
      .createQueryBuilder('integration')
      .where('integration.tenantId = :tenantId', { tenantId })
      .andWhere('integration.platform IN (:...platforms)', { platforms: aiPlatforms })
      .andWhere('integration.status = :status', { status: IntegrationStatus.ACTIVE })
      .getMany();
  }

  /**
   * Test integration connection
   */
  async testConnection(integrationId: string, tenantId: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.repository.findOne({
      where: { id: integrationId, tenantId },
    });

    if (!integration) {
      return { success: false, message: 'Integration not found' };
    }

    try {
      // Test based on platform
      switch (integration.platform) {
        case IntegrationPlatform.GROQ:
        case IntegrationPlatform.OPENROUTER:
        case IntegrationPlatform.DEEPSEEK:
        case IntegrationPlatform.MISTRAL:
        case IntegrationPlatform.QWEN:
          // Test API key by making a simple request
          if (!integration.credentials.api_key) {
            throw new Error('API key not configured');
          }
          // TODO: Make actual API test request
          break;

        case IntegrationPlatform.OLLAMA:
          // Test Ollama connection
          if (!integration.config.base_url) {
            throw new Error('Base URL not configured');
          }
          // TODO: Make actual API test request
          break;

        case IntegrationPlatform.WAHA:
          // Test WAHA connection
          if (!integration.credentials.api_key || !integration.config.server_url) {
            throw new Error('WAHA credentials not configured');
          }
          // TODO: Make actual API test request
          break;

        default:
          throw new Error(`Testing not implemented for platform: ${integration.platform}`);
      }

      // Update integration
      integration.status = IntegrationStatus.ACTIVE;
      integration.errorMessage = undefined;
      integration.lastSyncAt = new Date();
      await this.repository.save(integration);

      return { success: true, message: 'Connection successful' };
    } catch (error: any) {
      // Update integration with error
      integration.status = IntegrationStatus.ERROR;
      integration.errorMessage = error.message;
      await this.repository.save(integration);

      return { success: false, message: error.message };
    }
  }

  /**
   * Delete integration
   */
  async delete(integrationId: string, tenantId: string): Promise<boolean> {
    const result = await this.repository.delete({
      id: integrationId,
      tenantId,
    });

    return (result.affected || 0) > 0;
  }

  /**
   * Update integration status
   */
  async updateStatus(integrationId: string, tenantId: string, status: IntegrationStatus): Promise<MarketingIntegration | undefined> {
    const integration = await this.repository.findOne({
      where: { id: integrationId, tenantId },
    });

    if (!integration) {
      return undefined;
    }

    integration.status = status;
    return await this.repository.save(integration);
  }

  /**
   * Get credentials for AI provider (safe method that only returns if active)
   */
  async getAIProviderCredentials(
    tenantId: string,
    provider: IntegrationPlatform
  ): Promise<{ apiKey?: string; baseUrl?: string } | null> {
    const integration = await this.repository.findOne({
      where: {
        tenantId,
        platform: provider,
        status: IntegrationStatus.ACTIVE,
      },
    });

    if (!integration) {
      return null;
    }

    return {
      apiKey: integration.credentials.api_key,
      baseUrl: integration.config.base_url,
    };
  }
}
