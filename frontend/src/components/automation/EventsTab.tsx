/**
 * Events Tab - Monitoramento de Eventos
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  eventService,
  type AutomationEvent,
  formatEventType,
} from '@/services/automationService';
import {
  Activity,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Filter,
  Eye,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const EventsTab: React.FC = () => {
  const [events, setEvents] = useState<AutomationEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AutomationEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    eventType: '',
    entityType: '',
    processed: '',
    search: '',
  });

  useEffect(() => {
    loadEvents();
    loadEventTypes();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const queryFilters: any = {
        limit: 50,
      };

      if (filters.eventType) queryFilters.eventType = filters.eventType;
      if (filters.entityType) queryFilters.entityType = filters.entityType;
      if (filters.processed) queryFilters.processed = filters.processed === 'true';

      console.log('[EventsTab] Loading events with filters:', queryFilters);
      const data = await eventService.list(queryFilters);
      console.log('[EventsTab] Received events:', data);
      setEvents(data || []);
    } catch (error: any) {
      console.error('[EventsTab] Error loading events:', error);
      toast.error('Erro ao carregar eventos', {
        description: error.response?.data?.message || error.message,
      });
      setEvents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadEventTypes = async () => {
    try {
      const types = await eventService.getEventTypes();
      setEventTypes(types);
    } catch (error: any) {
      console.error('Error loading event types:', error);
    }
  };

  const handleViewDetails = (event: AutomationEvent) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleRefresh = () => {
    loadEvents();
  };

  const handleApplyFilters = () => {
    loadEvents();
  };

  const handleClearFilters = () => {
    setFilters({
      eventType: '',
      entityType: '',
      processed: '',
      search: '',
    });
    // Reload events after clearing filters
    setTimeout(() => loadEvents(), 100);
  };

  // Removed problematic useEffect that was causing infinite loop
  // Filters are now applied manually via handleApplyFilters button

  const filteredEvents = events.filter((event) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      try {
        return (
          event.eventType?.toLowerCase().includes(searchLower) ||
          event.entityType?.toLowerCase().includes(searchLower) ||
          event.entityId?.toLowerCase().includes(searchLower)
        );
      } catch (err) {
        console.error('[EventsTab] Error filtering event:', event, err);
        return false;
      }
    }
    return true;
  });

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
          <h2 className="text-2xl font-bold">Eventos</h2>
          <p className="text-muted-foreground">Monitore eventos gerados pelo sistema</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Event Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Evento</label>
              <Select
                value={filters.eventType}
                onValueChange={(value) => setFilters({ ...filters, eventType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {eventTypes.map((type) => {
                    const info = formatEventType(type);
                    return (
                      <SelectItem key={type} value={type}>
                        {info.icon} {info.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Entity Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Entidade</label>
              <Select
                value={filters.entityType}
                onValueChange={(value) => setFilters({ ...filters, entityType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="appointment">Agendamento</SelectItem>
                  <SelectItem value="payment">Pagamento</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Processed */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.processed}
                onValueChange={(value) => setFilters({ ...filters, processed: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="true">Processados</SelectItem>
                  <SelectItem value="false">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ID, tipo, entidade..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyFilters} size="sm">
              Aplicar Filtros
            </Button>
            <Button onClick={handleClearFilters} variant="outline" size="sm">
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground text-center">
              Eventos aparecerão aqui quando gerados pelo sistema
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-2">
            Mostrando {filteredEvents.length} evento(s)
          </p>

          {filteredEvents.map((event) => {
            try {
              const eventInfo = formatEventType(event.eventType || 'unknown');

              return (
                <Card key={event.id} className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{eventInfo.icon}</span>
                          <div>
                            <p className="font-medium">{eventInfo.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {eventInfo.category} • {event.entityType} #{event.entityId?.substring(0, 8) || 'N/A'}
                            </p>
                          </div>
                        </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.triggeredAt).toLocaleString('pt-BR')}
                        </div>
                        {event.processedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            Processado em {new Date(event.processedAt).toLocaleString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2">
                      <Badge variant={event.processed ? 'default' : 'secondary'}>
                        {event.processed ? 'Processado' : 'Pendente'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(event)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            } catch (err) {
              console.error('[EventsTab] Error rendering event:', event, err);
              return null;
            }
          })}
        </div>
      )}

      {/* Event Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Evento</DialogTitle>
            <DialogDescription>Informações completas sobre o evento</DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-1">ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedEvent.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Tipo de Evento</p>
                  <p className="text-sm">{selectedEvent.eventType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Tipo de Entidade</p>
                  <p className="text-sm">{selectedEvent.entityType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">ID da Entidade</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedEvent.entityId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Disparado em</p>
                  <p className="text-sm">{new Date(selectedEvent.triggeredAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <Badge variant={selectedEvent.processed ? 'default' : 'secondary'}>
                    {selectedEvent.processed ? 'Processado' : 'Pendente'}
                  </Badge>
                </div>
              </div>

              {/* Payload */}
              <div>
                <p className="text-sm font-medium mb-2">Payload</p>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>

              {/* Metadata */}
              {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Metadata</p>
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsTab;
