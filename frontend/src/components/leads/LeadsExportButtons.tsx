import { useState } from 'react';
import { Lead } from '@/services/leadsService';
import { exportLeads } from '@/utils/leadsExport';
import toast from 'react-hot-toast';

interface LeadsExportButtonsProps {
  leads: Lead[];
  selectedLeads?: Lead[];
}

export default function LeadsExportButtons({ leads, selectedLeads }: LeadsExportButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const leadsToExport = selectedLeads && selectedLeads.length > 0 ? selectedLeads : leads;

  const handleExport = async (format: 'pdf' | 'xlsx' | 'csv' | 'json') => {
    if (leadsToExport.length === 0) {
      toast.error('Nenhum lead para exportar');
      return;
    }

    setExporting(true);
    setIsOpen(false);

    try {
      await exportLeads(leadsToExport, format);
      toast.success(`${leadsToExport.length} lead(s) exportado(s) em ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(`Erro ao exportar: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting || leadsToExport.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{exporting ? 'Exportando...' : 'Exportar'}</span>
        {selectedLeads && selectedLeads.length > 0 && (
          <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
            {selectedLeads.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop para fechar dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
            <div className="py-1">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                <span>Exportar como PDF</span>
              </button>

              <button
                onClick={() => handleExport('xlsx')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                <span>Exportar como Excel</span>
              </button>

              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                <span>Exportar como CSV</span>
              </button>

              <button
                onClick={() => handleExport('json')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                <span>Exportar como JSON</span>
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {leadsToExport.length} lead(s) será(ão) exportado(s)
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
