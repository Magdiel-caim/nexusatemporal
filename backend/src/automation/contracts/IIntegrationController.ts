/**
 * CONTRATO: Integration Controller
 *
 * Responsável pela gestão de credenciais e integrações externas.
 *
 * SESSÃO A: Implementará este contrato
 * SESSÃO B: Poderá consumir após implementação
 */

export interface CreateIntegrationDto {
  tenantId: string;
  type: 'waha' | 'n8n' | 'openai' | 'notificame' | 'webhook' | 'custom';
  name: string;
  description?: string;
  credentials: IntegrationCredentials;
  config?: Record<string, any>;
  active: boolean;
}

export interface UpdateIntegrationDto {
  name?: string;
  description?: string;
  credentials?: IntegrationCredentials;
  config?: Record<string, any>;
  active?: boolean;
}

export interface IntegrationCredentials {
  // WhatsApp (WAHA)
  wahaApiUrl?: string;
  wahaApiKey?: string;
  wahaSessionName?: string;

  // n8n
  n8nApiUrl?: string;
  n8nApiKey?: string;

  // OpenAI
  openaiApiKey?: string;
  openaiOrganization?: string;
  openaiModel?: string;

  // Notificame
  notificameApiKey?: string;
  notificameApiUrl?: string;

  // Webhook
  webhookUrl?: string;
  webhookSecret?: string;
  webhookHeaders?: Record<string, string>;

  // Custom
  customData?: Record<string, any>;
}

export interface IntegrationResponse {
  id: string;
  tenantId: string;
  type: string;
  name: string;
  description?: string;
  credentials: Partial<IntegrationCredentials>; // Sem dados sensíveis
  config?: Record<string, any>;
  active: boolean;
  lastTestedAt?: Date;
  testStatus?: 'success' | 'failed' | 'pending';
  testMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestIntegrationDto {
  integrationId: string;
  tenantId: string;
}

export interface TestIntegrationResponse {
  success: boolean;
  message: string;
  details?: any;
  testedAt: Date;
}

/**
 * ENDPOINTS A SEREM IMPLEMENTADOS (Sessão A):
 *
 * POST   /api/automation/integrations              - Criar integração
 * GET    /api/automation/integrations              - Listar integrações
 * GET    /api/automation/integrations/:id          - Buscar integração por ID
 * PUT    /api/automation/integrations/:id          - Atualizar integração
 * DELETE /api/automation/integrations/:id          - Deletar integração
 * POST   /api/automation/integrations/:id/test     - Testar integração
 */
