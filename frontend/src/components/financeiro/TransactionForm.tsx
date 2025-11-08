import { useState } from 'react';
import { X, DollarSign, Calendar, User, Building } from 'lucide-react';
import {
  financialService,
  Transaction,
  TransactionType,
  TransactionCategory,
  PaymentMethod,
  TransactionStatus,
} from '../../services/financialService';
import { toast } from 'react-hot-toast';
import { getTodayString } from '@/utils/dateUtils';

interface TransactionFormProps {
  transaction?: Transaction;
  onClose: () => void;
  onSuccess: () => void;
}

const categoryOptions: Record<TransactionType, { value: TransactionCategory; label: string }[]> = {
  receita: [
    { value: 'procedimento', label: 'Procedimento' },
    { value: 'consulta', label: 'Consulta' },
    { value: 'retorno', label: 'Retorno' },
    { value: 'produto', label: 'Produto' },
    { value: 'outros_receitas', label: 'Outras Receitas' },
  ],
  despesa: [
    { value: 'salario', label: 'Salário' },
    { value: 'fornecedor', label: 'Fornecedor' },
    { value: 'aluguel', label: 'Aluguel' },
    { value: 'energia', label: 'Energia' },
    { value: 'agua', label: 'Água' },
    { value: 'internet', label: 'Internet' },
    { value: 'telefone', label: 'Telefone' },
    { value: 'impostos', label: 'Impostos' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'material_escritorio', label: 'Material de Escritório' },
    { value: 'material_medico', label: 'Material Médico' },
    { value: 'manutencao', label: 'Manutenção' },
    { value: 'contabilidade', label: 'Contabilidade' },
    { value: 'software', label: 'Software' },
    { value: 'limpeza', label: 'Limpeza' },
    { value: 'seguranca', label: 'Segurança' },
    { value: 'outros_despesas', label: 'Outras Despesas' },
  ],
  transferencia: [
    { value: 'outros_receitas', label: 'Transferência Entre Contas' },
  ],
};

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'link_pagamento', label: 'Link de Pagamento' },
  { value: 'transferencia_bancaria', label: 'Transferência Bancária' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cheque', label: 'Cheque' },
];

export default function TransactionForm({ transaction, onClose, onSuccess }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [showInstallments, setShowInstallments] = useState(false);

  const [formData, setFormData] = useState({
    type: transaction?.type || 'receita' as TransactionType,
    category: transaction?.category || 'procedimento' as TransactionCategory,
    amount: transaction?.amount || 0,
    description: transaction?.description || '',
    paymentMethod: transaction?.paymentMethod || '' as PaymentMethod | '',
    status: transaction?.status || 'pendente' as TransactionStatus,
    dueDate: transaction?.dueDate ? String(transaction.dueDate).split('T')[0] : '',
    paymentDate: transaction?.paymentDate ? String(transaction.paymentDate).split('T')[0] : '',
    referenceDate: transaction?.referenceDate ? String(transaction.referenceDate).split('T')[0] : getTodayString(),
    notes: transaction?.notes || '',
    leadId: transaction?.leadId || '',
    appointmentId: transaction?.appointmentId || '',
    supplierId: transaction?.supplierId || '',
    totalInstallments: 1,
  });

  const handleChange = (key: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };

      // Se mudar o tipo, ajustar categoria padrão
      if (key === 'type') {
        updated.category = categoryOptions[value as TransactionType][0].value;
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.type) {
      toast.error('Selecione o tipo de transação');
      return;
    }

    if (!formData.category) {
      toast.error('Selecione a categoria');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Informe a descrição');
      return;
    }

    if (!formData.dueDate) {
      toast.error('Informe a data de vencimento');
      return;
    }

    try {
      setLoading(true);

      if (showInstallments && formData.totalInstallments > 1) {
        // Criar parcelamento
        await financialService.createInstallmentTransactions({
          type: formData.type,
          category: formData.category,
          totalAmount: formData.amount,
          description: formData.description,
          paymentMethod: formData.paymentMethod || undefined,
          totalInstallments: formData.totalInstallments,
          firstDueDate: formData.dueDate,
          leadId: formData.leadId || undefined,
          appointmentId: formData.appointmentId || undefined,
          supplierId: formData.supplierId || undefined,
          referenceDate: formData.referenceDate,
        });
        toast.success(`${formData.totalInstallments} transações criadas com sucesso!`);
      } else if (transaction) {
        // Atualizar transação existente
        await financialService.updateTransaction(transaction.id, {
          type: formData.type,
          category: formData.category,
          amount: formData.amount,
          description: formData.description,
          paymentMethod: formData.paymentMethod || undefined,
          status: formData.status,
          dueDate: formData.dueDate,
          paymentDate: formData.paymentDate || undefined,
          referenceDate: formData.referenceDate,
          notes: formData.notes || undefined,
          leadId: formData.leadId || undefined,
          appointmentId: formData.appointmentId || undefined,
          supplierId: formData.supplierId || undefined,
        });
        toast.success('Transação atualizada com sucesso!');
      } else {
        // Criar nova transação
        await financialService.createTransaction({
          type: formData.type,
          category: formData.category,
          amount: formData.amount,
          description: formData.description,
          paymentMethod: formData.paymentMethod || undefined,
          status: formData.status,
          dueDate: formData.dueDate,
          paymentDate: formData.paymentDate || undefined,
          referenceDate: formData.referenceDate,
          notes: formData.notes || undefined,
          leadId: formData.leadId || undefined,
          appointmentId: formData.appointmentId || undefined,
          supplierId: formData.supplierId || undefined,
        });
        toast.success('Transação criada com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Erro ao salvar transação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {transaction ? 'Editar Transação' : 'Nova Transação'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Tipo e Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  disabled={!!transaction}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                  <option value="transferencia">Transferência</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {categoryOptions[formData.type].map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                  className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Descreva a transação..."
              />
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data de Vencimento *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data de Pagamento
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleChange('paymentDate', e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data de Referência *
                </label>
                <input
                  type="date"
                  value={formData.referenceDate}
                  onChange={(e) => handleChange('referenceDate', e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Método de Pagamento e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Método de Pagamento
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {paymentMethodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="estornada">Estornada</option>
                </select>
              </div>
            </div>

            {/* Relacionamentos (Lead, Appointment, Supplier) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Lead (ID)
                </label>
                <input
                  type="text"
                  value={formData.leadId}
                  onChange={(e) => handleChange('leadId', e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="UUID do lead..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Agendamento (ID)
                </label>
                <input
                  type="text"
                  value={formData.appointmentId}
                  onChange={(e) => handleChange('appointmentId', e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="UUID do agendamento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Building className="w-4 h-4 inline mr-1" />
                  Fornecedor (ID)
                </label>
                <input
                  type="text"
                  value={formData.supplierId}
                  onChange={(e) => handleChange('supplierId', e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="UUID do fornecedor..."
                />
              </div>
            </div>

            {/* Parcelamento */}
            {!transaction && (
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="installments"
                    checked={showInstallments}
                    onChange={(e) => setShowInstallments(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="installments" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Parcelar transação
                  </label>
                </div>

                {showInstallments && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Número de Parcelas
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="48"
                      value={formData.totalInstallments}
                      onChange={(e) => handleChange('totalInstallments', parseInt(e.target.value) || 1)}
                      className="w-full md:w-32 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Valor por parcela: R$ {(formData.amount / formData.totalInstallments).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Informações adicionais..."
              />
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  transaction ? 'Atualizar' : 'Criar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
