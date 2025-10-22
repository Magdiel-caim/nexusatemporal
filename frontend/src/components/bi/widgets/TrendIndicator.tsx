/**
 * TrendIndicator - Indicador de Tendência com Dark/Light Mode
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  value: number; // % de mudança
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  label,
  size = 'md',
  showIcon = true,
}) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const colorClass = isNeutral
    ? 'text-gray-500 dark:text-gray-400'
    : isPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  const bgClass = isNeutral
    ? 'bg-gray-100 dark:bg-gray-700'
    : isPositive
    ? 'bg-green-50 dark:bg-green-900/20'
    : 'bg-red-50 dark:bg-red-900/20';

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full ${bgClass} ${colorClass} ${sizeClasses[size]} font-semibold`}>
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>
        {isPositive && '+'}
        {value.toFixed(1)}%
      </span>
      {label && (
        <span className="text-gray-600 dark:text-gray-400 font-normal ml-1">
          {label}
        </span>
      )}
    </div>
  );
};

export default TrendIndicator;
