import { useState, useEffect } from 'react';
import { stockService } from '@/services/stockService';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, DollarSign, FileSpreadsheet, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ReportsView() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [mostUsedProducts, setMostUsedProducts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthsFilter, setMonthsFilter] = useState(6);
  const [topProductsLimit, setTopProductsLimit] = useState(10);

  useEffect(() => {
    loadReportsData();
  }, [monthsFilter, topProductsLimit]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const [monthly, mostUsed, byCategory] = await Promise.all([
        stockService.getMovementsMonthly(monthsFilter),
        stockService.getMostUsedProducts(topProductsLimit),
        stockService.getStockValueByCategory(),
      ]);

      // Processar dados mensais para o gráfico
      const monthlyProcessed = processMonthlyData(monthly.data);
      setMonthlyData(monthlyProcessed);

      setMostUsedProducts(mostUsed.data || []);
      setCategoryData(byCategory.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (data: any[]) => {
    // Agrupar por mês
    const grouped: any = {};
    data.forEach((item: any) => {
      if (!grouped[item.month]) {
        grouped[item.month] = { month: item.month, ENTRADA: 0, SAIDA: 0 };
      }
      grouped[item.month][item.type] = parseInt(item.total_quantity);
    });

    return Object.values(grouped).reverse();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();

      // Aba 1: Movimentações Mensais
      const ws1 = workbook.addWorksheet('Movimentações Mensais');
      ws1.columns = [
        { header: 'Mês', key: 'month', width: 15 },
        { header: 'Entradas', key: 'entrada', width: 15 },
        { header: 'Saídas', key: 'saida', width: 15 },
      ];
      ws1.getRow(1).font = { bold: true };
      ws1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
      monthlyData.forEach(d => ws1.addRow({ month: d.month, entrada: d.ENTRADA, saida: d.SAIDA }));

      // Aba 2: Produtos Mais Usados
      const ws2 = workbook.addWorksheet('Produtos Mais Usados');
      ws2.columns = [
        { header: 'Produto', key: 'name', width: 30 },
        { header: 'SKU', key: 'sku', width: 15 },
        { header: 'Quantidade Usada', key: 'total', width: 18 },
      ];
      ws2.getRow(1).font = { bold: true };
      ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };
      mostUsedProducts.forEach(p => ws2.addRow({ name: p.name, sku: p.sku, total: p.total_output }));

      // Aba 3: Valor por Categoria
      const ws3 = workbook.addWorksheet('Valor por Categoria');
      ws3.columns = [
        { header: 'Categoria', key: 'category', width: 20 },
        { header: 'Qtd Produtos', key: 'count', width: 15 },
        { header: 'Total Unidades', key: 'units', width: 15 },
        { header: 'Valor Total', key: 'value', width: 18 },
      ];
      ws3.getRow(1).font = { bold: true };
      ws3.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
      categoryData.forEach(c => ws3.addRow({ category: c.category, count: c.product_count, units: c.total_units, value: c.total_value }));
      ws3.getColumn('value').numFmt = 'R$ #,##0.00';

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_estoque_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Relatório exportado para Excel!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar Excel');
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.setTextColor(59, 130, 246);
      doc.text('Relatório de Estoque', 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);

      let currentY = 40;

      // Tabela 1: Movimentações
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Movimentações Mensais', 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Mês', 'Entradas', 'Saídas']],
        body: monthlyData.map(d => [d.month, d.ENTRADA, d.SAIDA]),
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Tabela 2: Top Produtos
      doc.setFontSize(14);
      doc.text('Produtos Mais Usados', 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Produto', 'Quantidade']],
        body: mostUsedProducts.slice(0, 5).map(p => [p.name, p.total_output]),
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 9 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Tabela 3: Categorias
      doc.setFontSize(14);
      doc.text('Valor por Categoria', 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Categoria', 'Produtos', 'Valor Total']],
        body: categoryData.map(c => [c.category, c.product_count, `R$ ${parseFloat(c.total_value).toFixed(2)}`]),
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 },
      });

      doc.save(`relatorio_estoque_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Relatório exportado para PDF!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calcular KPIs
  const totalEntradas = monthlyData.reduce((sum, d) => sum + (d.ENTRADA || 0), 0);
  const totalSaidas = monthlyData.reduce((sum, d) => sum + (d.SAIDA || 0), 0);
  const saldoMovimentacoes = totalEntradas - totalSaidas;
  const valorTotalEstoque = categoryData.reduce((sum, c) => sum + parseFloat(c.total_value || 0), 0);
  const totalProdutos = categoryData.reduce((sum, c) => sum + parseInt(c.product_count || 0), 0);
  const produtoMaisUsado = mostUsedProducts[0];

  return (
    <div className="space-y-6">
      {/* Dashboard de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Valor Total do Estoque */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Valor Total</span>
          </div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(valorTotalEstoque)}</div>
          <p className="text-sm opacity-80">{totalProdutos} produtos em estoque</p>
        </div>

        {/* KPI 2: Saldo de Movimentações */}
        <div className={`bg-gradient-to-br ${saldoMovimentacoes >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-xl shadow-lg p-6 text-white`}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Saldo ({monthsFilter}m)</span>
          </div>
          <div className="text-3xl font-bold mb-1">{saldoMovimentacoes > 0 ? '+' : ''}{saldoMovimentacoes}</div>
          <p className="text-sm opacity-80">Entradas: {totalEntradas} | Saídas: {totalSaidas}</p>
        </div>

        {/* KPI 3: Produto Mais Usado */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="h-8 w-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Mais Usado</span>
          </div>
          <div className="text-lg font-bold mb-1 truncate">{produtoMaisUsado?.name || 'N/A'}</div>
          <p className="text-sm opacity-80">{produtoMaisUsado?.total_output || 0} unidades consumidas</p>
        </div>

        {/* KPI 4: Categorias Ativas */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="h-8 w-8 opacity-80" />
            <span className="text-sm font-medium opacity-90">Categorias</span>
          </div>
          <div className="text-3xl font-bold mb-1">{categoryData.length}</div>
          <p className="text-sm opacity-80">Distribuídas em estoque</p>
        </div>
      </div>

      {/* Header com Filtros e Exportação */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Relatórios e Análises</h2>
            <p className="text-gray-600 dark:text-gray-300">Visualize dados agregados e tendências do estoque</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filtro de Meses */}
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <select
                value={monthsFilter}
                onChange={(e) => setMonthsFilter(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              >
                <option value={3}>3 meses</option>
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
              </select>
            </div>

            {/* Filtro Top Produtos */}
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" />
              <select
                value={topProductsLimit}
                onChange={(e) => setTopProductsLimit(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
              </select>
            </div>

            {/* Botões de Exportação */}
            <button
              onClick={exportToExcel}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              title="Exportar para Excel"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              title="Exportar para PDF"
            >
              <FileText className="h-5 w-5 mr-2" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Movimentações Mensais */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Movimentações Mensais (Últimos {monthsFilter} Meses)
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Line type="monotone" dataKey="ENTRADA" stroke="#10B981" strokeWidth={2} name="Entradas" />
            <Line type="monotone" dataKey="SAIDA" stroke="#EF4444" strokeWidth={2} name="Saídas" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Mais Usados */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Package className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top {topProductsLimit} Produtos Mais Usados
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mostUsedProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis type="category" dataKey="name" width={150} stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="total_output" fill="#8B5CF6" name="Quantidade Usada" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Valor por Categoria */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Valor do Estoque por Categoria</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="total_value"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(data: any) => `${data.category}: ${formatCurrency(data.total_value)}`}
              >
                {categoryData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Resumo por Categoria */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalhamento por Categoria</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Categoria</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Produtos</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unidades</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {categoryData.map((cat) => (
                <tr key={cat.category} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{cat.category}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-gray-400">{cat.product_count}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-gray-400">{Math.round(cat.total_units)}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(cat.total_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
