import { useState, useEffect } from 'react';
import api from '../services/api';

interface MediaUrlResult {
  url: string | null;
  loading: boolean;
  error: string | null;
  type: 'base64' | 'signed' | 'direct' | 'unknown' | null;
}

/**
 * Hook para buscar URL assinada (signed URL) de mídias do chat
 *
 * @param messageId - ID da mensagem
 * @param originalUrl - URL original da mídia (opcional)
 * @returns {MediaUrlResult} - Objeto com url, loading e error
 *
 * @example
 * const { url, loading, error } = useMediaUrl(message.id, message.mediaUrl);
 * if (loading) return <div>Carregando...</div>;
 * if (error) return <div>Erro ao carregar mídia</div>;
 * return <img src={url} alt="Media" />;
 */
export function useMediaUrl(messageId?: string, originalUrl?: string): MediaUrlResult {
  const [url, setUrl] = useState<string | null>(originalUrl || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<'base64' | 'signed' | 'direct' | 'unknown' | null>(null);

  useEffect(() => {
    // Se não tiver messageId ou originalUrl, não faz nada
    if (!messageId || !originalUrl) {
      return;
    }

    // Se a URL original for base64, usar diretamente
    if (originalUrl.startsWith('data:')) {
      setUrl(originalUrl);
      setType('base64');
      return;
    }

    // Se a URL original for HTTP e NÃO for do S3 privado, usar diretamente
    // (podemos verificar se a URL funciona ou sempre buscar signed URL)
    // Por segurança, vamos SEMPRE buscar signed URL para URLs do S3
    if (originalUrl.includes('idrivee2-26.com') || originalUrl.includes('s3')) {
      // Buscar signed URL
      const fetchSignedUrl = async () => {
        setLoading(true);
        setError(null);

        try {
          const { data } = await api.get(`/chat/media/${messageId}`);

          if (data.success && data.url) {
            setUrl(data.url);
            setType(data.type || 'unknown');
          } else {
            // Fallback para URL original
            setUrl(originalUrl);
            setType('direct');
          }
        } catch (err: any) {
          console.error('Erro ao buscar signed URL:', err);
          setError(err.message || 'Erro ao buscar mídia');
          // Fallback para URL original
          setUrl(originalUrl);
          setType('direct');
        } finally {
          setLoading(false);
        }
      };

      fetchSignedUrl();
    } else {
      // URL pública normal, usar diretamente
      setUrl(originalUrl);
      setType('direct');
    }
  }, [messageId, originalUrl]);

  return { url, loading, error, type };
}

/**
 * Hook alternativo que retorna a URL de streaming direto
 * Útil para vídeos e áudios que precisam de streaming
 *
 * @param messageId - ID da mensagem
 * @returns {string | null} - URL de streaming
 *
 * @example
 * const streamUrl = useMediaStreamUrl(message.id);
 * return <video src={streamUrl} controls />;
 */
export function useMediaStreamUrl(messageId?: string): string | null {
  if (!messageId) return null;
  return `${import.meta.env.VITE_API_URL || 'https://api.nexusatemporal.com.br'}/api/chat/media/${messageId}/stream`;
}
