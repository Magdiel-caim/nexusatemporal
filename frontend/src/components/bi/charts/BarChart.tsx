/**
 * BarChart - Gráfico de Barras com Dark/Light Mode
 */

import React from 'react';
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../../hooks/useTheme';

interface BarChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  title?: string;
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  dataKey,
  xAxisKey,
  title,
  height = 300,
}) => {
  const { isDarkMode } = useTheme();

  const colors = {
    bar: isDarkMode ? '#60a5fa' : '#3b82f6',
    grid: isDarkMode ? '#374151' : '#e5e7eb',
    text: isDarkMode ? '#9ca3af' : '#6b7280',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{label}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {`${payload[0].value.toLocaleString('pt-BR')}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBar data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey={xAxisKey} stroke={colors.text} style={{ fontSize: '12px' }} />
          <YAxis stroke={colors.text} style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={colors.bar} />
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
