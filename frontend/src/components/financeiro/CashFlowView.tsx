import { useState } from 'react';
import CashFlowDaily from './CashFlowDaily';
import CashFlowHistory from './CashFlowHistory';
import { History, Calendar } from 'lucide-react';

export default function CashFlowView() {
  const [activeView, setActiveView] = useState<'today' | 'history'>('today');

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveView('today')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeView === 'today'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Caixa do Dia
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
              activeView === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <History className="w-4 h-4 mr-2" />
            Histórico
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeView === 'today' && <CashFlowDaily />}
      {activeView === 'history' && <CashFlowHistory />}
    </div>
  );
}
