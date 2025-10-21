import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { leadsService } from '@/services/leadsService';
import appointmentService, { Appointment } from '@/services/appointmentService';
import {
  Users,
  DollarSign,
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
  const [showAlertsPopup, setShowAlertsPopup] = useState(false);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [leadsWithoutResponse, setLeadsWithoutResponse] = useState(0);
  const [leadsNoResponseList, setLeadsNoResponseList] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar leads e agendamentos em paralelo
      const [leads, appointments] = await Promise.all([
        leadsService.getLeads(),
        appointmentService.getToday(),
      ]);

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

      // Calcular conversão (leads que viraram fechado) - CORRIGIDO: usando status ao invés de state
      const closedLeads = leads.filter(lead => lead.status === 'won');
      const conversionRate = leads.length > 0 ? (closedLeads.length / leads.length) * 100 : 0;

      // Calcular ticket médio baseado em agendamentos pagos
      const paidAppointments = appointments.filter(apt => apt.paymentAmount && apt.paymentAmount > 0);
      const totalRevenue = paidAppointments.reduce((sum, apt) => sum + (Number(apt.paymentAmount) || 0), 0);
      const avgTicket = paidAppointments.length > 0 ? totalRevenue / paidAppointments.length : 0;

      // Calcular tempo médio de atendimento baseado em agendamentos finalizados
      const finalizedAppointments = appointments.filter(apt => apt.status === 'finalizado' && apt.estimatedDuration);
      const avgAttendanceTime = finalizedAppointments.length > 0
        ? finalizedAppointments.reduce((sum, apt) => sum + (apt.estimatedDuration || 0), 0) / finalizedAppointments.length
        : 45;

      // Separar agendamentos por clínica (com filtro robusto)
      const moemaAppointments = appointments.filter(apt =>
        apt.location?.toLowerCase().includes('moema')
      );
      const avPaulistaAppointments = appointments.filter(apt =>
        apt.location?.toLowerCase().includes('paulista') || apt.location === 'av_paulista'
      );

      setStats({
        newLeads: newLeadsToday.length,
        totalPatients: leads.length,
        avgAttendanceTime: Math.round(avgAttendanceTime),
        conversionRate: Math.round(conversionRate),
        avgTicket: avgTicket,
        uptime: 99.9,
        attendancesByClinic: {
          moema: moemaAppointments.length,
          avPaulista: avPaulistaAppointments.length,
        },
      });

      setNewLeads(newLeadsToday.slice(0, 10));
      setLeadsWithoutResponse(leadsNoResponse.length);
      setLeadsNoResponseList(leadsNoResponse);
      setTodayAppointments(appointments);

      // Atividades recentes baseadas em dados reais
      const activities: RecentActivity[] = [];

      if (newLeadsToday.length > 0) {
        activities.push({
          id: '1',
          type: 'lead',
          title: 'Novo lead cadastrado',
          description: newLeadsToday[0].name,
          time: 'Hoje',
          color: 'bg-blue-100 text-blue-600',
        });
      }

      const confirmedToday = appointments.filter(apt => apt.status === 'confirmado');
      if (confirmedToday.length > 0) {
        activities.push({
          id: '2',
          type: 'appointment',
          title: 'Agendamento confirmado',
          description: confirmedToday[0].lead?.name || 'Cliente',
          time: 'Hoje',
          color: 'bg-green-100 text-green-600',
        });
      }

      if (paidAppointments.length > 0) {
        activities.push({
          id: '3',
          type: 'payment',
          title: 'Pagamento recebido',
          description: `R$ ${Number(paidAppointments[0].paymentAmount).toFixed(2)} via ${paidAppointments[0].paymentMethod || 'PIX'}`,
          time: 'Hoje',
          color: 'bg-purple-100 text-purple-600',
        });
      }

      if (activities.length === 0) {
        activities.push({
          id: '1',
          type: 'info',
          title: 'Nenhuma atividade recente',
          description: 'Aguardando novas atividades',
          time: 'Hoje',
          color: 'bg-gray-100 text-gray-600',
        });
      }

      setRecentActivities(activities);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aguardando_pagamento: 'Aguardando Pagamento',
      aguardando_confirmacao: 'Aguardando Confirmação',
      confirmado: 'Confirmado',
      check_in: 'Check-in Realizado',
      em_atendimento: 'Em Atendimento',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      aguardando_pagamento: 'bg-orange-100 text-orange-800',
      aguardando_confirmacao: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-green-100 text-green-800',
      check_in: 'bg-blue-100 text-blue-800',
      em_atendimento: 'bg-indigo-100 text-indigo-800',
      finalizado: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-100 text-red-800',
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
              <div
                onClick={() => setShowAlertsPopup(true)}
                className="p-4 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="font-medium text-orange-900">
                      {leadsWithoutResponse} Lead{leadsWithoutResponse > 1 ? 's' : ''} sem resposta
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      Clique para ver os leads aguardando retorno há mais de 2 dias
                    </p>
                  </div>
                  <ChevronRight className="text-orange-600 flex-shrink-0" size={20} />
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
        <h2 className="text-xl font-bold mb-4">Agendamentos Hoje</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Procedimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Local
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {todayAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum agendamento para hoje
                  </td>
                </tr>
              ) : (
                todayAppointments.map(appointment => (
                  <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(appointment.scheduledDate).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {appointment.lead?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {appointment.procedure?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {appointment.location === 'moema' ? 'Moema' : appointment.location === 'av_paulista' ? 'Av. Paulista' : appointment.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {appointment.paymentAmount ? `R$ ${Number(appointment.paymentAmount).toFixed(2)}` : '-'}
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

      {/* Modal/Popup Leads Sem Resposta */}
      {showAlertsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-orange-600" size={28} />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Leads Sem Resposta ({leadsNoResponseList.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowAlertsPopup(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Leads aguardando retorno há mais de 2 dias
              </p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {leadsNoResponseList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="mx-auto mb-3 text-green-600" size={48} />
                  <p>Nenhum lead sem resposta</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leadsNoResponseList.map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => {
                        setShowAlertsPopup(false);
                        navigate('/leads', { state: { openLeadId: lead.id } });
                      }}
                      className="p-4 border border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {lead.name}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {lead.phone && <span>📞 {lead.phone}</span>}
                            {lead.procedure && <span>{lead.procedure.name}</span>}
                            {lead.activities && lead.activities.length > 0 && (
                              <span className="text-orange-600 font-medium">
                                Última atividade: {new Date(lead.activities[0].createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                            {(!lead.activities || lead.activities.length === 0) && (
                              <span className="text-red-600 font-medium">
                                Nenhuma atividade registrada
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="text-orange-600" size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => {
                  setShowAlertsPopup(false);
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
