import { User, Phone, Mail, MapPin, Calendar, FileText, CreditCard } from 'lucide-react';
import { Patient } from '../../services/pacienteService';

interface DadosPessoaisTabProps {
  patient: Patient;
  onUpdate?: (patientId: string) => void;
}

export default function DadosPessoaisTab({ patient }: DadosPessoaisTabProps) {
  const formatDate = (date?: string): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone?: string): string => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatCpf = (cpf?: string): string => {
    if (!cpf) return '-';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return cpf;
  };

  const formatCep = (cep?: string): string => {
    if (!cep) return '-';
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return cep;
  };

  const getGenderLabel = (gender?: string): string => {
    const genderMap: Record<string, string> = {
      male: 'Masculino',
      female: 'Feminino',
      other: 'Outro',
      not_informed: 'Não informado',
    };
    return gender ? genderMap[gender] || gender : '-';
  };

  const calculateAge = (birthDate?: string): string => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  return (
    <div className="space-y-6">
      {/* Informações Pessoais */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <User className="w-5 h-5" />
          Informações Pessoais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Nome Completo
            </label>
            <p className="text-gray-900 dark:text-white">{patient.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Status
            </label>
            <span
              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                patient.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {patient.status === 'active' ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              CPF
            </label>
            <p className="text-gray-900 dark:text-white">{formatCpf(patient.cpf)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              RG
            </label>
            <p className="text-gray-900 dark:text-white">{patient.rg || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Data de Nascimento
            </label>
            <p className="text-gray-900 dark:text-white">
              {formatDate(patient.birthDate)}
              {patient.birthDate && (
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  ({calculateAge(patient.birthDate)})
                </span>
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Gênero
            </label>
            <p className="text-gray-900 dark:text-white">{getGenderLabel(patient.gender)}</p>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <Phone className="w-5 h-5" />
          Contato
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              WhatsApp
            </label>
            <p className="text-gray-900 dark:text-white">{formatPhone(patient.whatsapp)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Telefone Emergência
            </label>
            <p className="text-gray-900 dark:text-white">{formatPhone(patient.emergencyPhone)}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <p className="text-gray-900 dark:text-white">{patient.email || '-'}</p>
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <MapPin className="w-5 h-5" />
          Endereço
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              CEP
            </label>
            <p className="text-gray-900 dark:text-white">{formatCep(patient.zipCode)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Rua
            </label>
            <p className="text-gray-900 dark:text-white">{patient.street || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Número
            </label>
            <p className="text-gray-900 dark:text-white">{patient.number || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Complemento
            </label>
            <p className="text-gray-900 dark:text-white">{patient.complement || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Bairro
            </label>
            <p className="text-gray-900 dark:text-white">{patient.neighborhood || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Cidade
            </label>
            <p className="text-gray-900 dark:text-white">{patient.city || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Estado
            </label>
            <p className="text-gray-900 dark:text-white">{patient.state || '-'}</p>
          </div>
        </div>
      </div>

      {/* Observações */}
      {patient.notes && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <FileText className="w-5 h-5" />
            Observações
          </h3>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{patient.notes}</p>
          </div>
        </div>
      )}

      {/* Metadados */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Informações do Sistema
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Cadastrado em
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(patient.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Última atualização
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(patient.updatedAt).toLocaleString('pt-BR')}
            </p>
          </div>

          {patient.source && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Origem
              </label>
              <p className="text-gray-900 dark:text-white">{patient.source}</p>
            </div>
          )}

          {patient.sourceId && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                ID Origem
              </label>
              <p className="text-gray-900 dark:text-white font-mono text-xs">{patient.sourceId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
