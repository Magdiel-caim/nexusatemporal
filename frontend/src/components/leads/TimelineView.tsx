import { Lead, Stage } from '@/services/leadsService';

interface TimelineViewProps {
  leads: Lead[];
  stages: Stage[];
  formatCurrency: (value?: number) => string;
  onLeadClick: (lead: Lead) => void;
}

export default function TimelineView({ leads, stages, formatCurrency, onLeadClick }: TimelineViewProps) {
  const getStageName = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.name || '-';
  };

  const getStageColor = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.color || '#6b7280';
  };

  // Agrupa leads por data
  const groupLeadsByDate = () => {
    const grouped: { [key: string]: Lead[] } = {};

    leads.forEach(lead => {
      const date = lead.expectedCloseDate
        ? new Date(lead.expectedCloseDate).toLocaleDateString('pt-BR')
        : 'Sem data';

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(lead);
    });

    return Object.entries(grouped).sort(([dateA], [dateB]) => {
      if (dateA === 'Sem data') return 1;
      if (dateB === 'Sem data') return -1;
      return new Date(dateA.split('/').reverse().join('-')).getTime() -
             new Date(dateB.split('/').reverse().join('-')).getTime();
    });
  };

  const groupedLeads = groupLeadsByDate();

  return (
    <div className="space-y-6">
      {groupedLeads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhum lead encontrado
        </div>
      ) : (
        groupedLeads.map(([date, dateLeads]) => (
          <div key={date} className="relative">
            {/* Date Header */}
            <div className="sticky top-0 bg-gray-50 border-l-4 border-primary-500 pl-4 py-2 mb-4 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">{date}</h3>
              </div>
              <span className="text-sm text-gray-600">
                {dateLeads.length} {dateLeads.length === 1 ? 'lead' : 'leads'}
              </span>
            </div>

            {/* Leads Cards */}
            <div className="pl-8 space-y-3">
              {dateLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  className="relative bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                >
                  {/* Timeline Dot */}
                  <div
                    className="absolute -left-10 top-6 w-4 h-4 rounded-full border-4 border-white"
                    style={{ backgroundColor: getStageColor(lead.stageId) }}
                  ></div>

                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                      {lead.email && (
                        <p className="text-sm text-gray-500">{lead.email}</p>
                      )}
                    </div>

                    <span
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ml-2"
                      style={{
                        backgroundColor: getStageColor(lead.stageId) + '20',
                        color: getStageColor(lead.stageId),
                      }}
                    >
                      {getStageName(lead.stageId)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {lead.procedure && (
                      <span
                        className="inline-flex px-2 py-1 text-xs font-medium rounded-md"
                        style={{
                          backgroundColor: lead.procedure.color + '20',
                          color: lead.procedure.color,
                        }}
                      >
                        {lead.procedure.name}
                      </span>
                    )}

                    {lead.estimatedValue && (
                      <span className="font-semibold text-primary-600">
                        {formatCurrency(lead.estimatedValue)}
                      </span>
                    )}

                    {lead.phone && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        {lead.phone}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
