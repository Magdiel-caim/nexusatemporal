import { Repository } from 'typeorm';
import { CrmDataSource } from '../../database/data-source';
import {
  MedicalRecord,
  Anamnesis,
  ProcedureHistory,
} from './medical-record.entity';
import {
  CreateMedicalRecordDto,
  CreateAnamnesisDto,
  CreateProcedureHistoryDto,
} from './medical-record.model';

export class MedicalRecordService {
  private medicalRecordRepo: Repository<MedicalRecord>;
  private anamnesisRepo: Repository<Anamnesis>;
  private procedureHistoryRepo: Repository<ProcedureHistory>;

  constructor() {
    this.medicalRecordRepo = CrmDataSource.getRepository(MedicalRecord);
    this.anamnesisRepo = CrmDataSource.getRepository(Anamnesis);
    this.procedureHistoryRepo = CrmDataSource.getRepository(ProcedureHistory);
  }

  // ========== PRONTUÁRIOS ==========

  async createMedicalRecord(
    data: CreateMedicalRecordDto,
    userId: string,
    tenantId: string
  ): Promise<MedicalRecord> {
    const medicalRecord = this.medicalRecordRepo.create({
      leadId: data.leadId,
      fullName: data.fullName,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      cpf: data.cpf,
      rg: data.rg,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      bloodType: data.bloodType,
      allergies: data.allergies,
      chronicDiseases: data.chronicDiseases,
      currentMedications: data.currentMedications,
      previousSurgeries: data.previousSurgeries,
      familyHistory: data.familyHistory,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      emergencyContactRelationship: data.emergencyContactRelationship,
      generalNotes: data.generalNotes,
      createdBy: userId,
      updatedBy: userId,
      tenantId,
    });

    return this.medicalRecordRepo.save(medicalRecord);
  }

  async getMedicalRecordById(id: string, tenantId: string): Promise<MedicalRecord | null> {
    return this.medicalRecordRepo.findOne({
      where: { id, tenantId, isActive: true },
      relations: ['lead', 'creator'],
    });
  }

  async getMedicalRecordByLeadId(leadId: string, tenantId: string): Promise<MedicalRecord | null> {
    return this.medicalRecordRepo.findOne({
      where: { leadId, tenantId, isActive: true },
      relations: ['lead', 'creator'],
    });
  }

  async getAllMedicalRecords(tenantId: string): Promise<MedicalRecord[]> {
    return this.medicalRecordRepo.find({
      where: { tenantId, isActive: true },
      relations: ['lead', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateMedicalRecord(
    id: string,
    data: Partial<CreateMedicalRecordDto>,
    userId: string,
    tenantId: string
  ): Promise<MedicalRecord | null> {
    const medicalRecord = await this.medicalRecordRepo.findOne({
      where: { id, tenantId },
    });

    if (!medicalRecord) return null;

    Object.assign(medicalRecord, data);
    medicalRecord.updatedBy = userId;

    return this.medicalRecordRepo.save(medicalRecord);
  }

  async deleteMedicalRecord(id: string, tenantId: string): Promise<boolean> {
    const result = await this.medicalRecordRepo.update(
      { id, tenantId },
      { isActive: false }
    );

    return (result.affected ?? 0) > 0;
  }

  // ========== ANAMNESE ==========

  async createAnamnesis(
    data: CreateAnamnesisDto,
    userId: string,
    tenantId: string
  ): Promise<Anamnesis> {
    const anamnesis = this.anamnesisRepo.create({
      medicalRecordId: data.medicalRecordId,
      appointmentId: data.appointmentId,
      complaintMain: data.complaintMain,
      complaintHistory: data.complaintHistory,
      smoker: data.smoker,
      alcoholConsumption: data.alcoholConsumption,
      physicalActivity: data.physicalActivity,
      sleepHours: data.sleepHours,
      waterIntake: data.waterIntake,
      skinType: data.skinType,
      skinIssues: data.skinIssues,
      cosmeticsUsed: data.cosmeticsUsed,
      previousAestheticProcedures: data.previousAestheticProcedures,
      expectations: data.expectations,
      hasDiabetes: data.hasDiabetes,
      hasHypertension: data.hasHypertension,
      hasHeartDisease: data.hasHeartDisease,
      hasThyroidIssues: data.hasThyroidIssues,
      isPregnant: data.isPregnant,
      isBreastfeeding: data.isBreastfeeding,
      menstrualCycleRegular: data.menstrualCycleRegular,
      usesContraceptive: data.usesContraceptive,
      professionalObservations: data.professionalObservations,
      treatmentPlan: data.treatmentPlan,
      photos: data.photos,
      documents: data.documents,
      performedBy: userId,
      tenantId,
    });

    return this.anamnesisRepo.save(anamnesis);
  }

  async getAnamnesisListByMedicalRecord(medicalRecordId: string, tenantId: string): Promise<Anamnesis[]> {
    return this.anamnesisRepo.find({
      where: { medicalRecordId, tenantId },
      relations: ['professional'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAnamnesisById(id: string, tenantId: string): Promise<Anamnesis | null> {
    return this.anamnesisRepo.findOne({
      where: { id, tenantId },
      relations: ['professional', 'medicalRecord'],
    });
  }

  // ========== HISTÓRICO DE PROCEDIMENTOS ==========

  async createProcedureHistory(
    data: CreateProcedureHistoryDto,
    tenantId: string
  ): Promise<ProcedureHistory> {
    const procedureHistory = this.procedureHistoryRepo.create({
      medicalRecordId: data.medicalRecordId,
      appointmentId: data.appointmentId,
      procedureId: data.procedureId,
      procedureDate: new Date(data.procedureDate),
      durationMinutes: data.durationMinutes,
      professionalId: data.professionalId,
      productsUsed: data.productsUsed,
      equipmentUsed: data.equipmentUsed,
      techniqueDescription: data.techniqueDescription,
      areasTreated: data.areasTreated,
      beforePhotos: data.beforePhotos,
      afterPhotos: data.afterPhotos,
      patientReaction: data.patientReaction,
      professionalNotes: data.professionalNotes,
      resultsDescription: data.resultsDescription,
      complications: data.complications,
      nextSessionRecommendation: data.nextSessionRecommendation,
      tenantId,
    });

    return this.procedureHistoryRepo.save(procedureHistory);
  }

  async getProcedureHistoryByMedicalRecord(medicalRecordId: string, tenantId: string): Promise<ProcedureHistory[]> {
    return this.procedureHistoryRepo.find({
      where: { medicalRecordId, tenantId },
      relations: ['professional'],
      order: { procedureDate: 'DESC' },
    });
  }

  async getProcedureHistoryById(id: string, tenantId: string): Promise<ProcedureHistory | null> {
    return this.procedureHistoryRepo.findOne({
      where: { id, tenantId },
      relations: ['professional', 'medicalRecord'],
    });
  }

  // Buscar prontuário completo com anamneses e histórico
  async getMedicalRecordComplete(id: string, tenantId: string): Promise<any | null> {
    const medicalRecord = await this.medicalRecordRepo.findOne({
      where: { id, tenantId, isActive: true },
      relations: ['lead', 'creator', 'anamnesisList', 'procedureHistory'],
    });

    return medicalRecord;
  }
}

export default new MedicalRecordService();
