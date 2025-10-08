import { Lead, Stage } from '@/services/leadsService';

interface GridViewProps {
  leads: Lead[];
  stages: Stage[];
  formatCurrency: (value?: number) => string;
  onLeadClick: (lead: Lead) => void;
}

export default function GridView({ leads, stages, formatCurrency, onLeadClick }: GridViewProps) {
  const getStageName = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.name || '-';
  };

  const getStageColor = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.color || '#6b7280';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {leads.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-500">
          Nenhum lead encontrado
        </div>
      ) : (
        leads.map((lead) => (
          <div
            key={lead.id}
            onClick={() => onLeadClick(lead)}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
          >
            {/* Header with Stage */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: getStageColor(lead.stageId) + '20',
                  color: getStageColor(lead.stageId),
                }}
              >
                <span
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: getStageColor(lead.stageId) }}
                ></span>
                {getStageName(lead.stageId)}
              </span>
            </div>

            {/* Lead Name */}
            <h4 className="font-semibold text-gray-900 text-base mb-2">
              {lead.name}
            </h4>

            {/* Procedure */}
            {lead.procedure && (
              <div className="mb-2">
                <span
                  className="text-xs px-2 py-1 rounded-md font-medium"
                  style={{
                    backgroundColor: lead.procedure.color + '20',
                    color: lead.procedure.color,
                  }}
                >
                  {lead.procedure.name}
                </span>
              </div>
            )}

            {/* Estimated Value */}
            {lead.estimatedValue && (
              <p className="text-sm font-semibold text-primary-600 mb-3">
                {formatCurrency(lead.estimatedValue)}
              </p>
            )}

            {/* Contact Info */}
            <div className="space-y-1 mb-3">
              {lead.email && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>

            {/* Expected Close Date */}
            {lead.expectedCloseDate && (
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(lead.expectedCloseDate).toLocaleDateString('pt-BR')}
              </div>
            )}

            {/* Tags */}
            {lead.tags && lead.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {lead.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {lead.tags.length > 3 && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    +{lead.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
