import { useState, useEffect } from 'react';
import { Brain, Check, X, Loader2, Plus, Trash2, TestTube } from 'lucide-react';
import toast from 'react-hot-toast';

interface AIProvider {
  id: string;
  platform: string;
  name: string;
  credentials: {
    api_key?: string;
  };
  config: {
    base_url?: string;
  };
  status: 'active' | 'inactive' | 'error';
  errorMessage?: string;
}

const AI_PROVIDERS = [
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference with Mixtral and Llama models',
    icon: '⚡',
    requiresApiKey: true,
    requiresBaseUrl: false,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access to Claude, GPT-4, Gemini and 100+ models',
    icon: '🌐',
    requiresApiKey: true,
    requiresBaseUrl: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'High-quality Chinese and English language models',
    icon: '🔍',
    requiresApiKey: true,
    requiresBaseUrl: false,
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'European AI with powerful open models',
    icon: '🇪🇺',
    requiresApiKey: true,
    requiresBaseUrl: false,
  },
  {
    id: 'qwen',
    name: 'Qwen (Alibaba)',
    description: 'Advanced multilingual models from Alibaba',
    icon: '🐼',
    requiresApiKey: true,
    requiresBaseUrl: false,
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Run LLMs locally on your own infrastructure',
    icon: '🦙',
    requiresApiKey: false,
    requiresBaseUrl: true,
  },
];

export default function AIProvidersConfig() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ apiKey: string; baseUrl: string }>({
    apiKey: '',
    baseUrl: '',
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketing/integrations?status=active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load providers');

      const data = await response.json();

      // Filter only AI providers
      const aiProviders = data.filter((p: AIProvider) =>
        ['groq', 'openrouter', 'deepseek', 'mistral', 'qwen', 'ollama'].includes(p.platform)
      );

      setProviders(aiProviders);
    } catch (error: any) {
      console.error('Error loading AI providers:', error);
      toast.error('Erro ao carregar provedores de IA');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (providerId: string) => {
    const providerConfig = AI_PROVIDERS.find(p => p.id === providerId);

    if (!providerConfig) return;

    if (providerConfig.requiresApiKey && !formData.apiKey) {
      toast.error('API Key é obrigatória');
      return;
    }

    if (providerConfig.requiresBaseUrl && !formData.baseUrl) {
      toast.error('Base URL é obrigatória');
      return;
    }

    try {
      const response = await fetch('/api/marketing/integrations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: providerId,
          name: providerConfig.name,
          credentials: {
            api_key: formData.apiKey || undefined,
          },
          config: {
            base_url: formData.baseUrl || undefined,
          },
          status: 'active',
        }),
      });

      if (!response.ok) throw new Error('Failed to save integration');

      toast.success(`${providerConfig.name} configurado com sucesso!`);
      setEditing(null);
      setFormData({ apiKey: '', baseUrl: '' });
      loadProviders();
    } catch (error: any) {
      console.error('Error saving integration:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const handleTest = async (provider: AIProvider) => {
    try {
      const response = await fetch(`/api/marketing/integrations/${provider.id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Test failed');

      const result = await response.json();

      if (result.success) {
        toast.success(`${provider.name}: Conexão OK!`);
      } else {
        toast.error(`${provider.name}: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Error testing integration:', error);
      toast.error('Erro ao testar conexão');
    }
  };

  const handleDelete = async (provider: AIProvider) => {
    if (!confirm(`Deseja remover a configuração de ${provider.name}?`)) return;

    try {
      const response = await fetch(`/api/marketing/integrations/${provider.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success(`${provider.name} removido com sucesso!`);
      loadProviders();
    } catch (error: any) {
      console.error('Error deleting integration:', error);
      toast.error('Erro ao remover configuração');
    }
  };

  const getProvider = (providerId: string) => {
    return providers.find(p => p.platform === providerId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Provedores de IA
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure suas credenciais para usar IA no módulo de Marketing
        </p>
      </div>

      {/* Providers Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {AI_PROVIDERS.map((providerConfig) => {
          const provider = getProvider(providerConfig.id);
          const isEditing = editing === providerConfig.id;
          const isConfigured = !!provider;

          return (
            <div
              key={providerConfig.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Provider Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{providerConfig.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {providerConfig.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {providerConfig.description}
                    </p>
                  </div>
                </div>

                {isConfigured && (
                  <div className="flex items-center gap-1">
                    {provider.status === 'active' && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                    {provider.status === 'error' && (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                )}
              </div>

              {/* Configuration Form / Status */}
              {!isConfigured || isEditing ? (
                <div className="space-y-4">
                  {providerConfig.requiresApiKey && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={formData.apiKey}
                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                        placeholder="sk-..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                      />
                    </div>
                  )}

                  {providerConfig.requiresBaseUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Base URL
                      </label>
                      <input
                        type="url"
                        value={formData.baseUrl}
                        onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                        placeholder="http://localhost:11434"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(providerConfig.id)}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      Salvar
                    </button>
                    {isEditing && (
                      <button
                        onClick={() => {
                          setEditing(null);
                          setFormData({ apiKey: '', baseUrl: '' });
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      provider.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {provider.status === 'active' ? 'Ativo' : 'Erro'}
                    </span>
                  </div>

                  {/* Error Message */}
                  {provider.errorMessage && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {provider.errorMessage}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTest(provider)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                    >
                      <TestTube size={16} />
                      Testar
                    </button>
                    <button
                      onClick={() => setEditing(providerConfig.id)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(provider)}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Add Button for Unconfigured */}
              {!isConfigured && !isEditing && (
                <button
                  onClick={() => setEditing(providerConfig.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-primary-600 hover:text-primary-600 transition-colors"
                >
                  <Plus size={20} />
                  Configurar {providerConfig.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          💡 Como usar?
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Configure pelo menos um provedor de IA para usar o Assistente de Marketing</li>
          <li>• As credenciais são armazenadas de forma segura e criptografada</li>
          <li>• Você pode configurar múltiplos provedores e alternar entre eles</li>
          <li>• Use o botão "Testar" para verificar se suas credenciais estão corretas</li>
        </ul>
      </div>
    </div>
  );
}
