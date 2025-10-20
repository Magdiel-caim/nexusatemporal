import { useState, useEffect } from 'react';
import { stockService, StockAlert, AlertType, AlertStatus } from '@/services/stockService';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AlertListProps {
  refreshKey: number;
  onRefresh: () => void;
}

export default function AlertList({ refreshKey, onRefresh }: AlertListProps) {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | ''>(AlertStatus.ACTIVE);

  useEffect(() => {
    loadAlerts();
  }, [refreshKey, statusFilter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await stockService.getAlerts({
        status: statusFilter || undefined,
        limit: 100,
      });
      setAlerts(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar alertas:', error);
      toast.error('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alert: StockAlert) => {
    const resolution = prompt('Digite a resolução do alerta:');
    if (!resolution) return;

    try {
      await stockService.resolveAlert(alert.id, resolution);
      toast.success('Alerta resolvido com sucesso!');
      onRefresh();
    } catch (error) {
      toast.error('Erro ao resolver alerta');
    }
  };

  const handleIgnore = async (alert: StockAlert) => {
    if (!confirm('Tem certeza que deseja ignorar este alerta?')) return;

    try {
      await stockService.ignoreAlert(alert.id);
      toast.success('Alerta ignorado');
      onRefresh();
    } catch (error) {
      toast.error('Erro ao ignorar alerta');
    }
  };

  const getAlertColor = (type: AlertType) => {
    switch (type) {
      case 'LOW_STOCK':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EXPIRING_SOON':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AlertStatus | '')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="RESOLVED">Resolvidos</option>
          <option value="IGNORED">Ignorados</option>
        </select>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alerta encontrado</h3>
          <p className="text-gray-600">Todos os itens estão dentro dos parâmetros normais</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl shadow-sm p-6 border-2 ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="font-bold text-lg">{alert.product?.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-white bg-opacity-50">
                      {alert.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm mb-3">{alert.message}</p>
                  {alert.currentStock !== undefined && (
                    <p className="text-sm font-medium">
                      Estoque atual: {alert.currentStock} {alert.product?.unit}
                      {alert.minimumStock && ` • Mínimo: ${alert.minimumStock} ${alert.product?.unit}`}
                    </p>
                  )}
                  <p className="text-xs mt-2 opacity-75">
                    Criado em: {new Date(alert.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                {alert.status === 'ACTIVE' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleResolve(alert)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Resolver
                    </button>
                    <button
                      onClick={() => handleIgnore(alert)}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Ignorar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
