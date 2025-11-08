import { useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
} from 'lucide-react';
import { financialService, CashFlow } from '../../services/financialService';
import { toast } from 'react-hot-toast';
import { getTodayString, formatDateBR, formatDateTimeBR } from '@/utils/dateUtils';

export default function CashFlowDaily() {
  const [cashFlow, setCashFlow] = useState<CashFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('0');
  const [closingValues, setClosingValues] = useState({
    cashAmount: 0,
    pixAmount: 0,
    creditCardAmount: 0,
    debitCardAmount: 0,
    transferAmount: 0,
    otherAmount: 0,
    notes: '',
  });
  const [movementAmount, setMovementAmount] = useState('0');
  const [movementNotes, setMovementNotes] = useState('');

  useEffect(() => {
    loadTodayCashFlow();
  }, []);

  const loadTodayCashFlow = async () => {
    try {
      setLoading(true);
      // USANDO TIMEZONE DE SÃO PAULO
      const today = getTodayString();
      const data = await financialService.getCashFlowByDate(today);
      setCashFlow(data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setCashFlow(null);
      } else {
        console.error('Erro ao carregar caixa:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCashFlow = async () => {
    try {
      // USANDO TIMEZONE DE SÃO PAULO
      const today = getTodayString();
      const data = await financialService.openCashFlow({
        date: today,
        openingBalance: Number(openingBalance),
      });
      setCashFlow(data);
      setShowOpenModal(false);
      toast.success('Caixa aberto com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao abrir caixa: ' + error.message);
    }
  };

  const handleCloseCashFlow = async () => {
    if (!cashFlow) return;

    try {
      const closingBalance =
        closingValues.cashAmount +
        closingValues.pixAmount +
        closingValues.creditCardAmount +
        closingValues.debitCardAmount +
        closingValues.transferAmount +
        closingValues.otherAmount;

      const data = await financialService.closeCashFlow(cashFlow.id, {
        ...closingValues,
        closingBalance,
      });
      setCashFlow(data);
      setShowCloseModal(false);
      toast.success('Caixa fechado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao fechar caixa: ' + error.message);
    }
  };

  const handleWithdrawal = async () => {
    if (!cashFlow) return;

    try {
      const data = await financialService.recordWithdrawal(
        cashFlow.id,
        Number(movementAmount),
        movementNotes || undefined
      );
      setCashFlow(data);
      setShowWithdrawalModal(false);
      setMovementAmount('0');
      setMovementNotes('');
      toast.success('Sangria registrada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao registrar sangria: ' + error.message);
    }
  };

  const handleDeposit = async () => {
    if (!cashFlow) return;

    try {
      const data = await financialService.recordDeposit(
        cashFlow.id,
        Number(movementAmount),
        movementNotes || undefined
      );
      setCashFlow(data);
      setShowDepositModal(false);
      setMovementAmount('0');
      setMovementNotes('');
      toast.success('Reforço registrado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao registrar reforço: ' + error.message);
    }
  };

  const handleUpdateFromTransactions = async () => {
    if (!cashFlow) return;

    try {
      // USANDO TIMEZONE DE SÃO PAULO
      const today = getTodayString();
      const data = await financialService.updateCashFlowFromTransactions(today);
      setCashFlow(data);
      toast.success('Caixa atualizado com transações!');
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cashFlow) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Caixa não aberto
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Abra o caixa para começar a registrar movimentações do dia.
          </p>
          <button
            onClick={() => setShowOpenModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Unlock className="w-4 h-4 mr-2" />
            Abrir Caixa
          </button>
        </div>

        {/* Modal Abrir Caixa */}
        {showOpenModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowOpenModal(false)} />
              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Abrir Caixa
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Saldo Inicial
                  </label>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowOpenModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleOpenCashFlow}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                  >
                    Abrir Caixa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Caixa do Dia - {formatDateBR(cashFlow.date)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {cashFlow.isClosed ? (
                <span className="inline-flex items-center text-red-600">
                  <Lock className="w-4 h-4 mr-1" />
                  Fechado em {formatDateTimeBR(cashFlow.closedAt!)}
                </span>
              ) : (
                <span className="inline-flex items-center text-green-600">
                  <Unlock className="w-4 h-4 mr-1" />
                  Aberto desde {formatDateTimeBR(cashFlow.openedAt || cashFlow.createdAt)}
                </span>
              )}
            </p>
          </div>
        </div>
        {!cashFlow.isClosed && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUpdateFromTransactions}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              title="Atualizar com transações"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="inline-flex items-center px-3 py-2 border border-orange-300 rounded-md text-sm font-medium text-orange-700 bg-white hover:bg-orange-50"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Sangria
            </button>
            <button
              onClick={() => setShowDepositModal(true)}
              className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Reforço
            </button>
            <button
              onClick={() => setShowCloseModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Fechar Caixa
            </button>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Saldo Inicial</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(cashFlow.openingBalance)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Receitas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(cashFlow.totalIncome)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(cashFlow.totalExpense)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Saldo Final</p>
              <p className={`text-2xl font-bold ${cashFlow.closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(cashFlow.closingBalance)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Detalhamento por Forma de Pagamento */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detalhamento por Forma de Pagamento
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Dinheiro</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(cashFlow.cashAmount)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">PIX</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(cashFlow.pixAmount)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cartão Crédito</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(cashFlow.creditCardAmount)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cartão Débito</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(cashFlow.debitCardAmount)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Transferência</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(cashFlow.transferAmount)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Outros</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(cashFlow.otherAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Movimentações */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Movimentações de Caixa
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-400 mb-1">Sangrias</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(cashFlow.withdrawals)}
                </p>
              </div>
              <ArrowDownCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-400 mb-1">Reforços</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(cashFlow.deposits)}
                </p>
              </div>
              <ArrowUpCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Observações */}
      {cashFlow.notes && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Observações</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{cashFlow.notes}</p>
        </div>
      )}

      {/* Modal Fechar Caixa */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCloseModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Fechar Caixa
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dinheiro
                  </label>
                  <input
                    type="number"
                    value={closingValues.cashAmount}
                    onChange={(e) => setClosingValues(prev => ({ ...prev, cashAmount: Number(e.target.value) }))}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PIX
                  </label>
                  <input
                    type="number"
                    value={closingValues.pixAmount}
                    onChange={(e) => setClosingValues(prev => ({ ...prev, pixAmount: Number(e.target.value) }))}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cartão Crédito
                  </label>
                  <input
                    type="number"
                    value={closingValues.creditCardAmount}
                    onChange={(e) => setClosingValues(prev => ({ ...prev, creditCardAmount: Number(e.target.value) }))}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cartão Débito
                  </label>
                  <input
                    type="number"
                    value={closingValues.debitCardAmount}
                    onChange={(e) => setClosingValues(prev => ({ ...prev, debitCardAmount: Number(e.target.value) }))}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transferência
                  </label>
                  <input
                    type="number"
                    value={closingValues.transferAmount}
                    onChange={(e) => setClosingValues(prev => ({ ...prev, transferAmount: Number(e.target.value) }))}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Outros
                  </label>
                  <input
                    type="number"
                    value={closingValues.otherAmount}
                    onChange={(e) => setClosingValues(prev => ({ ...prev, otherAmount: Number(e.target.value) }))}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações
                </label>
                <textarea
                  value={closingValues.notes}
                  onChange={(e) => setClosingValues(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                />
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCloseCashFlow}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                >
                  Fechar Caixa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sangria */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowWithdrawalModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Registrar Sangria
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motivo (opcional)
                </label>
                <textarea
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                />
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowWithdrawalModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleWithdrawal}
                  className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700"
                >
                  Registrar Sangria
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reforço */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDepositModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Registrar Reforço
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motivo (opcional)
                </label>
                <textarea
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                />
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeposit}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                >
                  Registrar Reforço
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
