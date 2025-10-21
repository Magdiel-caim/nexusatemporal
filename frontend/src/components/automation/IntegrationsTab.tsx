/**
 * Integrations Tab - Gestão de Integrações
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  integrationService,
  type Integration,
  type CreateIntegrationDto,
  getIntegrationTypeLabel,
  getIntegrationTypeIcon,
} from '@/services/automationService';
import {
  Plus,
  Settings,
  Trash2,
  TestTube,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

const IntegrationsTab: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateIntegrationDto>>({
    name: '',
    type: 'waha',
    config: {},
    credentials: {},
    isActive: true,
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await integrationService.list();
      setIntegrations(data);
    } catch (error: any) {
      toast.error('Erro ao carregar integrações', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingIntegration(null);
    setFormData({
      name: '',
      type: 'waha',
      config: {},
      credentials: {},
      isActive: true,
    });
    setShowDialog(true);
  };

  const handleEdit = (integration: Integration) => {
    setEditingIntegration(integration);
    setFormData({
      name: integration.name,
      type: integration.type,
      config: integration.config,
      credentials: {}, // Never load actual credentials
      isActive: integration.isActive,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      // Validate
      if (!formData.name || !formData.type) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      // Get type-specific config
      const config = getConfigForType(formData.type!);
      const credentials = getCredentialsForType();

      const data: CreateIntegrationDto = {
        name: formData.name!,
        type: formData.type!,
        config,
        credentials,
        isActive: formData.isActive!,
      };

      if (editingIntegration) {
        await integrationService.update(editingIntegration.id, data);
        toast.success('Integração atualizada com sucesso!');
      } else {
        await integrationService.create(data);
        toast.success('Integração criada com sucesso!');
      }

      setShowDialog(false);
      loadIntegrations();
    } catch (error: any) {
      toast.error('Erro ao salvar integração', {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta integração?')) return;

    try {
      await integrationService.delete(id);
      toast.success('Integração excluída com sucesso!');
      loadIntegrations();
    } catch (error: any) {
      toast.error('Erro ao excluir integração', {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleTest = async (id: string) => {
    try {
      setTesting(id);
      const result = await integrationService.test(id);

      if (result.success) {
        toast.success('Teste bem-sucedido!', {
          description: result.message,
        });
      } else {
        toast.error('Teste falhou', {
          description: result.message,
        });
      }

      loadIntegrations(); // Reload to get updated test status
    } catch (error: any) {
      toast.error('Erro ao testar integração', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setTesting(null);
    }
  };

  const getConfigForType = (type: string) => {
    const configs: Record<string, any> = {
      waha: {
        baseUrl: (formData.config as any)?.baseUrl || 'https://waha.nexusatemporal.com.br',
        session: (formData.config as any)?.session || 'default',
      },
      openai: {
        model: (formData.config as any)?.model || 'gpt-4',
        temperature: (formData.config as any)?.temperature || 0.7,
      },
      n8n: {
        baseUrl: (formData.config as any)?.baseUrl || 'https://n8n.nexusatemporal.com.br',
      },
      webhook: {
        url: (formData.config as any)?.url || '',
      },
    };
    return configs[type] || {};
  };

  const getCredentialsForType = () => {
    return {
      apiKey: (formData.credentials as any)?.apiKey || '',
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integrações</h2>
          <p className="text-muted-foreground">Gerencie conexões com serviços externos</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      {/* Integrations Grid */}
      {integrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma integração configurada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Adicione uma integração para começar a usar automações
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Integração
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <Card key={integration.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getIntegrationTypeIcon(integration.type)}</span>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{getIntegrationTypeLabel(integration.type)}</CardDescription>
                    </div>
                  </div>
                  <div className={`h-3 w-3 rounded-full ${integration.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <Badge variant={integration.isActive ? 'default' : 'secondary'}>
                    {integration.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {integration.lastTestStatus && (
                    <Badge variant={integration.lastTestStatus === 'success' ? 'default' : 'destructive'}>
                      {integration.lastTestStatus === 'success' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Testado
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Falhou
                        </>
                      )}
                    </Badge>
                  )}
                </div>

                {/* Last Test */}
                {integration.lastTestedAt && (
                  <p className="text-xs text-muted-foreground">
                    Último teste: {new Date(integration.lastTestedAt).toLocaleString('pt-BR')}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTest(integration.id)}
                    disabled={testing === integration.id}
                  >
                    {testing === integration.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Testar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(integration)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(integration.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIntegration ? 'Editar Integração' : 'Nova Integração'}
            </DialogTitle>
            <DialogDescription>
              Configure uma integração com serviços externos
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: WhatsApp Principal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waha">💬 WhatsApp (WAHA)</SelectItem>
                  <SelectItem value="openai">🤖 OpenAI (IA)</SelectItem>
                  <SelectItem value="n8n">🔄 n8n (Workflows)</SelectItem>
                  <SelectItem value="webhook">🔗 Webhook</SelectItem>
                  <SelectItem value="custom">⚙️ Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type-specific config */}
            {formData.type === 'waha' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="baseUrl">URL Base</Label>
                  <Input
                    id="baseUrl"
                    placeholder="https://waha.nexusatemporal.com.br"
                    value={(formData.config as any)?.baseUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, baseUrl: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="session">Sessão</Label>
                  <Input
                    id="session"
                    placeholder="default"
                    value={(formData.config as any)?.session || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, session: e.target.value },
                      })
                    }
                  />
                </div>
              </>
            )}

            {formData.type === 'openai' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Select
                    value={(formData.config as any)?.model || 'gpt-4'}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, model: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {formData.type === 'n8n' && (
              <div className="grid gap-2">
                <Label htmlFor="n8nUrl">URL Base</Label>
                <Input
                  id="n8nUrl"
                  placeholder="https://n8n.nexusatemporal.com.br"
                  value={(formData.config as any)?.baseUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, baseUrl: e.target.value },
                    })
                  }
                />
              </div>
            )}

            {/* API Key */}
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key *</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="Sua API key"
                  value={(formData.credentials as any)?.apiKey || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credentials: { ...formData.credentials, apiKey: e.target.value },
                    })
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Sua API key será armazenada de forma segura e criptografada
              </p>
            </div>

            {/* Active */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Integração Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Ative para usar esta integração em automações
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationsTab;
