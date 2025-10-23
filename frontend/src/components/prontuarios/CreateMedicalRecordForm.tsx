import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Heart, Phone as PhoneIcon, FileText, AlertCircle } from 'lucide-react';
import medicalRecordsService, { CreateMedicalRecordDto } from '../../services/medicalRecordsService';
import { leadsService, Lead } from '../../services/leadsService';
import { CepInput, CepInputData } from '@/components/ui/CepInput';

interface CreateMedicalRecordFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMedicalRecordForm: React.FC<CreateMedicalRecordFormProps> = ({ onClose, onSuccess }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchLead, setSearchLead] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pessoal' | 'endereco' | 'medico' | 'emergencia' | 'obs'>('pessoal');

  const [formData, setFormData] = useState<Partial<CreateMedicalRecordDto>>({
    fullName: '',
    birthDate: '',
    cpf: '',
    rg: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bloodType: '',
    allergies: [],
    chronicDiseases: [],
    currentMedications: [],
    previousSurgeries: [],
    familyHistory: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    generalNotes: '',
  });

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    if (selectedLead) {
      setFormData(prev => ({
        ...prev,
        leadId: selectedLead.id,
        fullName: selectedLead.name,
        phone: selectedLead.phone || '',
        email: selectedLead.email || '',
        city: selectedLead.city || '',
        state: selectedLead.state || '',
      }));
    }
  }, [selectedLead]);

  const loadLeads = async () => {
    try {
      const data = await leadsService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchLead.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchLead.toLowerCase()) ||
    lead.phone?.includes(searchLead)
  );

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
    }
  };

  const handleCepFound = (cepData: CepInputData) => {
    setFormData(prev => ({
      ...prev,
      zipCode: cepData.cep,
      address: cepData.street,
      city: cepData.city,
      state: cepData.state,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leadId) {
      setError('Selecione um lead para criar o prontuário');
      return;
    }

    if (!formData.fullName) {
      setError('Nome completo é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await medicalRecordsService.createMedicalRecord(formData as CreateMedicalRecordDto);
      onSuccess();
    } catch (err: any) {
      console.error('Erro ao criar prontuário:', err);
      setError(err.response?.data?.message || 'Erro ao criar prontuário');
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
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Novo Prontuário Médico</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Lead Selection */}
        <div className="p-6 border-b dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Selecionar Paciente (Lead) *
          </label>
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchLead}
            onChange={(e) => setSearchLead(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {searchLead && (
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              {filteredLeads.length === 0 ? (
                <div className="p-4 text-gray-500 dark:text-gray-400 text-sm">Nenhum lead encontrado</div>
              ) : (
                filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => {
                      setSelectedLead(lead);
                      setSearchLead('');
                    }}
                    className="w-full p-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/30 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {lead.email && <span>{lead.email}</span>}
                      {lead.phone && <span className="ml-2">{lead.phone}</span>}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
          {selectedLead && (
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{selectedLead.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedLead.email} • {selectedLead.phone}
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                <X size={20} />
              </button>
            </div>
          )}
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
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-medium'
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Endereço */}
            {activeTab === 'endereco' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CepInput
                    value={formData.zipCode || ''}
                    onChange={(cep) => handleInputChange('zipCode', cep)}
                    onAddressFound={handleCepFound}
                    label="CEP"
                    className="md:col-span-1"
                    autoFetch={true}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Endereço Completo (Rua, número)
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    placeholder="Rua, número, complemento"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    value={formData.allergies?.join(', ')}
                    onChange={(e) => handleArrayInput('allergies', e.target.value)}
                    rows={2}
                    placeholder="Ex: Dipirona, Penicilina, Látex"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doenças Crônicas <span className="text-xs text-gray-500 dark:text-gray-300">(separar por vírgula)</span>
                  </label>
                  <textarea
                    value={formData.chronicDiseases?.join(', ')}
                    onChange={(e) => handleArrayInput('chronicDiseases', e.target.value)}
                    rows={2}
                    placeholder="Ex: Diabetes, Hipertensão"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicações Atuais <span className="text-xs text-gray-500 dark:text-gray-300">(separar por vírgula)</span>
                  </label>
                  <textarea
                    value={formData.currentMedications?.join(', ')}
                    onChange={(e) => handleArrayInput('currentMedications', e.target.value)}
                    rows={2}
                    placeholder="Ex: Losartana 50mg, Metformina 500mg"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cirurgias Anteriores <span className="text-xs text-gray-500 dark:text-gray-300">(separar por vírgula)</span>
                  </label>
                  <textarea
                    value={formData.previousSurgeries?.join(', ')}
                    onChange={(e) => handleArrayInput('previousSurgeries', e.target.value)}
                    rows={2}
                    placeholder="Ex: Apendicectomia (2015), Cesariana (2018)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              disabled={loading || !selectedLead}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Criando...
                </>
              ) : (
                'Criar Prontuário'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMedicalRecordForm;
