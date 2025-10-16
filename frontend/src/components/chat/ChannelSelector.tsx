import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Hash } from 'lucide-react';
import chatService from '../../services/chatService';

interface WhatsAppSession {
  sessionName: string;
  totalContacts: number;
  totalMessages: number;
  unreadMessages: number;
  lastActivity: string;
}

interface ChannelSelectorProps {
  selectedChannel: string | null;
  onChannelSelect: (sessionName: string | null) => void;
}

const ChannelSelector: React.FC<ChannelSelectorProps> = ({ selectedChannel, onChannelSelect }) => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const data = await chatService.getWhatsAppSessions();
      setSessions(data);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
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
        {sessions.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{sessions.length}</span>
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

          {/* Lista de Sessões */}
          {isLoading ? (
            <div className="px-8 py-4 text-xs text-gray-500 dark:text-gray-400">Carregando...</div>
          ) : sessions.length === 0 ? (
            <div className="px-8 py-4 text-xs text-gray-500 dark:text-gray-400">Nenhum canal disponível</div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.sessionName}
                onClick={() => onChannelSelect(session.sessionName)}
                className={`w-full px-8 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  selectedChannel === session.sessionName
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{formatSessionName(session.sessionName)}</span>
                    {session.unreadMessages > 0 && (
                      <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {session.unreadMessages}
                      </span>
                    )}
                  </div>
                  {selectedChannel === session.sessionName && (
                    <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {session.totalContacts} contatos
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
