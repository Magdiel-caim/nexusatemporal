import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, Loader } from 'lucide-react';
import api from '@/services/api';

interface SearchResult {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  cpf: string | null;
  rg: string | null;
  source: 'lead' | 'patient';
}

interface PatientSearchInputProps {
  value: string;
  onChange: (patientId: string, patientData: SearchResult) => void;
  placeholder?: string;
  selectedPatientName?: string;
}

const PatientSearchInput: React.FC<PatientSearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar por nome, CPF ou RG...',
  selectedPatientName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'name' | 'cpf' | 'rg'>('all');
  const searchTimeout = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fechar dropdown ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      // Debounce search
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm, searchType]);

  const performSearch = async () => {
    try {
      setIsSearching(true);
      const response = await api.get('/appointments/search-patients', {
        params: {
          q: searchTerm,
          type: searchType,
        },
      });

      setResults(response.data.data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient: SearchResult) => {
    onChange(patient.id, patient);
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
  };

  const handleClearSelection = () => {
    onChange('', {} as SearchResult);
    setSearchTerm('');
    setResults([]);
  };

  const detectSearchType = (term: string) => {
    const cleanTerm = term.replace(/\D/g, '');

    // CPF tem 11 dígitos
    if (cleanTerm.length === 11) {
      return 'cpf';
    }

    // RG geralmente tem 7-9 dígitos
    if (cleanTerm.length >= 7 && cleanTerm.length <= 9) {
      return 'rg';
    }

    return 'name';
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      const detectedType = detectSearchType(term);
      setSearchType(detectedType);
    }
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getSourceBadge = (source: string) => {
    return source === 'lead' ? (
      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
        Lead
      </span>
    ) : (
      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
        Paciente
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {value && selectedPatientName ? (
        /* Mostrar paciente selecionado */
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400 rounded-lg">
          <User className="text-blue-600 dark:text-blue-400" size={20} />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">{selectedPatientName}</p>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
            title="Remover seleção"
          >
            <X size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      ) : (
        /* Campo de busca */
        <>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {isSearching ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (results.length > 0) {
                  setShowResults(true);
                }
              }}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchType !== 'all' && searchTerm.length >= 2 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                  {searchType === 'cpf' ? 'CPF' : searchType === 'rg' ? 'RG' : 'Nome'}
                </span>
              </div>
            )}
          </div>

          {/* Dropdown de resultados */}
          {showResults && results.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              <div className="p-2 border-b dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((patient) => (
                <button
                  key={`${patient.source}-${patient.id}`}
                  type="button"
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left border-b dark:border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {patient.name}
                        </p>
                        {getSourceBadge(patient.source)}
                      </div>
                      <div className="space-y-0.5">
                        {patient.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            📱 {patient.phone}
                          </p>
                        )}
                        {patient.cpf && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            CPF: {formatCPF(patient.cpf)}
                          </p>
                        )}
                        {patient.rg && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            RG: {patient.rg}
                          </p>
                        )}
                        {patient.email && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            ✉️ {patient.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Mensagem quando não há resultados */}
          {showResults && !isSearching && searchTerm.length >= 2 && results.length === 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nenhum paciente encontrado para "{searchTerm}"
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatientSearchInput;
