import axios from 'axios';

export class DisparadorIAService {
  private openaiApiKey: string;
  private groqApiKey: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.groqApiKey = process.env.GROQ_API_KEY || '';
  }

  /**
   * Modelos suportados
   */
  private readonly MODELOS_OPENAI = [
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4-turbo',
    'gpt-4o',
    'gpt-4o-mini'
  ];

  private readonly MODELOS_GROQ = [
    'llama-3.1-8b-instant',
    'llama-3.1-70b-versatile',
    'llama-3.2-11b-text-preview',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
  ];

  /**
   * Substituir variáveis dinâmicas no texto
   */
  private substituirVariaveis(texto: string, contactData?: any): string {
    if (!contactData) return texto;

    return texto
      .replace(/\{\{nome\}\}/g, contactData.nome || '')
      .replace(/\{\{telefone\}\}/g, contactData.telefone || '')
      .replace(/\{\{email\}\}/g, contactData.email || '')
      .replace(/\{\{categoria\}\}/g, contactData.categoria || '')
      .replace(/\{\{observacoes\}\}/g, contactData.observacoes || '');
  }

  /**
   * Gerar texto personalizado usando IA
   */
  async gerarTexto(
    provider: 'openai' | 'groq',
    model: string,
    systemPrompt: string,
    userPrompt: string,
    contactData?: any
  ): Promise<string> {
    // Substituir variáveis nos prompts
    const systemProcessed = this.substituirVariaveis(systemPrompt, contactData);
    const userProcessed = this.substituirVariaveis(userPrompt, contactData);

    if (provider === 'openai') {
      return await this.gerarTextoOpenAI(model, systemProcessed, userProcessed);
    } else if (provider === 'groq') {
      return await this.gerarTextoGroq(model, systemProcessed, userProcessed);
    } else {
      throw new Error('Provider não suportado');
    }
  }

  /**
   * Corrigir texto usando IA
   */
  async corrigirTexto(
    provider: 'openai' | 'groq',
    model: string,
    texto: string
  ): Promise<string> {
    const systemPrompt = 'Você é um assistente especializado em correção de textos. Corrija erros de ortografia, gramática e pontuação, mas mantenha o tom e o estilo original do texto.';
    const userPrompt = `Corrija o seguinte texto:\n\n${texto}`;

    return await this.gerarTexto(provider, model, systemPrompt, userPrompt);
  }

  /**
   * Gerar variações de texto
   */
  async gerarVariacoes(
    provider: 'openai' | 'groq',
    model: string,
    texto: string,
    quantidade: number = 3
  ): Promise<string[]> {
    const systemPrompt = `Você é um assistente especializado em gerar variações de textos. Crie ${quantidade} variações diferentes do texto fornecido, mantendo o mesmo significado mas com palavras e estruturas diferentes. Retorne apenas as variações, uma por linha, sem numeração ou outros caracteres.`;
    const userPrompt = `Gere ${quantidade} variações do seguinte texto:\n\n${texto}`;

    const resultado = await this.gerarTexto(provider, model, systemPrompt, userPrompt);

    // Dividir resultado em linhas e limpar
    const variacoes = resultado
      .split('\n')
      .map(linha => linha.trim())
      .filter(linha => linha.length > 0)
      .filter(linha => !linha.match(/^\d+[\.\)\:]/) && !linha.startsWith('-'))
      .slice(0, quantidade);

    return variacoes;
  }

  /**
   * Gerar texto usando OpenAI
   */
  private async gerarTextoOpenAI(
    model: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    if (!this.openaiApiKey) {
      throw new Error('Chave da API OpenAI não configurada');
    }

    if (!this.MODELOS_OPENAI.includes(model)) {
      throw new Error(`Modelo OpenAI inválido: ${model}`);
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openaiApiKey}`
          }
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error: any) {
      console.error('[DisparadorIAService] Erro ao chamar OpenAI:', error.response?.data || error.message);
      throw new Error(`Erro ao gerar texto com OpenAI: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Gerar texto usando Groq
   */
  private async gerarTextoGroq(
    model: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    if (!this.groqApiKey) {
      throw new Error('Chave da API Groq não configurada');
    }

    if (!this.MODELOS_GROQ.includes(model)) {
      throw new Error(`Modelo Groq inválido: ${model}`);
    }

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.groqApiKey}`
          }
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error: any) {
      console.error('[DisparadorIAService] Erro ao chamar Groq:', error.response?.data || error.message);
      throw new Error(`Erro ao gerar texto com Groq: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}
