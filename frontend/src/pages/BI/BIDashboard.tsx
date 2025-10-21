/**
 * BIDashboard - Dashboard Principal de Business Intelligence
 *
 * DARK/LIGHT MODE 100% TESTADO E VALIDADO
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, DollarSign, Users, ShoppingCart, Percent, Download, RefreshCw } from 'lucide-react';
import biService, { DashboardData } from '../../services/biService';
import DateRangePicker, { DateRange } from '../../components/bi/filters/DateRangePicker';
import KPICard from '../../components/bi/widgets/KPICard';
import StatCard from '../../components/bi/widgets/StatCard';
import LineChart from '../../components/bi/charts/LineChart';
import BarChart from '../../components/bi/charts/BarChart';

const BIDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    preset: 'last30days',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await biService.getExecutiveDashboard({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setDashboardData(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const blob = await biService.exportReport(dashboardData, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Business Intelligence
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visão geral dos principais indicadores de negócio
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                <Download className="w-4 h-4" />
                Exportar
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  Exportar PDF
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Exportar Excel
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                >
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de Data */}
      <div className="mb-6">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {dashboardData?.kpis && (
          <>
            <KPICard kpi={dashboardData.kpis.revenue} loading={loading} />
            <KPICard kpi={dashboardData.kpis.sales} loading={loading} />
            <KPICard kpi={dashboardData.kpis.leads} loading={loading} />
            <KPICard kpi={dashboardData.kpis.conversionRate} loading={loading} />
            <KPICard kpi={dashboardData.kpis.averageTicket} loading={loading} />
            <KPICard kpi={dashboardData.kpis.profitMargin} loading={loading} />
          </>
        )}
      </div>

      {/* Stats Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Receita Total"
          value={`R$ ${dashboardData?.kpis.revenue.value.toLocaleString('pt-BR') || '0'}`}
          subtitle="Últimos 30 dias"
          icon={DollarSign}
          iconColor="text-green-600 dark:text-green-400"
          loading={loading}
        />
        <StatCard
          title="Total de Vendas"
          value={dashboardData?.kpis.sales.value || 0}
          subtitle="Últimos 30 dias"
          icon={ShoppingCart}
          iconColor="text-blue-600 dark:text-blue-400"
          loading={loading}
        />
        <StatCard
          title="Novos Leads"
          value={dashboardData?.kpis.leads.value || 0}
          subtitle="Últimos 30 dias"
          icon={Users}
          iconColor="text-purple-600 dark:text-purple-400"
          loading={loading}
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${dashboardData?.kpis.conversionRate.value.toFixed(1) || '0'}%`}
          subtitle="Últimos 30 dias"
          icon={Percent}
          iconColor="text-orange-600 dark:text-orange-400"
          loading={loading}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {dashboardData?.charts && (
          <>
            <LineChart
              data={dashboardData.charts.salesOverTime}
              dataKey="value"
              xAxisKey="date"
              title="Evolução de Vendas"
              height={350}
            />
            <BarChart
              data={dashboardData.charts.salesByProduct}
              dataKey="value"
              xAxisKey="name"
              title="Vendas por Produto"
              height={350}
            />
          </>
        )}
      </div>

      {/* Funil e Revenue vs Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboardData?.charts && (
          <>
            <BarChart
              data={dashboardData.charts.salesFunnel}
              dataKey="count"
              xAxisKey="name"
              title="Funil de Vendas"
              height={350}
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Receitas vs Despesas
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Receitas</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      R$ {dashboardData.charts.revenueVsExpenses.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div className="bg-green-500 dark:bg-green-400 h-4 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Despesas</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      R$ {dashboardData.charts.revenueVsExpenses.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-red-500 dark:bg-red-400 h-4 rounded-full"
                      style={{
                        width: `${(dashboardData.charts.revenueVsExpenses.expenses / dashboardData.charts.revenueVsExpenses.revenue) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lucro Líquido</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      R$ {(dashboardData.charts.revenueVsExpenses.revenue - dashboardData.charts.revenueVsExpenses.expenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BIDashboard;
