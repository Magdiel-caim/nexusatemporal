/**
 * OpenAI Service - IA Integration
 *
 * Serviço de integração com OpenAI para recursos de IA
 * - Geração de texto
 * - Análise de leads
 * - Respostas automáticas
 * - Análise de sentimento
 *
 * @see https://platform.openai.com/docs/api-reference
 */

import axios, { AxiosInstance } from 'axios';

export interface OpenAIConfig {
  apiKey: string;
  organization?: string;
  model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
}

export interface GenerateTextDTO {
  prompt: string;
  systemPrompt?: string;
  model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  temperature?: number; // 0-2
  maxTokens?: number;
  context?: Record<string, any>;
}

export interface GenerateTextResponse {
  success: boolean;
  text: string;
  tokensUsed: number;
  model: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  error?: string;
}

export interface AnalyzeLeadDTO {
  leadData: {
    name?: string;
    message?: string;
    source?: string;
    history?: any[];
  };
  analysisType: 'sentiment' | 'intent' | 'quality' | 'urgency' | 'complete';
}

export interface AnalyzeLeadResponse {
  success: boolean;
  analysis: {
    sentiment?: 'positive' | 'neutral' | 'negative';
    sentimentScore?: number; // 0-100
    intent?: string[];
    quality?: 'high' | 'medium' | 'low';
    qualityScore?: number; // 0-100
    urgency?: 'high' | 'medium' | 'low';
    urgencyScore?: number; // 0-100
    tags?: string[];
    summary?: string;
    recommendedAction?: string;
  };
  tokensUsed: number;
  error?: string;
}

export interface GenerateResponseDTO {
  context: {
    leadName?: string;
    leadMessage?: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    companyInfo?: string;
  };
  tone?: 'professional' | 'friendly' | 'formal' | 'casual';
  language?: 'pt-BR' | 'en-US' | 'es-ES';
}

export interface GenerateResponseResponse {
  success: boolean;
  response: string;
  tokensUsed: number;
  error?: string;
}

