import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Download,
  Filter,
  PieChart as PieChartIcon,
  BarChart3,
  FileText,
} from 'lucide-react';
import { financialService } from '../../services/financialService';
import { toast } from 'react-hot-toast';

interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface DREData {
  receitaBruta: number;
  receitaLiquida: number;
  custos: number;
  lucroBruto: number;
  despesasOperacionais: number;
  lucroOperacional: number;
  lucroLiquido: number;
}

export default function FinancialReports() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryIncome, setCategoryIncome] = useState<CategoryData[]>([]);
  const [categoryExpense, setCategoryExpense] = useState<CategoryData[]>([]);
  const [dreData, setDreData] = useState<DREData | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Set default dates based on period
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    if (period === 'month') {
      setStartDate(new Date(year, month, 1).toISOString().split('T')[0]);
      setEndDate(new Date(year, month + 1, 0).toISOString().split('T')[0]);
    } else if (period === 'quarter') {
      const quarter = Math.floor(month / 3);
      setStartDate(new Date(year, quarter * 3, 1).toISOString().split('T')[0]);
      setEndDate(new Date(year, quarter * 3 + 3, 0).toISOString().split('T')[0]);
    } else {
      setStartDate(new Date(year, 0, 1).toISOString().split('T')[0]);
      setEndDate(new Date(year, 11, 31).toISOString().split('T')[0]);
    }
  }, [period]);

  useEffect(() => {
    if (startDate && endDate) {
      loadReports();
    }
  }, [startDate, endDate]);

  const loadReports = async () => {
    try {
      setLoading(true);

      // Load transactions for the period
      const transactions = await financialService.getTransactions({
        status: 'confirmada',
        dateFrom: startDate,
        dateTo: endDate,
      });

      // Calculate monthly data
      const monthlyMap = new Map<string, { receitas: number; despesas: number }>();

      transactions.forEach(t => {
        const date = new Date(t.paymentDate || t.dueDate);
        const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { receitas: 0, despesas: 0 });
        }

        const data = monthlyMap.get(monthKey)!;
        if (t.type === 'receita') {
          data.receitas += Number(t.amount);
        } else {
          data.despesas += Number(t.amount);
        }
      });

      const monthly: MonthlyData[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        receitas: data.receitas,
        despesas: data.despesas,
        saldo: data.receitas - data.despesas,
      }));

      setMonthlyData(monthly);

      // Calculate category distribution
      const incomeByCategory = new Map<string, number>();
      const expenseByCategory = new Map<string, number>();
      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach(t => {
        const amount = Number(t.amount);
        if (t.type === 'receita') {
          incomeByCategory.set(t.category, (incomeByCategory.get(t.category) || 0) + amount);
          totalIncome += amount;
        } else {
          expenseByCategory.set(t.category, (expenseByCategory.get(t.category) || 0) + amount);
          totalExpense += amount;
        }
      });

      const incomeCategories: CategoryData[] = Array.from(incomeByCategory.entries())
        .map(([name, value]) => ({
          name: getCategoryLabel(name),
          value,
          percentage: (value / totalIncome) * 100,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      const expenseCategories: CategoryData[] = Array.from(expenseByCategory.entries())
        .map(([name, value]) => ({
          name: getCategoryLabel(name),
          value,
          percentage: (value / totalExpense) * 100,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      setCategoryIncome(incomeCategories);
      setCategoryExpense(expenseCategories);

      // Calculate DRE
      const dre: DREData = {
        receitaBruta: totalIncome,
        receitaLiquida: totalIncome,
        custos: 0,
        lucroBruto: totalIncome,
        despesasOperacionais: totalExpense,
        lucroOperacional: totalIncome - totalExpense,
        lucroLiquido: totalIncome - totalExpense,
      };

      setDreData(dre);

    } catch (error: any) {
      toast.error('Erro ao carregar relatórios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      procedimento: 'Procedimento',
      consulta: 'Consulta',
      retorno: 'Retorno',
      produto: 'Produto',
      salario: 'Salário',
      fornecedor: 'Fornecedor',
      aluguel: 'Aluguel',
      energia: 'Energia',
      agua: 'Água',
      internet: 'Internet',
      telefone: 'Telefone',
      marketing: 'Marketing',
      material_escritorio: 'Material Escritório',
      material_medico: 'Material Médico',
      impostos: 'Impostos',
      manutencao: 'Manutenção',
      contabilidade: 'Contabilidade',
      software: 'Software',
      limpeza: 'Limpeza',
      seguranca: 'Segurança',
      outros_receitas: 'Outras Receitas',
      outros_despesas: 'Outras Despesas',
    };
    return labels[category] || category;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const exportToPDF = () => {
    toast.success('Exportação de PDF em desenvolvimento...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Relatórios Financeiros
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Análises e demonstrativos do período
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Período
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
              >
                <option value="month">Mês Atual</option>
                <option value="quarter">Trimestre Atual</option>
                <option value="year">Ano Atual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* DRE - Demonstrativo de Resultado */}
      {dreData && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              DRE - Demonstrativo de Resultado do Exercício
            </h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Receita Bruta</span>
              <span className="text-sm font-bold text-green-600">{formatCurrency(dreData.receitaBruta)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">(-) Deduções</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">(=) Receita Líquida</span>
              <span className="text-sm font-bold text-green-600">{formatCurrency(dreData.receitaLiquida)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">(-) Custos</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(dreData.custos)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">(=) Lucro Bruto</span>
              <span className="text-sm font-bold text-green-600">{formatCurrency(dreData.lucroBruto)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">(-) Despesas Operacionais</span>
              <span className="text-sm text-red-600">{formatCurrency(dreData.despesasOperacionais)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">(=) Lucro Operacional</span>
              <span className={`text-sm font-bold ${dreData.lucroOperacional >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(dreData.lucroOperacional)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-bold text-gray-900 dark:text-white">(=) Lucro Líquido</span>
              <span className={`text-base font-bold ${dreData.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(dreData.lucroLiquido)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Receitas vs Despesas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
              <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Balance Line Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Evolução do Saldo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} name="Saldo" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Income by Category */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Receitas por Categoria
          </h3>
          {categoryIncome.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryIncome}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                >
                  {categoryIncome.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>Nenhuma receita no período</p>
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Despesas por Categoria
          </h3>
          {categoryExpense.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryExpense}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                >
                  {categoryExpense.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>Nenhuma despesa no período</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Categories Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Income Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Principais Fontes de Receita
          </h3>
          <div className="space-y-3">
            {categoryIncome.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">{formatCurrency(cat.value)}</p>
                  <p className="text-xs text-gray-500">{cat.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Expense Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Principais Despesas
          </h3>
          <div className="space-y-3">
            {categoryExpense.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{formatCurrency(cat.value)}</p>
                  <p className="text-xs text-gray-500">{cat.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
