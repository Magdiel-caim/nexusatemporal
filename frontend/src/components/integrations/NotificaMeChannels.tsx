/**
 * NotificaMe Channels Component
 * Lista canais Instagram/Messenger conectados via NotificaMe Hub
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Instagram, MessageCircle, RefreshCw, Send, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import notificaMeService from '@/services/notificaMeService';

interface Channel {
  id: string;
  name: string;
  channel: 'instagram' | 'messenger' | 'whatsapp';
  profile_pic?: string;
  instagram?: {
    name: string;
    profile_pic: string;
  };
  messenger?: {
    name: string;
  };
  createdAt: string;
}

export const NotificaMeChannels: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    loadChannels();
  }, [selectedPlatform]);

  /**
   * Carregar canais
   */
  const loadChannels = async () => {
    try {
      setLoading(true);
      const platform = selectedPlatform === 'all' ? undefined : selectedPlatform;
      const result = await notificaMeService.listChannels(platform);

      if (result.success) {
        setChannels(result.data);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar canais', {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Refresh manual
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadChannels();
  };

  /**
   * Testar envio de mensagem
   */
  const handleTestSend = async (channel: Channel) => {
    try {
      toast.info('Função de teste em desenvolvimento');
      // TODO: Implementar modal para testar envio
    } catch (error: any) {
      toast.error('Erro ao enviar mensagem de teste', {
        description: error.message
      });
    }
  };

  /**
   * Abrir painel NotificaMe
   */
  const handleOpenPanel = () => {
    window.open('https://app.notificame.com.br', '_blank');
  };

  /**
   * Ícone da plataforma
   */
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'messenger':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  /**
   * Nome da plataforma
   */
  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'Instagram';
      case 'messenger':
        return 'Messenger';
      case 'whatsapp':
        return 'WhatsApp';
      default:
        return platform;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Canais Conectados</CardTitle>
            <CardDescription>
              Canais Instagram e Messenger conectados via NotificaMe Hub
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenPanel}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Painel NotificaMe
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedPlatform === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPlatform('all')}
          >
            Todos ({channels.length})
          </Button>
          <Button
            variant={selectedPlatform === 'instagram' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPlatform('instagram')}
          >
            <Instagram className="w-4 h-4 mr-2" />
            Instagram
          </Button>
          <Button
            variant={selectedPlatform === 'messenger' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPlatform('messenger')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Messenger
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!loading && channels.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Instagram className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum canal conectado</h3>
            <p className="text-muted-foreground mb-4">
              Conecte canais Instagram ou Messenger no painel NotificaMe
            </p>
            <Button onClick={handleOpenPanel}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Painel NotificaMe
            </Button>
          </div>
        )}

        {/* Lista de Canais */}
        {!loading && channels.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {channels.map((channel) => (
              <Card key={channel.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {channel.profile_pic ? (
                        <img
                          src={channel.profile_pic}
                          alt={channel.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          {getPlatformIcon(channel.channel)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{channel.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {getPlatformName(channel.channel)}
                        </Badge>
                      </div>

                      {channel.instagram && (
                        <p className="text-sm text-muted-foreground truncate">
                          @{channel.instagram.name}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-1">
                        Conectado em {new Date(channel.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleTestSend(channel)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Testar Envio
                    </Button>
                  </div>
                </div>

                {/* ID do Canal */}
                <div className="px-4 py-2 bg-muted text-xs font-mono truncate">
                  ID: {channel.id}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info */}
        {!loading && channels.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Para conectar novos canais, acesse o painel NotificaMe
              e conecte sua conta Instagram ou Messenger. Os canais aparecerão automaticamente aqui.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
