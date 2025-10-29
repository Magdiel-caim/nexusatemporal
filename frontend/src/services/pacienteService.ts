import api from './api';

export interface Patient {
  id: string;
  tenantId: string;
  name: string;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  gender?: string;
  whatsapp?: string;
  emergencyPhone?: string;
  email?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  notes?: string;
  profilePhotoUrl?: string;
  status: 'active' | 'inactive';
  source?: string;
  sourceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientImage {
  id: string;
  patientId: string;
  tenantId: string;
  type: 'profile' | 'before' | 'after' | 'document' | 'procedure';
  category?: string;
  imageUrl: string;
  s3Key: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  procedureName?: string;
  pairedImageId?: string;
  signedUrl?: string;
  createdAt: string;
}

export interface PatientMedicalRecord {
  id: string;
  patientId: string;
  tenantId: string;
  serviceDate: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  observations?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  revisionNumber: number;
  revisedAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
}

export interface SearchParams {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface PatientsResponse {
  patients: Patient[];
  total: number;
}

class PacienteService {
  /**
   * Buscar todos os pacientes
   */
  async getAll(params?: SearchParams): Promise<PatientsResponse> {
    const response = await api.get('/pacientes', { params });
    return response.data;
  }

  /**
   * Buscar paciente por ID
   */
  async getById(id: string): Promise<Patient> {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  }

  /**
   * Criar novo paciente
   */
  async create(data: Partial<Patient>): Promise<Patient> {
    const response = await api.post('/pacientes', data);
    return response.data;
  }

  /**
   * Atualizar paciente
   */
  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    const response = await api.put(`/pacientes/${id}`, data);
    return response.data;
  }

  /**
   * Deletar paciente (soft delete)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/pacientes/${id}`);
  }

  /**
   * Buscar estatísticas de pacientes
   */
  async getStats(): Promise<PatientStats> {
    const response = await api.get('/pacientes/stats');
    return response.data;
  }

  /**
   * Upload de imagem do paciente
   */
  async uploadImage(
    patientId: string,
    file: File,
    data: {
      type: 'profile' | 'before' | 'after' | 'document' | 'procedure';
      category?: string;
      description?: string;
      procedureName?: string;
    }
  ): Promise<PatientImage> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', data.type);
    if (data.category) formData.append('category', data.category);
    if (data.description) formData.append('description', data.description);
    if (data.procedureName) formData.append('procedureName', data.procedureName);

    const response = await api.post(`/pacientes/${patientId}/imagens`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Listar imagens do paciente
   */
  async getImages(patientId: string, type?: string): Promise<PatientImage[]> {
    const response = await api.get(`/pacientes/${patientId}/imagens`, {
      params: { type },
    });
    return response.data;
  }

  /**
   * Listar prontuários do paciente
   */
  async getMedicalRecords(patientId: string): Promise<PatientMedicalRecord[]> {
    const response = await api.get(`/pacientes/${patientId}/prontuarios`);
    return response.data;
  }

  /**
   * Criar prontuário para o paciente
   */
  async createMedicalRecord(
    patientId: string,
    data: Partial<PatientMedicalRecord>
  ): Promise<PatientMedicalRecord> {
    const response = await api.post(`/pacientes/${patientId}/prontuarios`, data);
    return response.data;
  }

  /**
   * Buscar CEP via API ViaCEP
   */
  async searchCep(cep: string): Promise<{
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
  }> {
    const cleanCep = cep.replace(/\D/g, '');
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return data;
  }
}

export default new PacienteService();
