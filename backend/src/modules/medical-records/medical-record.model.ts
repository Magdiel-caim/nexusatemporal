export interface MedicalRecord {
  id: string;
  recordNumber: string;
  leadId: string;

  // Informações Pessoais
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

  // Informações Médicas
  bloodType?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  previousSurgeries?: string[];
  familyHistory?: string;

  // Informações de Emergência
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Observações
  generalNotes?: string;
  medicalNotes?: string;

  // Metadata
  createdBy?: string;
  updatedBy?: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relacionamentos
  lead?: any;
  anamnesisList?: Anamnesis[];
  procedureHistory?: ProcedureHistory[];
}

export interface Anamnesis {
  id: string;
  medicalRecordId: string;
  appointmentId?: string;

  // Informações da Anamnese
  complaintMain?: string;
  complaintHistory?: string;

  // Hábitos de Vida
  smoker?: boolean;
  alcoholConsumption?: string;
  physicalActivity?: string;
  sleepHours?: number;
  waterIntake?: number;

  // Estética Específica
  skinType?: string;
  skinIssues?: string[];
  cosmeticsUsed?: string[];
  previousAestheticProcedures?: string[];
  expectations?: string;

  // Saúde Geral
  hasDiabetes?: boolean;
  hasHypertension?: boolean;
  hasHeartDisease?: boolean;
  hasThyroidIssues?: boolean;
  isPregnant?: boolean;
  isBreastfeeding?: boolean;
  menstrualCycleRegular?: boolean;
  usesContraceptive?: boolean;

  // Observações
  professionalObservations?: string;
  treatmentPlan?: string;

  // Anexos
  photos?: string[];
  documents?: string[];

  // Metadata
  performedBy?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relacionamentos
  medicalRecord?: MedicalRecord;
  appointment?: any;
  professional?: any;
}

export interface ProcedureHistory {
  id: string;
  medicalRecordId: string;
  appointmentId?: string;
  procedureId: string;

  // Informações do Procedimento
  procedureDate: Date;
  durationMinutes?: number;
  professionalId?: string;

  // Detalhes da Execução
  productsUsed?: string[];
  equipmentUsed?: string[];
  techniqueDescription?: string;
  areasTreated?: string[];

  // Observações
  beforePhotos?: string[];
  afterPhotos?: string[];
  patientReaction?: string;
  professionalNotes?: string;

  // Resultados e Follow-up
  resultsDescription?: string;
  complications?: string;
  nextSessionRecommendation?: string;

  // Metadata
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relacionamentos
  medicalRecord?: MedicalRecord;
  appointment?: any;
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
