import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { leadsService } from '@/services/leadsService';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Activity,
  ChevronRight,
  Building2,
  Timer,
  Target,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  newLeads: number;
  totalPatients: number;
  avgAttendanceTime: number;
  conversionRate: number;
  avgTicket: number;
  uptime: number;
  attendancesByClinic: {
    moema: number;
    avPaulista: number;
  };
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  color: string;
}

interface Attendance {
  id: string;
  patientName: string;
  doctorName: string;
  room: string;
  procedure: string;
  status: 'aguardando' | 'em_atendimento' | 'finalizado' | 'retorno_marcado';
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    newLeads: 0,
    totalPatients: 0,
    avgAttendanceTime: 0,
    conversionRate: 0,
    avgTicket: 0,
    uptime: 99.9,
    attendancesByClinic: { moema: 0, avPaulista: 0 },
  });
  const [newLeads, setNewLeads] = useState<any[]>([]);
  const [showNewLeadsPopup, setShowNewLeadsPopup] = useState(false);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [leadsWithoutResponse, setLeadsWithoutResponse] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar leads
      const leads = await leadsService.getLeads();

      // Calcular estatísticas
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newLeadsToday = leads.filter(lead => {
        const createdDate = new Date(lead.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        return createdDate.getTime() === today.getTime();
      });

      // Leads sem resposta (sem atividades nos últimos 2 dias)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const leadsNoResponse = leads.filter(lead => {
        if (!lead.activities || lead.activities.length === 0) return true;
        const lastActivity = new Date(lead.activities[0].createdAt);
        return lastActivity < twoDaysAgo;
      });

      // Calcular conversão (leads que viraram fechado)
      const closedLeads = leads.filter(lead => lead.stage?.name === 'Fechado');
      const conversionRate = leads.length > 0 ? (closedLeads.length / leads.length) * 100 : 0;

      // Calcular ticket médio
      const totalValue = closedLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
      const avgTicket = closedLeads.length > 0 ? totalValue / closedLeads.length : 0;

      // Separar por clínica
      const moemaClinics = leads.filter(l => l.attendanceLocation === 'clinic' || l.city?.toLowerCase().includes('moema'));
      const avPaulistaLeads = leads.filter(l => l.city?.toLowerCase().includes('paulista'));

      setStats({
        newLeads: newLeadsToday.length,
        totalPatients: leads.length,
        avgAttendanceTime: 45, // Mock - seria calculado com base em agendamentos
        conversionRate: Math.round(conversionRate),
        avgTicket: avgTicket,
        uptime: 99.9,
        attendancesByClinic: {
          moema: moemaClinics.length,
          avPaulista: avPaulistaLeads.length,
        },
      });

      setNewLeads(newLeadsToday.slice(0, 10));
      setLeadsWithoutResponse(leadsNoResponse.length);

      // Mock de atividades recentes (em produção viria da API)
      setRecentActivities([
        {
          id: '1',
          type: 'lead',
          title: 'Novo lead cadastrado',
          description: newLeadsToday.length > 0 ? newLeadsToday[0].name : 'Aguardando novos leads',
          time: 'Há 5 minutos',
          color: 'bg-blue-100 text-blue-600',
        },
        {
          id: '2',
          type: 'appointment',
          title: 'Agendamento confirmado',
          description: 'Cliente confirmou consulta para amanhã',
          time: 'Há 15 minutos',
          color: 'bg-green-100 text-green-600',
        },
        {
          id: '3',
          type: 'payment',
          title: 'Pagamento recebido',
          description: 'R$ 350,00 via PIX',
          time: 'Há 1 hora',
          color: 'bg-purple-100 text-purple-600',
        },
      ]);

      // Mock de atendimentos (em produção viria da API de agenda)
      setAttendances([
        {
          id: '1',
          patientName: 'Maria Silva',
          doctorName: 'Dr. João Santos',
          room: 'Sala 1',
          procedure: 'Consulta Inicial',
          status: 'em_atendimento',
        },
        {
          id: '2',
          patientName: 'Pedro Oliveira',
          doctorName: 'Dra. Ana Costa',
          room: 'Sala 2',
          procedure: 'Retorno',
          status: 'aguardando',
        },
      ]);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aguardando: 'Aguardando',
      em_atendimento: 'Em Atendimento',
      finalizado: 'Finalizado',
      retorno_marcado: 'Retorno Marcado',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      aguardando: 'bg-yellow-100 text-yellow-800',
      em_atendimento: 'bg-blue-100 text-blue-800',
      finalizado: 'bg-green-100 text-green-800',
      retorno_marcado: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bem-vindo, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visão geral do seu sistema Nexus
        </p>
      </div>

      {/* Novos Leads - Clicável */}
      <div
        onClick={() => setShowNewLeadsPopup(true)}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 cursor-pointer hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
      >
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-sm opacity-90 mb-1">Novos Leads Hoje</p>
            <p className="text-4xl font-bold">{stats.newLeads}</p>
            <p className="text-sm mt-2 opacity-90">Clique para ver detalhes</p>
          </div>
          <div className="bg-white/20 p-4 rounded-full">
            <Users size={40} />
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Pacientes */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total de Pacientes
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalPatients}
              </p>
              <p className="text-xs text-gray-500 mt-1">Atendidos pela clínica</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <UserCheck className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Tempo Médio de Atendimento */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Tempo Médio
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.avgAttendanceTime}min
              </p>
              <p className="text-xs text-green-600 mt-1">-5min vs mês anterior</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <Timer className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Taxa de Conversão
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.conversionRate}%
              </p>
              <p className="text-xs text-green-600 mt-1">Lead → Fechado</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <Target className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Ticket Médio
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(stats.avgTicket)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Por cliente fechado</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Atendimentos por Clínica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-indigo-100">
              <Building2 className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Moema</p>
              <p className="text-xl font-bold">{stats.attendancesByClinic.moema}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-indigo-100">
              <Building2 className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">AV Paulista</p>
              <p className="text-xl font-bold">{stats.attendancesByClinic.avPaulista}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Activity className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-xl font-bold">{stats.uptime}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="text-orange-600" size={24} />
            Alertas
          </h2>
          <div className="space-y-3">
            {leadsWithoutResponse > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-orange-900">
                      {leadsWithoutResponse} Lead{leadsWithoutResponse > 1 ? 's' : ''} sem resposta
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      Existem leads aguardando retorno há mais de 2 dias
                    </p>
                  </div>
                </div>
              </div>
            )}
            {leadsWithoutResponse === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="mx-auto mb-2 text-green-600" size={40} />
                <p>Nenhum alerta no momento</p>
              </div>
            )}
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Atividades Recentes</h2>
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activity.color.split(' ')[0]}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Atendimentos */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Atendimentos Hoje</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sala
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Procedimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum atendimento agendado para hoje
                  </td>
                </tr>
              ) : (
                attendances.map(attendance => (
                  <tr key={attendance.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {attendance.patientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {attendance.doctorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {attendance.room}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {attendance.procedure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(attendance.status)}`}>
                        {getStatusLabel(attendance.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal/Popup Novos Leads */}
      {showNewLeadsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Novos Leads Hoje ({newLeads.length})
                </h3>
                <button
                  onClick={() => setShowNewLeadsPopup(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {newLeads.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="mx-auto mb-3 opacity-50" size={48} />
                  <p>Nenhum lead novo hoje</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {newLeads.map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => {
                        setShowNewLeadsPopup(false);
                        navigate('/leads', { state: { openLeadId: lead.id } });
                      }}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {lead.name}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {lead.phone && <span>📞 {lead.phone}</span>}
                            {lead.procedure && <span>{lead.procedure.name}</span>}
                            {lead.estimatedValue && (
                              <span className="text-green-600 font-medium">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(lead.estimatedValue)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="text-gray-400" size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => {
                  setShowNewLeadsPopup(false);
                  navigate('/leads');
                }}
                className="w-full btn-primary"
              >
                Ver Todos os Leads
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
