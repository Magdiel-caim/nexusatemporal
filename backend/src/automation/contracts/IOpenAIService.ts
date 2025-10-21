/**
 * CONTRATO: OpenAI Service (AI Integration)
 *
 * Serviço de integração com OpenAI para recursos de IA.
 *
 * SESSÃO A: Implementará este serviço
 * SESSÃO B: NÃO PRECISA TOCAR - Apenas usar depois
 */

export interface GenerateTextDto {
  tenantId: string;
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

export interface AnalyzeLeadDto {
  tenantId: string;
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
}

export interface GenerateResponseDto {
  tenantId: string;
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

/**
 * MÉTODOS DO SERVIÇO (Sessão A implementará):
 *
 * - generateText(dto: GenerateTextDto)
 * - analyzeLead(dto: AnalyzeLeadDto)
 * - generateResponse(dto: GenerateResponseDto)
 * - summarizeText(text: string, maxLength?: number)
 * - extractKeywords(text: string)
 */
