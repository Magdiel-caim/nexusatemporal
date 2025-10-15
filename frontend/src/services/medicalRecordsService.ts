import api from './api';

export interface MedicalRecord {
  id: string;
  recordNumber: string;
  leadId: string;
  fullName: string;
  birthDate?: Date;
  cpf?: string;
  rg?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bloodType?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  previousSurgeries?: string[];
  familyHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  generalNotes?: string;
  medicalNotes?: string;
  createdBy?: string;
  updatedBy?: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lead?: any;
  anamnesisList?: Anamnesis[];
  procedureHistory?: ProcedureHistory[];
}

export interface Anamnesis {
  id: string;
  medicalRecordId: string;
  appointmentId?: string;
  complaintMain?: string;
  complaintHistory?: string;
  smoker?: boolean;
  alcoholConsumption?: string;
  physicalActivity?: string;
  sleepHours?: number;
  waterIntake?: number;
  skinType?: string;
  skinIssues?: string[];
  cosmeticsUsed?: string[];
  previousAestheticProcedures?: string[];
  expectations?: string;
  hasDiabetes?: boolean;
  hasHypertension?: boolean;
  hasHeartDisease?: boolean;
  hasThyroidIssues?: boolean;
  isPregnant?: boolean;
  isBreastfeeding?: boolean;
  menstrualCycleRegular?: boolean;
  usesContraceptive?: boolean;
  professionalObservations?: string;
  treatmentPlan?: string;
  photos?: string[];
  documents?: string[];
  performedBy?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  medicalRecord?: MedicalRecord;
  professional?: any;
}

export interface ProcedureHistory {
  id: string;
  medicalRecordId: string;
  appointmentId?: string;
  procedureId: string;
  procedureDate: Date;
  durationMinutes?: number;
  professionalId?: string;
  productsUsed?: string[];
  equipmentUsed?: string[];
  techniqueDescription?: string;
  areasTreated?: string[];
  beforePhotos?: string[];
  afterPhotos?: string[];
  patientReaction?: string;
  professionalNotes?: string;
  resultsDescription?: string;
  complications?: string;
  nextSessionRecommendation?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  medicalRecord?: MedicalRecord;
  procedure?: any;
  professional?: any;
}

export interface CreateMedicalRecordDto {
  leadId: string;
  fullName: string;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bloodType?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  previousSurgeries?: string[];
  familyHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  generalNotes?: string;
}

export interface CreateAnamnesisDto {
  medicalRecordId: string;
  appointmentId?: string;
  complaintMain?: string;
  complaintHistory?: string;
  smoker?: boolean;
  alcoholConsumption?: string;
  physicalActivity?: string;
  sleepHours?: number;
  waterIntake?: number;
  skinType?: string;
  skinIssues?: string[];
  cosmeticsUsed?: string[];
  previousAestheticProcedures?: string[];
  expectations?: string;
  hasDiabetes?: boolean;
  hasHypertension?: boolean;
  hasHeartDisease?: boolean;
  hasThyroidIssues?: boolean;
  isPregnant?: boolean;
  isBreastfeeding?: boolean;
  menstrualCycleRegular?: boolean;
  usesContraceptive?: boolean;
  professionalObservations?: string;
  treatmentPlan?: string;
  photos?: string[];
  documents?: string[];
}

export interface CreateProcedureHistoryDto {
  medicalRecordId: string;
  appointmentId?: string;
  procedureId: string;
  procedureDate: string;
  durationMinutes?: number;
  professionalId?: string;
  productsUsed?: string[];
  equipmentUsed?: string[];
  techniqueDescription?: string;
  areasTreated?: string[];
  beforePhotos?: string[];
  afterPhotos?: string[];
  patientReaction?: string;
  professionalNotes?: string;
  resultsDescription?: string;
  complications?: string;
  nextSessionRecommendation?: string;
}

class MedicalRecordsService {
  // ========== PRONTUÁRIOS ==========

  async createMedicalRecord(data: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const response = await api.post<{ success: boolean; data: MedicalRecord }>(
      '/medical-records',
      data
    );
    return response.data.data;
  }

  async getAllMedicalRecords(): Promise<MedicalRecord[]> {
    const response = await api.get<{ success: boolean; data: MedicalRecord[] }>(
      '/medical-records'
    );
    return response.data.data;
  }

  async getMedicalRecordById(id: string): Promise<MedicalRecord> {
    const response = await api.get<{ success: boolean; data: MedicalRecord }>(
      `/medical-records/${id}`
    );
    return response.data.data;
  }

  async getMedicalRecordComplete(id: string): Promise<MedicalRecord> {
    const response = await api.get<{ success: boolean; data: MedicalRecord }>(
      `/medical-records/${id}/complete`
    );
    return response.data.data;
  }

  async getMedicalRecordByLeadId(leadId: string): Promise<MedicalRecord> {
    const response = await api.get<{ success: boolean; data: MedicalRecord }>(
      `/medical-records/lead/${leadId}`
    );
    return response.data.data;
  }

  async updateMedicalRecord(
    id: string,
    data: Partial<CreateMedicalRecordDto>
  ): Promise<MedicalRecord> {
    const response = await api.put<{ success: boolean; data: MedicalRecord }>(
      `/medical-records/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteMedicalRecord(id: string): Promise<void> {
    await api.delete(`/medical-records/${id}`);
  }

  // ========== ANAMNESE ==========

  async createAnamnesis(data: CreateAnamnesisDto): Promise<Anamnesis> {
    const response = await api.post<{ success: boolean; data: Anamnesis }>(
      '/medical-records/anamnesis',
      data
    );
    return response.data.data;
  }

  async getAnamnesisListByMedicalRecord(medicalRecordId: string): Promise<Anamnesis[]> {
    const response = await api.get<{ success: boolean; data: Anamnesis[] }>(
      `/medical-records/${medicalRecordId}/anamnesis`
    );
    return response.data.data;
  }

  async getAnamnesisById(id: string): Promise<Anamnesis> {
    const response = await api.get<{ success: boolean; data: Anamnesis }>(
      `/medical-records/anamnesis/${id}`
    );
    return response.data.data;
  }

  // ========== HISTÓRICO DE PROCEDIMENTOS ==========

  async createProcedureHistory(data: CreateProcedureHistoryDto): Promise<ProcedureHistory> {
    const response = await api.post<{ success: boolean; data: ProcedureHistory }>(
      '/medical-records/procedure-history',
      data
    );
    return response.data.data;
  }

  async getProcedureHistoryByMedicalRecord(medicalRecordId: string): Promise<ProcedureHistory[]> {
    const response = await api.get<{ success: boolean; data: ProcedureHistory[] }>(
      `/medical-records/${medicalRecordId}/procedure-history`
    );
    return response.data.data;
  }

  async getProcedureHistoryById(id: string): Promise<ProcedureHistory> {
    const response = await api.get<{ success: boolean; data: ProcedureHistory }>(
      `/medical-records/procedure-history/${id}`
    );
    return response.data.data;
  }
}

export default new MedicalRecordsService();
