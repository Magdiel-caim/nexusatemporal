import { useState, useEffect } from 'react';
import { Activity, leadsService } from '@/services/leadsService';
import {
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  MessageSquare,
  MessageCircle,
  User,
  Clock,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface ActivitiesTimelineProps {
  leadId: string;
  showOnlyHistory?: boolean;
}

const getActivityIcon = (type: string) => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'call':
      return <Phone className={iconClass} />;
    case 'email':
      return <Mail className={iconClass} />;
    case 'meeting':
      return <Calendar className={iconClass} />;
    case 'task':
      return <CheckSquare className={iconClass} />;
    case 'note':
      return <MessageSquare className={iconClass} />;
    case 'whatsapp':
      return <MessageCircle className={iconClass} />;
    case 'lead_created':
    case 'lead_assigned':
    case 'stage_change':
    case 'status_change':
    case 'field_change':
      return <User className={iconClass} />;
    default:
      return <Clock className={iconClass} />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'call':
      return 'bg-blue-100 text-blue-600 border-blue-200';
    case 'email':
      return 'bg-purple-100 text-purple-600 border-purple-200';
    case 'meeting':
      return 'bg-green-100 text-green-600 border-green-200';
    case 'task':
      return 'bg-orange-100 text-orange-600 border-orange-200';
    case 'note':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'whatsapp':
      return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    case 'lead_created':
    case 'lead_assigned':
    case 'stage_change':
    case 'status_change':
    case 'field_change':
      return 'bg-indigo-100 text-indigo-600 border-indigo-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getActivityTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    call: 'Ligação',
    email: 'E-mail',
    meeting: 'Reunião',
    task: 'Tarefa',
    note: 'Nota',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    stage_change: 'Mudança de Estágio',
    status_change: 'Mudança de Status',
    lead_created: 'Lead Criado',
    lead_assigned: 'Lead Atribuído',
    field_change: 'Alteração',
    other: 'Outro',
  };
  return labels[type] || type;
};

export default function ActivitiesTimeline({ leadId, showOnlyHistory = false }: ActivitiesTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [leadId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await leadsService.getLeadActivities(leadId);
      setActivities(data);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteActivity = async (activityId: string) => {
    try {
      await leadsService.completeActivity(activityId);
      toast.success('Atividade concluída!');
      await loadActivities();
    } catch (error) {
      console.error('Erro ao concluir atividade:', error);
      toast.error('Erro ao concluir atividade');
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch {
      return date;
    }
  };

  // Filter activities based on showOnlyHistory
  const systemActivityTypes = ['stage_change', 'status_change', 'lead_created', 'lead_assigned', 'field_change'];
  const manualActivityTypes = ['call', 'email', 'meeting', 'task', 'note', 'whatsapp', 'sms', 'other'];

  const filteredActivities = showOnlyHistory
    ? activities.filter(activity => systemActivityTypes.includes(activity.type))
    : activities.filter(activity => manualActivityTypes.includes(activity.type));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {showOnlyHistory ? 'Histórico' : 'Atividades'} ({filteredActivities.length})
        </h3>
      </div>

      {/* Timeline */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">
            {showOnlyHistory
              ? 'Nenhuma alteração registrada ainda'
              : 'Nenhuma atividade criada ainda. Use o botão "Nova Atividade" para adicionar follow-ups, ligações, reuniões e mais.'}
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Activities */}
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div key={activity.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${getActivityColor(activity.type)} z-10`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className={`bg-white rounded-lg border p-4 shadow-sm ${activity.isCompleted ? 'opacity-70' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {activity.title}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getActivityColor(activity.type)}`}>
                            {getActivityTypeLabel(activity.type)}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        )}
                      </div>

                      {!activity.isCompleted && (activity.type === 'task' || activity.type === 'call' || activity.type === 'meeting') && (
                        <button
                          onClick={() => handleCompleteActivity(activity.id)}
                          className="flex-shrink-0 p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          title="Marcar como concluída"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(activity.createdAt)}
                      </span>
                      {activity.user && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {activity.user.name}
                        </span>
                      )}
                      {activity.scheduledAt && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <Calendar className="w-3 h-3" />
                          Agendado: {formatDate(activity.scheduledAt)}
                        </span>
                      )}
                      {activity.isCompleted && activity.completedAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Check className="w-3 h-3" />
                          Concluída: {formatDate(activity.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
