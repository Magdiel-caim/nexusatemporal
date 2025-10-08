import { useState } from 'react';
import { Lead, Stage } from '@/services/leadsService';

interface DivisionViewProps {
  leads: Lead[];
  stages: Stage[];
  formatCurrency: (value?: number) => string;
  onLeadClick: (lead: Lead) => void;
}

export default function DivisionView({ leads, stages, formatCurrency, onLeadClick }: DivisionViewProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(leads[0] || null);

  const getStageName = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.name || '-';
  };

  const getStageColor = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.color || '#6b7280';
  };

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-18rem)]">
      {/* List Sidebar */}
      <div className="w-96 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            Leads ({leads.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {leads.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Nenhum lead encontrado
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => handleLeadSelect(lead)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedLead?.id === lead.id
                      ? 'bg-primary-50 border-l-4 border-primary-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {lead.name}
                    </h4>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: getStageColor(lead.stageId) }}
                    ></span>
                  </div>
                  {lead.email && (
                    <p className="text-xs text-gray-500 mb-1">{lead.email}</p>
                  )}
                  {lead.estimatedValue && (
                    <p className="text-xs font-semibold text-primary-600">
                      {formatCurrency(lead.estimatedValue)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {selectedLead ? (
          <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedLead.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getStageColor(selectedLead.stageId) + '20',
                        color: getStageColor(selectedLead.stageId),
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: getStageColor(selectedLead.stageId) }}
                      ></span>
                      {getStageName(selectedLead.stageId)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onLeadClick(selectedLead)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  Editar
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Procedure */}
              {selectedLead.procedure && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Procedimento</h3>
                  <span
                    className="inline-flex px-3 py-1.5 text-sm font-medium rounded-md"
                    style={{
                      backgroundColor: selectedLead.procedure.color + '20',
                      color: selectedLead.procedure.color,
                    }}
                  >
                    {selectedLead.procedure.name}
                  </span>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Informações de Contato</h3>
                <div className="space-y-2">
                  {selectedLead.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-gray-900">{selectedLead.email}</span>
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className="text-gray-900">{selectedLead.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Value & Date */}
              <div className="grid grid-cols-2 gap-4">
                {selectedLead.estimatedValue && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Valor Estimado</h3>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatCurrency(selectedLead.estimatedValue)}
                    </p>
                  </div>
                )}
                {selectedLead.expectedCloseDate && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Data Esperada</h3>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(selectedLead.expectedCloseDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Observações</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {selectedLead.notes}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedLead.tags && selectedLead.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Selecione um lead para ver os detalhes
          </div>
        )}
      </div>
    </div>
  );
}
