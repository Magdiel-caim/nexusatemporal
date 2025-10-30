import { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  AlertCircle,
  CheckCircle,
  Ban,
  PlayCircle,
  Calendar,
  Activity,
  Shield,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

interface ApiKey {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'revoked';
  scopes: string[];
  allowedIps?: string[];
  allowedOrigins?: string[];
  rateLimit: number;
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  createdAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
}

interface CreateApiKeyData {
  name: string;
  description?: string;
  scopes: string[];
  allowedIps?: string;
  allowedOrigins?: string;
  rateLimit: number;
  expiresAt?: string;
}

export default function ApiKeysManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [formData, setFormData] = useState<CreateApiKeyData>({
    name: '',
    description: '',
    scopes: ['read'],
    allowedIps: '',
    allowedOrigins: '',
    rateLimit: 1000,
    expiresAt: '',
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const response = await api.get('/integrations/api-keys');
      setApiKeys(response.data);
    } catch (error: any) {
      console.error('Error loading API keys:', error);
      toast.error('Erro ao carregar API Keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        allowedIps: formData.allowedIps
          ? formData.allowedIps.split(',').map((ip) => ip.trim())
          : undefined,
        allowedOrigins: formData.allowedOrigins
          ? formData.allowedOrigins.split(',').map((origin) => origin.trim())
          : undefined,
      };

      const response = await api.post('/integrations/api-keys', payload);

      setGeneratedKey(response.data.key);
      setShowKeyModal(true);
      setShowCreateModal(false);

      // Reset form
      setFormData({
        name: '',
        description: '',
        scopes: ['read'],
        allowedIps: '',
        allowedOrigins: '',
        rateLimit: 1000,
        expiresAt: '',
      });

      await loadApiKeys();
      toast.success('API Key criada com sucesso!');
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar API Key');
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Tem certeza que deseja revogar esta API Key? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await api.post(`/integrations/api-keys/${id}/revoke`);
      toast.success('API Key revogada com sucesso');
      await loadApiKeys();
    } catch (error: any) {
      console.error('Error revoking API key:', error);
      toast.error('Erro ao revogar API Key');
    }
  };

  const handleActivateKey = async (id: string) => {
    try {
      await api.post(`/integrations/api-keys/${id}/activate`);
      toast.success('API Key ativada com sucesso');
      await loadApiKeys();
    } catch (error: any) {
      console.error('Error activating API key:', error);
      toast.error('Erro ao ativar API Key');
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta API Key?')) {
      return;
    }

    try {
      await api.delete(`/integrations/api-keys/${id}`);
      toast.success('API Key deletada com sucesso');
      await loadApiKeys();
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      toast.error('Erro ao deletar API Key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        label: 'Ativa',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      inactive: {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        label: 'Inativa',
        icon: <Ban className="w-4 h-4" />,
      },
      revoked: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        label: 'Revogada',
        icon: <AlertCircle className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            API Keys
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie chaves de API para integrar com N8N e outros sistemas externos
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova API Key
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
              Como usar as API Keys
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc ml-4">
              <li>Envie a chave no header: <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">Authorization: Bearer nxs_xxxxx</code></li>
              <li>Ou via query param: <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">?api_key=nxs_xxxxx</code></li>
              <li>Defina escopos (read, write, full) para controlar permissões</li>
              <li>Configure IPs e origens permitidas para maior segurança</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Key className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Nenhuma API Key criada ainda
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Crie sua primeira API Key para começar a integrar
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar API Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {apiKey.name}
                    </h3>
                    {getStatusBadge(apiKey.status)}
                  </div>
                  {apiKey.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {apiKey.description}
                    </p>
                  )}

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Shield className="w-3 h-3" />
                        Escopos
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Activity className="w-3 h-3" />
                        Rate Limit
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {apiKey.rateLimit}/hora
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Activity className="w-3 h-3" />
                        Uso
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {apiKey.usageCount.toLocaleString()} requisições
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Calendar className="w-3 h-3" />
                        Último uso
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(apiKey.lastUsedAt)}
                      </p>
                    </div>
                  </div>

                  {/* IPs e Origins */}
                  {(apiKey.allowedIps || apiKey.allowedOrigins) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {apiKey.allowedIps && apiKey.allowedIps.length > 0 && (
                        <div className="mb-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <Globe className="w-3 h-3" />
                            IPs Permitidos
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {apiKey.allowedIps.join(', ')}
                          </p>
                        </div>
                      )}
                      {apiKey.allowedOrigins && apiKey.allowedOrigins.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <Globe className="w-3 h-3" />
                            Origens Permitidas
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {apiKey.allowedOrigins.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {apiKey.status === 'active' && (
                    <button
                      onClick={() => handleRevokeKey(apiKey.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Revogar"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  {apiKey.status === 'inactive' && (
                    <button
                      onClick={() => handleActivateKey(apiKey.id)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Ativar"
                    >
                      <PlayCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Criar Nova API Key
              </h3>
            </div>

            <form onSubmit={handleCreateApiKey} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  placeholder="Ex: N8N Workflow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Descreva para que será usada esta chave"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Escopos *
                </label>
                <div className="space-y-2">
                  {['read', 'write', 'full'].map((scope) => (
                    <label key={scope} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.scopes.includes(scope)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, scopes: [...formData.scopes, scope] });
                          } else {
                            setFormData({
                              ...formData,
                              scopes: formData.scopes.filter((s) => s !== scope),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {scope === 'read' && 'Leitura - Apenas consultar dados'}
                        {scope === 'write' && 'Escrita - Criar e modificar dados'}
                        {scope === 'full' && 'Completo - Acesso total (read + write)'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rate Limit (requisições/hora)
                </label>
                <input
                  type="number"
                  value={formData.rateLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, rateLimit: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IPs Permitidos (opcional)
                </label>
                <input
                  type="text"
                  value={formData.allowedIps}
                  onChange={(e) => setFormData({ ...formData, allowedIps: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 192.168.1.1, 10.0.0.1 (separados por vírgula)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Origens Permitidas (opcional)
                </label>
                <input
                  type="text"
                  value={formData.allowedOrigins}
                  onChange={(e) =>
                    setFormData({ ...formData, allowedOrigins: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: https://n8n.example.com, https://app.example.com"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar API Key
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Key Display Modal */}
      {showKeyModal && generatedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                API Key Criada com Sucesso!
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                      Atenção! Copie esta chave agora
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Esta é a única vez que você verá esta chave. Guarde-a em um local seguro.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sua API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedKey}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedKey)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setGeneratedKey('');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar (Já copiei a chave)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
