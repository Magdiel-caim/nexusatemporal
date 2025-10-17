import { useState, useEffect } from 'react';
import { X, FileText, Plus, Trash2, DollarSign } from 'lucide-react';
import { financialService, Invoice, Transaction } from '../../services/financialService';
import { toast } from 'react-hot-toast';

interface InvoiceFormProps {
  invoice?: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function InvoiceForm({ invoice, onClose, onSuccess }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState({
    invoiceNumber: invoice?.invoiceNumber || '',
    type: invoice?.type || 'recibo',
    transactionId: invoice?.transactionId || '',
    leadId: invoice?.leadId || '',
    description: invoice?.description || '',
    issueDate: invoice?.issueDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate?.split('T')[0] || '',
  });
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items || [{ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
  );

  useEffect(() => {
    loadTransactions();
    if (!invoice) {
      generateInvoiceNumber();
    }
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await financialService.getTransactions({ status: 'confirmada' });
      setTransactions(data.slice(0, 50)); // Limita a 50 transações recentes
    } catch (error: any) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setFormData(prev => ({ ...prev, invoiceNumber: `${year}${month}-${random}` }));
  };

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleItemChange = (index: number, key: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [key]: value };

      // Recalcula o total do item
      if (key === 'quantity' || key === 'unitPrice') {
        const quantity = key === 'quantity' ? Number(value) : newItems[index].quantity;
        const unitPrice = key === 'unitPrice' ? Number(value) : newItems[index].unitPrice;
        newItems[index].totalPrice = quantity * unitPrice;
      }

      return newItems;
    });
  };

  const addItem = () => {
    setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast.error('Deve haver pelo menos um item');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.invoiceNumber.trim()) {
      toast.error('Informe o número do recibo/NF');
      return;
    }

    if (!formData.transactionId && items.every(item => !item.description.trim())) {
      toast.error('Adicione pelo menos um item ou selecione uma transação');
      return;
    }

    try {
      setLoading(true);

      const total = calculateTotal();

      // Filtra itens vazios
      const validItems = items.filter(item => item.description.trim() !== '');

      const invoiceData: any = {
        invoiceNumber: formData.invoiceNumber,
        type: formData.type,
        transactionId: formData.transactionId || undefined,
        leadId: formData.leadId || undefined,
        amount: total,
        description: formData.description || undefined,
        items: validItems.length > 0 ? validItems : undefined,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate || undefined,
      };

      if (invoice) {
        await financialService.updateInvoice(invoice.id, invoiceData);
        toast.success('Recibo/NF atualizado com sucesso!');
      } else {
        await financialService.createInvoice(invoiceData);
        toast.success('Recibo/NF criado com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {invoice ? 'Editar Recibo/NF' : 'Novo Recibo/NF'}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Dados Principais */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Dados do Documento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    placeholder="2025-0001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="recibo">Recibo</option>
                    <option value="nota_fiscal">Nota Fiscal</option>
                    <option value="nota_servico">Nota de Serviço</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Emissão *
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleChange('issueDate', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Vinculação */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Vinculação (Opcional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transação
                  </label>
                  <select
                    value={formData.transactionId}
                    onChange={(e) => handleChange('transactionId', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Nenhuma</option>
                    {transactions.map(transaction => (
                      <option key={transaction.id} value={transaction.id}>
                        {transaction.description} - {formatCurrency(Number(transaction.amount))}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Vincule a uma transação existente
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Itens */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Itens do Recibo/NF
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="col-span-12 md:col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Descrição do item"
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        placeholder="Qtd"
                        min="1"
                        step="1"
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        placeholder="Preço"
                        min="0"
                        step="0.01"
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="col-span-3 md:col-span-2 flex items-center justify-end">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>

                    <div className="col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Valor Total:
                    </span>
                  </div>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>

            {/* Descrição/Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição/Observações
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Informações adicionais sobre o recibo/NF..."
              />
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Salvando...' : invoice ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
