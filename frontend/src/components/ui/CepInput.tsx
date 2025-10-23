/**
 * Componente de Input de CEP com busca automática
 * Busca automaticamente as informações de endereço quando um CEP válido é digitado
 */

import React, { useState, useEffect } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';
import { useCep, formatCep, isValidCep } from '@/hooks/useCep';

export interface CepInputData {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
}

interface CepInputProps {
  value: string;
  onChange: (cep: string) => void;
  onAddressFound?: (data: CepInputData) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  autoFetch?: boolean; // Se true, busca automaticamente quando CEP é válido
}

export const CepInput: React.FC<CepInputProps> = ({
  value,
  onChange,
  onAddressFound,
  disabled = false,
  className = '',
  label = 'CEP',
  required = false,
  autoFetch = true,
}) => {
  const { fetchCep, loading, data } = useCep();
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatCep(inputValue);
    setLocalValue(formatted);
    onChange(formatted);

    // Auto-buscar quando CEP estiver completo
    if (autoFetch && isValidCep(formatted)) {
      handleFetchCep(formatted);
    }
  };

  const handleFetchCep = async (cep: string) => {
    const cepData = await fetchCep(cep);
    if (cepData && onAddressFound) {
      onAddressFound({
        cep: cepData.cep,
        street: cepData.street,
        neighborhood: cepData.neighborhood,
        city: cepData.city,
        state: cepData.state,
        complement: cepData.complement,
      });
    }
  };

  const handleSearchClick = () => {
    if (isValidCep(localValue)) {
      handleFetchCep(localValue);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          disabled={disabled || loading}
          placeholder="00000-000"
          maxLength={9}
          className={`
            w-full pl-10 pr-10 py-2 border rounded-lg
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            dark:bg-gray-700 dark:border-gray-600 dark:text-white
            ${loading ? 'bg-gray-50' : ''}
          `}
        />
        {!autoFetch && (
          <button
            type="button"
            onClick={handleSearchClick}
            disabled={disabled || loading || !isValidCep(localValue)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        )}
        {autoFetch && loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
          </div>
        )}
      </div>
      {data && !loading && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
          ✓ CEP encontrado: {data.city} - {data.state}
        </p>
      )}
    </div>
  );
};
