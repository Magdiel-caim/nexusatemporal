import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialPost, marketingService } from '@/services/marketingService';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

interface SocialPostCalendarProps {
  onSelectPost: (post: SocialPost) => void;
  refreshTrigger?: number;
}

const platformColors: Record<string, { bg: string; border: string; text: string }> = {
  instagram: {
    bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
    border: 'border-purple-500',
    text: 'text-white',
  },
  facebook: {
    bg: 'bg-blue-600',
    border: 'border-blue-600',
    text: 'text-white',
  },
  linkedin: {
    bg: 'bg-blue-700',
    border: 'border-blue-700',
    text: 'text-white',
  },
  tiktok: {
    bg: 'bg-black',
    border: 'border-black',
    text: 'text-white',
  },
};

const platformIcons: Record<string, string> = {
  instagram: '📷',
  facebook: '👍',
  linkedin: '💼',
  tiktok: '🎵',
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: SocialPost;
}

export default function SocialPostCalendar({ onSelectPost, refreshTrigger }: SocialPostCalendarProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    loadPosts();
  }, [refreshTrigger]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await marketingService.getSocialPosts({ status: 'scheduled' });
      setPosts(data);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast.error('Erro ao carregar posts agendados');
    } finally {
      setLoading(false);
    }
  };

  const events: CalendarEvent[] = useMemo(() => {
    return posts
      .filter((post) => post.scheduledAt)
      .map((post) => {
        const scheduledDate = new Date(post.scheduledAt!);
        return {
          id: post.id,
          title: `${platformIcons[post.platform]} ${post.content.substring(0, 30)}${
            post.content.length > 30 ? '...' : ''
          }`,
          start: scheduledDate,
          end: new Date(scheduledDate.getTime() + 60 * 60 * 1000), // +1 hour
          resource: post,
        };
      });
  }, [posts]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const platform = event.resource.platform;
    const colors = platformColors[platform];

    return {
      style: {
        backgroundColor: colors.bg.includes('gradient') ? '#9333ea' : colors.bg.replace('bg-', '#'),
        borderLeft: `4px solid ${colors.border.replace('border-', '#')}`,
        borderRadius: '4px',
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    onSelectPost(event.resource);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Calendar Header with Legend */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Posts Agendados ({events.length})
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(platformIcons).map(([platform, icon]) => (
            <div key={platform} className="flex items-center gap-2 text-sm">
              <div
                className={`w-4 h-4 rounded ${
                  platform === 'instagram'
                    ? 'bg-purple-500'
                    : platform === 'facebook'
                    ? 'bg-blue-600'
                    : platform === 'linkedin'
                    ? 'bg-blue-700'
                    : 'bg-black'
                }`}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {icon} {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-container" style={{ height: '600px' }}>
        <style>
          {`
            .rbc-calendar {
              font-family: inherit;
            }
            .rbc-header {
              padding: 12px 6px;
              font-weight: 600;
              border-bottom: 1px solid #e5e7eb;
            }
            .dark .rbc-header {
              border-bottom-color: #374151;
              color: #fff;
            }
            .rbc-today {
              background-color: #dbeafe;
            }
            .dark .rbc-today {
              background-color: #1e3a8a;
            }
            .rbc-off-range-bg {
              background-color: #f9fafb;
            }
            .dark .rbc-off-range-bg {
              background-color: #111827;
            }
            .rbc-month-view, .rbc-time-view {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }
            .dark .rbc-month-view, .dark .rbc-time-view {
              border-color: #374151;
            }
            .rbc-event {
              cursor: pointer;
            }
            .rbc-event:hover {
              opacity: 0.85;
            }
            .rbc-toolbar {
              padding: 12px;
              margin-bottom: 12px;
              background-color: #f9fafb;
              border-radius: 8px;
            }
            .dark .rbc-toolbar {
              background-color: #1f2937;
            }
            .rbc-toolbar button {
              color: #374151;
              border: 1px solid #d1d5db;
              padding: 6px 12px;
              border-radius: 6px;
              background-color: white;
              font-weight: 500;
            }
            .dark .rbc-toolbar button {
              color: #d1d5db;
              border-color: #4b5563;
              background-color: #374151;
            }
            .rbc-toolbar button:hover {
              background-color: #f3f4f6;
            }
            .dark .rbc-toolbar button:hover {
              background-color: #4b5563;
            }
            .rbc-toolbar button.rbc-active {
              background-color: #2563eb;
              color: white;
              border-color: #2563eb;
            }
            .dark .rbc-toolbar button.rbc-active {
              background-color: #3b82f6;
              border-color: #3b82f6;
            }
            .rbc-time-slot {
              border-top: 1px solid #f3f4f6;
            }
            .dark .rbc-time-slot {
              border-top-color: #374151;
            }
            .rbc-day-slot .rbc-time-slot {
              border-top: 1px solid #f3f4f6;
            }
            .dark .rbc-day-slot .rbc-time-slot {
              border-top-color: #374151;
            }
            .rbc-time-content {
              border-top: 1px solid #e5e7eb;
            }
            .dark .rbc-time-content {
              border-top-color: #374151;
            }
            .rbc-time-header-content {
              border-left: 1px solid #e5e7eb;
            }
            .dark .rbc-time-header-content {
              border-left-color: #374151;
            }
            .rbc-day-bg + .rbc-day-bg {
              border-left: 1px solid #e5e7eb;
            }
            .dark .rbc-day-bg + .rbc-day-bg {
              border-left-color: #374151;
            }
            .rbc-month-row + .rbc-month-row {
              border-top: 1px solid #e5e7eb;
            }
            .dark .rbc-month-row + .rbc-month-row {
              border-top-color: #374151;
            }
            .rbc-date-cell {
              padding: 6px;
            }
            .dark .rbc-date-cell {
              color: #d1d5db;
            }
            .rbc-off-range {
              color: #9ca3af;
            }
            .dark .rbc-off-range {
              color: #6b7280;
            }
          `}
        </style>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          messages={{
            next: 'Próximo',
            previous: 'Anterior',
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            agenda: 'Agenda',
            date: 'Data',
            time: 'Hora',
            event: 'Post',
            noEventsInRange: 'Nenhum post agendado neste período.',
            showMore: (total) => `+ ${total} post${total > 1 ? 's' : ''}`,
          }}
          culture="pt-BR"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
}
