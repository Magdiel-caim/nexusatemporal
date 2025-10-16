import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Lead } from '@/services/leadsService';

// Formatar data para exibição
const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
};

// Formatar telefone
const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  return phone;
};

// Preparar dados para exportação
const prepareLeadData = (leads: Lead[]) => {
  return leads.map(lead => ({
    'Nome': lead.name || '',
    'Telefone': formatPhone(lead.phone),
    'WhatsApp': formatPhone(lead.whatsapp),
    'Email': lead.email || '',
    'Cidade': lead.city || '',
    'Estado': lead.state || '',
    'Bairro': lead.neighborhood || '',
    'Status': lead.status || '',
    'Origem': lead.source || '',
    'Canal': lead.channel || '',
    'Responsável': lead.assignedTo?.name || '',
    'Local de Atendimento': lead.attendanceLocation || '',
    'Situação do Cliente': lead.clientStatus || '',
    'Procedimento': lead.procedure?.name || '',
    'Valor Estimado': lead.estimatedValue ? `R$ ${lead.estimatedValue}` : '',
    'Prioridade': lead.priority || '',
    'Observações': lead.notes || '',
    'Data de Criação': formatDate(lead.createdAt),
    'Última Atualização': formatDate(lead.updatedAt),
  }));
};

// Exportar para PDF
export const exportToPDF = (leads: Lead[], filename: string = 'leads') => {
  const doc = new jsPDF('landscape');

  // Título
  doc.setFontSize(18);
  doc.text('Relatório de Leads', 14, 15);

  // Data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);
  doc.text(`Total de Leads: ${leads.length}`, 14, 27);

  // Tabela com dados principais
  autoTable(doc, {
    startY: 35,
    head: [['Nome', 'Telefone', 'Email', 'Cidade', 'Status', 'Origem', 'Responsável', 'Valor']],
    body: leads.map(lead => [
      lead.name || '',
      formatPhone(lead.phone),
      lead.email || '',
      lead.city || '',
      lead.status || '',
      lead.source || '',
      lead.assignedTo?.name || '',
      lead.estimatedValue ? `R$ ${lead.estimatedValue}` : '',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Salvar PDF
  doc.save(`${filename}.pdf`);
};

// Exportar para XLSX (Excel)
export const exportToXLSX = (leads: Lead[], filename: string = 'leads') => {
  const preparedData = prepareLeadData(leads);

  // Criar worksheet
  const ws = XLSX.utils.json_to_sheet(preparedData);

  // Criar workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');

  // Configurar larguras das colunas
  const colWidths = [
    { wch: 25 }, // Nome
    { wch: 15 }, // Telefone
    { wch: 15 }, // WhatsApp
    { wch: 30 }, // Email
    { wch: 15 }, // Cidade
    { wch: 15 }, // Estágio
    { wch: 15 }, // Status
    { wch: 15 }, // Origem
    { wch: 20 }, // Responsável
    { wch: 20 }, // Local de Atendimento
    { wch: 20 }, // Situação do Cliente
    { wch: 15 }, // Valor Estimado
    { wch: 30 }, // Detalhes da Visita
    { wch: 30 }, // Observações
    { wch: 15 }, // Data de Criação
    { wch: 15 }, // Última Atualização
  ];
  ws['!cols'] = colWidths;

  // Gerar arquivo
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};

// Exportar para CSV
export const exportToCSV = (leads: Lead[], filename: string = 'leads') => {
  const preparedData = prepareLeadData(leads);

  // Criar worksheet
  const ws = XLSX.utils.json_to_sheet(preparedData);

  // Converter para CSV
  const csv = XLSX.utils.sheet_to_csv(ws);

  // Criar blob e fazer download
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }); // \uFEFF = BOM para UTF-8
  saveAs(blob, `${filename}.csv`);
};

// Exportar para JSON
export const exportToJSON = (leads: Lead[], filename: string = 'leads') => {
  const preparedData = leads.map(lead => ({
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    phone2: lead.phone2,
    whatsapp: lead.whatsapp,
    email: lead.email,
    city: lead.city,
    state: lead.state,
    neighborhood: lead.neighborhood,
    stageId: lead.stageId,
    status: lead.status,
    priority: lead.priority,
    source: lead.source,
    channel: lead.channel,
    assignedToId: lead.assignedToId,
    procedureId: lead.procedureId,
    attendanceLocation: lead.attendanceLocation,
    clientStatus: lead.clientStatus,
    estimatedValue: lead.estimatedValue,
    expectedCloseDate: lead.expectedCloseDate,
    notes: lead.notes,
    tags: lead.tags,
    company: lead.company,
    position: lead.position,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  }));

  const json = JSON.stringify(preparedData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, `${filename}.json`);
};

// Função única para exportar baseado no formato
export const exportLeads = (leads: Lead[], format: 'pdf' | 'xlsx' | 'csv' | 'json', filename?: string) => {
  const defaultFilename = `leads_${new Date().toISOString().split('T')[0]}`;
  const finalFilename = filename || defaultFilename;

  switch (format) {
    case 'pdf':
      exportToPDF(leads, finalFilename);
      break;
    case 'xlsx':
      exportToXLSX(leads, finalFilename);
      break;
    case 'csv':
      exportToCSV(leads, finalFilename);
      break;
    case 'json':
      exportToJSON(leads, finalFilename);
      break;
    default:
      throw new Error(`Formato não suportado: ${format}`);
  }
};
