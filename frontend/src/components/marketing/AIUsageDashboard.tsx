import React, { useEffect, useState } from 'react';
import { BarChart3, DollarSign, Zap, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface UsageStats {
  provider: string;
  module: string;
  total_requests: number;
  total_tokens: number;
  total_cost_usd: number;
  avg_response_time_ms: number;
  date: string;
}

interface RateLimits {
  max_requests_per_hour: number;
  max_tokens_per_day: number;
  max_cost_per_month_usd: number;
  current_requests_hour: number;
  current_tokens_day: number;
  current_cost_month_usd: number;
  alerts_enabled: boolean;
  alert_threshold_percent: number;
}

export const AIUsageDashboard: React.FC = () => {
  const [stats, setStats] = useState<UsageStats[]>([]);
  const [limits, setLimits] = useState<RateLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      let startDate = new Date();

      if (period === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate.setMonth(now.getMonth() - 1);
      }

      const [statsRes, limitsRes] = await Promise.all([
        api.get('/marketing/ai/usage-stats', {
          params: {
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
          },
        }),
        api.get('/marketing/ai/rate-limits'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (limitsRes.data.success) {
        setLimits(limitsRes.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getTotalsByProvider = () => {
    const totals: Record<string, { requests: number; tokens: number; cost: number }> = {};

    stats.forEach((stat) => {
      if (!totals[stat.provider]) {
        totals[stat.provider] = { requests: 0, tokens: 0, cost: 0 };
      }
      totals[stat.provider].requests += parseInt(stat.total_requests.toString());
      totals[stat.provider].tokens += parseInt(stat.total_tokens.toString());
      totals[stat.provider].cost += parseFloat(stat.total_cost_usd.toString());
    });

    return totals;
  };

  const getOverallTotals = () => {
    return stats.reduce(
      (acc, stat) => ({
        requests: acc.requests + parseInt(stat.total_requests.toString()),
        tokens: acc.tokens + parseInt(stat.total_tokens.toString()),
        cost: acc.cost + parseFloat(stat.total_cost_usd.toString()),
        avgResponseTime:
          (acc.avgResponseTime + parseFloat(stat.avg_response_time_ms.toString())) / 2,
      }),
      { requests: 0, tokens: 0, cost: 0, avgResponseTime: 0 }
    );
  };

  const getUsagePercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const totals = getOverallTotals();
  const providerTotals = getTotalsByProvider();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Dashboard de Uso de IAs
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monitore o uso, custos e performance das IAs
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'today' ? 'Hoje' : p === 'week' ? 'Última Semana' : 'Último Mês'}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Requisições</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totals.requests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tokens Usados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totals.tokens.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Custo Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totals.cost.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totals.avgResponseTime.toFixed(0)}ms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      {limits && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Limites de Uso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Requests per Hour */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Requisições / Hora
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {limits.current_requests_hour} / {limits.max_requests_per_hour}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getUsageColor(
                    getUsagePercentage(limits.current_requests_hour, limits.max_requests_per_hour)
                  )}`}
                  style={{
                    width: `${getUsagePercentage(
                      limits.current_requests_hour,
                      limits.max_requests_per_hour
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Tokens per Day */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tokens / Dia</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {limits.current_tokens_day.toLocaleString()} /{' '}
                  {limits.max_tokens_per_day.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getUsageColor(
                    getUsagePercentage(limits.current_tokens_day, limits.max_tokens_per_day)
                  )}`}
                  style={{
                    width: `${getUsagePercentage(
                      limits.current_tokens_day,
                      limits.max_tokens_per_day
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Cost per Month */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Custo / Mês</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${parseFloat(limits.current_cost_month_usd.toString()).toFixed(2)} / $
                  {parseFloat(limits.max_cost_per_month_usd.toString()).toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getUsageColor(
                    getUsagePercentage(
                      parseFloat(limits.current_cost_month_usd.toString()),
                      parseFloat(limits.max_cost_per_month_usd.toString())
                    )
                  )}`}
                  style={{
                    width: `${getUsagePercentage(
                      parseFloat(limits.current_cost_month_usd.toString()),
                      parseFloat(limits.max_cost_per_month_usd.toString())
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Uso por Provedor
        </h3>
        <div className="space-y-4">
          {Object.entries(providerTotals).map(([provider, data]) => (
            <div key={provider} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {provider}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {data.requests} requisições • {data.tokens.toLocaleString()} tokens
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">${data.cost.toFixed(4)}</p>
                <p className="text-xs text-gray-500">custo total</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
