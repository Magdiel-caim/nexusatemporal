import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Hash, CheckCircle, XCircle, Clock } from 'lucide-react';
import chatService from '../../services/chatService';

interface WhatsAppChannel {
  sessionName: string;
  friendlyName?: string; // ✨ Nome amigável (ex: "Atemporal")
  phoneNumber: string;
  status: string;
  conversationCount: number;
  unreadCount: number;
}

interface ChannelSelectorProps {
  selectedChannel: string | null;
  onChannelSelect: (sessionName: string | null) => void;
}

const ChannelSelector: React.FC<ChannelSelectorProps> = ({ selectedChannel, onChannelSelect }) => {
  const [channels, setChannels] = useState<WhatsAppChannel[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setIsLoading(true);
      const data = await chatService.getChannels();

      // Backend já filtra e retorna apenas canais "atemporal"
      setChannels(data);
    } catch (error) {
      console.error('Erro ao carregar canais:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSessionName = (sessionName: string): string => {
    // Remove prefixos comuns e formata o nome
    return sessionName
      .replace(/^session_/, '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'WORKING':
        return <span title="Conectado"><CheckCircle className="h-3 w-3 text-green-500" /></span>;
      case 'STARTING':
        return <span title="Iniciando"><Clock className="h-3 w-3 text-yellow-500" /></span>;
      case 'FAILED':
      case 'STOPPED':
        return <span title="Desconectado"><XCircle className="h-3 w-3 text-red-500" /></span>;
      default:
        return <span title="Desconhecido"><Clock className="h-3 w-3 text-gray-400" /></span>;
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      {/* Header - Canais */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
          <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Canais</span>
        </div>
        {channels.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{channels.length}</span>
        )}
      </button>

      {/* Lista de Canais */}
      {isExpanded && (
        <div className="pb-2">
          {/* Opção "Todos os canais" */}
          <button
            onClick={() => onChannelSelect(null)}
            className={`w-full px-8 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              selectedChannel === null ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Todos os canais</span>
              {selectedChannel === null && (
                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </div>
          </button>

          {/* Lista de Canais */}
          {isLoading ? (
            <div className="px-8 py-4 text-xs text-gray-500 dark:text-gray-400">Carregando...</div>
          ) : channels.length === 0 ? (
            <div className="px-8 py-4 text-xs text-gray-500 dark:text-gray-400">Nenhum canal disponível</div>
          ) : (
            channels.map((channel) => (
              <button
                key={channel.sessionName}
                onClick={() => onChannelSelect(channel.sessionName)}
                className={`w-full px-8 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  selectedChannel === channel.sessionName
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(channel.status)}
                    <span className="truncate">{channel.friendlyName || formatSessionName(channel.sessionName)}</span>
                    {channel.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {channel.unreadCount}
                      </span>
                    )}
                  </div>
                  {selectedChannel === channel.sessionName && (
                    <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                  <span>{channel.conversationCount} conversas</span>
                  <span className="text-gray-400">•</span>
                  <span className="truncate">{channel.phoneNumber}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ChannelSelector;
