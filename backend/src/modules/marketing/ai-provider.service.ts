/**
 * AI Provider Service
 *
 * Serviço unificado para integração com múltiplos provedores de IA
 * Suporta: OpenAI, Anthropic (Claude), Google (Gemini), Groq, OpenRouter
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import crypto from 'crypto';
import { getAutomationDbPool } from './automation/database';
import AIConfigServiceModule from './ai-config.service';

const AIConfigService = AIConfigServiceModule.getInstance();

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIGenerateOptions {
  tenantId: string;
  provider: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  module?: string; // Para tracking
  userId?: number;
}

export interface AIGenerateResult {
  content: string;
  provider: string;
  model: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  costUsd: number;
  responseTimeMs: number;
  cached: boolean;
}

export class AIProviderService {
  private get db() {
    return getAutomationDbPool();
  }

  /**
   * Gera resposta usando a IA configurada
   */
  async generate(options: AIGenerateOptions): Promise<AIGenerateResult> {
    const startTime = Date.now();

    try {
      // 1. Verificar cache primeiro
      const promptHash = this.hashPrompt(options.messages);
      const cached = await this.getCachedResponse(options.tenantId, options.provider, promptHash);

      if (cached) {
        await this.logUsage({
          ...options,
          tokensUsed: { prompt: 0, completion: 0, total: cached.tokens_used || 0 },
          costUsd: 0,
          responseTimeMs: Date.now() - startTime,
          success: true,
        });

        return {
          content: cached.response,
          provider: options.provider,
          model: 'cached',
          tokensUsed: { prompt: 0, completion: 0, total: cached.tokens_used || 0 },
          costUsd: 0,
          responseTimeMs: Date.now() - startTime,
          cached: true,
        };
      }

      // 2. Buscar configuração da IA
      const config = await AIConfigService.getConfig(options.tenantId, options.provider);
      if (!config || !config.is_active) {
        throw new Error(`IA ${options.provider} não configurada ou inativa`);
      }

      // 3. Verificar rate limit
      await this.checkRateLimit(options.tenantId);

      // 4. Chamar IA apropriada
      let result: AIGenerateResult;

      switch (options.provider.toLowerCase()) {
        case 'openai':
          result = await this.callOpenAI(config.api_key, config.model, options);
          break;
        case 'anthropic':
          result = await this.callAnthropic(config.api_key, config.model, options);
          break;
        case 'google':
        case 'gemini':
          result = await this.callGemini(config.api_key, config.model, options);
          break;
        case 'groq':
          result = await this.callGroq(config.api_key, config.model, options);
          break;
        case 'openrouter':
          result = await this.callOpenRouter(config.api_key, config.model, options);
          break;
        default:
          throw new Error(`Provedor ${options.provider} não suportado`);
      }

      result.responseTimeMs = Date.now() - startTime;

      // 5. Salvar em cache
      await this.cacheResponse(
        options.tenantId,
        options.provider,
        promptHash,
        JSON.stringify(options.messages),
        result.content,
        result.tokensUsed.total
      );

      // 6. Logar uso
      await this.logUsage({
        ...options,
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
        responseTimeMs: result.responseTimeMs,
        success: true,
      });

      // 7. Atualizar rate limit
      await this.updateRateLimit(options.tenantId, result.tokensUsed.total, result.costUsd);

      return result;
    } catch (error: any) {
      // Logar erro
      await this.logUsage({
        ...options,
        tokensUsed: { prompt: 0, completion: 0, total: 0 },
        costUsd: 0,
        responseTimeMs: Date.now() - startTime,
        success: false,
        errorMessage: error.message,
      });

      throw error;
    }
  }

  /**
   * Gera resposta com fallback automático
   */
  async generateWithFallback(options: AIGenerateOptions): Promise<AIGenerateResult> {
    const fallbackConfig = await this.getFallbackConfig(options.tenantId, options.module || 'marketing');
    const providers = fallbackConfig?.priority_order || [options.provider];

    for (const provider of providers) {
      try {
        const result = await this.generate({ ...options, provider });
        return result;
      } catch (error: any) {
        console.warn(`[AIProvider] ${provider} falhou, tentando próximo...`, error.message);

        if (provider === providers[providers.length - 1]) {
          throw new Error(`Todos os provedores falharam: ${error.message}`);
        }
      }
    }

    throw new Error('Nenhum provedor disponível');
  }

  /**
   * OpenAI Integration
   */
  private async callOpenAI(apiKey: string, model: string, options: AIGenerateOptions): Promise<AIGenerateResult> {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: model || 'gpt-4o-mini',
      messages: options.messages as any,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
    });

    const usage = response.usage!;
    const costUsd = this.calculateCost('openai', model, usage.prompt_tokens, usage.completion_tokens);

    return {
      content: response.choices[0].message.content || '',
      provider: 'openai',
      model,
      tokensUsed: {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
      },
      costUsd,
      responseTimeMs: 0,
      cached: false,
    };
  }

  /**
   * Anthropic (Claude) Integration
   */
  private async callAnthropic(apiKey: string, model: string, options: AIGenerateOptions): Promise<AIGenerateResult> {
    const anthropic = new Anthropic({ apiKey });

    // Converter mensagens para formato Anthropic
    const messages = options.messages.filter(m => m.role !== 'system');
    const systemMessage = options.messages.find(m => m.role === 'system')?.content;

    const response = await anthropic.messages.create({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      system: systemMessage,
      messages: messages as any,
    });

    const usage = response.usage;
    const costUsd = this.calculateCost('anthropic', model, usage.input_tokens, usage.output_tokens);

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      provider: 'anthropic',
      model,
      tokensUsed: {
        prompt: usage.input_tokens,
        completion: usage.output_tokens,
        total: usage.input_tokens + usage.output_tokens,
      },
      costUsd,
      responseTimeMs: 0,
      cached: false,
    };
  }

  /**
   * Google Gemini Integration
   */
  private async callGemini(apiKey: string, model: string, options: AIGenerateOptions): Promise<AIGenerateResult> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' });

    // Converter mensagens para formato Gemini
    const prompt = options.messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Gemini não retorna contagem de tokens precisa na resposta
    const estimatedTokens = Math.ceil(text.length / 4);

    return {
      content: text,
      provider: 'google',
      model,
      tokensUsed: {
        prompt: Math.ceil(prompt.length / 4),
        completion: estimatedTokens,
        total: Math.ceil(prompt.length / 4) + estimatedTokens,
      },
      costUsd: this.calculateCost('google', model, Math.ceil(prompt.length / 4), estimatedTokens),
      responseTimeMs: 0,
      cached: false,
    };
  }

  /**
   * Groq Integration
   */
  private async callGroq(apiKey: string, model: string, options: AIGenerateOptions): Promise<AIGenerateResult> {
    const groq = new Groq({ apiKey });

    const response = await groq.chat.completions.create({
      model: model || 'llama-3.3-70b-versatile',
      messages: options.messages as any,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
    });

    const usage = response.usage!;
    const costUsd = this.calculateCost('groq', model, usage.prompt_tokens, usage.completion_tokens);

    return {
      content: response.choices[0].message.content || '',
      provider: 'groq',
      model,
      tokensUsed: {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
      },
      costUsd,
      responseTimeMs: 0,
      cached: false,
    };
  }

  /**
   * OpenRouter Integration
   */
  private async callOpenRouter(apiKey: string, model: string, options: AIGenerateOptions): Promise<AIGenerateResult> {
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://nexus-crm.com',
        'X-Title': 'Nexus CRM',
      },
    });

    const response = await openai.chat.completions.create({
      model: model || 'anthropic/claude-3.5-sonnet',
      messages: options.messages as any,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
    });

    const usage = response.usage!;
    const costUsd = this.calculateCost('openrouter', model, usage.prompt_tokens, usage.completion_tokens);

    return {
      content: response.choices[0].message.content || '',
      provider: 'openrouter',
      model,
      tokensUsed: {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
      },
      costUsd,
      responseTimeMs: 0,
      cached: false,
    };
  }

  /**
   * Calcula custo estimado em USD
   */
  private calculateCost(provider: string, model: string, promptTokens: number, completionTokens: number): number {
    // Preços aproximados (atualizar conforme necessário)
    const pricing: Record<string, { input: number; output: number }> = {
      'openai-gpt-4o': { input: 0.0025, output: 0.01 },
      'openai-gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'anthropic-claude-3-5-sonnet': { input: 0.003, output: 0.015 },
      'anthropic-claude-3-5-haiku': { input: 0.0008, output: 0.004 },
      'google-gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
      'google-gemini-1.5-pro': { input: 0.00125, output: 0.005 },
      'groq-llama-3.3-70b': { input: 0.00059, output: 0.00079 },
      'groq-llama-3.1-8b': { input: 0.00005, output: 0.00008 },
    };

    const key = `${provider}-${model}`.toLowerCase();
    const prices = pricing[key] || { input: 0.0001, output: 0.0002 }; // Fallback

    return ((promptTokens / 1000) * prices.input) + ((completionTokens / 1000) * prices.output);
  }

  /**
   * Hash do prompt para cache
   */
  private hashPrompt(messages: AIMessage[]): string {
    const content = JSON.stringify(messages);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Buscar resposta em cache
   */
  private async getCachedResponse(tenantId: string, provider: string, promptHash: string): Promise<any> {
    const query = `
      SELECT * FROM ai_cache
      WHERE tenant_id = $1 AND provider = $2 AND prompt_hash = $3
      AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `;

    const result = await this.db.query(query, [tenantId, provider, promptHash]);

    if (result.rows.length > 0) {
      // Incrementar hit count
      await this.db.query(
        'UPDATE ai_cache SET hit_count = hit_count + 1 WHERE id = $1',
        [result.rows[0].id]
      );
      return result.rows[0];
    }

    return null;
  }

  /**
   * Salvar resposta em cache
   */
  private async cacheResponse(
    tenantId: string,
    provider: string,
    promptHash: string,
    promptText: string,
    response: string,
    tokensUsed: number
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    const query = `
      INSERT INTO ai_cache (tenant_id, provider, prompt_hash, prompt_text, response, tokens_used, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (tenant_id, provider, prompt_hash)
      DO UPDATE SET
        response = EXCLUDED.response,
        tokens_used = EXCLUDED.tokens_used,
        expires_at = EXCLUDED.expires_at,
        created_at = NOW(),
        hit_count = 0
    `;

    await this.db.query(query, [tenantId, provider, promptHash, promptText, response, tokensUsed, expiresAt]);
  }

  /**
   * Logar uso de IA
   */
  private async logUsage(data: {
    tenantId: string;
    provider: string;
    messages: AIMessage[];
    tokensUsed: { prompt: number; completion: number; total: number };
    costUsd: number;
    responseTimeMs: number;
    module?: string;
    userId?: number;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    // Log em ai_usage_logs
    await this.db.query(
      `INSERT INTO ai_usage_logs
       (tenant_id, user_id, provider, model, prompt_tokens, completion_tokens, total_tokens, cost_usd, response_time_ms, module, success)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        data.tenantId,
        data.userId || null,
        data.provider,
        'auto',
        data.tokensUsed.prompt,
        data.tokensUsed.completion,
        data.tokensUsed.total,
        data.costUsd,
        data.responseTimeMs,
        data.module || 'marketing',
        data.success,
      ]
    );

    // Log detalhado em ai_audit_logs
    await this.db.query(
      `INSERT INTO ai_audit_logs
       (tenant_id, user_id, provider, prompt, response, tokens_used, cost_usd, success, error_message, module)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        data.tenantId,
        data.userId || null,
        data.provider,
        JSON.stringify(data.messages),
        '', // Não salvar resposta completa para economizar espaço
        data.tokensUsed.total,
        data.costUsd,
        data.success,
        data.errorMessage || null,
        data.module || 'marketing',
      ]
    );
  }

  /**
   * Verificar rate limit
   */
  private async checkRateLimit(tenantId: string): Promise<void> {
    const query = `
      SELECT * FROM ai_rate_limits WHERE tenant_id = $1 LIMIT 1
    `;

    const result = await this.db.query(query, [tenantId]);

    if (result.rows.length === 0) {
      // Criar rate limit padrão
      await this.db.query(
        `INSERT INTO ai_rate_limits (tenant_id) VALUES ($1)`,
        [tenantId]
      );
      return;
    }

    const limits = result.rows[0];

    // Verificar limites
    if (limits.current_requests_hour >= limits.max_requests_per_hour) {
      throw new Error('Limite de requisições por hora excedido');
    }

    if (limits.current_tokens_day >= limits.max_tokens_per_day) {
      throw new Error('Limite de tokens por dia excedido');
    }

    if (parseFloat(limits.current_cost_month_usd) >= parseFloat(limits.max_cost_per_month_usd)) {
      throw new Error('Limite de custo mensal excedido');
    }
  }

  /**
   * Atualizar rate limit
   */
  private async updateRateLimit(tenantId: string, tokens: number, cost: number): Promise<void> {
    await this.db.query(
      `UPDATE ai_rate_limits
       SET
         current_requests_hour = current_requests_hour + 1,
         current_tokens_day = current_tokens_day + $2,
         current_cost_month_usd = current_cost_month_usd + $3
       WHERE tenant_id = $1`,
      [tenantId, tokens, cost]
    );
  }

  /**
   * Buscar configuração de fallback
   */
  private async getFallbackConfig(tenantId: string, module: string): Promise<any> {
    const query = `
      SELECT * FROM ai_fallback_config
      WHERE tenant_id = $1 AND module = $2 AND enabled = true
      LIMIT 1
    `;

    const result = await this.db.query(query, [tenantId, module]);
    return result.rows[0] || null;
  }
}

// Export a singleton instance (lazy initialization)
let instance: AIProviderService | null = null;

export default {
  getInstance(): AIProviderService {
    if (!instance) {
      instance = new AIProviderService();
    }
    return instance;
  },
};
