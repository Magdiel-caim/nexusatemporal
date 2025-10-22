/**
 * QuickFilters - Filtros Rápidos com Dark/Light Mode
 */

import React from 'react';
import { Filter, X } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  value: any;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  type: 'select' | 'multi-select' | 'toggle';
}

interface QuickFiltersProps {
  filters: FilterGroup[];
  selectedFilters: Record<string, any>;
  onChange: (filterId: string, value: any) => void;
  onClear: () => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
  filters,
  selectedFilters,
  onChange,
  onClear,
}) => {
  const hasActiveFilters = Object.values(selectedFilters).some(
    (val) => val !== null && val !== undefined && val !== ''
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Filtros
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <div key={filter.id}>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {filter.label}
            </label>

            {filter.type === 'select' && (
              <select
                value={selectedFilters[filter.id] || ''}
                onChange={(e) => onChange(filter.id, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-900
                         text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                         transition-colors"
              >
                <option value="">Todos</option>
                {filter.options.map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {filter.type === 'multi-select' && (
              <div className="space-y-2">
                {filter.options.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(selectedFilters[filter.id]) &&
                        selectedFilters[filter.id].includes(opt.value)
                      }
                      onChange={(e) => {
                        const current = Array.isArray(selectedFilters[filter.id])
                          ? selectedFilters[filter.id]
                          : [];
                        const updated = e.target.checked
                          ? [...current, opt.value]
                          : current.filter((v: any) => v !== opt.value);
                        onChange(filter.id, updated);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded
                               focus:ring-blue-500 dark:focus:ring-blue-400
                               bg-white dark:bg-gray-900"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            )}

            {filter.type === 'toggle' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onChange(filter.id, !selectedFilters[filter.id])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    selectedFilters[filter.id]
                      ? 'bg-blue-600 dark:bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      selectedFilters[filter.id] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedFilters[filter.id] ? 'Sim' : 'Não'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickFilters;
