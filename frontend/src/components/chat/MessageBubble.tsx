import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, CheckCheck, Clock, Download, Play, FileText, Reply, Loader2 } from 'lucide-react';
import { useMediaUrl } from '../hooks/useMediaUrl';

interface MessageBubbleProps {
  message: {
    id: string;
    content?: string;
    direction: 'incoming' | 'outgoing';
    type: string;
    status: string;
    createdAt: string;
    sentAt?: string;
    deliveredAt?: string;
    readAt?: string;
    mediaUrl?: string;
    quotedMsg?: {
      content: string;
      senderName: string;
    };
  };
  onReply?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onReply, onDelete }) => {
  const isOutgoing = message.direction === 'outgoing';

  // Buscar signed URL para mídias (se necessário)
  const { url: signedMediaUrl, loading: loadingMedia, error: mediaError } = useMediaUrl(
    message.id,
    message.mediaUrl
  );

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: ptBR });
  };

  const getStatusIcon = (status: string) => {
    const getTooltip = () => {
      if (message.readAt) {
        return `Lido em ${format(new Date(message.readAt), 'dd/MM HH:mm', { locale: ptBR })}`;
      }
      if (message.deliveredAt) {
        return `Entregue em ${format(new Date(message.deliveredAt), 'dd/MM HH:mm', { locale: ptBR })}`;
      }
      if (message.sentAt) {
        return `Enviado em ${format(new Date(message.sentAt), 'dd/MM HH:mm', { locale: ptBR })}`;
      }
      return undefined;
    };

    switch (status) {
      case 'sent':
        return <span title={getTooltip()}><Check className="h-3 w-3 text-gray-400" /></span>;
      case 'delivered':
        return <span title={getTooltip()}><CheckCheck className="h-3 w-3 text-gray-400" /></span>;
      case 'read':
        return <span title={getTooltip()}><CheckCheck className="h-3 w-3 text-blue-500" /></span>;
      case 'pending':
        return <span title="Enviando..."><Clock className="h-3 w-3 text-gray-400" /></span>;
      default:
        return null;
    }
  };

  const renderMedia = () => {
    if (!message.mediaUrl) return null;

    // Mostrar loader enquanto busca signed URL
    if (loadingMedia) {
      return (
        <div className="mb-2 flex items-center gap-2 p-4 bg-white/10 rounded-lg">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm opacity-75">Carregando mídia...</span>
        </div>
      );
    }

    // Mostrar erro se houver problema ao carregar
    if (mediaError || !signedMediaUrl) {
      return (
        <div className="mb-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">⚠️ Erro ao carregar mídia</p>
        </div>
      );
    }

    switch (message.type) {
      case 'image':
        return (
          <div className="mb-2">
            <img
              src={signedMediaUrl}
              alt="Imagem"
              className="rounded-lg max-w-sm max-h-96 object-contain cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(signedMediaUrl, '_blank')}
              onError={(e) => {
                console.error('Erro ao carregar imagem:', signedMediaUrl);
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-sm text-red-700 dark:text-red-300">⚠️ Imagem não disponível</div>';
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="mb-2 relative group">
            <video
              src={signedMediaUrl}
              controls
              className="rounded-lg max-w-sm max-h-96 object-contain"
              controlsList="nodownload"
            />
            <a
              href={signedMediaUrl}
              download
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        );

      case 'audio':
      case 'ptt': // Push-to-talk (áudio gravado)
        return (
          <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
            <Play className="h-5 w-5" />
            <audio src={signedMediaUrl} controls className="flex-1" />
          </div>
        );

      case 'document':
        return (
          <a
            href={signedMediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <FileText className="h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Documento</p>
              <p className="text-xs opacity-75">Clique para abrir</p>
            </div>
            <Download className="h-4 w-4" />
          </a>
        );

      default:
        return null;
    }
  };

  const renderQuotedMessage = () => {
    if (!message.quotedMsg) return null;

    return (
      <div className="mb-2 p-2 border-l-4 border-white/30 bg-white/10 rounded">
        <p className="text-xs font-semibold opacity-75">{message.quotedMsg.senderName}</p>
        <p className="text-xs opacity-60 truncate">{message.quotedMsg.content}</p>
      </div>
    );
  };

  return (
    <div
      className={`flex group ${isOutgoing ? 'justify-end' : 'justify-start'}`}
    >
      <div className="flex items-end gap-2 max-w-[70%]">
        {/* Message Bubble */}
        <div
          className={`px-4 py-2 rounded-lg ${
            isOutgoing
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
          }`}
        >
          {/* Quoted Message */}
          {renderQuotedMessage()}

          {/* Media Content */}
          {renderMedia()}

          {/* Text Content */}
          {message.content && <p className="text-sm break-words">{message.content}</p>}

          {/* Timestamp and Status */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-xs opacity-75">{formatTime(message.createdAt)}</span>
            {isOutgoing && getStatusIcon(message.status)}
          </div>
        </div>

        {/* Action Buttons (show on hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {onReply && (
            <button
              onClick={() => onReply(message.id)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
              title="Responder"
            >
              <Reply className="h-4 w-4" />
            </button>
          )}
          {onDelete && isOutgoing && (
            <button
              onClick={() => onDelete(message.id)}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
              title="Excluir"
            >
              <Download className="h-4 w-4 rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
