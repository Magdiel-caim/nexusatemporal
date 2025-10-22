import { useState, useEffect } from 'react';
import { MessageSquare, Plus, QrCode, Play, Square, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface WAHASession {
  id: string;
  name: string;
  displayName: string;
  phoneNumber?: string;
  status: 'stopped' | 'starting' | 'scan_qr_code' | 'working' | 'failed';
  qrCode?: string;
  wahaServerUrl: string;
  isPrimary: boolean;
  isActive: boolean;
  failoverEnabled: boolean;
  failoverPriority: number;
  maxMessagesPerMinute: number;
  minDelaySeconds: number;
  maxDelaySeconds: number;
  errorMessage?: string;
  lastConnectedAt?: string;
}

const STATUS_COLORS = {
  stopped: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  starting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  scan_qr_code: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  working: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const STATUS_LABELS = {
  stopped: 'Parado',
  starting: 'Iniciando...',
  scan_qr_code: 'Aguardando QR Code',
  working: 'Conectado',
  failed: 'Erro',
};

export default function WAHASessionsConfig() {
  const [sessions, setSessions] = useState<WAHASession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    wahaServerUrl: 'https://apiwts.nexusatemporal.com.br',
    wahaApiKey: 'bd0c416348b2f04d198ff8971b608a87',
    isPrimary: false,
    failoverEnabled: true,
    failoverPriority: 0,
    maxMessagesPerMinute: 30,
    minDelaySeconds: 1,
    maxDelaySeconds: 5,
  });
  const [selectedQR, setSelectedQR] = useState<{ sessionId: string; qrCode: string } | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketing/waha/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load sessions');

      const data = await response.json();
      setSessions(data);
    } catch (error: any) {
      console.error('Error loading WAHA sessions:', error);
      toast.error('Erro ao carregar sessões WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome da sessão é obrigatório');
      return;
    }

    try {
      const response = await fetch('/api/marketing/waha/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create session');

      toast.success('Sessão criada com sucesso!');
      setShowForm(false);
      setFormData({
        name: '',
        displayName: '',
        wahaServerUrl: 'https://apiwts.nexusatemporal.com.br',
        wahaApiKey: 'bd0c416348b2f04d198ff8971b608a87',
        isPrimary: false,
        failoverEnabled: true,
        failoverPriority: 0,
        maxMessagesPerMinute: 30,
        minDelaySeconds: 1,
        maxDelaySeconds: 5,
      });
      loadSessions();
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error('Erro ao criar sessão');
    }
  };

  const handleStart = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/marketing/waha/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to start session');

      const result = await response.json();

      if (result.qrCode) {
        setSelectedQR({ sessionId, qrCode: result.qrCode });
        toast.success('Sessão iniciada! Escaneie o QR Code para conectar');
      }

      loadSessions();
    } catch (error: any) {
      console.error('Error starting session:', error);
      toast.error('Erro ao iniciar sessão');
    }
  };

  const handleStop = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/marketing/waha/sessions/${sessionId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to stop session');

      toast.success('Sessão parada com sucesso!');
      setSelectedQR(null);
      loadSessions();
    } catch (error: any) {
      console.error('Error stopping session:', error);
      toast.error('Erro ao parar sessão');
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Deseja realmente excluir esta sessão?')) return;

    try {
      const response = await fetch(`/api/marketing/waha/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete session');

      toast.success('Sessão excluída com sucesso!');
      loadSessions();
    } catch (error: any) {
      console.error('Error deleting session:', error);
      toast.error('Erro ao excluir sessão');
    }
  };

  const handleRefreshQR = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/marketing/waha/sessions/${sessionId}/qr`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to get QR code');

      const result = await response.json();

      if (result.qrCode) {
        setSelectedQR({ sessionId, qrCode: result.qrCode });
        toast.success('QR Code atualizado!');
      }
    } catch (error: any) {
      console.error('Error refreshing QR:', error);
      toast.error('Erro ao atualizar QR Code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Sessões WhatsApp (WAHA)
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie múltiplos números de WhatsApp para disparos em massa
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Nova Sessão
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Criar Nova Sessão WhatsApp
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome da Sessão *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: principal, vendas, suporte"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome de Exibição
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="ex: WhatsApp Principal"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Servidor WAHA
              </label>
              <input
                type="url"
                value={formData.wahaServerUrl}
                onChange={(e) => setFormData({ ...formData, wahaServerUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={formData.wahaApiKey}
                onChange={(e) => setFormData({ ...formData, wahaApiKey: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensagens por Minuto
              </label>
              <input
                type="number"
                value={formData.maxMessagesPerMinute}
                onChange={(e) => setFormData({ ...formData, maxMessagesPerMinute: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridade Failover
              </label>
              <input
                type="number"
                value={formData.failoverPriority}
                onChange={(e) => setFormData({ ...formData, failoverPriority: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Sessão Principal</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.failoverEnabled}
                  onChange={(e) => setFormData({ ...formData, failoverEnabled: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Failover Ativo</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleCreate}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Criar Sessão
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma sessão configurada
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Crie uma sessão para começar a enviar mensagens em massa via WhatsApp
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {session.displayName || session.name}
                    </h3>
                    {session.isPrimary && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs font-medium">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {session.phoneNumber || 'Número não conectado'}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded text-xs font-medium ${STATUS_COLORS[session.status]}`}>
                  {STATUS_LABELS[session.status]}
                </span>
              </div>

              {/* Error Message */}
              {session.errorMessage && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-400">{session.errorMessage}</p>
                </div>
              )}

              {/* QR Code */}
              {selectedQR?.sessionId === session.id && selectedQR.qrCode && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Escaneie o QR Code com WhatsApp
                    </p>
                    <button
                      onClick={() => handleRefreshQR(session.id)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={selectedQR.qrCode}
                      alt="QR Code"
                      className="max-w-xs rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Settings Summary */}
              <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Msg/Min</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {session.maxMessagesPerMinute}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Delay (s)</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {session.minDelaySeconds}-{session.maxDelaySeconds}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Prioridade</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {session.failoverPriority}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {session.status === 'stopped' || session.status === 'failed' ? (
                  <button
                    onClick={() => handleStart(session.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
                  >
                    <Play size={16} />
                    Iniciar
                  </button>
                ) : (
                  <button
                    onClick={() => handleStop(session.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors text-sm font-medium"
                  >
                    <Square size={16} />
                    Parar
                  </button>
                )}

                {session.status === 'scan_qr_code' && (
                  <button
                    onClick={() => handleRefreshQR(session.id)}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <QrCode size={16} />
                  </button>
                )}

                <button
                  onClick={() => loadSessions()}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw size={16} />
                </button>

                <button
                  onClick={() => handleDelete(session.id)}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          💡 Dicas de Uso
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Configure múltiplas sessões para distribuir os envios e aumentar a capacidade</li>
          <li>• A sessão principal será usada primeiro, com failover automático para as outras</li>
          <li>• Ajuste mensagens/minuto e delay para evitar bloqueios do WhatsApp</li>
          <li>• Recomendado: máximo 30 msg/min com delay de 1-5 segundos entre mensagens</li>
        </ul>
      </div>
    </div>
  );
}
