"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
let ExportService = class ExportService {
    /**
     * Exportar relatório em diferentes formatos
     */
    async exportReport(reportData, options) {
        switch (options.format) {
            case 'pdf':
                return this.exportToPdf(reportData, options);
            case 'excel':
                return this.exportToExcel(reportData, options);
            case 'csv':
                return this.exportToCsv(reportData, options);
            default:
                throw new Error(`Formato ${options.format} não suportado`);
        }
    }
    /**
     * Exportar para PDF
     * NOTA: Implementação básica - requer biblioteca como puppeteer ou pdfkit
     */
    async exportToPdf(reportData, options) {
        // Gerar HTML do relatório
        const html = this.generateReportHtml(reportData, options);
        // TODO: Implementar geração de PDF com puppeteer ou pdfkit
        // Por enquanto, retornar HTML como buffer
        const buffer = Buffer.from(html, 'utf-8');
        const filename = options.filename || `relatorio-${Date.now()}.pdf`;
        return {
            buffer,
            filename,
            contentType: 'application/pdf',
        };
    }
    /**
     * Exportar para Excel
     * NOTA: Implementação básica - requer biblioteca como exceljs
     */
    async exportToExcel(reportData, options) {
        // TODO: Implementar com exceljs
        // Por enquanto, gerar CSV
        return this.exportToCsv(reportData, options);
    }
    /**
     * Exportar para CSV
     */
    async exportToCsv(reportData, options) {
        let csv = '';
        // Header
        if (options.includeMetadata !== false) {
            csv += `Relatório: ${reportData.title}\n`;
            csv += `Gerado em: ${reportData.generatedAt.toLocaleString('pt-BR')}\n`;
            csv += `Período: ${reportData.period.startDate.toLocaleDateString('pt-BR')} a ${reportData.period.endDate.toLocaleDateString('pt-BR')}\n`;
            csv += '\n';
        }
        // Sections
        for (const section of reportData.sections) {
            csv += `${section.title}\n`;
            csv += this.sectionToCsv(section);
            csv += '\n\n';
        }
        const buffer = Buffer.from(csv, 'utf-8');
        const filename = options.filename || `relatorio-${Date.now()}.csv`;
        return {
            buffer,
            filename,
            contentType: 'text/csv',
        };
    }
    /**
     * Converter seção para CSV
     */
    sectionToCsv(section) {
        const { type, data } = section;
        if (!data)
            return '';
        switch (type) {
            case 'kpi':
                return this.kpiToCsv(data);
            case 'table':
                return this.tableToCsv(data);
            case 'chart':
                return this.chartDataToCsv(data);
            case 'text':
                return data + '\n';
            default:
                return '';
        }
    }
    /**
     * Converter KPIs para CSV
     */
    kpiToCsv(data) {
        if (Array.isArray(data)) {
            let csv = 'Nome,Valor,Unidade,Meta,Tendência\n';
            data.forEach((kpi) => {
                csv += `${kpi.name},${kpi.value},${kpi.unit || ''},${kpi.target || ''},${kpi.trend || ''}\n`;
            });
            return csv;
        }
        else if (typeof data === 'object') {
            // Objeto com múltiplos KPIs
            let csv = 'KPI,Nome,Valor,Unidade,Meta,Tendência\n';
            Object.entries(data).forEach(([key, kpi]) => {
                csv += `${key},${kpi.name},${kpi.value},${kpi.unit || ''},${kpi.target || ''},${kpi.trend || ''}\n`;
            });
            return csv;
        }
        return '';
    }
    /**
     * Converter tabela para CSV
     */
    tableToCsv(data) {
        if (!Array.isArray(data) || data.length === 0)
            return '';
        // Headers
        const headers = Object.keys(data[0]);
        let csv = headers.join(',') + '\n';
        // Rows
        data.forEach((row) => {
            const values = headers.map((header) => {
                const value = row[header];
                // Escapar vírgulas e aspas
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value ?? '';
            });
            csv += values.join(',') + '\n';
        });
        return csv;
    }
    /**
     * Converter dados de gráfico para CSV
     */
    chartDataToCsv(data) {
        if (Array.isArray(data)) {
            return this.tableToCsv(data);
        }
        else if (typeof data === 'object') {
            // Converter objeto para array de pares chave-valor
            const array = Object.entries(data).map(([key, value]) => ({
                chave: key,
                valor: value,
            }));
            return this.tableToCsv(array);
        }
        return '';
    }
    /**
     * Gerar HTML do relatório
     */
    generateReportHtml(reportData, options) {
        let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${reportData.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
    }
    .metadata {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .kpi-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
    }
    .kpi-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #6b7280;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    .kpi-trend {
      font-size: 12px;
      margin-top: 5px;
    }
    .trend-up { color: #10b981; }
    .trend-down { color: #ef4444; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>${reportData.title}</h1>

  ${options.includeMetadata !== false
            ? `
  <div class="metadata">
    <p><strong>Gerado em:</strong> ${reportData.generatedAt.toLocaleString('pt-BR')}</p>
    <p><strong>Período:</strong> ${reportData.period.startDate.toLocaleDateString('pt-BR')} a ${reportData.period.endDate.toLocaleDateString('pt-BR')}</p>
    ${reportData.description ? `<p>${reportData.description}</p>` : ''}
  </div>
  `
            : ''}
`;
        // Adicionar seções
        reportData.sections.forEach((section) => {
            html += `<h2>${section.title}</h2>`;
            html += this.sectionToHtml(section, options);
        });
        html += `
  <div class="footer">
    <p>Relatório gerado por Nexus CRM - Business Intelligence</p>
  </div>
</body>
</html>
`;
        return html;
    }
    /**
     * Converter seção para HTML
     */
    sectionToHtml(section, options) {
        const { type, data } = section;
        if (!data)
            return '';
        switch (type) {
            case 'kpi':
                return this.kpiToHtml(data);
            case 'table':
                return this.tableToHtml(data);
            case 'chart':
                return options.includeCharts !== false
                    ? this.chartToHtml(data)
                    : '<p><em>Gráfico omitido</em></p>';
            case 'text':
                return `<p>${data}</p>`;
            default:
                return '';
        }
    }
    /**
     * Converter KPIs para HTML
     */
    kpiToHtml(data) {
        if (typeof data === 'object' && !Array.isArray(data)) {
            // Objeto com múltiplos KPIs
            let html = '<div class="kpi-grid">';
            Object.values(data).forEach((kpi) => {
                html += this.singleKpiToHtml(kpi);
            });
            html += '</div>';
            return html;
        }
        else if (Array.isArray(data)) {
            let html = '<div class="kpi-grid">';
            data.forEach((kpi) => {
                html += this.singleKpiToHtml(kpi);
            });
            html += '</div>';
            return html;
        }
        return '';
    }
    singleKpiToHtml(kpi) {
        const trendClass = kpi.trend > 0 ? 'trend-up' : kpi.trend < 0 ? 'trend-down' : '';
        const trendIcon = kpi.trend > 0 ? '▲' : kpi.trend < 0 ? '▼' : '―';
        return `
    <div class="kpi-card">
      <h3>${kpi.name}</h3>
      <div class="kpi-value">${kpi.value.toLocaleString('pt-BR')}${kpi.unit ? ' ' + kpi.unit : ''}</div>
      ${kpi.trend !== undefined
            ? `<div class="kpi-trend ${trendClass}">${trendIcon} ${Math.abs(kpi.trend).toFixed(1)}%</div>`
            : ''}
      ${kpi.target ? `<div style="font-size: 12px; color: #6b7280;">Meta: ${kpi.target}</div>` : ''}
    </div>
    `;
    }
    /**
     * Converter tabela para HTML
     */
    tableToHtml(data) {
        if (!Array.isArray(data) || data.length === 0)
            return '';
        const headers = Object.keys(data[0]);
        let html = '<table><thead><tr>';
        headers.forEach((header) => {
            html += `<th>${this.formatHeaderName(header)}</th>`;
        });
        html += '</tr></thead><tbody>';
        data.forEach((row) => {
            html += '<tr>';
            headers.forEach((header) => {
                const value = row[header];
                html += `<td>${this.formatCellValue(value)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    }
    /**
     * Converter gráfico para HTML (representação tabular)
     */
    chartToHtml(data) {
        if (Array.isArray(data)) {
            return this.tableToHtml(data);
        }
        else if (typeof data === 'object') {
            const array = Object.entries(data).map(([key, value]) => ({
                Item: key,
                Valor: value,
            }));
            return this.tableToHtml(array);
        }
        return '';
    }
    /**
     * Formatar nome de header
     */
    formatHeaderName(name) {
        // Capitalizar e trocar underscores por espaços
        return name
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
    }
    /**
     * Formatar valor de célula
     */
    formatCellValue(value) {
        if (value === null || value === undefined)
            return '-';
        if (typeof value === 'number') {
            return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
        }
        if (value instanceof Date) {
            return value.toLocaleString('pt-BR');
        }
        return String(value);
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)()
], ExportService);
//# sourceMappingURL=export.service.js.map