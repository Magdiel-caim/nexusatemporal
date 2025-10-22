/**
 * DateRangePicker - Seletor de Período com Dark/Light Mode PERFEITO
 *
 * ATENÇÃO ESPECIAL: Inputs de data com dark mode validado
 */

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
  preset: DateRangePreset;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const [showCustom, setShowCustom] = useState(value.preset === 'custom');

  const presets = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'last7days', label: 'Últimos 7 dias' },
    { value: 'last30days', label: 'Últimos 30 dias' },
    { value: 'thisMonth', label: 'Este mês' },
    { value: 'lastMonth', label: 'Mês passado' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const calculateDates = (preset: DateRangePreset): { startDate: string; endDate: string } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case 'today':
        return {
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };

      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: yesterday.toISOString().split('T')[0],
          endDate: yesterday.toISOString().split('T')[0],
        };

      case 'last7days':
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 6);
        return {
          startDate: last7.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };

      case 'last30days':
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 29);
        return {
          startDate: last30.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };

      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          startDate: monthStart.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };

      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: lastMonthStart.toISOString().split('T')[0],
          endDate: lastMonthEnd.toISOString().split('T')[0],
        };

      default:
        return {
          startDate: value.startDate,
          endDate: value.endDate,
        };
    }
  };

  const handlePresetChange = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      setShowCustom(true);
      onChange({
        ...value,
        preset: 'custom',
      });
    } else {
      setShowCustom(false);
      const dates = calculateDates(preset);
      onChange({
        startDate: dates.startDate,
        endDate: dates.endDate,
        preset,
      });
    }
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', newValue: string) => {
    onChange({
      ...value,
      [field]: newValue,
      preset: 'custom',
    });
  };

  return (
    <div className="space-y-3">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetChange(preset.value as DateRangePreset)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              value.preset === preset.value
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs - COM DARK MODE PERFEITO */}
      {showCustom && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Data Inicial
            </label>
            <div className="relative">
              <input
                type="date"
                value={value.startDate}
                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-900
                         text-gray-900 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-500
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                         transition-colors"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Data Final
            </label>
            <div className="relative">
              <input
                type="date"
                value={value.endDate}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-900
                         text-gray-900 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-500
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                         transition-colors"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
