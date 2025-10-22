import { useState, useEffect } from 'react';
import { BulkMessage, marketingService } from '@/services/marketingService';
import { Send, Clock, CheckCircle, XCircle, Eye, MousePointer, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BulkMessageListProps {
  onEdit: (message: BulkMessage) => void;
  refreshTrigger?: number;
}

const platformIcons: Record<string, string> = {
  whatsapp: '💬',
  instagram_dm: '📷',
  email: '📧',
};

const platformNames: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram_dm: 'Instagram DM',
  email: 'Email',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  sending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  sending: 'Enviando',
  completed: 'Concluído',
  failed: 'Falhou',
};

export default function BulkMessageList({ onEdit, refreshTrigger }: BulkMessageListProps) {
  const [messages, setMessages] = useState<BulkMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    platform: 'all',
    status: 'all',
  });

  useEffect(() => {
    loadMessages();
  }, [refreshTrigger]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      if (filters.platform !== 'all') filterParams.platform = filters.platform;
      if (filters.status !== 'all') filterParams.status = filters.status;

      const data = await marketingService.getBulkMessages(filterParams);
      setMessages(data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [filters]);

  const calculateMetrics = (message: BulkMessage) => {
    const deliveryRate = message.totalRecipients > 0
      ? ((message.deliveredCount / message.totalRecipients) * 100).toFixed(1)
      : '0';
    const openRate = message.deliveredCount > 0
      ? ((message.openedCount / message.deliveredCount) * 100).toFixed(1)
      : '0';
    const clickRate = message.openedCount > 0
      ? ((message.clickedCount / message.openedCount) * 100).toFixed(1)
      : '0';

    return { deliveryRate, openRate, clickRate };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Plataforma
          </label>
          <select
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="all">Todas</option>
            <option value="whatsapp">💬 WhatsApp</option>
            <option value="instagram_dm">📷 Instagram DM</option>
            <option value="email">📧 Email</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="all">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="scheduled">Agendado</option>
            <option value="sending">Enviando</option>
            <option value="completed">Concluído</option>
            <option value="failed">Falhou</option>
          </select>
        </div>

        <div className="ml-auto flex items-end">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {messages.length} mensagem{messages.length !== 1 ? 'ns' : ''} encontrada
            {messages.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Lista de Mensagens */}
      {messages.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Send className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma mensagem encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {messages.length === 0
              ? 'Crie sua primeira mensagem em massa'
              : 'Nenhuma mensagem corresponde aos filtros selecionados'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const metrics = calculateMetrics(message);
            return (
              <div
                key={message.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg text-2xl">
                      {platformIcons[message.platform]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {message.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {platformNames[message.platform]}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[message.status]}`}>
                          {statusLabels[message.status]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {message.scheduledAt && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <Clock size={14} />
                        Agendado: {format(new Date(message.scheduledAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    )}
                    {message.sentAt && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Send size={14} />
                        Enviado: {format(new Date(message.sentAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Preview */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 font-mono">
                    {message.content}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users size={14} className="text-blue-600" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {message.totalRecipients}
                    </p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Send size={14} className="text-yellow-600" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Enviados</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {message.sentCount}
                    </p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle size={14} className="text-green-600" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Entregues</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {message.deliveredCount}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{metrics.deliveryRate}%</p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Eye size={14} className="text-purple-600" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Abertos</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {message.openedCount}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{metrics.openRate}%</p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MousePointer size={14} className="text-indigo-600" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Cliques</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {message.clickedCount}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{metrics.clickRate}%</p>
                  </div>

                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <XCircle size={14} className="text-red-600" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Falhas</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {message.failedCount}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => onEdit(message)}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
