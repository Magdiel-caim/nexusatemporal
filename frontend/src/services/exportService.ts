import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, StockMovement, StockAlert } from './stockService';

// ============================================
// EXPORTAÇÃO DE PRODUTOS
// ============================================

export async function exportProductsToExcel(products: Product[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Produtos');

  // Definir colunas
  worksheet.columns = [
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Nome', key: 'name', width: 30 },
    { header: 'Categoria', key: 'category', width: 15 },
    { header: 'Estoque Atual', key: 'currentStock', width: 15 },
    { header: 'Estoque Mínimo', key: 'minimumStock', width: 15 },
    { header: 'Unidade', key: 'unit', width: 10 },
    { header: 'Preço Compra', key: 'purchasePrice', width: 15 },
    { header: 'Preço Venda', key: 'salePrice', width: 15 },
    { header: 'Localização', key: 'location', width: 20 },
    { header: 'Status', key: 'isActive', width: 10 },
  ];

  // Estilizar cabeçalho
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3B82F6' },
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Adicionar dados
  products.forEach((product) => {
    worksheet.addRow({
      sku: product.sku || 'N/A',
      name: product.name,
      category: product.category,
      currentStock: product.currentStock,
      minimumStock: product.minimumStock,
      unit: product.unit,
      purchasePrice: product.purchasePrice || 0,
      salePrice: product.salePrice || 0,
      location: product.location || 'N/A',
      isActive: product.isActive ? 'Ativo' : 'Inativo',
    });
  });

  // Aplicar formatação condicional (cores)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const product = products[rowNumber - 2];
      if (product.currentStock === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFECACA' }, // Vermelho claro
        };
      } else if (product.currentStock <= product.minimumStock) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEF3C7' }, // Amarelo claro
        };
      }
    }
  });

  // Formatação de moeda
  worksheet.getColumn('purchasePrice').numFmt = 'R$ #,##0.00';
  worksheet.getColumn('salePrice').numFmt = 'R$ #,##0.00';

  // Gerar arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `produtos_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportProductsToPDF(products: Product[]) {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text('Relatório de Produtos', 14, 20);

  // Data
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);

  // Preparar dados da tabela
  const tableData = products.map((p) => [
    p.sku || 'N/A',
    p.name,
    p.category,
    p.currentStock,
    p.minimumStock,
    p.unit,
    `R$ ${(p.purchasePrice || 0).toFixed(2)}`,
    p.isActive ? 'Ativo' : 'Inativo',
  ]);

  // Gerar tabela
  autoTable(doc, {
    head: [['SKU', 'Nome', 'Categoria', 'Estoque', 'Mín.', 'Un.', 'Preço', 'Status']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const product = products[data.row.index];
        if (product.currentStock === 0) {
          doc.setFillColor(254, 202, 202); // Vermelho
        } else if (product.currentStock <= product.minimumStock) {
          doc.setFillColor(254, 243, 199); // Amarelo
        }
      }
    },
  });

  // Salvar PDF
  doc.save(`produtos_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ============================================
// EXPORTAÇÃO DE MOVIMENTAÇÕES
// ============================================

export async function exportMovementsToExcel(movements: StockMovement[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Movimentações');

  worksheet.columns = [
    { header: 'Data', key: 'date', width: 20 },
    { header: 'Produto', key: 'product', width: 30 },
    { header: 'Tipo', key: 'type', width: 15 },
    { header: 'Motivo', key: 'reason', width: 20 },
    { header: 'Quantidade', key: 'quantity', width: 12 },
    { header: 'Estoque Anterior', key: 'previousStock', width: 15 },
    { header: 'Novo Estoque', key: 'newStock', width: 15 },
    { header: 'Valor Unit.', key: 'unitPrice', width: 15 },
    { header: 'Valor Total', key: 'totalPrice', width: 15 },
    { header: 'Observações', key: 'notes', width: 30 },
  ];

  // Estilizar cabeçalho
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' },
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Adicionar dados
  movements.forEach((mov) => {
    worksheet.addRow({
      date: new Date(mov.createdAt).toLocaleString('pt-BR'),
      product: mov.productId, // Idealmente pegar o nome do produto
      type: mov.type,
      reason: mov.reason,
      quantity: mov.quantity,
      previousStock: mov.previousStock,
      newStock: mov.newStock,
      unitPrice: mov.unitPrice || 0,
      totalPrice: mov.totalPrice || 0,
      notes: mov.notes || '',
    });
  });

  // Formatação de moeda
  worksheet.getColumn('unitPrice').numFmt = 'R$ #,##0.00';
  worksheet.getColumn('totalPrice').numFmt = 'R$ #,##0.00';

  // Gerar arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `movimentacoes_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportMovementsToPDF(movements: StockMovement[]) {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text('Relatório de Movimentações', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);

  const tableData = movements.map((m) => [
    new Date(m.createdAt).toLocaleDateString('pt-BR'),
    m.type,
    m.reason,
    m.quantity,
    m.previousStock,
    m.newStock,
    `R$ ${(m.totalPrice || 0).toFixed(2)}`,
  ]);

  autoTable(doc, {
    head: [['Data', 'Tipo', 'Motivo', 'Qtd', 'Est. Ant.', 'Est. Novo', 'Valor']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
  });

  doc.save(`movimentacoes_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ============================================
// EXPORTAÇÃO DE ALERTAS
// ============================================

export function exportAlertsToPDF(alerts: StockAlert[]) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(239, 68, 68);
  doc.text('Relatório de Alertas de Estoque', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);

  const tableData = alerts.map((a) => [
    a.type,
    a.productId, // Idealmente pegar nome do produto
    a.currentStock || 0,
    a.minimumStock || 0,
    a.status,
    new Date(a.createdAt).toLocaleDateString('pt-BR'),
  ]);

  autoTable(doc, {
    head: [['Tipo', 'Produto', 'Estoque Atual', 'Estoque Mín.', 'Status', 'Data']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [239, 68, 68], textColor: 255 },
    alternateRowStyles: { fillColor: [254, 242, 242] },
  });

  doc.save(`alertas_${new Date().toISOString().split('T')[0]}.pdf`);
}
