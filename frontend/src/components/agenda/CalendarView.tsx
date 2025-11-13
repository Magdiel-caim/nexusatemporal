import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Appointment } from '@/services/appointmentService';
import './CalendarView.css';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Create DragAndDropCalendar component
const DragAndDropCalendar = withDragAndDrop<CalendarEvent, any>(Calendar);

interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
  status: string;
}

interface CalendarViewProps {
  appointments: Appointment[];
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onNavigate: (date: Date) => void;
  onEventDrop?: (data: EventInteractionArgs<CalendarEvent>) => void;
  draggableAccessor?: (event: CalendarEvent) => boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  onSelectSlot,
  onSelectEvent,
  onNavigate,
  onEventDrop,
  draggableAccessor,
}) => {
  const events: CalendarEvent[] = useMemo(() => {
    return appointments.map((apt) => {
      const startDate = new Date(apt.scheduledDate);
      const duration = apt.estimatedDuration || apt.procedure?.duration || 60;
      const endDate = new Date(startDate.getTime() + duration * 60000);

      return {
        id: apt.id,
        title: `${apt.lead?.name || 'Sem nome'} - ${apt.procedure?.name || 'Procedimento'}`,
        start: startDate,
        end: endDate,
        resource: apt,
        status: apt.status,
      };
    });
  }, [appointments]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const statusColors: Record<string, { backgroundColor: string; color: string }> = {
      aguardando_pagamento: { backgroundColor: '#FEF3C7', color: '#92400E' },
      pagamento_confirmado: { backgroundColor: '#DBEAFE', color: '#1E40AF' },
      aguardando_confirmacao: { backgroundColor: '#FED7AA', color: '#9A3412' },
      confirmado: { backgroundColor: '#D1FAE5', color: '#065F46' },
      em_atendimento: { backgroundColor: '#E9D5FF', color: '#6B21A8' },
      finalizado: { backgroundColor: '#E5E7EB', color: '#374151' },
      cancelado: { backgroundColor: '#FEE2E2', color: '#991B1B' },
      reagendado: { backgroundColor: '#DBEAFE', color: '#1E40AF' },
    };

    const style = statusColors[event.status] || statusColors.confirmado;

    // Verificar se pode ser arrastado
    const isDraggable = draggableAccessor ? draggableAccessor(event) : true;
    const className = isDraggable ? '' : 'non-draggable';

    return {
      style: {
        ...style,
        borderRadius: '6px',
        border: 'none',
        padding: '4px 8px',
        fontSize: '0.875rem',
        fontWeight: '500',
      },
      className,
    };
  };

  const messages = {
    allDay: 'Dia inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Nenhum agendamento neste período.',
    showMore: (total: number) => `+ ${total} mais`,
  };

  return (
    <div className="calendar-container">
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor={(event: CalendarEvent) => event.start}
        endAccessor={(event: CalendarEvent) => event.end}
        style={{ height: '100%', minHeight: 600 }}
        culture="pt-BR"
        messages={messages}
        onSelectSlot={onSelectSlot}
        onSelectEvent={(event: CalendarEvent) => onSelectEvent(event)}
        onNavigate={onNavigate}
        onEventDrop={onEventDrop}
        draggableAccessor={draggableAccessor}
        resizable={false}
        selectable
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="week"
        step={5}
        timeslots={12}
        min={new Date(2025, 0, 1, 7, 0, 0)}
        max={new Date(2025, 0, 1, 20, 0, 0)}
        scrollToTime={new Date(2025, 0, 1, 8, 0, 0)}
        dayLayoutAlgorithm="no-overlap"
      />
    </div>
  );
};

export default CalendarView;
