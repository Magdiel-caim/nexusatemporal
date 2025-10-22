/**
 * NotificaMe OAuth Callback Page
 * Processa retorno do OAuth do Instagram/Messenger
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import notificaMeService from '@/services/notificaMeService';

const NotificaMeCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processando autorização...');

  useEffect(() => {
    processCallback();
  }, []);

  const processCallback = async () => {
    try {
      // 1. Obter parâmetros da URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // 2. Verificar se houve erro na autorização
      if (error) {
        throw new Error(errorDescription || error);
      }

      if (!code) {
        throw new Error('Código de autorização não encontrado');
      }

      // 3. Obter instanceId do localStorage
      const instanceId = localStorage.getItem('notificame_pending_instance');
      const platform = localStorage.getItem('notificame_pending_platform');

      if (!instanceId) {
        throw new Error('Instância não identificada');
      }

      // 4. Processar callback no backend
      setMessage('Conectando sua conta...');
      const result = await notificaMeService.processCallback(instanceId, code, state || undefined);

      if (!result.success) {
        throw new Error('Falha ao processar autorização');
      }

      // 5. Sucesso!
      setStatus('success');
      setMessage(`${platform === 'instagram' ? 'Instagram' : 'Messenger'} conectado com sucesso!`);

      // Marcar como sucesso no localStorage
      localStorage.setItem('notificame_auth_success', 'true');

      // Fechar popup após 2 segundos
      setTimeout(() => {
        if (window.opener) {
          window.close();
        } else {
          navigate('/integracoes-sociais');
        }
      }, 2000);
    } catch (error: any) {
      console.error('Error processing callback:', error);
      setStatus('error');
      setMessage(error.message || 'Erro ao processar autorização');

      // Fechar popup após 3 segundos
      setTimeout(() => {
        if (window.opener) {
          window.close();
        } else {
          navigate('/integracoes-sociais');
        }
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {status === 'processing' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
                <h2 className="text-xl font-semibold">Processando...</h2>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
                <h2 className="text-xl font-semibold text-green-600">Sucesso!</h2>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">Esta janela fechará automaticamente...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 mx-auto text-red-600" />
                <h2 className="text-xl font-semibold text-red-600">Erro</h2>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">Esta janela fechará automaticamente...</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificaMeCallbackPage;
