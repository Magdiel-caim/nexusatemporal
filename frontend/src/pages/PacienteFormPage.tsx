import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Calendar, FileText, Upload, X } from 'lucide-react';
import pacienteService, { Patient } from '../services/pacienteService';

export default function PacienteFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    cpf: '',
    rg: '',
    birthDate: '',
    gender: '',
    whatsapp: '',
    emergencyPhone: '',
    email: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    notes: '',
    status: 'active',
  });

  useEffect(() => {
    if (isEdit && id) {
      loadPatient(id);
    }
  }, [id, isEdit]);

  const loadPatient = async (patientId: string) => {
    try {
      setLoading(true);
      const patient = await pacienteService.getById(patientId);
      setFormData(patient);
      if (patient.profilePhotoUrl) {
        setPhotoPreview(patient.profilePhotoUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar paciente:', error);
      alert('Erro ao carregar dados do paciente');
      navigate('/pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpar erro do campo ao digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
      }
      setFormData(prev => ({ ...prev, cpf: value }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let value = e.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
      if (value.length > 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (value.length > 6) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
      }
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length <= 8) {
      if (value.length > 5) {
        value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
      }
      setFormData(prev => ({ ...prev, zipCode: value }));

      // Buscar CEP automaticamente quando completo
      if (value.replace(/\D/g, '').length === 8) {
        setLoadingCep(true);
        try {
          const data = await pacienteService.searchCep(value.replace(/\D/g, ''));
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
        } catch (error) {
          console.error('Erro ao buscar CEP:', error);
        } finally {
          setLoadingCep(false);
        }
      }
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida');
        return;
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }

      setPhotoFile(file);

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setFormData(prev => ({ ...prev, profilePhotoUrl: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (formData.cpf) {
      const cpfDigits = formData.cpf.replace(/\D/g, '');
      if (cpfDigits.length !== 11) {
        newErrors.cpf = 'CPF inválido';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.whatsapp || formData.whatsapp.replace(/\D/g, '').length < 10) {
      newErrors.whatsapp = 'WhatsApp é obrigatório e deve ser válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar dados
      const dataToSend = {
        ...formData,
        cpf: formData.cpf?.replace(/\D/g, '') || undefined,
        whatsapp: formData.whatsapp?.replace(/\D/g, '') || undefined,
        emergencyPhone: formData.emergencyPhone?.replace(/\D/g, '') || undefined,
        zipCode: formData.zipCode?.replace(/\D/g, '') || undefined,
      };

      let patient: Patient;

      if (isEdit && id) {
        patient = await pacienteService.update(id, dataToSend);
      } else {
        patient = await pacienteService.create(dataToSend);
      }

      // Upload da foto se houver
      if (photoFile && patient.id) {
        try {
          await pacienteService.uploadImage(patient.id, photoFile, {
            type: 'profile',
            description: 'Foto de perfil',
          });
        } catch (error) {
          console.error('Erro ao fazer upload da foto:', error);
          alert('Paciente salvo, mas houve erro ao fazer upload da foto');
        }
      }

      navigate(`/pacientes/${patient.id}`);
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error);

      if (error.response?.data?.message) {
        alert(`Erro: ${error.response.data.message}`);
      } else {
        alert('Erro ao salvar paciente. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/pacientes')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Editar Paciente' : 'Novo Paciente'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isEdit ? 'Atualize os dados do paciente' : 'Preencha os dados para cadastrar um novo paciente'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto de Perfil */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Foto de Perfil
          </h2>

          <div className="flex items-center gap-6">
            <div className="relative">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Selecionar Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                JPG, PNG ou GIF. Máximo 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Dados Pessoais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 ${
                  errors.name ? 'border-red-500' : ''
                }`}
                placeholder="Digite o nome completo"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CPF</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleCpfChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 ${
                  errors.cpf ? 'border-red-500' : ''
                }`}
                placeholder="000.000.000-00"
              />
              {errors.cpf && (
                <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">RG</label>
              <input
                type="text"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                placeholder="00.000.000-0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Nascimento
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gênero</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Selecione</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
                <option value="not_informed">Prefiro não informar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contato
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handlePhoneChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 ${
                  errors.whatsapp ? 'border-red-500' : ''
                }`}
                placeholder="(00) 00000-0000"
              />
              {errors.whatsapp && (
                <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefone Emergência</label>
              <input
                type="text"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 ${
                  errors.email ? 'border-red-500' : ''
                }`}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">CEP</label>
              <div className="relative">
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleCepChange}
                  className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                  placeholder="00000-000"
                />
                {loadingCep && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                O endereço será preenchido automaticamente
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rua</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                placeholder="Nome da rua"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Número</label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                placeholder="123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Complemento</label>
              <input
                type="text"
                name="complement"
                value={formData.complement}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                placeholder="Apto, Bloco, etc"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bairro</label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                placeholder="Nome do bairro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cidade</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                placeholder="Nome da cidade"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Observações
          </h2>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
            placeholder="Observações adicionais sobre o paciente..."
          ></textarea>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/pacientes')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? 'Atualizar' : 'Cadastrar'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
