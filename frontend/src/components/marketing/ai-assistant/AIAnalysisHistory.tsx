import { useState, useEffect } from 'react';
import { AIAnalysis, marketingService } from '@/services/marketingService';
import { Clock, TrendingUp, DollarSign, Zap, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AIAnalysisHistoryProps {
  refreshTrigger?: number;
}

const analysisTypeIcons: Record<string, React.ReactNode> = {
  sentiment: <TrendingUp size={16} className="text-blue-600" />,
  optimization: <Zap size={16} className="text-yellow-600" />,
  prediction: <Eye size={16} className="text-purple-600" />,
  copywriting: <span className="text-green-600">✍️</span>,
  image_gen: <span className="text-pink-600">🎨</span>,
};

const analysisTypeLabels: Record<string, string> = {
  sentiment: 'Análise de Sentimento',
  optimization: 'Otimização',
  prediction: 'Predição',
  copywriting: 'Copywriting',
  image_gen: 'Geração de Imagem',
};

const providerColors: Record<string, string> = {
  groq: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  openrouter: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  deepseek: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  mistral: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  qwen: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  ollama: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export default function AIAnalysisHistory({ refreshTrigger }: AIAnalysisHistoryProps) {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadAnalyses();
  }, [refreshTrigger]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedType !== 'all') {
        filters.analysisType = selectedType;
      }
      const data = await marketingService.getAIAnalyses(filters);
      setAnalyses(data);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      toast.error('Erro ao carregar histórico de análises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, [selectedType]);

  const formatCost = (cost?: number) => {
    if (!cost) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(cost);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Histórico de Análises ({analyses.length})
          </h3>

          {/* Filter by Type */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Filtrar:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="all">Todos os tipos</option>
              <option value="sentiment">Sentimento</option>
              <option value="optimization">Otimização</option>
              <option value="prediction">Predição</option>
              <option value="copywriting">Copywriting</option>
              <option value="image_gen">Geração de Imagem</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {analyses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Zap size={48} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma análise encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {selectedType === 'all'
                ? 'Comece usando a IA para otimizar seus conteúdos'
                : 'Nenhuma análise deste tipo foi realizada ainda'}
            </p>
          </div>
        ) : (
          analyses.map((analysis) => (
            <div key={analysis.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700">
                    {analysisTypeIcons[analysis.analysisType]}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {analysisTypeLabels[analysis.analysisType]}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          providerColors[analysis.aiProvider]
                        }`}
                      >
                        {analysis.aiProvider}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {analysis.aiModel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={14} />
                    {format(new Date(analysis.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                  {analysis.score && (
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      Score: {analysis.score}/100
                    </div>
                  )}
                </div>
              </div>

              {/* Input Preview */}
              {analysis.inputData && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Entrada:
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {typeof analysis.inputData === 'object'
                      ? JSON.stringify(analysis.inputData).substring(0, 200)
                      : analysis.inputData}
                  </p>
                </div>
              )}

              {/* Output Preview */}
              {analysis.outputData && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Resultado:
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {typeof analysis.outputData === 'object'
                      ? JSON.stringify(analysis.outputData).substring(0, 200)
                      : analysis.outputData}
                  </p>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Sugestões:
                  </p>
                  <ul className="space-y-1">
                    {analysis.suggestions.slice(0, 3).map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-primary-600 dark:text-primary-400">•</span>
                        <span className="line-clamp-1">{suggestion}</span>
                      </li>
                    ))}
                    {analysis.suggestions.length > 3 && (
                      <li className="text-xs text-gray-500 dark:text-gray-400">
                        +{analysis.suggestions.length - 3} mais sugestões
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Metrics */}
              <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                {analysis.tokensUsed && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Zap size={14} />
                    <span>{analysis.tokensUsed.toLocaleString('pt-BR')} tokens</span>
                  </div>
                )}
                {analysis.cost && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <DollarSign size={14} />
                    <span>{formatCost(analysis.cost)}</span>
                  </div>
                )}
                {analysis.processingTimeMs && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={14} />
                    <span>{analysis.processingTimeMs}ms</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
