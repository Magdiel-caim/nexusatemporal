/**
 * Notifica.me Configuration Component
 * Configuração de integração com Instagram e Messenger
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Instagram, MessageCircle, CheckCircle2, XCircle, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import notificaMeService, { type NotificaMeInstance } from '@/services/notificaMeService';
import { integrationService } from '@/services/automationService';

interface NotificaMeConfigProps {
  apiKey?: string;
  onConfigChange?: () => void;
}

const NotificaMeConfig: React.FC<NotificaMeConfigProps> = ({ apiKey: initialApiKey, onConfigChange }) => {
  const [instances, setInstances] = useState<NotificaMeInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [qrCode, setQrCode] = useState<{ instanceId: string; code: string } | null>(null);
  const [apiKey, setApiKey] = useState(initialApiKey || '');
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
        setApiKey('••••••••••••••••'); // Masked
      }
    } catch (error) {
      console.error('Error checking configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Configurar integração automaticamente
   */
  const handleConfigure = async () => {
    if (!apiKey || apiKey === '••••••••••••••••') {
      toast.error('Insira uma API Key válida');
      return;
    }

    try {
      setTesting(true);

      // Criar integração
      await integrationService.create({
        name: 'Notifica.me - Instagram & Messenger',
        type: 'notificame',
        credentials: {
          notificame_api_key: apiKey,
          notificame_api_url: 'https://app.notificame.com.br/api',
        },
        config: {
          auto_configure: true,
        },
        isActive: true,
      });

      toast.success('Integração configurada com sucesso!');
      setIsConfigured(true);
      loadInstances();

      if (onConfigChange) {
        onConfigChange();
      }
    } catch (error: any) {
      toast.error('Erro ao configurar integração', {
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
            Configure sua API Key do Notifica.me para conectar suas redes sociais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key do Notifica.me</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Sua API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Obtenha sua API Key em{' '}
              <a
                href="https://app.notificame.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                app.notificame.com.br
              </a>
            </p>
          </div>

          <Button
            onClick={handleConfigure}
            disabled={testing || !apiKey}
            className="w-full"
          >
            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Configurar Integração
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
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma conta conectada ainda.</p>
              <p className="text-sm">Entre em contato com o suporte para conectar suas contas.</p>
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
