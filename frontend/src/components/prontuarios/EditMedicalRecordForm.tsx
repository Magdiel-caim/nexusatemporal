import React, { useState } from 'react';
import { X, User, MapPin, Heart, Phone as PhoneIcon, FileText, AlertCircle, Save } from 'lucide-react';
import medicalRecordsService, { MedicalRecord, CreateMedicalRecordDto } from '../../services/medicalRecordsService';

interface EditMedicalRecordFormProps {
  record: MedicalRecord;
  onClose: () => void;
  onSuccess: () => void;
}

const EditMedicalRecordForm: React.FC<EditMedicalRecordFormProps> = ({ record, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pessoal' | 'endereco' | 'medico' | 'emergencia' | 'obs'>('pessoal');

  const [formData, setFormData] = useState<Partial<CreateMedicalRecordDto>>({
    leadId: record.leadId,
    fullName: record.fullName,
    birthDate: record.birthDate ? new Date(record.birthDate).toISOString().split('T')[0] : '',
    cpf: record.cpf || '',
    rg: record.rg || '',
    phone: record.phone || '',
    email: record.email || '',
    address: record.address || '',
    city: record.city || '',
    state: record.state || '',
    zipCode: record.zipCode || '',
    bloodType: record.bloodType || '',
    allergies: record.allergies || [],
    chronicDiseases: record.chronicDiseases || [],
    currentMedications: record.currentMedications || [],
    previousSurgeries: record.previousSurgeries || [],
    familyHistory: record.familyHistory || '',
    emergencyContactName: record.emergencyContactName || '',
    emergencyContactPhone: record.emergencyContactPhone || '',
    emergencyContactRelationship: record.emergencyContactRelationship || '',
    generalNotes: record.generalNotes || '',
  });

  const handleInputChange = (field: keyof CreateMedicalRecordDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayInput = (field: 'allergies' | 'chronicDiseases' | 'currentMedications' | 'previousSurgeries', value: string) => {
    if (value.trim()) {
      const items = value.split(',').map(item => item.trim()).filter(item => item);
      setFormData(prev => ({
        ...prev,
        [field]: items,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: [],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName) {
      setError('Nome completo é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await medicalRecordsService.updateMedicalRecord(record.id, formData);
      onSuccess();
    } catch (err: any) {
      console.error('Erro ao atualizar prontuário:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar prontuário');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'pessoal', label: 'Dados Pessoais', icon: User },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'medico', label: 'Informações Médicas', icon: Heart },
    { id: 'emergencia', label: 'Emergência', icon: PhoneIcon },
    { id: 'obs', label: 'Observações', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Editar Prontuário</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Nº {record.recordNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <AlertCircle className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Dados Pessoais */}
            {activeTab === 'pessoal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      RG
                    </label>
                    <input
                      type="text"
                      value={formData.rg}
                      onChange={(e) => handleInputChange('rg', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Endereço */}
            {activeTab === 'endereco' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço Completo
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    placeholder="Rua, número, complemento"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="SP"
                      maxLength={2}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="00000-000"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Informações Médicas */}
            {activeTab === 'medico' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Sanguíneo
                  </label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => handleInputChange('bloodType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alergias <span className="text-xs text-gray-500 dark:text-gray-300">(separar por vírgula)</span>
                  </label>
                  <textarea
                    value={formData.allergies?.join(', ') || ''}
                    onChange={(e) => handleArrayInput('allergies', e.target.value)}
                    rows={2}
                    placeholder="Ex: Dipirona, Penicilina, Látex"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doenças Crônicas <span className="text-xs text-gray-500 dark:text-gray-300">(separar por vírgula)</span>
                  </label>
                  <textarea
                    value={formData.chronicDiseases?.join(', ') || ''}
                    onChange={(e) => handleArrayInput('chronicDiseases', e.target.value)}
                    rows={2}
                    placeholder="Ex: Diabetes, Hipertensão"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicações Atuais <span className="text-xs text-gray-500 dark:text-gray-300">(separar por vírgula)</span>
                  </label>
                  <textarea
                    value={formData.currentMedications?.join(', ') || ''}
                    onChange={(e) => handleArrayInput('currentMedications', e.target.value)}
                    rows={2}
                    placeholder="Ex: Losartana 50mg, Metformina 500mg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cirurgias Anteriores <span className="text-xs text-gray-500 dark:text-gray-300">(separar por vírgula)</span>
                  </label>
                  <textarea
                    value={formData.previousSurgeries?.join(', ') || ''}
                    onChange={(e) => handleArrayInput('previousSurgeries', e.target.value)}
                    rows={2}
                    placeholder="Ex: Apendicectomia (2015), Cesariana (2018)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Histórico Familiar
                  </label>
                  <textarea
                    value={formData.familyHistory}
                    onChange={(e) => handleInputChange('familyHistory', e.target.value)}
                    rows={3}
                    placeholder="Doenças relevantes na família..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Emergência */}
            {activeTab === 'emergencia' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Contato de Emergência
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone do Contato de Emergência
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relacionamento
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                    placeholder="Ex: Mãe, Cônjuge, Filho(a)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Observações */}
            {activeTab === 'obs' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações Gerais
                  </label>
                  <textarea
                    value={formData.generalNotes}
                    onChange={(e) => handleInputChange('generalNotes', e.target.value)}
                    rows={8}
                    placeholder="Informações adicionais relevantes..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicalRecordForm;
