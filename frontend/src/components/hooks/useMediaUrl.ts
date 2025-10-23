import { useState, useEffect } from 'react';

interface UseMediaUrlResult {
  url: string | null;
  loading: boolean;
  error: Error | null;
}

export function useMediaUrl(_messageId: string | undefined, mediaUrl: string | null | undefined): UseMediaUrlResult {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!mediaUrl) {
      setUrl(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Se já for uma URL completa, retornar diretamente
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      setUrl(mediaUrl);
      setLoading(false);
      return;
    }

    // Caso contrário, construir URL do backend
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const fullUrl = `${backendUrl}${mediaUrl}`;
    setUrl(fullUrl);
    setLoading(false);
  }, [mediaUrl]);

  return { url, loading, error };
}
