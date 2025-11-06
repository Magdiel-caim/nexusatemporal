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
    // Se não tiver originalUrl, não faz nada
    if (!originalUrl) {
      return;
    }

    // ✅ CORREÇÃO: Se a URL original for base64, usar diretamente
    if (originalUrl.startsWith('data:')) {
      console.log('📷 Usando base64 direto (tamanho:', originalUrl.length, ')');
      setUrl(originalUrl);
      setType('base64');
      setLoading(false);
      setError(null);
      return;
    }

    // ✅ CORREÇÃO: Se a URL for do S3 (IDrive E2), usar diretamente
    // CORS deve estar configurado no bucket
    if (originalUrl.includes('idrivee2-26.com') || originalUrl.includes('.s3.')) {
      console.log('☁️ Usando URL S3 direto:', originalUrl);
      setUrl(originalUrl);
      setType('direct');
      setLoading(false);
      setError(null);
      return;
    }

    // ✅ Se for URL HTTP/HTTPS normal, usar diretamente
    if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
      console.log('🌐 Usando URL HTTP direto:', originalUrl);
      setUrl(originalUrl);
      setType('direct');
      setLoading(false);
      setError(null);
      return;
    }

    // ⚠️ URL desconhecida - tentar buscar signed URL do backend (fallback)
    if (messageId) {
      console.log('❓ URL desconhecida, buscando signed URL do backend...');
      const fetchSignedUrl = async () => {
        setLoading(true);
        setError(null);

        try {
          const { data } = await api.get(`/chat/media/${messageId}`);

          if (data.success && data.url) {
            console.log('✅ Signed URL recebida:', data.url);
            setUrl(data.url);
            setType(data.type || 'signed');
          } else {
            // Fallback: tentar usar URL original mesmo assim
            console.warn('⚠️ Backend não retornou signed URL, usando original');
            setUrl(originalUrl);
            setType('unknown');
          }
        } catch (err: any) {
          console.error('❌ Erro ao buscar signed URL:', err);
          setError(err.message || 'Erro ao buscar mídia');
          // Fallback: usar URL original
          setUrl(originalUrl);
          setType('unknown');
        } finally {
          setLoading(false);
        }
      };

      fetchSignedUrl();
    } else {
      // Sem messageId, usar URL original como último recurso
      console.warn('⚠️ Sem messageId, usando URL original:', originalUrl);
      setUrl(originalUrl);
      setType('unknown');
      setLoading(false);
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
