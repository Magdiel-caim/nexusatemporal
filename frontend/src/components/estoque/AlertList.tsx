import { useState, useEffect } from 'react';
import { stockService, StockAlert, AlertType, AlertStatus } from '@/services/stockService';
import { AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.text('Relatório de Alertas de Estoque', 14, 20);

      // Data de geração
      doc.setFontSize(11);
      const dataGeracao = new Date().toLocaleString('pt-BR');
      doc.text(`Gerado em: ${dataGeracao}`, 14, 28);

      // Filtro aplicado
      const filtroTexto = statusFilter
        ? `Status: ${statusFilter === 'ACTIVE' ? 'Ativos' : statusFilter === 'RESOLVED' ? 'Resolvidos' : 'Ignorados'}`
        : 'Todos os status';
      doc.text(`Filtro: ${filtroTexto}`, 14, 34);

      // Preparar dados para a tabela
      const tableData = alerts.map((alert) => [
        alert.product?.name || 'N/A',
        alert.type.replace('_', ' '),
        alert.status,
        alert.currentStock !== undefined ? `${alert.currentStock} ${alert.product?.unit || ''}` : 'N/A',
        alert.minimumStock ? `${alert.minimumStock} ${alert.product?.unit || ''}` : 'N/A',
        new Date(alert.createdAt).toLocaleDateString('pt-BR'),
      ]);

      // Gerar tabela
      autoTable(doc, {
        startY: 40,
        head: [['Produto', 'Tipo', 'Status', 'Estoque Atual', 'Estoque Mínimo', 'Data']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
        },
      });

      // Resumo
      const finalY = (doc as any).lastAutoTable.finalY || 40;
      doc.setFontSize(11);
      doc.text(`Total de alertas: ${alerts.length}`, 14, finalY + 10);

      // Gerar nome do arquivo com timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `alertas_${timestamp}.pdf`;

      // Salvar PDF
      doc.save(filename);

      toast.success(`Arquivo ${filename} exportado com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar arquivo PDF');
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
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExportPDF}
          disabled={alerts.length === 0}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="Exportar lista de alertas para PDF"
        >
          <FileText className="h-5 w-5 mr-2" />
          Exportar PDF
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
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
