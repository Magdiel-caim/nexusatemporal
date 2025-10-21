import React from 'react';
import {
  ArrowLeft,
  Edit,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  FileText,
  Droplet,
  Activity,
  Users,
} from 'lucide-react';
import { MedicalRecord } from '../../services/medicalRecordsService';

interface ViewMedicalRecordProps {
  record: MedicalRecord;
  onBack: () => void;
  onEdit?: () => void;
}

const ViewMedicalRecord: React.FC<ViewMedicalRecordProps> = ({ record, onBack, onEdit }) => {
  const InfoRow = ({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: any }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2">
        {Icon && <Icon className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" size={18} />}
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
        </div>
      </div>
    );
  };

  const Badge = ({ children, color = 'blue' }: { children: React.ReactNode; color?: string }) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      red: 'bg-red-100 text-red-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[color as keyof typeof colors] || colors.blue}`}>
        {children}
      </span>
    );
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-800 dark:text-white border-b dark:border-gray-700 pb-3">
        <Icon className="text-purple-600 dark:text-purple-400" size={22} />
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit size={18} />
                Editar Prontuário
              </button>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <User className="text-purple-600 dark:text-purple-400" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{record.fullName}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Prontuário: {record.recordNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              {record.birthDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-gray-400 dark:text-gray-500" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    Nascimento: {new Date(record.birthDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {record.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="text-gray-400 dark:text-gray-500" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">{record.phone}</span>
                </div>
              )}
              {record.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="text-gray-400 dark:text-gray-500" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">{record.email}</span>
                </div>
              )}
              {record.bloodType && (
                <div className="flex items-center gap-2 text-sm">
                  <Droplet className="text-red-500 dark:text-red-400" size={16} />
                  <Badge color="red">{record.bloodType}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Pessoais */}
        <Section title="Dados Pessoais" icon={User}>
          <div className="space-y-1">
            <InfoRow label="CPF" value={record.cpf} />
            <InfoRow label="RG" value={record.rg} />
            <InfoRow label="Telefone" value={record.phone} icon={Phone} />
            <InfoRow label="E-mail" value={record.email} icon={Mail} />
          </div>
        </Section>

        {/* Endereço */}
        <Section title="Endereço" icon={MapPin}>
          <div className="space-y-1">
            <InfoRow label="Endereço Completo" value={record.address} />
            <InfoRow label="Cidade" value={record.city} />
            <InfoRow label="Estado" value={record.state} />
            <InfoRow label="CEP" value={record.zipCode} />
          </div>
          {!record.address && !record.city && (
            <p className="text-gray-400 dark:text-gray-500 text-sm italic">Nenhum endereço cadastrado</p>
          )}
        </Section>

        {/* Informações Médicas */}
        <Section title="Informações Médicas" icon={Heart}>
          <div className="space-y-4">
            {record.bloodType && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Tipo Sanguíneo</div>
                <Badge color="red">{record.bloodType}</Badge>
              </div>
            )}

            {record.allergies && record.allergies.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                  <AlertTriangle className="text-red-500" size={16} />
                  Alergias
                </div>
                <div className="flex flex-wrap gap-2">
                  {record.allergies.map((allergy, idx) => (
                    <Badge key={idx} color="red">{allergy}</Badge>
                  ))}
                </div>
              </div>
            )}

            {record.chronicDiseases && record.chronicDiseases.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Doenças Crônicas</div>
                <div className="flex flex-wrap gap-2">
                  {record.chronicDiseases.map((disease, idx) => (
                    <Badge key={idx} color="yellow">{disease}</Badge>
                  ))}
                </div>
              </div>
            )}

            {record.currentMedications && record.currentMedications.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Medicações Atuais</div>
                <div className="flex flex-wrap gap-2">
                  {record.currentMedications.map((med, idx) => (
                    <Badge key={idx} color="blue">{med}</Badge>
                  ))}
                </div>
              </div>
            )}

            {record.previousSurgeries && record.previousSurgeries.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Cirurgias Anteriores</div>
                <div className="flex flex-wrap gap-2">
                  {record.previousSurgeries.map((surgery, idx) => (
                    <Badge key={idx} color="purple">{surgery}</Badge>
                  ))}
                </div>
              </div>
            )}

            {record.familyHistory && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Histórico Familiar</div>
                <p className="text-gray-700 dark:text-gray-300">{record.familyHistory}</p>
              </div>
            )}
          </div>
        </Section>

        {/* Contato de Emergência */}
        <Section title="Contato de Emergência" icon={Users}>
          <div className="space-y-1">
            <InfoRow label="Nome" value={record.emergencyContactName} icon={User} />
            <InfoRow label="Telefone" value={record.emergencyContactPhone} icon={Phone} />
            <InfoRow label="Relacionamento" value={record.emergencyContactRelationship} />
          </div>
          {!record.emergencyContactName && (
            <p className="text-gray-400 dark:text-gray-500 text-sm italic">Nenhum contato de emergência cadastrado</p>
          )}
        </Section>

        {/* Observações */}
        {record.generalNotes && (
          <div className="lg:col-span-2">
            <Section title="Observações Gerais" icon={FileText}>
              <p className="text-gray-700 whitespace-pre-wrap">{record.generalNotes}</p>
            </Section>
          </div>
        )}

        {/* Anamneses e Procedimentos */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="Anamneses" icon={FileText}>
            {record.anamnesisList && record.anamnesisList.length > 0 ? (
              <div className="space-y-3">
                {record.anamnesisList.map((anamnesis) => (
                  <div key={anamnesis.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(anamnesis.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    {anamnesis.complaintMain && (
                      <div className="mt-1 text-gray-900 dark:text-white font-medium">{anamnesis.complaintMain}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-sm italic">Nenhuma anamnese cadastrada</p>
            )}
          </Section>

          <Section title="Histórico de Procedimentos" icon={Activity}>
            {record.procedureHistory && record.procedureHistory.length > 0 ? (
              <div className="space-y-3">
                {record.procedureHistory.map((procedure) => (
                  <div key={procedure.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(procedure.procedureDate).toLocaleDateString('pt-BR')}
                    </div>
                    {procedure.resultsDescription && (
                      <div className="mt-1 text-gray-900 dark:text-white">{procedure.resultsDescription}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-sm italic">Nenhum procedimento registrado</p>
            )}
          </Section>
        </div>

        {/* Metadados */}
        <div className="lg:col-span-2">
          <Section title="Informações do Sistema" icon={Activity}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Criado em</div>
                <div className="font-medium text-gray-900">
                  {new Date(record.createdAt).toLocaleString('pt-BR')}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Última atualização</div>
                <div className="font-medium text-gray-900">
                  {new Date(record.updatedAt).toLocaleString('pt-BR')}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div>
                  <Badge color={record.isActive ? 'green' : 'red'}>
                    {record.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default ViewMedicalRecord;
