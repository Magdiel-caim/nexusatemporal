export interface Integration {
  id: string;
  tenant_id: string;
  type: 'waha' | 'n8n' | 'openai' | 'notificame' | 'webhook' | 'custom';
  name: string;
  description?: string;
  credentials: IntegrationCredentials;
  config?: Record<string, any>;
  is_active: boolean;
  last_tested_at?: Date;
  test_status?: 'success' | 'failed' | 'pending';
  test_message?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IntegrationCredentials {
  // WhatsApp (WAHA)
  waha_api_url?: string;
  waha_api_key?: string;
  waha_session_name?: string;

  // n8n
  n8n_api_url?: string;
  n8n_api_key?: string;

  // OpenAI
  openai_api_key?: string;
  openai_organization?: string;
  openai_model?: string;

  // Notificame
  notificame_api_key?: string;
  notificame_api_url?: string;

  // Webhook
  webhook_url?: string;
  webhook_secret?: string;
  webhook_headers?: Record<string, string>;

  // Custom
  custom_data?: Record<string, any>;
}

export interface CreateIntegrationDTO {
  type: 'waha' | 'n8n' | 'openai' | 'notificame' | 'webhook' | 'custom';
  name: string;
  description?: string;
  credentials: IntegrationCredentials;
  config?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateIntegrationDTO {
  name?: string;
  description?: string;
  credentials?: IntegrationCredentials;
  config?: Record<string, any>;
  is_active?: boolean;
}

export interface TestIntegrationResult {
  success: boolean;
  message: string;
  details?: any;
  tested_at: Date;
}
