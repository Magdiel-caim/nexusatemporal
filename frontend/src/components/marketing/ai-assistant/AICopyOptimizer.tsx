import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Copy, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { marketingService } from '@/services/marketingService';

const optimizeCopySchema = z.object({
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
  platform: z.enum(['instagram', 'facebook', 'linkedin', 'email', 'website']).optional(),
  audience: z.string().optional(),
  goal: z.enum(['engagement', 'conversion', 'awareness', 'education']).optional(),
  provider: z.enum(['groq', 'openrouter', 'deepseek', 'mistral', 'qwen', 'ollama']),
  model: z.string(),
});

type OptimizeCopyFormData = z.infer<typeof optimizeCopySchema>;

const providerModels: Record<string, string[]> = {
  groq: ['mixtral-8x7b-32768', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'],
  openrouter: ['meta-llama/llama-3.1-70b-instruct', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro-1.5'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
  mistral: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
  qwen: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
  ollama: ['llama3.1', 'mistral', 'codellama'],
};

export default function AICopyOptimizer() {
  const [loading, setLoading] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OptimizeCopyFormData>({
    resolver: zodResolver(optimizeCopySchema),
    defaultValues: {
      content: '',
      platform: 'instagram',
      audience: '',
      goal: 'engagement',
      provider: 'groq',
      model: 'mixtral-8x7b-32768',
    },
  });

  const selectedProvider = watch('provider');
  const content = watch('content');

  const onSubmit = async (data: OptimizeCopyFormData) => {
    try {
      setLoading(true);
      setOptimizedContent('');
      setSuggestions([]);

      const result = await marketingService.optimizeCopy({
        content: data.content,
        platform: data.platform,
        audience: data.audience,
        goal: data.goal,
      });

      // Parse AI response
      if (result.outputData?.optimizedContent) {
        setOptimizedContent(result.outputData.optimizedContent);
      }
      if (result.suggestions) {
        setSuggestions(result.suggestions);
      }

      toast.success('Conteúdo otimizado com sucesso!');
    } catch (error) {
      console.error('Erro ao otimizar conteúdo:', error);
      toast.error('Erro ao otimizar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado para área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Form */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-primary-600" size={20} />
            Otimizar Copy com IA
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Provider & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Provider *
                </label>
                <select
                  {...register('provider')}
                  onChange={(e) => {
                    setValue('provider', e.target.value as any);
                    // Set default model for selected provider
                    const models = providerModels[e.target.value];
                    if (models.length > 0) {
                      setValue('model', models[0]);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="groq">Groq</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="mistral">Mistral</option>
                  <option value="qwen">Qwen</option>
                  <option value="ollama">Ollama (Local)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modelo *
                </label>
                <select
                  {...register('model')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  {providerModels[selectedProvider]?.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conteúdo Original *
              </label>
              <textarea
                {...register('content')}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
                placeholder="Cole ou digite o texto que deseja otimizar..."
              />
              <div className="flex justify-between items-center mt-1">
                {errors.content && <p className="text-sm text-red-600">{errors.content.message}</p>}
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                  {content?.length || 0} caracteres
                </p>
              </div>
            </div>

            {/* Platform & Goal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plataforma
                </label>
                <select
                  {...register('platform')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="email">Email</option>
                  <option value="website">Website</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Objetivo
                </label>
                <select
                  {...register('goal')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="engagement">Engajamento</option>
                  <option value="conversion">Conversão</option>
                  <option value="awareness">Consciência</option>
                  <option value="education">Educação</option>
                </select>
              </div>
            </div>

            {/* Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Público-Alvo (Opcional)
              </label>
              <input
                type="text"
                {...register('audience')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Ex: Mulheres 25-40 anos interessadas em beleza"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Otimizando...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Otimizar com IA
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column - Results */}
      <div className="space-y-6">
        {/* Optimized Content */}
        {optimizedContent && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                Conteúdo Otimizado
              </h3>
              <button
                onClick={() => handleCopy(optimizedContent)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                {copied ? (
                  <>
                    <CheckCircle size={16} />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copiar
                  </>
                )}
              </button>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{optimizedContent}</p>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sugestões de Melhoria
            </h3>
            <ul className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-medium text-xs">
                    {index + 1}
                  </span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty State */}
        {!optimizedContent && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aguardando otimização
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Preencha o formulário e clique em "Otimizar com IA" para ver os resultados
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <RefreshCw className="h-16 w-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Otimizando conteúdo...
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              A IA está analisando e melhorando seu texto
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
