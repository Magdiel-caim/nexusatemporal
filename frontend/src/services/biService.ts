/**
 * BI Service - Business Intelligence
 *
 * NOTA: Backend BI ainda em desenvolvimento
 * Por enquanto retorna dados MOCK para demonstração
 * As rotas serão ativadas quando o backend estiver pronto
 */

// import api from './api'; // TODO: Descomentar quando backend estiver pronto

// Tipos
export interface KPIData {
  name: string;
  value: number;
  unit?: string;
  target?: number | null;
  trend?: number; // % de mudança
  period?: string;
  metadata?: any;
}

export interface ChartDataPoint {
  date?: string;
  name?: string;
  value: number;
  count?: number;
}

export interface DashboardData {
  kpis: {
    revenue: KPIData;
    sales: KPIData;
    leads: KPIData;
    conversionRate: KPIData;
    averageTicket: KPIData;
    profitMargin: KPIData;
  };
  charts: {
    salesOverTime: ChartDataPoint[];
    salesByProduct: ChartDataPoint[];
    salesFunnel: ChartDataPoint[];
    revenueVsExpenses: { revenue: number; expenses: number };
  };
}

/**
 * Gerar dados MOCK para demonstração
 */
const generateMockData = (): DashboardData => {
  const now = new Date();
  const dates: string[] = [];

  // Gerar últimos 30 dias
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return {
    kpis: {
      revenue: {
        name: 'Receita Total',
        value: 125850.50,
        unit: 'R$',
        target: 150000,
        trend: 12.5,
        period: 'monthly',
      },
      sales: {
        name: 'Total de Vendas',
        value: 156,
        unit: '',
        target: 200,
        trend: 8.3,
        period: 'monthly',
      },
      leads: {
        name: 'Novos Leads',
        value: 89,
        unit: '',
        target: 100,
        trend: -5.2,
        period: 'monthly',
      },
      conversionRate: {
        name: 'Taxa de Conversão',
        value: 24.5,
        unit: '%',
        target: 30,
        trend: 3.1,
        period: 'monthly',
      },
      averageTicket: {
        name: 'Ticket Médio',
        value: 806.73,
        unit: 'R$',
        target: 900,
        trend: 4.2,
        period: 'monthly',
      },
      profitMargin: {
        name: 'Margem de Lucro',
        value: 32.8,
        unit: '%',
        target: 35,
        trend: 1.5,
        period: 'monthly',
      },
    },
    charts: {
      salesOverTime: dates.map((date, i) => ({
        date,
        value: 2500 + Math.random() * 3000 + i * 50,
        count: Math.floor(3 + Math.random() * 8),
      })),
      salesByProduct: [
        { name: 'Harmonização Facial', value: 45200, count: 45 },
        { name: 'Botox', value: 38500, count: 62 },
        { name: 'Preenchimento Labial', value: 28300, count: 38 },
        { name: 'Limpeza de Pele', value: 14800, count: 28 },
        { name: 'Peeling Químico', value: 9850, count: 15 },
      ],
      salesFunnel: [
        { name: 'Novos', value: 89, count: 89 },
        { name: 'Contatados', value: 72, count: 72 },
        { name: 'Qualificados', value: 58, count: 58 },
        { name: 'Proposta', value: 42, count: 42 },
        { name: 'Negociação', value: 28, count: 28 },
        { name: 'Ganhos', value: 22, count: 22 },
      ],
      revenueVsExpenses: {
        revenue: 125850.50,
        expenses: 84571.20,
      },
    },
  };
};

class BIService {
  /**
   * Obter dados do dashboard executivo
   */
  async getExecutiveDashboard(_filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardData> {
    // TODO: Quando backend estiver pronto, descomentar:
    // const { data } = await api.get('/bi/dashboards/executive', { params: filters });
    // return data;

    // Por enquanto, retornar mock
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular latência
    return generateMockData();
  }

  /**
   * Obter dados do dashboard de vendas
   */
  async getSalesDashboard(_filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockData();
  }

  /**
   * Obter dados do dashboard financeiro
   */
  async getFinancialDashboard(_filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockData();
  }

  /**
   * Obter todos os KPIs
   */
  async getAllKPIs(_filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Record<string, KPIData>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateMockData().kpis;
  }

  /**
   * Exportar relatório
   */
  async exportReport(
    _reportData: any,
    _format: 'pdf' | 'excel' | 'csv' = 'pdf',
    _filename?: string
  ): Promise<Blob> {
    // TODO: Implementar quando backend estiver pronto
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock: retornar blob vazio
    return new Blob(['Mock Report'], { type: 'application/pdf' });
  }
}

export default new BIService();
