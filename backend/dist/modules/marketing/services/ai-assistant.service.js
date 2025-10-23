"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAssistantService = void 0;
const data_source_1 = require("../../../database/data-source");
const entities_1 = require("../entities");
const ai_provider_service_1 = __importDefault(require("../ai-provider.service"));
const AIProviderService = ai_provider_service_1.default.getInstance();
class AIAssistantService {
    analysisRepository = data_source_1.AppDataSource.getRepository(entities_1.AIAnalysis);
    // AI Provider configurations
    getProviderConfig(provider) {
        const configs = {
            [entities_1.AIProvider.GROQ]: {
                baseUrl: 'https://api.groq.com/openai/v1',
                apiKey: process.env.GROQ_API_KEY || '',
            },
            [entities_1.AIProvider.OPENROUTER]: {
                baseUrl: 'https://openrouter.ai/api/v1',
                apiKey: process.env.OPENROUTER_API_KEY || '',
            },
            [entities_1.AIProvider.DEEPSEEK]: {
                baseUrl: 'https://api.deepseek.com/v1',
                apiKey: process.env.DEEPSEEK_API_KEY || '',
            },
            [entities_1.AIProvider.MISTRAL]: {
                baseUrl: 'https://api.mistral.ai/v1',
                apiKey: process.env.MISTRAL_API_KEY || '',
            },
            [entities_1.AIProvider.QWEN]: {
                baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
                apiKey: process.env.QWEN_API_KEY || '',
            },
            [entities_1.AIProvider.OLLAMA]: {
                baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
                apiKey: '',
            },
        };
        return configs[provider];
    }
    async analyze(tenantId, provider, model, analysisType, inputData, userId) {
        const startTime = Date.now();
        try {
            const result = await this.callAI(provider, model, analysisType, inputData);
            const analysis = this.analysisRepository.create({
                tenantId,
                aiProvider: provider,
                aiModel: model,
                analysisType,
                inputData,
                outputData: result.output,
                suggestions: result.suggestions,
                score: result.score,
                tokensUsed: result.tokensUsed,
                cost: result.cost,
                processingTimeMs: Date.now() - startTime,
                createdBy: userId,
            });
            return await this.analysisRepository.save(analysis);
        }
        catch (error) {
            console.error('[AIAssistantService] Analysis error:', error);
            throw new Error(`AI Analysis failed: ${error.message}`);
        }
    }
    async callAI(provider, model, analysisType, inputData) {
        // For now, return placeholder responses
        // TODO: Implement actual API calls in integration sessions
        const config = this.getProviderConfig(provider);
        if (!config.apiKey && provider !== entities_1.AIProvider.OLLAMA) {
            throw new Error(`API key not configured for provider: ${provider}`);
        }
        // Placeholder response based on analysis type
        switch (analysisType) {
            case entities_1.AnalysisType.COPYWRITING:
                return {
                    output: {
                        generatedText: 'AI-generated copy will appear here once integration is complete.',
                        variations: ['Variation 1', 'Variation 2', 'Variation 3'],
                    },
                    suggestions: ['Use more action verbs', 'Add emotional appeal', 'Include call-to-action'],
                    score: 0.85,
                    tokensUsed: 100,
                    cost: 0.001,
                };
            case entities_1.AnalysisType.SENTIMENT:
                return {
                    output: {
                        sentiment: 'positive',
                        confidence: 0.92,
                        emotions: { joy: 0.7, trust: 0.8, anticipation: 0.6 },
                    },
                    score: 0.92,
                    tokensUsed: 50,
                    cost: 0.0005,
                };
            case entities_1.AnalysisType.OPTIMIZATION:
                return {
                    output: {
                        optimizedContent: 'Optimized content will appear here',
                        improvements: ['Clarity', 'Engagement', 'SEO'],
                    },
                    suggestions: [
                        'Shorten sentences for better readability',
                        'Add keywords for SEO',
                        'Include social proof',
                    ],
                    score: 0.88,
                    tokensUsed: 150,
                    cost: 0.0015,
                };
            case entities_1.AnalysisType.PREDICTION:
                return {
                    output: {
                        predictedEngagement: 75,
                        predictedClicks: 120,
                        predictedConversions: 15,
                        confidence: 0.78,
                    },
                    suggestions: ['Post during peak hours', 'Use trending hashtags', 'Include video content'],
                    score: 0.78,
                    tokensUsed: 80,
                    cost: 0.0008,
                };
            case entities_1.AnalysisType.IMAGE_GEN:
                return {
                    output: {
                        imageUrl: 'https://placeholder.com/generated-image.png',
                        prompt: inputData.prompt,
                        style: inputData.style || 'realistic',
                    },
                    tokensUsed: 0,
                    cost: 0.02,
                };
            default:
                return {
                    output: { message: 'Analysis complete' },
                    tokensUsed: 50,
                    cost: 0.0005,
                };
        }
    }
    async getRecentAnalyses(tenantId, limit = 10) {
        return await this.analysisRepository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getAnalysisByRelated(tenantId, relatedType, relatedId) {
        return await this.analysisRepository.find({
            where: { tenantId, relatedType, relatedId },
            order: { createdAt: 'DESC' },
        });
    }
    // Helper methods for specific use cases
    async optimizeCopy(tenantId, content, context, userId) {
        return await this.analyze(tenantId, entities_1.AIProvider.OPENROUTER, 'anthropic/claude-3.5-sonnet', entities_1.AnalysisType.OPTIMIZATION, { content, context }, userId);
    }
    /**
     * Gera copy de marketing usando o provider configurado
     */
    async generateCopy(tenantId, provider, prompt, context, userId) {
        const messages = [
            {
                role: 'system',
                content: `Você é um especialista em copywriting e marketing digital. Crie textos persuasivos, criativos e otimizados para conversão.
${context ? `Contexto: Plataforma: ${context.platform || 'geral'}, Público: ${context.audience || 'geral'}, Objetivo: ${context.goal || 'engajamento'}` : ''}`,
            },
            {
                role: 'user',
                content: prompt,
            },
        ];
        const result = await AIProviderService.generateWithFallback({
            tenantId,
            provider,
            messages,
            temperature: 0.8,
            maxTokens: 1000,
            module: 'marketing-assistant',
            userId,
        });
        return result.content;
    }
    /**
     * Analisa sentimento de texto
     */
    async analyzeSentiment(tenantId, provider, text, userId) {
        const messages = [
            {
                role: 'system',
                content: 'Você é um analisador de sentimentos. Analise o texto e retorne apenas um JSON com: sentiment (positive/negative/neutral/urgent), confidence (0-1), e emotions (objeto com emoções e scores 0-1).',
            },
            {
                role: 'user',
                content: `Analise o sentimento deste texto:\n\n${text}`,
            },
        ];
        const result = await AIProviderService.generate({
            tenantId,
            provider,
            messages,
            temperature: 0.3,
            maxTokens: 300,
            module: 'sentiment-analysis',
            userId,
        });
        try {
            return JSON.parse(result.content);
        }
        catch {
            return {
                sentiment: 'neutral',
                confidence: 0.5,
                emotions: {},
            };
        }
    }
    /**
     * Gera resumo de texto
     */
    async generateSummary(tenantId, provider, text, maxLength = 200, userId) {
        const messages = [
            {
                role: 'system',
                content: `Você é um especialista em criar resumos executivos. Resuma o texto de forma clara, objetiva e informativa em até ${maxLength} caracteres.`,
            },
            {
                role: 'user',
                content: `Resuma este texto:\n\n${text}`,
            },
        ];
        const result = await AIProviderService.generate({
            tenantId,
            provider,
            messages,
            temperature: 0.5,
            maxTokens: 500,
            module: 'summary',
            userId,
        });
        return result.content;
    }
    /**
     * Traduz texto
     */
    async translateText(tenantId, provider, text, targetLanguage, userId) {
        const messages = [
            {
                role: 'system',
                content: `Você é um tradutor profissional. Traduza o texto para ${targetLanguage} mantendo o tom, estilo e significado original.`,
            },
            {
                role: 'user',
                content: text,
            },
        ];
        const result = await AIProviderService.generate({
            tenantId,
            provider,
            messages,
            temperature: 0.3,
            maxTokens: 2000,
            module: 'translation',
            userId,
        });
        return result.content;
    }
    async generateImage(tenantId, prompt, options, userId) {
        return await this.analyze(tenantId, entities_1.AIProvider.OPENROUTER, 'black-forest-labs/flux-1-dev', entities_1.AnalysisType.IMAGE_GEN, { prompt, ...options }, userId);
    }
    async predictCampaignPerformance(tenantId, campaignData, userId) {
        return await this.analyze(tenantId, entities_1.AIProvider.GROQ, 'llama-3.1-70b-versatile', entities_1.AnalysisType.PREDICTION, campaignData, userId);
    }
}
exports.AIAssistantService = AIAssistantService;
//# sourceMappingURL=ai-assistant.service.js.map