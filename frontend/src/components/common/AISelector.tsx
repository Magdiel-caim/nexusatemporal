import React, { useEffect, useState } from 'react';
import api from '@/services/api';

interface AIConfig {
  id: number;
  provider: string;
  model: string;
  is_active: boolean;
}

interface AISelectorProps {
  value: string;
  onChange: (provider: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  showModel?: boolean;
}

export const AISelector: React.FC<AISelectorProps> = ({
  value,
  onChange,
  label = 'Selecione a IA',
  disabled = false,
  className = '',
  showModel = true,
}) => {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await api.get('/marketing/ai/configs');

      if (response.data.success) {
        const activeConfigs = response.data.data.filter((c: AIConfig) => c.is_active);
        setConfigs(activeConfigs);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações de IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      openai: 'OpenAI',
      anthropic: 'Claude (Anthropic)',
      google: 'Google Gemini',
      groq: 'Groq',
      openrouter: 'OpenRouter',
    };
    return names[provider.toLowerCase()] || provider;
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span className="text-sm text-gray-500">Carregando IAs...</span>
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="rounded-md bg-yellow-50 p-3 border border-yellow-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Nenhuma IA configurada</h3>
            <p className="mt-1 text-sm text-yellow-700">
              Configure pelo menos uma IA em Configurações → Integrações de IA
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Selecione uma IA</option>
        {configs.map((config) => (
          <option key={config.provider} value={config.provider}>
            {getProviderName(config.provider)}
            {showModel && ` - ${config.model}`}
          </option>
        ))}
      </select>
    </div>
  );
};
