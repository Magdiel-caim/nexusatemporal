import { CrmDataSource } from '../../../database/data-source';

export class DashboardService {
  /**
   * Dashboard Executivo - Visão geral do negócio
   */
  async getExecutiveDashboard(tenantId: string, startDate?: string, endDate?: string) {
    const queryRunner = CrmDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Definir período padrão (último mês)
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      // KPIs principais
      const [revenueResult] = await queryRunner.query(`
        SELECT COALESCE(SUM(valor_liquido), 0) as total
        FROM vendas
        WHERE tenant_id = $1
        AND status = 'confirmada'
        AND data_venda >= $2 AND data_venda <= $3
      `, [tenantId, start, end]);

      const [salesResult] = await queryRunner.query(`
        SELECT COUNT(*) as total
        FROM vendas
        WHERE tenant_id = $1
        AND status = 'confirmada'
        AND data_venda >= $2 AND data_venda <= $3
      `, [tenantId, start, end]);

      const [leadsResult] = await queryRunner.query(`
        SELECT COUNT(*) as total
        FROM leads
        WHERE tenant_id = $1
        AND created_at >= $2 AND created_at <= $3
      `, [tenantId, start, end]);

      const [conversionResult] = await queryRunner.query(`
        SELECT
          COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'won') as converted,
          COUNT(DISTINCT l.id) as total
        FROM leads l
        WHERE l.tenant_id = $1
        AND l.created_at >= $2 AND l.created_at <= $3
      `, [tenantId, start, end]);

      const revenue = parseFloat(revenueResult?.total || 0);
      const salesCount = parseInt(salesResult?.total || 0);
      const leadsCount = parseInt(leadsResult?.total || 0);
      const converted = parseInt(conversionResult?.converted || 0);
      const totalLeads = parseInt(conversionResult?.total || 0);
      const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0;
      const averageTicket = salesCount > 0 ? revenue / salesCount : 0;

      // Período anterior para comparação
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - (end.getTime() - start.getTime()));

      const [prevRevenueResult] = await queryRunner.query(`
        SELECT COALESCE(SUM(valor_liquido), 0) as total
        FROM vendas
        WHERE tenant_id = $1
        AND status = 'confirmada'
        AND data_venda >= $2 AND data_venda <= $3
      `, [tenantId, prevStart, prevEnd]);

      const prevRevenue = parseFloat(prevRevenueResult?.total || 0);
      const revenueTrend = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

      // Evolução de vendas (últimos 30 dias)
      const salesEvolution = await queryRunner.query(`
        SELECT
          DATE(data_venda) as date,
          SUM(valor_liquido) as value,
          COUNT(*) as count
        FROM vendas
        WHERE tenant_id = $1
        AND status = 'confirmada'
        AND data_venda >= $2 AND data_venda <= $3
        GROUP BY DATE(data_venda)
        ORDER BY DATE(data_venda) ASC
      `, [tenantId, start, end]);

      // Vendas por produto (top 5)
      const salesByProduct = await queryRunner.query(`
        SELECT
          p.name,
          SUM(vd.valor_liquido) as value,
          COUNT(*) as count
        FROM vendas vd
        JOIN procedures p ON vd.procedure_id = p.id
        WHERE vd.tenant_id = $1
        AND vd.status = 'confirmada'
        AND vd.data_venda >= $2 AND vd.data_venda <= $3
        GROUP BY p.name
        ORDER BY value DESC
        LIMIT 5
      `, [tenantId, start, end]);

      // Funil de vendas por status de lead
      const salesFunnel = await queryRunner.query(`
        SELECT
          status as name,
          COUNT(*) as value,
          COUNT(*) as count
        FROM leads
        WHERE tenant_id = $1
        AND created_at >= $2 AND created_at <= $3
        GROUP BY status
        ORDER BY
          CASE status
            WHEN 'new' THEN 1
            WHEN 'contacted' THEN 2
            WHEN 'qualified' THEN 3
            WHEN 'proposal' THEN 4
            WHEN 'negotiation' THEN 5
            WHEN 'won' THEN 6
            ELSE 7
          END
      `, [tenantId, start, end]);

      // Receitas vs Despesas
      const [financialResult] = await queryRunner.query(`
        SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
        FROM transactions
        WHERE tenant_id = $1
        AND date >= $2 AND date <= $3
      `, [tenantId, start, end]);

      const revenueFromTransactions = parseFloat(financialResult?.revenue || 0);
      const expenses = parseFloat(financialResult?.expenses || 0);
      const profitMargin = revenueFromTransactions > 0
        ? ((revenueFromTransactions - expenses) / revenueFromTransactions) * 100
        : 0;

      return {
        kpis: {
          revenue: {
            name: 'Receita Total',
            value: revenue,
            unit: 'R$',
            target: null,
            trend: revenueTrend,
            period: 'monthly',
          },
          sales: {
            name: 'Total de Vendas',
            value: salesCount,
            unit: '',
            target: null,
            trend: 0,
            period: 'monthly',
          },
          leads: {
            name: 'Novos Leads',
            value: leadsCount,
            unit: '',
            target: null,
            trend: 0,
            period: 'monthly',
          },
          conversionRate: {
            name: 'Taxa de Conversão',
            value: conversionRate,
            unit: '%',
            target: null,
            trend: 0,
            period: 'monthly',
          },
          averageTicket: {
            name: 'Ticket Médio',
            value: averageTicket,
            unit: 'R$',
            target: null,
            trend: 0,
            period: 'monthly',
          },
          profitMargin: {
            name: 'Margem de Lucro',
            value: profitMargin,
            unit: '%',
            target: null,
            trend: 0,
            period: 'monthly',
          },
        },
        charts: {
          salesOverTime: salesEvolution.map((item: any) => ({
            date: item.date,
            value: parseFloat(item.value),
            count: parseInt(item.count),
          })),
          salesByProduct: salesByProduct.map((item: any) => ({
            name: item.name,
            value: parseFloat(item.value),
            count: parseInt(item.count),
          })),
          salesFunnel: salesFunnel.map((item: any) => ({
            name: this.translateStatus(item.name),
            value: parseInt(item.value),
            count: parseInt(item.count),
          })),
          revenueVsExpenses: {
            revenue: revenueFromTransactions,
            expenses: expenses,
          },
        },
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Dashboard de Vendas
   */
  async getSalesDashboard(tenantId: string, startDate?: string, endDate?: string) {
    // Por enquanto retorna mesmo conteúdo do executivo
    // Pode ser expandido no futuro
    return this.getExecutiveDashboard(tenantId, startDate, endDate);
  }

  /**
   * Traduzir status do lead
   */
  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      'new': 'Novos',
      'contacted': 'Contatados',
      'qualified': 'Qualificados',
      'proposal': 'Proposta',
      'negotiation': 'Negociação',
      'won': 'Ganhos',
      'lost': 'Perdidos',
    };
    return translations[status] || status;
  }
}
