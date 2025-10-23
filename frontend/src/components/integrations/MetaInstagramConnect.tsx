/**
 * Meta Instagram Connect Component
 * Component for connecting Instagram Business accounts via Meta Graph API
 * Allows users to directly OAuth with Meta (no third-party like NotificaMe)
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Instagram,
  Facebook,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  ExternalLink,
  RefreshCw,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { metaInstagramService } from '@/services/metaInstagramService';

interface InstagramAccount {
  id: number;
  instagram_account_id: string;
  instagram_username: string;
  instagram_name: string;
  profile_picture_url: string;
  facebook_page_id?: string;
  facebook_page_name?: string;
  platform: string;
  status: string;
  connected_at: string;
  token_expires_at: string;
  user_id: number;
}

export const MetaInstagramConnect: React.FC = () => {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadAccounts();

    // Listen for messages from OAuth popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'meta-oauth-complete') {
        loadAccounts();
        toast.success('Instagram conectado com sucesso!');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /**
   * Load connected accounts
   */
  const loadAccounts = async () => {
    try {
      setLoading(true);
      const result = await metaInstagramService.listAccounts();
      if (result.success) {
        setAccounts(result.data);
      }
    } catch (error: any) {
      console.error('Error loading accounts:', error);
      toast.error('Erro ao carregar contas', {
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Connect Instagram account via OAuth
   */
  const handleConnect = async () => {
    try {
      setConnecting(true);

      // Get OAuth URL
      const result = await metaInstagramService.startOAuth();

      if (result.success) {
        // Open OAuth popup
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          result.data.authUrl,
          'MetaOAuthPopup',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no`
        );

        // Poll popup status
        const checkPopup = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopup);
            setConnecting(false);
            // Reload accounts after popup closes
            setTimeout(() => loadAccounts(), 1000);
          }
        }, 500);
      }
    } catch (error: any) {
      console.error('Error starting OAuth:', error);
      setConnecting(false);
      toast.error('Erro ao conectar Instagram', {
        description: error.response?.data?.error || error.message,
      });
    }
  };

  /**
   * Disconnect Instagram account
   */
  const handleDisconnect = async (account: InstagramAccount) => {
    const confirmed = confirm(
      `Tem certeza que deseja desconectar a conta @${account.instagram_username}?`
    );

    if (!confirmed) return;

    try {
      await metaInstagramService.disconnectAccount(account.id);
      toast.success('Conta desconectada com sucesso');
      loadAccounts();
    } catch (error: any) {
      console.error('Error disconnecting account:', error);
      toast.error('Erro ao desconectar conta', {
        description: error.response?.data?.error || error.message,
      });
    }
  };

  /**
   * Check if token is expiring soon (less than 7 days)
   */
  const isTokenExpiringSoon = (expiresAt: string): boolean => {
    const expiryDate = new Date(expiresAt);
    const daysUntilExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry < 7;
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-600" />
              Instagram Business via Meta API
            </CardTitle>
            <CardDescription>
              Conecte suas contas Instagram Business diretamente via Meta Graph API (independente de terceiros)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAccounts}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={handleConnect}
              disabled={connecting || loading}
              size="sm"
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Conectar Instagram
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Requisitos:</strong> Conta Instagram Business ou Creator conectada a uma Facebook Page.
            Você precisa ter permissões de administrador na página.
          </AlertDescription>
        </Alert>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!loading && accounts.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <Instagram className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">Nenhuma conta conectada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique em "Conectar Instagram" para adicionar sua primeira conta
              </p>
            </div>
          </div>
        )}

        {/* Accounts List */}
        {!loading && accounts.length > 0 && (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                {/* Profile Picture */}
                <img
                  src={account.profile_picture_url}
                  alt={account.instagram_username}
                  className="w-12 h-12 rounded-full"
                />

                {/* Account Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{account.instagram_name}</p>
                    {account.status === 'active' && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    )}
                    {isTokenExpiringSoon(account.token_expires_at) && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expira em breve
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{account.instagram_username}</p>
                  {account.facebook_page_name && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Facebook className="h-3 w-3" />
                      <span>{account.facebook_page_name}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Conectado em: {formatDate(account.connected_at)} • Expira: {formatDate(account.token_expires_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(account)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Documentation Link */}
        <div className="border-t pt-4">
          <Button
            variant="link"
            size="sm"
            className="text-xs"
            onClick={() => window.open('https://developers.facebook.com/docs/instagram-platform', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Documentação Meta API
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
