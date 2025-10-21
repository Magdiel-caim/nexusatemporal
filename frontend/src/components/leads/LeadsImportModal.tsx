import { useState, useRef } from 'react';
import { importLeads, ImportResult } from '@/utils/leadsImport';
import { leadsService } from '@/services/leadsService';
import toast from 'react-hot-toast';

interface LeadsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LeadsImportModal({ isOpen, onClose, onSuccess }: LeadsImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
      setStep('upload');
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error('Selecione um arquivo');
      return;
    }

    setImporting(true);
    try {
      const result = await importLeads(file);
      setImportResult(result);
      setStep('preview');

      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} erro(s) encontrado(s)`);
      } else {
        toast.success(`${result.validRows} lead(s) prontos para importar`);
      }
    } catch (error: any) {
      toast.error(`Erro ao processar arquivo: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    if (!importResult || importResult.leads.length === 0) {
      toast.error('Nenhum lead para importar');
      return;
    }

    setImporting(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      // Importar leads um por um
      for (const lead of importResult.leads) {
        try {
          await leadsService.createLead(lead as any);
          successCount++;
        } catch (error: any) {
          errors.push(`Erro ao importar ${lead.name}: ${error.message}`);
        }
      }

      // Mostrar resultado
      if (successCount > 0) {
        toast.success(`${successCount} lead(s) importado(s) com sucesso`);
        onSuccess();
      }

      if (errors.length > 0) {
        toast.error(`${errors.length} erro(s) ao importar alguns leads`);
      }

      setStep('result');
      setImportResult({
        ...importResult,
        success: errors.length === 0,
        errors: [...importResult.errors, ...errors],
        validRows: successCount,
      });
    } catch (error: any) {
      toast.error(`Erro ao importar leads: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    setStep('upload');
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setImportResult(null);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Importar Leads
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={importing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Selecione o arquivo
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.json"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Formatos suportados: .xlsx, .xls, .csv, .json
                </p>
              </div>

              {file && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instruções */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                  ℹ️ Instruções de Importação
                </h3>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                  <li>O campo <strong>Nome</strong> é obrigatório</li>
                  <li>Campos opcionais: Telefone, WhatsApp, Email, Cidade, etc.</li>
                  <li>Cabeçalhos podem estar em português ou inglês</li>
                  <li>O sistema aceita variações de nomes (ex: "Nome", "name", "NOME")</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && importResult && (
            <div className="space-y-4">
              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Linhas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{importResult.totalRows}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-green-600 dark:text-green-400">Leads Válidos</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-300">{importResult.validRows}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <p className="text-sm text-red-600 dark:text-red-400">Erros</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-300">{importResult.errors.length}</p>
                </div>
              </div>

              {/* Erros */}
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <h3 className="text-sm font-medium text-red-900 dark:text-red-300 mb-2">
                    ⚠️ Erros Encontrados
                  </h3>
                  <ul className="text-xs text-red-800 dark:text-red-400 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview dos primeiros leads */}
              {importResult.leads.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Preview dos Leads (primeiros 5)
                  </h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Nome</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Telefone</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Email</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Cidade</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {importResult.leads.slice(0, 5).map((lead, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{lead.name}</td>
                              <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{lead.phone || '-'}</td>
                              <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{lead.email || '-'}</td>
                              <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{lead.city || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {importResult.leads.length > 5 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      ... e mais {importResult.leads.length - 5} lead(s)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && importResult && (
            <div className="space-y-4">
              <div className="text-center py-8">
                {importResult.success ? (
                  <>
                    <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Importação Concluída!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {importResult.validRows} lead(s) importado(s) com sucesso
                    </p>
                  </>
                ) : (
                  <>
                    <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Importação Parcial
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {importResult.validRows} lead(s) importado(s), {importResult.errors.length} erro(s)
                    </p>
                  </>
                )}
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h3 className="text-sm font-medium text-red-900 dark:text-red-300 mb-2">
                    Erros Durante a Importação
                  </h3>
                  <ul className="text-xs text-red-800 dark:text-red-400 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
          {step === 'upload' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                disabled={importing}
              >
                Cancelar
              </button>
              <button
                onClick={handlePreview}
                disabled={!file || importing}
                className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Processando...' : 'Analisar Arquivo'}
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                disabled={importing}
              >
                Voltar
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !importResult || importResult.leads.length === 0}
                className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importando...' : `Importar ${importResult?.validRows || 0} Lead(s)`}
              </button>
            </>
          )}

          {step === 'result' && (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Importar Outro Arquivo
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                Fechar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
