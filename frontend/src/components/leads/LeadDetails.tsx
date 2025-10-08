import { useState } from 'react';
import { Lead, Stage, leadsService } from '@/services/leadsService';
import LeadForm from './LeadForm';
import ActivitiesTimeline from './ActivitiesTimeline';
import ActivityForm from './ActivityForm';
import Modal from '@/components/ui/Modal';
import { FileText, Clock, Plus } from 'lucide-react';

interface LeadDetailsProps {
  lead?: Lead;
  stages: Stage[];
  onSubmit: (data: Partial<Lead>) => Promise<void>;
  onClose: () => void;
}

type TabType = 'details' | 'activities';

export default function LeadDetails({ lead, stages, onSubmit, onClose }: LeadDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleActivitySubmit = async (data: any) => {
    if (!lead) return;

    await leadsService.createActivity(lead.id, data);
    setShowActivityForm(false);
    // Refresh activities timeline by changing key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      {/* Header com Abas e Ação */}
      <div className="flex items-center justify-between border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'details'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Detalhes
          </button>
          {lead && (
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'activities'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              Histórico
            </button>
          )}
        </div>

        {/* Botão Nova Atividade - apenas na aba Detalhes */}
        {activeTab === 'details' && lead && (
          <button
            onClick={() => setShowActivityForm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Atividade
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'details' && (
          <div className="space-y-6">
            <LeadForm
              onSubmit={onSubmit}
              onCancel={onClose}
              initialData={lead}
              stages={stages}
            />

            {/* Atividades Manuais - apenas se lead já existe */}
            {lead && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Atividades e Follow-ups
                </h3>
                <ActivitiesTimeline
                  key={`activities-${refreshKey}`}
                  leadId={lead.id}
                  showOnlyHistory={false}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'activities' && lead && (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Histórico de alterações e atividades realizadas neste lead
              </p>
            </div>
            <ActivitiesTimeline
              key={`history-${refreshKey}`}
              leadId={lead.id}
              showOnlyHistory={true}
            />
          </div>
        )}
      </div>

      {/* Modal para Adicionar Atividade */}
      {showActivityForm && (
        <Modal
          isOpen={showActivityForm}
          onClose={() => setShowActivityForm(false)}
          title="Nova Atividade"
          size="md"
        >
          <ActivityForm
            onSubmit={handleActivitySubmit}
            onCancel={() => setShowActivityForm(false)}
          />
        </Modal>
      )}
    </div>
  );
}
