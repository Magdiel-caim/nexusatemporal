import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { leadsService } from '@/services/leadsService';
import appointmentService, { Appointment } from '@/services/appointmentService';
import { financialService, Transaction } from '@/services/financialService';
import stockService, { Product, StockAlert } from '@/services/stockService';
import { safeNumber } from '@/utils/formatters';
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
  Calendar,
  ArrowRight,
  FileText,
  Settings,
  GripVertical,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  CreditCard,
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

interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  category: 'metrics' | 'tables' | 'charts' | 'alerts';
  roles: string[]; // Roles que podem ver este widget
  isDefault: boolean; // Se deve aparecer por padrão
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
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [enabledWidgets, setEnabledWidgets] = useState<string[]>([]);

  // Estados para dados financeiros
  const [pendingPayables, setPendingPayables] = useState<Transaction[]>([]);
  const [pendingReceivables, setPendingReceivables] = useState<Transaction[]>([]);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [monthExpenses, setMonthExpenses] = useState(0);

  // Estados para dados de estoque
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);

  // Widgets disponíveis
  const availableWidgets: DashboardWidget[] = [
    {
      id: 'new-leads',
      name: 'Novos Leads Hoje',
      description: 'Exibe quantidade de novos leads cadastrados hoje',
      category: 'metrics',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin'],
      isDefault: true,
    },
    {
      id: 'today-appointments',
      name: 'Agendamentos Hoje',
      description: 'Exibe total de agendamentos do dia',
      category: 'metrics',
      roles: ['receptionist', 'doctor', 'professional', 'user'],
      isDefault: true,
    },
    {
      id: 'total-patients',
      name: 'Total de Pacientes',
      description: 'Número total de pacientes atendidos',
      category: 'metrics',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin', 'receptionist', 'doctor', 'professional'],
      isDefault: true,
    },
    {
      id: 'avg-time',
      name: 'Tempo Médio',
      description: 'Tempo médio de atendimento',
      category: 'metrics',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin'],
      isDefault: true,
    },
    {
      id: 'conversion-rate',
      name: 'Taxa de Conversão',
      description: 'Percentual de leads convertidos',
      category: 'metrics',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin'],
      isDefault: true,
    },
    {
      id: 'avg-ticket',
      name: 'Ticket Médio',
      description: 'Valor médio por cliente',
      category: 'metrics',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin'],
      isDefault: true,
    },
    {
      id: 'clinics-attendance',
      name: 'Atendimentos por Clínica',
      description: 'Distribuição de atendimentos entre unidades',
      category: 'metrics',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin'],
      isDefault: true,
    },
    {
      id: 'uptime',
      name: 'Uptime do Sistema',
      description: 'Disponibilidade do sistema',
      category: 'metrics',
      roles: ['admin', 'owner', 'superadmin', 'super_admin'],
      isDefault: true,
    },
    {
      id: 'alerts',
      name: 'Alertas',
      description: 'Notificações e alertas importantes',
      category: 'alerts',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin', 'receptionist'],
      isDefault: true,
    },
    {
      id: 'recent-activities',
      name: 'Atividades Recentes',
      description: 'Últimas atividades do sistema',
      category: 'tables',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin'],
      isDefault: true,
    },
    {
      id: 'appointments-table',
      name: 'Tabela de Agendamentos',
      description: 'Lista detalhada dos agendamentos',
      category: 'tables',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin', 'receptionist', 'doctor', 'professional'],
      isDefault: true,
    },
    // Widgets Financeiros
    {
      id: 'financial-summary',
      name: 'Resumo Financeiro',
      description: 'Receitas e despesas do mês',
      category: 'metrics',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin', 'financeiro', 'financial'],
      isDefault: true,
    },
    {
      id: 'pending-payables',
      name: 'Contas a Pagar',
      description: 'Lista de contas pendentes de pagamento',
      category: 'tables',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin', 'financeiro', 'financial'],
      isDefault: true,
    },
    {
      id: 'pending-receivables',
      name: 'Contas a Receber',
      description: 'Lista de valores a receber',
      category: 'tables',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin', 'financeiro', 'financial'],
      isDefault: true,
    },
    // Widgets de Estoque
    {
      id: 'low-stock-alert',
      name: 'Alertas de Estoque Baixo',
      description: 'Produtos com estoque abaixo do mínimo',
      category: 'alerts',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin', 'administrativo', 'administrative', 'estoque', 'stock'],
      isDefault: true,
    },
    {
      id: 'stock-summary',
      name: 'Resumo de Estoque',
      description: 'Visão geral do estoque',
      category: 'metrics',
      roles: ['admin', 'owner', 'manager', 'superadmin', 'super_admin', 'administrativo', 'administrative', 'estoque', 'stock'],
      isDefault: true,
    },
  ];

  useEffect(() => {
    loadDashboardData();
    loadWidgetPreferences();

    // Recarregar a cada 60 segundos para atualizar alertas
    const interval = setInterval(() => {
      loadDashboardData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Carregar preferências de widgets do localStorage
  const loadWidgetPreferences = () => {
    const saved = localStorage.getItem(`dashboard-widgets-${user?.id}`);
    if (saved) {
      setEnabledWidgets(JSON.parse(saved));
    } else {
      // Carregar widgets padrão baseado no role do usuário
      const defaultWidgets = availableWidgets
        .filter(w => w.isDefault && w.roles.includes(user?.role || ''))
        .map(w => w.id);
      setEnabledWidgets(defaultWidgets);
    }
  };

  // Salvar preferências de widgets
  const saveWidgetPreferences = (widgets: string[]) => {
    localStorage.setItem(`dashboard-widgets-${user?.id}`, JSON.stringify(widgets));
    setEnabledWidgets(widgets);
    toast.success('Preferências salvas com sucesso!');
  };

  // Verificar se widget está habilitado
  const isWidgetEnabled = (widgetId: string) => {
    return enabledWidgets.includes(widgetId);
  };

  // Verificar se usuário pode customizar dashboard
  const canCustomizeDashboard = () => {
    // TODOS os usuários autenticados podem customizar sua dashboard
    return !!user?.role;
  };

  // Verificar se o usuário pode ver métricas avançadas
  const canViewAdvancedMetrics = () => {
    if (!user?.role) return false;
    const restrictedRoles = ['receptionist', 'doctor', 'professional', 'user'];
    return !restrictedRoles.includes(user.role);
  };

  // Verificar se o usuário é da equipe de vendas
  const isSalesTeam = () => {
    if (!user?.role) return false;
    // Vendedores e admins/gestores podem ver leads
    const salesRoles = ['admin', 'owner', 'manager', 'superadmin', 'super_admin'];
    return salesRoles.includes(user.role);
  };

  const handleLeadClick = (leadId: string) => {
    setShowAlertsPopup(false);
    navigate('/leads', { state: { openLeadId: leadId } });
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await appointmentService.update(appointmentId, { status: newStatus });
      toast.success('Status atualizado com sucesso!');
      // Recarregar dados
      loadDashboardData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleViewPatient = (lead: any) => {
    setSelectedPatient(lead);
    setShowPatientModal(true);
  };

  const loadFinancialData = async () => {
    try {
      console.log('[Dashboard] Carregando dados financeiros para role:', user?.role);

      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      console.log('[Dashboard] Buscando transações de', startDate, 'até', endDate);

      // Buscar transações do mês
      const transactions = await financialService.getTransactions({
        dateFrom: startDate,
        dateTo: endDate,
      });
      console.log('[Dashboard] Total de transações:', transactions.length);

      // Filtrar contas a pagar e receber pendentes
      const payables = transactions.filter((t: Transaction) => t.type === 'despesa' && t.status === 'pendente');
      const receivables = transactions.filter((t: Transaction) => t.type === 'receita' && t.status === 'pendente');
      console.log('[Dashboard] Contas a pagar:', payables.length, '| Contas a receber:', receivables.length);

      // Calcular totais do mês (com proteção contra NaN)
      const revenue = transactions
        .filter((t: Transaction) => t.type === 'receita' && t.status === 'confirmada')
        .reduce((sum: number, t: Transaction) => sum + safeNumber(t.amount), 0);

      const expenses = transactions
        .filter((t: Transaction) => t.type === 'despesa' && t.status === 'confirmada')
        .reduce((sum: number, t: Transaction) => sum + safeNumber(t.amount), 0);
      console.log('[Dashboard] Receitas:', revenue, '| Despesas:', expenses);

      setPendingPayables(payables.slice(0, 5)); // Top 5
      setPendingReceivables(receivables.slice(0, 5)); // Top 5
      setMonthRevenue(revenue);
      setMonthExpenses(expenses);
    } catch (error) {
      console.error('[Dashboard] Erro ao carregar dados financeiros:', error);
    }
  };

  const loadStockData = async () => {
    try {
      console.log('[Dashboard] Carregando dados de estoque para role:', user?.role);

      // Buscar produtos com estoque baixo
      const productsResponse = await stockService.getProducts();
      console.log('[Dashboard] Resposta de produtos:', productsResponse);

      // O serviço retorna { data: Product[], total: number }
      const products = Array.isArray(productsResponse) ? productsResponse : (productsResponse.data || []);
      const lowStock = products.filter((p: Product) => p.currentStock <= p.minimumStock && p.isActive);
      console.log('[Dashboard] Produtos com estoque baixo:', lowStock.length);

      // Buscar alertas ativos
      const alertsResponse = await stockService.getAlerts();
      console.log('[Dashboard] Resposta de alertas:', alertsResponse);

      const alerts = Array.isArray(alertsResponse) ? alertsResponse : (alertsResponse.data || []);
      const activeAlerts = alerts.filter((a: StockAlert) => a.status === 'ACTIVE');
      console.log('[Dashboard] Alertas ativos:', activeAlerts.length);

      setLowStockProducts(lowStock.slice(0, 5)); // Top 5
      setStockAlerts(activeAlerts.slice(0, 5)); // Top 5
    } catch (error) {
      console.error('[Dashboard] Erro ao carregar dados de estoque:', error);
    }
  };

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
        // Se o lead foi atualizado recentemente (nas últimas 4 horas), não mostrar no alerta
        const updatedAt = new Date(lead.updatedAt);
        const fourHoursAgo = new Date();
        fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);

        if (updatedAt > fourHoursAgo) {
          return false; // Lead foi atualizado recentemente, não mostrar alerta
        }

        // Verificar atividades
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

      // Filtrar apenas agendamentos confirmados, aguardando atendimento ou em atendimento
      const relevantAppointments = appointments.filter(apt =>
        ['confirmado', 'aguardando_atendimento', 'em_atendimento'].includes(apt.status)
      );
      setTodayAppointments(relevantAppointments);

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

      // Carregar dados financeiros e estoque em paralelo (se o usuário tiver acesso)
      const extraPromises = [];
      console.log('[Dashboard] Role do usuário:', user?.role);

      const hasFinancialAccess = ['admin', 'owner', 'manager', 'superadmin', 'super_admin', 'financeiro', 'financial'].includes(user?.role || '');
      const hasStockAccess = ['admin', 'owner', 'manager', 'superadmin', 'super_admin', 'administrativo', 'administrative', 'estoque', 'stock'].includes(user?.role || '');

      console.log('[Dashboard] Acesso financeiro:', hasFinancialAccess);
      console.log('[Dashboard] Acesso estoque:', hasStockAccess);

      if (hasFinancialAccess) {
        console.log('[Dashboard] Carregando dados financeiros...');
        extraPromises.push(loadFinancialData());
      }

      if (hasStockAccess) {
        console.log('[Dashboard] Carregando dados de estoque...');
        extraPromises.push(loadStockData());
      }

      await Promise.all(extraPromises);
      console.log('[Dashboard] Dados extras carregados com sucesso');

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
      aguardando_atendimento: 'Aguardando Atendimento',
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
      aguardando_atendimento: 'bg-cyan-100 text-cyan-800',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bem-vindo, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visão geral do seu sistema Nexus
          </p>
        </div>
        {canCustomizeDashboard() && (
          <button
            onClick={() => setShowCustomizeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Settings size={20} />
            Personalizar Dashboard
          </button>
        )}
      </div>

      {/* Novos Leads - Apenas para equipe de vendas */}
      {isSalesTeam() && isWidgetEnabled('new-leads') && (
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
      )}

      {/* Agendamentos Hoje - Para médicos, recepcionistas e demais colaboradores */}
      {!isSalesTeam() && isWidgetEnabled('today-appointments') && (
        <div
          onClick={() => navigate('/appointments')}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-6 cursor-pointer hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm opacity-90 mb-1">Agendamentos Hoje</p>
              <p className="text-4xl font-bold">{todayAppointments.length}</p>
              <p className="text-sm mt-2 opacity-90">Clique para ver todos</p>
            </div>
            <div className="bg-white/20 p-4 rounded-full">
              <Calendar size={40} />
            </div>
          </div>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Pacientes */}
        {isWidgetEnabled('total-patients') && (
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
        )}

        {/* Tempo Médio de Atendimento - Apenas para Admin e Gestores */}
        {canViewAdvancedMetrics() && isWidgetEnabled('avg-time') && (
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
        )}

        {/* Taxa de Conversão - Apenas para Admin e Gestores */}
        {canViewAdvancedMetrics() && isWidgetEnabled('conversion-rate') && (
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
        )}

        {/* Ticket Médio - Apenas para Admin e Gestores */}
        {canViewAdvancedMetrics() && isWidgetEnabled('avg-ticket') && (
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
        )}
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

        {/* Uptime - Apenas para Admin e Gestores */}
        {canViewAdvancedMetrics() && (
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
        )}
      </div>

      {/* Alertas e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        {isWidgetEnabled('alerts') && (
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
        )}

        {/* Atividades Recentes */}
        {isWidgetEnabled('recent-activities') && (
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
        )}
      </div>

      {/* Tabela de Atendimentos */}
      {isWidgetEnabled('appointments-table') && (
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {todayAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewPatient(appointment.lead)}
                        className="text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
                      >
                        {appointment.lead?.name || 'N/A'}
                        <FileText size={14} />
                      </button>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {appointment.status === 'confirmado' && user?.role === 'receptionist' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'aguardando_atendimento')}
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                          title="Marcar como Aguardando Atendimento"
                        >
                          Aguardando <ArrowRight size={12} />
                        </button>
                      )}
                      {appointment.status === 'aguardando_atendimento' && ['doctor', 'professional'].includes(user?.role || '') && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'em_atendimento')}
                          className="text-xs px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 flex items-center gap-1"
                          title="Iniciar Atendimento"
                        >
                          Iniciar <ArrowRight size={12} />
                        </button>
                      )}
                      {appointment.status === 'em_atendimento' && ['doctor', 'professional'].includes(user?.role || '') && (
                        <span className="text-xs text-indigo-600 font-medium">Em Atendimento</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Widgets Financeiros */}
      {isWidgetEnabled('financial-summary') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Receitas do Mês */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Receitas do Mês
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(monthRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Confirmadas</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Despesas do Mês */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Despesas do Mês
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(monthExpenses)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Confirmadas</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                <TrendingDown className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contas a Pagar */}
      {isWidgetEnabled('pending-payables') && pendingPayables.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CreditCard className="text-red-600" size={24} />
            Contas a Pagar
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {pendingPayables.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Number(transaction.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigate('/financeiro')}
              className="w-full btn-primary"
            >
              Ver Todas as Contas
            </button>
          </div>
        </div>
      )}

      {/* Contas a Receber */}
      {isWidgetEnabled('pending-receivables') && pendingReceivables.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="text-green-600" size={24} />
            Contas a Receber
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {pendingReceivables.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Number(transaction.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigate('/financeiro')}
              className="w-full btn-primary"
            >
              Ver Todas as Contas
            </button>
          </div>
        </div>
      )}

      {/* Widgets de Estoque */}
      {isWidgetEnabled('low-stock-alert') && lowStockProducts.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-600" size={24} />
            Alertas de Estoque Baixo
          </h2>
          <div className="space-y-3">
            {lowStockProducts.map(product => (
              <div
                key={product.id}
                className="p-4 border border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Estoque Atual: <strong className="text-orange-600">{product.currentStock}</strong></span>
                      <span>Mínimo: {product.minimumStock}</span>
                      {product.sku && <span>SKU: {product.sku}</span>}
                    </div>
                  </div>
                  <Package className="text-orange-600" size={20} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigate('/estoque')}
              className="w-full btn-primary"
            >
              Ver Estoque Completo
            </button>
          </div>
        </div>
      )}

      {isWidgetEnabled('stock-summary') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total de Produtos em Estoque Baixo */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Produtos com Estoque Baixo
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {lowStockProducts.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Requerem atenção</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Package className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          {/* Alertas Ativos */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Alertas Ativos
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stockAlerts.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Estoque e validades</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

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
                      onClick={() => handleLeadClick(lead.id)}
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

      {/* Modal/Popup Ficha do Paciente */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="text-primary-600" size={28} />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Ficha do Paciente
                  </h3>
                </div>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações Pessoais</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedPatient.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Telefone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedPatient.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedPatient.whatsapp || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Localização */}
                {(selectedPatient.city || selectedPatient.state || selectedPatient.neighborhood) && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Localização</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedPatient.neighborhood && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Bairro</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedPatient.neighborhood}</p>
                        </div>
                      )}
                      {selectedPatient.city && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Cidade</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedPatient.city}</p>
                        </div>
                      )}
                      {selectedPatient.state && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedPatient.state}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {selectedPatient.notes && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Observações</h4>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedPatient.notes}</p>
                  </div>
                )}

                {/* Status e Informações Adicionais */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações Adicionais</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPatient.status && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedPatient.status}</p>
                      </div>
                    )}
                    {selectedPatient.source && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Origem</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedPatient.source}</p>
                      </div>
                    )}
                    {selectedPatient.estimatedValue && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Valor Estimado</p>
                        <p className="font-medium text-green-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(selectedPatient.estimatedValue)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex gap-3">
              <button
                onClick={() => {
                  setShowPatientModal(false);
                  navigate('/leads', { state: { openLeadId: selectedPatient.id } });
                }}
                className="flex-1 btn-primary"
              >
                Ver Detalhes Completos
              </button>
              <button
                onClick={() => setShowPatientModal(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Personalização da Dashboard */}
      {showCustomizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="text-primary-600" size={28} />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Personalizar Dashboard
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Selecione os widgets que deseja visualizar na sua dashboard
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCustomizeModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
              {/* Organizar por categoria */}
              {['metrics', 'alerts', 'tables'].map(category => {
                const categoryWidgets = availableWidgets.filter(
                  w => w.category === category && w.roles.includes(user?.role || '')
                );

                if (categoryWidgets.length === 0) return null;

                const categoryNames = {
                  metrics: 'Métricas',
                  alerts: 'Alertas',
                  tables: 'Tabelas e Listas',
                  charts: 'Gráficos',
                };

                return (
                  <div key={category} className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {categoryNames[category as keyof typeof categoryNames]}
                    </h4>
                    <div className="space-y-2">
                      {categoryWidgets.map(widget => (
                        <label
                          key={widget.id}
                          className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={enabledWidgets.includes(widget.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEnabledWidgets([...enabledWidgets, widget.id]);
                              } else {
                                setEnabledWidgets(enabledWidgets.filter(id => id !== widget.id));
                              }
                            }}
                            className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <GripVertical size={16} className="text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {widget.name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {widget.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex gap-3">
              <button
                onClick={() => {
                  // Restaurar padrões
                  const defaultWidgets = availableWidgets
                    .filter(w => w.isDefault && w.roles.includes(user?.role || ''))
                    .map(w => w.id);
                  setEnabledWidgets(defaultWidgets);
                }}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Restaurar Padrões
              </button>
              <button
                onClick={() => {
                  saveWidgetPreferences(enabledWidgets);
                  setShowCustomizeModal(false);
                }}
                className="flex-1 btn-primary"
              >
                Salvar Preferências
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
