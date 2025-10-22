/**
 * Notifica.me Configuration Component
 * Configuração de integração com Instagram e Messenger
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Instagram, MessageCircle, CheckCircle2, XCircle, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import notificaMeService, { type NotificaMeInstance } from '@/services/notificaMeService';
import { integrationService } from '@/services/automationService';

interface NotificaMeConfigProps {
  onConfigChange?: () => void;
}

const NotificaMeConfig: React.FC<NotificaMeConfigProps> = ({ onConfigChange }) => {
  const [instances, setInstances] = useState<NotificaMeInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [qrCode, setQrCode] = useState<{ instanceId: string; code: string } | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    checkConfiguration();
  }, []);

  useEffect(() => {
    if (isConfigured) {
      loadInstances();
    }
  }, [isConfigured]);

  /**
   * Verificar se já está configurado
   */
  const checkConfiguration = async () => {
    try {
      const integrations = await integrationService.list('notificame');
      const notificameIntegration = integrations.find(i => i.type === 'notificame' && i.isActive);

      if (notificameIntegration) {
        setIsConfigured(true);
      }
    } catch (error) {
      console.error('Error checking configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Configurar integração automaticamente
   * Modelo Revendedor: API Key está no backend, apenas ativamos a integração
   */
  const handleConfigure = async () => {
    try {
      setTesting(true);

      // Criar integração (API Key vem do backend via env var)
      await integrationService.create({
        name: 'Notifica.me - Instagram & Messenger',
        type: 'notificame',
        credentials: {
          // API Key é gerenciada pelo backend (modelo revendedor)
          configured_by: 'reseller',
        },
        config: {
          auto_configure: true,
          reseller_mode: true,
        },
        isActive: true,
      });

      toast.success('Integração ativada com sucesso!');
      setIsConfigured(true);
      loadInstances();

      if (onConfigChange) {
        onConfigChange();
      }
    } catch (error: any) {
      toast.error('Erro ao ativar integração', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  /**
   * Testar conexão
   */
  const handleTest = async () => {
    try {
      setTesting(true);
      const result = await notificaMeService.testConnection();

      if (result.success) {
        toast.success('Conexão testada com sucesso!');
        loadInstances();
      } else {
        toast.error('Falha no teste de conexão', {
          description: result.message,
        });
      }
    } catch (error: any) {
      toast.error('Erro ao testar conexão', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  /**
   * Carregar instâncias
   */
  const loadInstances = async () => {
    try {
      const result = await notificaMeService.getInstances();
      if (result.success) {
        setInstances(result.data);
      }
    } catch (error: any) {
      console.error('Error loading instances:', error);
      // Silencioso - pode não ter instâncias ainda
    }
  };

  /**
   * Conectar Instagram/Messenger via OAuth
   */
  const handleConnectPlatform = async (platform: 'instagram' | 'messenger') => {
    try {
      setTesting(true);

      // 1. Criar nova instância
      const createResult = await notificaMeService.createInstance(
        platform,
        `${platform === 'instagram' ? 'Instagram' : 'Messenger'} - ${new Date().toLocaleDateString()}`
      );

      if (!createResult.success) {
        throw new Error('Falha ao criar instância');
      }

      const { instanceId, authUrl } = createResult.data;

      // 2. Se já retornou authUrl, usar ela. Senão, buscar
      let oauthUrl = authUrl;

      if (!oauthUrl) {
        const authResult = await notificaMeService.getAuthorizationUrl(instanceId);
        if (!authResult.success) {
          throw new Error('Falha ao obter URL de autorização');
        }
        oauthUrl = authResult.data.authUrl;
      }

      // 3. Salvar instanceId no localStorage para usar no callback
      localStorage.setItem('notificame_pending_instance', instanceId);
      localStorage.setItem('notificame_pending_platform', platform);

      // 4. Abrir popup OAuth
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const popup = window.open(
        oauthUrl,
        'NotificaMeAuth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        throw new Error('Popup bloqueado. Habilite popups para este site.');
      }

      // 5. Monitorar fechamento do popup
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          setTesting(false);

          // Verificar se conexão foi bem-sucedida
          const wasSuccessful = localStorage.getItem('notificame_auth_success');
          if (wasSuccessful === 'true') {
            toast.success(`${platform === 'instagram' ? 'Instagram' : 'Messenger'} conectado com sucesso!`);
            localStorage.removeItem('notificame_auth_success');
            loadInstances();
          }

          // Limpar dados temporários
          localStorage.removeItem('notificame_pending_instance');
          localStorage.removeItem('notificame_pending_platform');
        }
      }, 500);

      toast.info('Complete a autorização na janela que abriu');
    } catch (error: any) {
      toast.error(`Erro ao conectar ${platform === 'instagram' ? 'Instagram' : 'Messenger'}`, {
        description: error.response?.data?.message || error.message,
      });
      setTesting(false);
    }
  };

  /**
   * Obter QR Code para conectar
   */
  const handleGetQRCode = async (instanceId: string) => {
    try {
      const result = await notificaMeService.getQRCode(instanceId);
      if (result.success) {
        setQrCode({
          instanceId,
          code: result.data.qrCode,
        });
        toast.success('QR Code gerado! Escaneie com seu Instagram ou Messenger');
      }
    } catch (error: any) {
      toast.error('Erro ao gerar QR Code', {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  /**
   * Desconectar instância
   */
  const handleDisconnect = async (instanceId: string) => {
    if (!confirm('Deseja realmente desconectar esta conta?')) return;

    try {
      const result = await notificaMeService.disconnectInstance(instanceId);
      if (result.success) {
        toast.success('Conta desconectada com sucesso');
        loadInstances();
        if (qrCode?.instanceId === instanceId) {
          setQrCode(null);
        }
      }
    } catch (error: any) {
      toast.error('Erro ao desconectar', {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  /**
   * Atualizar status
   */
  const handleRefresh = () => {
    loadInstances();
    toast.success('Status atualizado');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Não configurado ainda
  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conectar Instagram & Messenger
          </CardTitle>
          <CardDescription>
            Ative a integração com Instagram e Messenger para começar a receber mensagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-medium">Conecte suas Redes Sociais</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Conecte aqui suas contas Meta (Facebook e Instagram) e responda seus clientes em um único local.
            </p>
          </div>

          <Button
            onClick={handleConfigure}
            disabled={testing}
            className="w-full"
          >
            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ativar Integração
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Configurado
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Instagram & Messenger Conectados
              </CardTitle>
              <CardDescription>
                Suas redes sociais estão integradas e prontas para uso
              </CardDescription>
            </div>
            <Button onClick={handleTest} variant="outline" size="sm" disabled={testing}>
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Testar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {instances.length === 0 && (
            <div className="space-y-4">
              <div className="text-center py-6 border-2 border-dashed rounded-lg bg-muted/30">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium mb-2">Nenhuma conta conectada ainda</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Conecte suas contas Instagram ou Messenger para começar a receber mensagens
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Card className="border-pink-200 bg-pink-50/50 dark:bg-pink-950/20 dark:border-pink-900">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Instagram className="h-6 w-6 text-pink-600" />
                      <div>
                        <p className="font-medium">Instagram Direct</p>
                        <p className="text-xs text-muted-foreground">Mensagens diretas</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleConnectPlatform('instagram')}
                      disabled={testing}
                    >
                      {testing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Instagram className="h-3 w-3" />
                      )}
                      Conectar Instagram
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium">Facebook Messenger</p>
                        <p className="text-xs text-muted-foreground">Mensagens Facebook</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleConnectPlatform('messenger')}
                      disabled={testing}
                    >
                      {testing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <MessageCircle className="h-3 w-3" />
                      )}
                      Conectar Messenger
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {instances.map((instance) => (
            <Card key={instance.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {instance.platform === 'instagram' ? (
                      <Instagram className="h-8 w-8 text-pink-600" />
                    ) : (
                      <MessageCircle className="h-8 w-8 text-blue-600" />
                    )}
                    <div>
                      <p className="font-medium">{instance.name}</p>
                      {instance.phone && (
                        <p className="text-sm text-muted-foreground">{instance.phone}</p>
                      )}
                      <Badge
                        variant={
                          instance.status === 'connected'
                            ? 'default'
                            : instance.status === 'connecting'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="mt-1"
                      >
                        {instance.status === 'connected' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {instance.status === 'disconnected' && <XCircle className="h-3 w-3 mr-1" />}
                        {instance.status === 'connecting' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {instance.status === 'connected'
                          ? 'Conectado'
                          : instance.status === 'connecting'
                          ? 'Conectando...'
                          : 'Desconectado'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {instance.status === 'disconnected' && (
                      <Button onClick={() => handleGetQRCode(instance.id)} size="sm" variant="outline">
                        Conectar
                      </Button>
                    )}
                    {instance.status === 'connected' && (
                      <Button
                        onClick={() => handleDisconnect(instance.id)}
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* QR Code */}
                {qrCode?.instanceId === instance.id && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm font-medium mb-2">Escaneie o QR Code:</p>
                    <div className="flex justify-center">
                      <img src={qrCode.code} alt="QR Code" className="max-w-xs" />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Abra o {instance.platform === 'instagram' ? 'Instagram' : 'Messenger'} e escaneie este código
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button onClick={handleRefresh} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Status
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificaMeConfig;