export class OpenAIService {
  private client: AxiosInstance;
  private config: OpenAIConfig;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor(config: OpenAIConfig) {
    this.config = {
      model: 'gpt-3.5-turbo',
      ...config
    };

    this.client = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...(config.organization ? { 'OpenAI-Organization': config.organization } : {})
      },
      timeout: 60000
    });

    // Interceptor para rate limiting e logs
    this.client.interceptors.request.use((config) => {
      this.requestCount++;
      this.lastRequestTime = Date.now();
      console.log(`[OpenAIService] Request #${this.requestCount}: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        console.log(`[OpenAIService] Response: ${response.status} - Tokens: ${response.data.usage?.total_tokens || 'N/A'}`);
        return response;
      },
      (error) => {
        console.error(`[OpenAIService] Error:`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
        throw error;
      }
    );
  }

  /**
   * Gera texto usando OpenAI
   */
  async generateText(dto: GenerateTextDTO): Promise<GenerateTextResponse> {
    try {
      const messages: any[] = [];

      // System prompt
      if (dto.systemPrompt) {
        messages.push({
          role: 'system',
          content: dto.systemPrompt
        });
      }

      // Context (se fornecido)
      if (dto.context && Object.keys(dto.context).length > 0) {
        messages.push({
          role: 'system',
          content: `Contexto adicional: ${JSON.stringify(dto.context)}`
        });
      }

      // User prompt
      messages.push({
        role: 'user',
        content: dto.prompt
      });

      const response = await this.client.post('/chat/completions', {
        model: dto.model || this.config.model,
        messages,
        temperature: dto.temperature ?? 0.7,
        max_tokens: dto.maxTokens ?? 1000
      });

      const choice = response.data.choices[0];

      return {
        success: true,
        text: choice.message.content,
        tokensUsed: response.data.usage.total_tokens,
        model: response.data.model,
        finishReason: choice.finish_reason as any
      };
    } catch (error: any) {
      console.error('[OpenAIService] Error generating text:', error);
      return {
        success: false,
        text: '',
        tokensUsed: 0,
        model: dto.model || this.config.model!,
        finishReason: 'error',
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Analisa um lead usando IA
   */
  async analyzeLead(dto: AnalyzeLeadDTO): Promise<AnalyzeLeadResponse> {
    try {
      let prompt = this.buildLeadAnalysisPrompt(dto);

      const response = await this.generateText({
        systemPrompt: `Você é um assistente especializado em análise de leads para um CRM.
Analise os dados do lead e forneça insights acionáveis em formato JSON.`,
        prompt,
        temperature: 0.3, // Mais determinístico para análise
        maxTokens: 800
      });

      if (!response.success) {
        return {
          success: false,
          analysis: {},
          tokensUsed: 0,
          error: response.error
        };
      }

      // Parse do JSON retornado
      const analysis = this.parseLeadAnalysis(response.text, dto.analysisType);

      return {
        success: true,
        analysis,
        tokensUsed: response.tokensUsed
      };
    } catch (error: any) {
      console.error('[OpenAIService] Error analyzing lead:', error);
      return {
        success: false,
        analysis: {},
        tokensUsed: 0,
        error: error.message
      };
    }
  }

  /**
   * Gera resposta automática para um lead
   */
  async generateResponse(dto: GenerateResponseDTO): Promise<GenerateResponseResponse> {
    try {
      const tone = dto.tone || 'friendly';
      const language = dto.language || 'pt-BR';

      const messages: any[] = [];

      // System prompt baseado no tom
      const systemPrompts = {
        'professional': 'Você é um assistente profissional de atendimento ao cliente. Seja cortês, claro e objetivo.',
        'friendly': 'Você é um assistente amigável de atendimento ao cliente. Seja caloroso, empático e prestativo.',
        'formal': 'Você é um assistente formal de atendimento ao cliente. Mantenha linguagem respeitosa e protocolar.',
        'casual': 'Você é um assistente descontraído de atendimento ao cliente. Seja natural e próximo.'
      };

      messages.push({
        role: 'system',
        content: systemPrompts[tone] + ` Responda sempre em ${language}.`
      });

      // Informações da empresa
      if (dto.context.companyInfo) {
        messages.push({
          role: 'system',
          content: `Informações da empresa: ${dto.context.companyInfo}`
        });
      }

      // Histórico de conversas
      if (dto.context.conversationHistory && dto.context.conversationHistory.length > 0) {
        dto.context.conversationHistory.forEach(msg => {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        });
      }

      // Mensagem atual do lead
      if (dto.context.leadMessage) {
        messages.push({
          role: 'user',
          content: dto.context.leadMessage
        });
      }

      const response = await this.client.post('/chat/completions', {
        model: this.config.model,
        messages,
        temperature: 0.8, // Mais criativo para respostas
        max_tokens: 500
      });

      return {
        success: true,
        response: response.data.choices[0].message.content,
        tokensUsed: response.data.usage.total_tokens
      };
    } catch (error: any) {
      console.error('[OpenAIService] Error generating response:', error);
      return {
        success: false,
        response: '',
        tokensUsed: 0,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Resume um texto longo
   */
  async summarizeText(text: string, maxLength: number = 200): Promise<{ success: boolean; summary: string; tokensUsed: number; error?: string }> {
    try {
      const response = await this.generateText({
        systemPrompt: `Você é um assistente especializado em resumir textos.
Crie resumos concisos e informativos.`,
        prompt: `Resuma o seguinte texto em no máximo ${maxLength} caracteres:\n\n${text}`,
        temperature: 0.3,
        maxTokens: 300
      });

      return {
        success: response.success,
        summary: response.text,
        tokensUsed: response.tokensUsed,
        error: response.error
      };
    } catch (error: any) {
      return {
        success: false,
        summary: '',
        tokensUsed: 0,
        error: error.message
      };
    }
  }

  /**
   * Extrai palavras-chave de um texto
   */
  async extractKeywords(text: string, maxKeywords: number = 5): Promise<{ success: boolean; keywords: string[]; tokensUsed: number; error?: string }> {
    try {
      const response = await this.generateText({
        systemPrompt: `Você é um assistente especializado em extração de palavras-chave.
Retorne apenas as palavras-chave, separadas por vírgula.`,
        prompt: `Extraia ${maxKeywords} palavras-chave principais do seguinte texto:\n\n${text}`,
        temperature: 0.2,
        maxTokens: 100
      });

      if (!response.success) {
        return {
          success: false,
          keywords: [],
          tokensUsed: 0,
          error: response.error
        };
      }

      // Parse das keywords
      const keywords = response.text
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, maxKeywords);

      return {
        success: true,
        keywords,
        tokensUsed: response.tokensUsed
      };
    } catch (error: any) {
      return {
        success: false,
        keywords: [],
        tokensUsed: 0,
        error: error.message
      };
    }
  }

  /**
   * Constrói prompt para análise de lead
   */
  private buildLeadAnalysisPrompt(dto: AnalyzeLeadDTO): string {
    let prompt = `Analise o seguinte lead:\n\n`;

    if (dto.leadData.name) {
      prompt += `Nome: ${dto.leadData.name}\n`;
    }

    if (dto.leadData.source) {
      prompt += `Origem: ${dto.leadData.source}\n`;
    }

    if (dto.leadData.message) {
      prompt += `Mensagem: ${dto.leadData.message}\n`;
    }

    if (dto.leadData.history && dto.leadData.history.length > 0) {
      prompt += `\nHistórico: ${JSON.stringify(dto.leadData.history)}\n`;
    }

    prompt += `\nForneça uma análise focada em: ${dto.analysisType}\n\n`;

    switch (dto.analysisType) {
      case 'sentiment':
        prompt += `Retorne em JSON: { "sentiment": "positive|neutral|negative", "sentimentScore": 0-100 }`;
        break;
      case 'intent':
        prompt += `Retorne em JSON: { "intent": ["intenção1", "intenção2"] }`;
        break;
      case 'quality':
        prompt += `Retorne em JSON: { "quality": "high|medium|low", "qualityScore": 0-100 }`;
        break;
      case 'urgency':
        prompt += `Retorne em JSON: { "urgency": "high|medium|low", "urgencyScore": 0-100 }`;
        break;
      case 'complete':
        prompt += `Retorne em JSON: {
          "sentiment": "positive|neutral|negative",
          "sentimentScore": 0-100,
          "intent": ["intenção1"],
          "quality": "high|medium|low",
          "qualityScore": 0-100,
          "urgency": "high|medium|low",
          "urgencyScore": 0-100,
          "tags": ["tag1", "tag2"],
          "summary": "resumo breve",
          "recommendedAction": "ação recomendada"
        }`;
        break;
    }

    return prompt;
  }

  /**
   * Faz parse da análise de lead
   */
  private parseLeadAnalysis(text: string, analysisType: string): any {
    try {
      // Remove markdown se houver
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Tenta fazer parse do JSON
      const parsed = JSON.parse(cleanText);
      return parsed;
    } catch (error) {
      console.error('[OpenAIService] Error parsing lead analysis:', error);

      // Retorna estrutura vazia baseada no tipo
      switch (analysisType) {
        case 'sentiment':
          return { sentiment: 'neutral', sentimentScore: 50 };
        case 'intent':
          return { intent: [] };
        case 'quality':
          return { quality: 'medium', qualityScore: 50 };
        case 'urgency':
          return { urgency: 'medium', urgencyScore: 50 };
        default:
          return {};
      }
    }
  }

  /**
   * Estatísticas de uso
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
      model: this.config.model
    };
  }
}
