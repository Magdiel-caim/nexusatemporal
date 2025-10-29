import { DollarSign, Plus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FinanceiroTabProps {
  patientId: string;
}

export default function FinanceiroTab({ patientId }: FinanceiroTabProps) {
  const navigate = useNavigate();

  // TODO: Integrar com o módulo financeiro
  // const [transactions, setTransactions] = useState([]);
  // const [summary, setSummary] = useState({ total: 0, paid: 0, pending: 0 });

  const handleNewTransaction = () => {
    // Navegar para módulo financeiro com o paciente pré-selecionado
    navigate('/financeiro', {
      state: {
        patientId: patientId,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Financeiro
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Histórico de transações financeiras do paciente
          </p>
        </div>

        <button
          onClick={handleNewTransaction}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Transação
        </button>
      </div>

      {/* Summary Cards (placeholder) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                R$ 0,00
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pago</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                R$ 0,00
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pendente</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                R$ 0,00
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Integração com Módulo Financeiro
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
              Esta seção exibirá as transações financeiras do paciente vindas do módulo Financeiro.
              Para ver ou criar transações, você pode:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-4 list-disc">
              <li>Clicar no botão "Nova Transação" acima</li>
              <li>Acessar o módulo Financeiro diretamente no menu</li>
              <li>Filtrar transações por este paciente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Placeholder */}
      <div className="text-center py-12">
        <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Nenhuma transação encontrada
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          As transações aparecerão aqui quando criadas no módulo Financeiro
        </p>
      </div>

      {/* Future: Lista de transações */}
      {/*
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            // Conteúdo do card de transação
          </div>
        ))}
      </div>
      */}
    </div>
  );
}
