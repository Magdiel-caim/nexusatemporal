import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  FileText,
  Send,
  X,
  CheckCircle,
  Clock,
  Mail,
  Eye,
} from 'lucide-react';
import { financialService, Invoice } from '../../services/financialService';
import { toast } from 'react-hot-toast';

interface InvoiceListProps {
  onEditInvoice?: (invoice: Invoice) => void;
  onCreateInvoice?: () => void;
}

export default function InvoiceList({ onEditInvoice, onCreateInvoice }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await financialService.getInvoices({
        search: filters.search || undefined,
        type: (filters.type || undefined) as any,
        status: (filters.status || undefined) as any,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      });
      setInvoices(data);
    } catch (error: any) {
      toast.error('Erro ao carregar recibos/NF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Informe o motivo do cancelamento:');
    if (!reason) return;

    try {
      await financialService.cancelInvoice(id, reason);
      toast.success('Recibo/NF cancelado com sucesso!');
      loadInvoices();
    } catch (error: any) {
      toast.error('Erro ao cancelar: ' + error.message);
    }
  };

  const handleSend = async (invoice: Invoice) => {
    if (!invoice.pdfUrl) {
      toast.error('Gere o PDF antes de enviar');
      return;
    }

    const email = prompt('Informe o email para envio:', invoice.lead?.email || invoice.sentTo || '');
    if (!email) return;

    try {
      await financialService.markInvoiceAsSent(invoice.id, { sentTo: email, sentMethod: 'email' });
      toast.success('Recibo/NF marcado como enviado!');
      loadInvoices();
    } catch (error: any) {
      toast.error('Erro ao marcar como enviado: ' + error.message);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      recibo: 'Recibo',
      nota_fiscal: 'Nota Fiscal',
      nota_servico: 'Nota de Serviço',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      rascunho: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-200',
        label: 'Rascunho',
      },
      emitida: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-800 dark:text-blue-200',
        label: 'Emitida',
      },
      enviada: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-800 dark:text-green-200',
        label: 'Enviada',
      },
      cancelada: {
        bg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-800 dark:text-red-200',
        label: 'Cancelada',
      },
    };

    const badge = badges[status] || badges.rascunho;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'emitida':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'enviada':
        return <Mail className="w-5 h-5 text-green-600" />;
      case 'cancelada':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recibos e Notas Fiscais
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {invoices.length} registro(s)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          {onCreateInvoice && (
            <button
              onClick={onCreateInvoice}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Recibo/NF
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Número, descrição..."
                  className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="recibo">Recibo</option>
                <option value="nota_fiscal">Nota Fiscal</option>
                <option value="nota_servico">Nota de Serviço</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="rascunho">Rascunho</option>
                <option value="emitida">Emitida</option>
                <option value="enviada">Enviada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadInvoices}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invoices.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Nenhum recibo/NF encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comece criando um novo recibo ou nota fiscal.
            </p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getTypeLabel(invoice.type)}
                    </p>
                  </div>
                </div>
                {getStatusIcon(invoice.status)}
              </div>

              {/* Informações */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Valor:</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(Number(invoice.amount))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Emissão:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatDate(invoice.issueDate)}
                  </span>
                </div>
                {invoice.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {invoice.description}
                  </p>
                )}
                <div className="pt-2">
                  {getStatusBadge(invoice.status)}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  {invoice.pdfUrl && (
                    <a
                      href={invoice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400"
                      title="Visualizar PDF"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  {invoice.status !== 'cancelada' && (
                    <button
                      onClick={() => handleSend(invoice)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      title="Enviar"
                      disabled={!invoice.pdfUrl}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {invoice.status === 'rascunho' && onEditInvoice && (
                    <button
                      onClick={() => onEditInvoice(invoice)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {invoice.status !== 'cancelada' && (
                    <button
                      onClick={() => handleCancel(invoice.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
