import { CrmDataSource } from '../../../database/data-source';

export class DataAggregatorService {
  /**
   * Obter resumo agregado de dados
   */
  async getDataSummary(tenantId: string, startDate?: string, endDate?: string) {
    const queryRunner = CrmDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate
        ? new Date(startDate)
        : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [summary] = await queryRunner.query(
        `
        SELECT
          (SELECT COUNT(*) FROM leads WHERE tenant_id = $1 AND created_at >= $2 AND created_at <= $3) as total_leads,
          (SELECT COUNT(*) FROM vendas WHERE tenant_id = $1 AND status = 'confirmada' AND data_venda >= $2 AND data_venda <= $3) as total_sales,
          (SELECT COALESCE(SUM(valor_liquido), 0) FROM vendas WHERE tenant_id = $1 AND status = 'confirmada' AND data_venda >= $2 AND data_venda <= $3) as total_revenue
      `,
        [tenantId, start, end]
      );

      return {
        totalLeads: parseInt(summary?.total_leads || 0),
        totalSales: parseInt(summary?.total_sales || 0),
        totalRevenue: parseFloat(summary?.total_revenue || 0),
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      };
    } finally {
      await queryRunner.release();
    }
  }
}
