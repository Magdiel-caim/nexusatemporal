import React from 'react';

interface Procedure {
  id: string;
  name: string;
  price?: number | string;
  duration?: number;
}

interface ProcedureSelectorProps {
  procedures: Procedure[];
  mode: 'single' | 'multiple';
  selectedProcedureId?: string;
  selectedProcedureIds?: string[];
  onModeChange: (mode: 'single' | 'multiple') => void;
  onSingleChange: (procedureId: string) => void;
  onMultipleChange: (procedureIds: string[]) => void;
  required?: boolean;
  className?: string;
  showModeToggle?: boolean; // Controle se mostra o toggle ou não
}

const ProcedureSelector: React.FC<ProcedureSelectorProps> = ({
  procedures,
  mode,
  selectedProcedureId = '',
  selectedProcedureIds = [],
  onModeChange,
  onSingleChange,
  onMultipleChange,
  required = false,
  className = '',
  showModeToggle = true,
}) => {
  const handleCheckboxChange = (procedureId: string, checked: boolean) => {
    if (checked) {
      onMultipleChange([...selectedProcedureIds, procedureId]);
    } else {
      onMultipleChange(selectedProcedureIds.filter(id => id !== procedureId));
    }
  };

  const formatPrice = (price?: number | string): string => {
    if (!price) return '';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '' : numPrice.toFixed(2);
  };

  const calculateTotals = () => {
    if (selectedProcedureIds.length === 0) return { duration: 0, price: 0 };

    const duration = selectedProcedureIds.reduce((sum, id) => {
      const proc = procedures.find(p => p.id === id);
      return sum + (proc?.duration || 60);
    }, 0);

    const price = selectedProcedureIds.reduce((sum, id) => {
      const proc = procedures.find(p => p.id === id);
      const procPrice = proc?.price ? parseFloat(String(proc.price)) : 0;
      return sum + (isNaN(procPrice) ? 0 : procPrice);
    }, 0);

    return { duration, price };
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Procedimento(s) {required && '*'}
      </label>

      {/* Toggle Único/Múltiplos */}
      {showModeToggle && (
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            onClick={() => onModeChange('single')}
            className={`px-3 py-1 text-xs rounded ${
              mode === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Único
          </button>
          <button
            type="button"
            onClick={() => onModeChange('multiple')}
            className={`px-3 py-1 text-xs rounded ${
              mode === 'multiple'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Múltiplos
          </button>
        </div>
      )}

      {mode === 'single' ? (
        // Seleção única
        <select
          required={required}
          value={selectedProcedureId}
          onChange={(e) => onSingleChange(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
        >
          <option value="">Selecione um procedimento</option>
          {procedures.map((proc) => {
            const price = formatPrice(proc.price);
            return (
              <option key={proc.id} value={proc.id}>
                {proc.name}
                {price && ` - R$ ${price}`}
                {proc.duration && ` (${proc.duration}min)`}
              </option>
            );
          })}
        </select>
      ) : (
        // Seleção múltipla
        <div className="space-y-2">
          <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
            {procedures.map((proc) => {
              const price = formatPrice(proc.price);
              return (
                <label
                  key={proc.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedProcedureIds.includes(proc.id)}
                    onChange={(e) => handleCheckboxChange(proc.id, e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {proc.name}
                    {price && ` - R$ ${price}`}
                    {proc.duration && ` (${proc.duration}min)`}
                  </span>
                </label>
              );
            })}
          </div>

          {selectedProcedureIds.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedProcedureIds.length} procedimento(s) selecionado(s)
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Duração total: {calculateTotals().duration} min
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                Valor total: R$ {calculateTotals().price.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProcedureSelector;
