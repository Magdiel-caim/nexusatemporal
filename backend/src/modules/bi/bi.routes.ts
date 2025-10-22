import { Router } from 'express';
import { DashboardService } from './services/dashboard.service';
import { KpiService } from './services/kpi.service';
import { DataAggregatorService } from './services/data-aggregator.service';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authenticate);

// Instanciar services
const dashboardService = new DashboardService();
const kpiService = new KpiService();
const dataAggregator = new DataAggregatorService();

/**
 * GET /api/bi/dashboards/executive
 * Retorna dados do dashboard executivo
 */
router.get('/dashboards/executive', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const tenantId = (req as any).user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: 'Tenant não identificado' });
    }

    // Validação de datas
    if (startDate && isNaN(Date.parse(startDate as string))) {
      return res.status(400).json({ error: 'Formato de startDate inválido' });
    }

    if (endDate && isNaN(Date.parse(endDate as string))) {
      return res.status(400).json({ error: 'Formato de endDate inválido' });
    }

    if (startDate && endDate && new Date(startDate as string) > new Date(endDate as string)) {
      return res.status(400).json({ error: 'startDate deve ser anterior a endDate' });
    }

    const data = await dashboardService.getExecutiveDashboard(
      tenantId,
      startDate as string,
      endDate as string
    );

    res.json(data);
  } catch (error: any) {
    console.error('Error getting executive dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/bi/dashboards/sales
 * Retorna dados do dashboard de vendas
 */
router.get('/dashboards/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const tenantId = (req as any).user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: 'Tenant não identificado' });
    }

    // Validação de datas
    if (startDate && isNaN(Date.parse(startDate as string))) {
      return res.status(400).json({ error: 'Formato de startDate inválido' });
    }

    if (endDate && isNaN(Date.parse(endDate as string))) {
      return res.status(400).json({ error: 'Formato de endDate inválido' });
    }

    if (startDate && endDate && new Date(startDate as string) > new Date(endDate as string)) {
      return res.status(400).json({ error: 'startDate deve ser anterior a endDate' });
    }

    const data = await dashboardService.getSalesDashboard(
      tenantId,
      startDate as string,
      endDate as string
    );

    res.json(data);
  } catch (error: any) {
    console.error('Error getting sales dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/bi/kpis
 * Retorna todos os KPIs
 */
router.get('/kpis', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const tenantId = (req as any).user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: 'Tenant não identificado' });
    }

    const kpis = await kpiService.getAllKPIs(
      tenantId,
      {
        startDate: startDate as string,
        endDate: endDate as string,
        category: category as string,
      }
    );

    res.json(kpis);
  } catch (error: any) {
    console.error('Error getting KPIs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/bi/data/summary
 * Retorna resumo agregado de dados
 */
router.get('/data/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const tenantId = (req as any).user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: 'Tenant não identificado' });
    }

    const summary = await dataAggregator.getDataSummary(
      tenantId,
      startDate as string,
      endDate as string
    );

    res.json(summary);
  } catch (error: any) {
    console.error('Error getting data summary:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
