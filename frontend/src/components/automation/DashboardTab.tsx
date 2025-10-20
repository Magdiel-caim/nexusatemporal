/**
 * Dashboard Tab - Visão Geral de Automações
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { integrationService, triggerService, eventService, type EventStats, type TriggerStats, type Integration } from '@/services/automationService';
import { Activity, Zap, Settings, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [triggerStats, setTriggerStats] = useState<TriggerStats | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [events, triggers, integs] = await Promise.all([
        eventService.getStats(),
        triggerService.getStats(),
        integrationService.list(),
      ]);
      setEventStats(events);
      setTriggerStats(triggers);
      setIntegrations(integs);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const activeIntegrations = integrations.filter(i => i.isActive).length;
  const activeTriggers = triggerStats?.active || 0;
  const totalEvents = eventStats?.total || 0;
  const successRate = eventStats?.successRate || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Integrações Ativas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrações Ativas</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              {integrations.length} total
            </p>
          </CardContent>
        </Card>

        {/* Triggers Ativos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Triggers Ativos</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTriggers}</div>
            <p className="text-xs text-muted-foreground">
              {triggerStats?.total || 0} total
            </p>
          </CardContent>
        </Card>

        {/* Eventos (últimas 24h) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {eventStats?.processed || 0} processados
            </p>
          </CardContent>
        </Card>

        {/* Taxa de Sucesso */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {eventStats?.triggersExecuted || 0} triggers executados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integrações e Status */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Integrações */}
        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
            <CardDescription>Status das integrações configuradas</CardDescription>
          </CardHeader>
          <CardContent>
            {integrations.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma integração configurada</p>
                <p className="text-sm">Adicione uma integração para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${integration.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.type}</p>
                      </div>
                    </div>
                    <Badge variant={integration.isActive ? 'default' : 'secondary'}>
                      {integration.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Eventos por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Tipo</CardTitle>
            <CardDescription>Distribuição de eventos recentes</CardDescription>
          </CardHeader>
          <CardContent>
            {!eventStats || Object.keys(eventStats.byType || {}).length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum evento registrado</p>
                <p className="text-sm">Eventos aparecerão aqui quando gerados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(eventStats.byType || {})
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{type}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Triggers Mais Ativos */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Triggers</CardTitle>
          <CardDescription>Performance dos triggers ativos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total de Execuções</p>
              <p className="text-2xl font-bold">{triggerStats?.totalExecutions || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tempo Médio</p>
              <p className="text-2xl font-bold">{triggerStats?.avgExecutionTime?.toFixed(0) || 0}ms</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Triggers por Evento</p>
              <p className="text-2xl font-bold">{Object.keys(triggerStats?.byEvent || {}).length}</p>
            </div>
          </div>

          {triggerStats && Object.keys(triggerStats.byEvent || {}).length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium mb-3">Por Tipo de Evento</p>
              {Object.entries(triggerStats.byEvent || {})
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([event, count]) => (
                  <div key={event} className="flex items-center justify-between p-2 hover:bg-accent rounded">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{event}</span>
                    </div>
                    <Badge>{count}</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;
