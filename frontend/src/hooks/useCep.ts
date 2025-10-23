/**
 * Hook para busca de CEP
 * Busca informações de endereço através do CEP usando a API interna
 */

import { useState, useCallback } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export interface CepData {
  cep: string;
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  ibge: string;
  ddd: string;
}

export interface UseCepReturn {
  loading: boolean;
  error: string | null;
  data: CepData | null;
  fetchCep: (cep: string) => Promise<CepData | null>;
  clearData: () => void;
}

/**
 * Hook para busca de CEP
 *
 * @example
 * const { fetchCep, loading, data, error } = useCep();
 *
 * const handleCepChange = async (cep: string) => {
 *   const cepData = await fetchCep(cep);
 *   if (cepData) {
 *     setFormData({
 *       ...formData,
 *       city: cepData.city,
 *       state: cepData.state,
 *       neighborhood: cepData.neighborhood,
 *       street: cepData.street
 *     });
 *   }
 * };
 */
export function useCep(): UseCepReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CepData | null>(null);

  const fetchCep = useCallback(async (cep: string): Promise<CepData | null> => {
    // Limpar formatação do CEP (remover pontos, traços, espaços)
    const cepClean = cep.replace(/\D/g, '');

    // Validar se tem 8 dígitos
    if (cepClean.length !== 8) {
      setError('CEP deve conter 8 dígitos');
      toast.error('CEP deve conter 8 dígitos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<CepData>(`/data/cep/${cepClean}`);
      setData(response.data);
      toast.success('CEP encontrado com sucesso!');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar CEP';
      setError(errorMessage);
      toast.error(errorMessage);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    data,
    fetchCep,
    clearData,
  };
}

/**
 * Formata CEP para o padrão brasileiro (00000-000)
 */
export function formatCep(cep: string): string {
  const cepClean = cep.replace(/\D/g, '');
  if (cepClean.length <= 5) {
    return cepClean;
  }
  return `${cepClean.slice(0, 5)}-${cepClean.slice(5, 8)}`;
}

/**
 * Valida se um CEP é válido (8 dígitos)
 */
export function isValidCep(cep: string): boolean {
  const cepClean = cep.replace(/\D/g, '');
  return cepClean.length === 8;
}
