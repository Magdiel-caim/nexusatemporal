/**
 * KPICard - Card de KPI com suporte perfeito a Dark/Light Mode
 *
 * ATENÇÃO: Dark mode testado e validado em TODOS os elementos
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { KPIData } from '../../../services/biService';

interface KPICardProps {
  kpi: KPIData;
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ kpi, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  const { name, value, unit, target, trend } = kpi;

  // Determinar cor da tendência
  const getTrendColor = () => {
    if (!trend) return 'text-gray-500 dark:text-gray-400';
    return trend > 0
      ? 'text-green-600 dark:text-green-400'
      : trend < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-500 dark:text-gray-400';
  };

  // Ícone da tendência
  const TrendIcon = !trend || trend === 0
    ? Minus
    : trend > 0
    ? TrendingUp
    : TrendingDown;

  // Calcular progresso em relação à meta
  const progress = target ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {name}
        </h3>
        {trend !== undefined && (
          <div className={`flex items-center ${getTrendColor()}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            <span className="text-sm font-semibold">
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Valor Principal */}
      <div className="mb-3">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {unit === 'R$' ? (
            <>
              <span className="text-2xl">R$</span> {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </>
          ) : unit === '%' ? (
            <>{value.toFixed(1)}<span className="text-xl">%</span></>
          ) : (
            value.toLocaleString('pt-BR')
          )}
        </div>
      </div>

      {/* Meta e Progresso */}
      {target && (
        <div className="space-y-2">
          {/* Barra de Progresso */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress >= 100
                  ? 'bg-green-500 dark:bg-green-400'
                  : progress >= 70
                  ? 'bg-blue-500 dark:bg-blue-400'
                  : progress >= 40
                  ? 'bg-yellow-500 dark:bg-yellow-400'
                  : 'bg-red-500 dark:bg-red-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Target className="w-3 h-3 mr-1" />
              <span>
                Meta: {unit === 'R$' ? 'R$ ' : ''}{target.toLocaleString('pt-BR')}{unit === '%' ? '%' : ''}
              </span>
            </div>
            <span className={`font-semibold ${
              progress >= 100
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICard;
