/**
 * Triggers Tab - Gestão de Triggers (Automações)
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
import { Textarea } from '@/components/ui/textarea';
import {
  triggerService,
  type Trigger,
  type CreateTriggerDto,
  formatEventType,
} from '@/services/automationService';
import {
  Plus,
  Zap,
  Trash2,
  Edit,
  Power,
  PowerOff,
  Loader2,
  Play,
  Pause,
} from 'lucide-react';
import { toast } from 'sonner';

const TriggersTab: React.FC = () => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateTriggerDto>>({
    name: '',
    description: '',
    event: '',
    conditions: [],
    actions: [],
    active: true,
    priority: 10,
  });

  useEffect(() => {
    loadTriggers();
    loadEventTypes();
  }, []);

  const loadTriggers = async () => {
    try {
      setLoading(true);
      const data = await triggerService.list();
      setTriggers(data);
    } catch (error: any) {
      toast.error('Erro ao carregar triggers', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEventTypes = async () => {
    try {
      const types = await triggerService.getEventTypes();
      setEventTypes(types);
    } catch (error: any) {
      console.error('Error loading event types:', error);
    }
  };

  const handleCreate = () => {
    setEditingTrigger(null);
    setFormData({
      name: '',
      description: '',
      event: '',
      conditions: [],
      actions: [
        {
          type: 'log',
          description: 'Log do evento',
          config: { message: 'Trigger executado: {{event.type}}' },
        },
      ],
      active: true,
      priority: 10,
    });
    setShowDialog(true);
  };

  const handleEdit = (trigger: Trigger) => {
    setEditingTrigger(trigger);
    setFormData({
      name: trigger.name,
      description: trigger.description || '',
      event: trigger.event,
      conditions: trigger.conditions || [],
      actions: trigger.actions || [],
      active: trigger.active,
      priority: trigger.priority || 10,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      // Validate
      if (!formData.name || !formData.event) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const data: CreateTriggerDto = {
        name: formData.name!,
        description: formData.description,
        event: formData.event!,
        conditions: formData.conditions || [],
        actions: formData.actions || [],
        active: formData.active!,
        priority: formData.priority,
      };

      if (editingTrigger) {
        await triggerService.update(editingTrigger.id, data);
        toast.success('Trigger atualizado com sucesso!');
      } else {
        await triggerService.create(data);
        toast.success('Trigger criado com sucesso!');
      }

      setShowDialog(false);
      loadTriggers();
    } catch (error: any) {
      toast.error('Erro ao salvar trigger', {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este trigger?')) return;

    try {
      await triggerService.delete(id);
      toast.success('Trigger excluído com sucesso!');
      loadTriggers();
    } catch (error: any) {
      toast.error('Erro ao excluir trigger', {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await triggerService.toggle(id);
      toast.success('Status do trigger alterado!');
      loadTriggers();
    } catch (error: any) {
      toast.error('Erro ao alterar status', {
        description: error.response?.data?.message || error.message,
      });
    }
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
          <h2 className="text-2xl font-bold">Triggers</h2>
          <p className="text-muted-foreground">Automações baseadas em eventos do sistema</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Trigger
        </Button>
      </div>

      {/* Triggers List */}
      {triggers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum trigger configurado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie triggers para automatizar ações quando eventos ocorrerem
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Trigger
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {triggers.map((trigger) => {
            const eventInfo = formatEventType(trigger.event);

            return (
              <Card key={trigger.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{trigger.name}</CardTitle>
                        <Badge variant={trigger.active ? 'default' : 'secondary'}>
                          {trigger.active ? (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <Pause className="h-3 w-3 mr-1" />
                              Inativo
                            </>
                          )}
                        </Badge>
                        {trigger.priority && trigger.priority > 50 && (
                          <Badge variant="destructive">Alta Prioridade</Badge>
                        )}
                      </div>
                      {trigger.description && (
                        <CardDescription>{trigger.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggle(trigger.id)}
                        title={trigger.active ? 'Desativar' : 'Ativar'}
                      >
                        {trigger.active ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEdit(trigger)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(trigger.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Event */}
                    <div>
                      <p className="text-sm font-medium mb-2">Evento</p>
                      <div className="flex items-center gap-2 p-2 bg-accent rounded">
                        <span>{eventInfo.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{eventInfo.label}</p>
                          <p className="text-xs text-muted-foreground">{eventInfo.category}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Ações ({trigger.actions?.length || 0})
                      </p>
                      <div className="space-y-1">
                        {trigger.actions?.slice(0, 2).map((action, idx) => (
                          <div key={idx} className="text-sm p-2 bg-accent rounded">
                            {action.description || action.type}
                          </div>
                        ))}
                        {(trigger.actions?.length || 0) > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{(trigger.actions?.length || 0) - 2} mais
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  {trigger.executionCount !== undefined && trigger.executionCount > 0 && (
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                      <div>
                        <span className="text-muted-foreground">Execuções: </span>
                        <span className="font-medium">{trigger.executionCount}</span>
                      </div>
                      {trigger.avgExecutionTimeMs && (
                        <div>
                          <span className="text-muted-foreground">Tempo médio: </span>
                          <span className="font-medium">{trigger.avgExecutionTimeMs.toFixed(0)}ms</span>
                        </div>
                      )}
                      {trigger.lastExecutedAt && (
                        <div>
                          <span className="text-muted-foreground">Última execução: </span>
                          <span className="font-medium">
                            {new Date(trigger.lastExecutedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTrigger ? 'Editar Trigger' : 'Novo Trigger'}</DialogTitle>
            <DialogDescription>
              Configure uma automação baseada em eventos
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Boas-vindas ao Lead"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o que este trigger faz"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Event */}
            <div className="grid gap-2">
              <Label htmlFor="event">Evento *</Label>
              <Select
                value={formData.event}
                onValueChange={(value) => setFormData({ ...formData, event: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((eventType) => {
                    const info = formatEventType(eventType);
                    return (
                      <SelectItem key={eventType} value={eventType}>
                        <div className="flex items-center gap-2">
                          <span>{info.icon}</span>
                          <span>{info.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="grid gap-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={String(formData.priority || 10)}
                onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Baixa (5)</SelectItem>
                  <SelectItem value="10">Normal (10)</SelectItem>
                  <SelectItem value="50">Alta (50)</SelectItem>
                  <SelectItem value="100">Urgente (100)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Triggers com prioridade maior são executados primeiro
              </p>
            </div>

            {/* Info sobre ações */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">ℹ️ Sobre Ações</p>
              <p className="text-xs text-muted-foreground">
                Por padrão, este trigger irá apenas registrar um log. Para configurar ações avançadas
                (enviar WhatsApp, executar IA, etc), edite o trigger após criar ou use a API diretamente.
              </p>
            </div>

            {/* Active */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Trigger Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Desative para pausar temporariamente
                </p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
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

export default TriggersTab;
