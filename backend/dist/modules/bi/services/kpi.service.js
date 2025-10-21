"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiService = void 0;
const data_source_1 = require("../../../database/data-source");
class KpiService {
    /**
     * Obter todos os KPIs
     */
    async getAllKPIs(tenantId, filters) {
        const queryRunner = data_source_1.CrmDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const end = filters.endDate ? new Date(filters.endDate) : new Date();
            const start = filters.startDate
                ? new Date(filters.startDate)
                : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
            // Receita total
            const [revenueResult] = await queryRunner.query(`
        SELECT COALESCE(SUM(valor_liquido), 0) as total
        FROM vendas
        WHERE tenant_id = $1
        AND status = 'confirmada'
        AND data_venda >= $2 AND data_venda <= $3
      `, [tenantId, start, end]);
            // Total de vendas
            const [salesResult] = await queryRunner.query(`
        SELECT COUNT(*) as total
        FROM vendas
        WHERE tenant_id = $1
        AND status = 'confirmada'
        AND data_venda >= $2 AND data_venda <= $3
      `, [tenantId, start, end]);
            const revenue = parseFloat(revenueResult?.total || 0);
            const salesCount = parseInt(salesResult?.total || 0);
            const averageTicket = salesCount > 0 ? revenue / salesCount : 0;
            return {
                revenue: {
                    name: 'Receita Total',
                    value: revenue,
                    unit: 'R$',
                },
                sales: {
                    name: 'Total de Vendas',
                    value: salesCount,
                    unit: '',
                },
                averageTicket: {
                    name: 'Ticket Médio',
                    value: averageTicket,
                    unit: 'R$',
                },
            };
        }
        finally {
            await queryRunner.release();
        }
    }
}
exports.KpiService = KpiService;
//# sourceMappingURL=kpi.service.js.map