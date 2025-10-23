/**
 * AI Integrations Tab
 *
 * Interface para configurar integrações com múltiplas IAs
 * (OpenAI, Claude, Gemini, OpenRouter, Groq, etc.)
 */

import { useState, useEffect } from 'react';
import { Bot, Sparkles, Zap, Brain, Cpu, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

interface AIProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  models: string[];
  docsUrl: string;
  configured: boolean;
  apiKey?: string;
  selectedModel?: string;
}

interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
  isActive: boolean;
}

export default function AIIntegrationsTab() {
  const [providers, setProviders] = useState<AIProvider[]>([
    {
      id: 'openai',
      name: 'OpenAI',
      icon: <Bot className="w-8 h-8 text-green-600" />,
      description: 'ChatGPT, GPT-4, GPT-4 Turbo',
      models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
      docsUrl: 'https://platform.openai.com/api-keys',
      configured: false,
    },
    {
      id: 'anthropic',
      name: 'Claude (Anthropic)',
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      description: 'Claude 3 Opus, Sonnet, Haiku',
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      docsUrl: 'https://console.anthropic.com/settings/keys',
      configured: false,
    },
    {
      id: 'google',
      name: 'Google Gemini',
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      description: 'Gemini Pro, Gemini Ultra',
      models: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
      docsUrl: 'https://makersuite.google.com/app/apikey',
      configured: false,
    },
    {
      id: 'groq',
      name: 'Groq',
      icon: <Zap className="w-8 h-8 text-orange-600" />,
      description: 'LLaMA, Mixtral (ultra-rápido e gratuito)',
      models: ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'],
      docsUrl: 'https://console.groq.com/keys',
      configured: false,
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      icon: <Cpu className="w-8 h-8 text-indigo-600" />,
      description: 'Acesso a múltiplas IAs (inclui modelos gratuitos)',
      models: [
        'meta-llama/llama-3-70b-instruct:free',
        'meta-llama/llama-3-8b-instruct:free',
        'google/gemma-7b-it:free',
        'mistralai/mistral-7b-instruct:free',
        'openchat/openchat-7b:free',
        'gpt-4-turbo-preview',
        'claude-3-opus-20240229',
      ],
      docsUrl: 'https://openrouter.ai/keys',
      configured: false,
    },
  ]);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      const response = await api.get('/marketing/ai/configs');
      const configs: AIConfig[] = response.data.data || [];

      setProviders((prev) =>
        prev.map((provider) => {
          const config = configs.find((c) => c.provider === provider.id);
          if (config) {
            return {
              ...provider,
              configured: true,
              apiKey: config.apiKey,
              selectedModel: config.model,
            };
          }
          return provider;
        })
      );
    } catch (error) {
      console.error('Erro ao carregar configurações de IA:', error);
    }
  };

  const handleConfigure = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setApiKey(provider.apiKey || '');
    setSelectedModel(provider.selectedModel || provider.models[0]);
    setShowConfigModal(true);
  };

  const handleSave = async () => {
    if (!selectedProvider || !apiKey) {
      toast.error('Preencha a API Key');
      return;
    }

    try {
      setLoading(true);

      await api.post('/marketing/ai/configs', {
        provider: selectedProvider.id,
        apiKey,
        model: selectedModel,
        isActive: true,
      });

      toast.success(`${selectedProvider.name} configurado com sucesso!`);
      setShowConfigModal(false);
      loadConfigurations();
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar configuração');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (providerId: string) => {
    if (!confirm('Deseja remover esta configuração?')) return;

    try {
      await api.delete(`/marketing/ai/configs/${providerId}`);
      toast.success('Configuração removida');
      loadConfigurations();
    } catch (error: any) {
      console.error('Erro ao deletar configuração:', error);
      toast.error('Erro ao remover configuração');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary-600" />
          Integrações de IA
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure as chaves de API para usar inteligência artificial nas campanhas
        </p>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {provider.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {provider.description}
                  </p>
                  {provider.configured && provider.selectedModel && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        Configurado
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Modelo: {provider.selectedModel}
                      </span>
                    </div>
                  )}
                  {!provider.configured && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      Não configurado
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => handleConfigure(provider)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  provider.configured
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {provider.configured ? 'Reconfigurar' : 'Configurar'}
              </button>
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                title="Documentação"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              {provider.configured && (
                <button
                  onClick={() => handleDelete(provider.id)}
                  className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {selectedProvider.icon}
                Configurar {selectedProvider.name}
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* API Key Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key {selectedProvider.name}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Chave API para integração com {selectedProvider.name}
                </p>
              </div>

              {/* Model Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modelo
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  {selectedProvider.models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                      {model.includes(':free') && ' (Gratuito)'}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Escolha o modelo de IA que será usado
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
