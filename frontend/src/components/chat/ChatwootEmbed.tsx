import React, { useState, useEffect } from 'react';
import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface ChatwootEmbedProps {
  className?: string;
}

const ChatwootEmbed: React.FC<ChatwootEmbedProps> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const chatwootUrl = 'https://chat.nexusatemporal.com';

  useEffect(() => {
    // Reset states when component mounts
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleReload = () => {
    setIsLoading(true);
    setHasError(false);
    // Force iframe reload by changing key
    const iframe = document.getElementById('chatwoot-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const handleOpenExternal = () => {
    window.open(chatwootUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`relative w-full h-full bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Carregando Chatwoot...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Erro ao Carregar Chatwoot
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Não foi possível carregar o Chatwoot no iframe. Isso pode ser causado por
              restrições de segurança (X-Frame-Options).
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleReload}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </button>
              <button
                onClick={handleOpenExternal}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir em Nova Aba
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatwoot Iframe */}
      <iframe
        id="chatwoot-iframe"
        src={chatwootUrl}
        className="w-full h-full border-0"
        title="Chatwoot"
        allow="microphone; camera; fullscreen"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-top-navigation allow-top-navigation-by-user-activation"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />

      {/* External Link Button (always visible) */}
      {!hasError && !isLoading && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleOpenExternal}
            className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all"
            title="Abrir Chatwoot em nova aba"
          >
            <ExternalLink className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatwootEmbed;
