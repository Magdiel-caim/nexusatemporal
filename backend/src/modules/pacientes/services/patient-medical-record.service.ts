import { PatientDataSource } from '../database/patient.datasource';
import { PatientMedicalRecord } from '../entities/patient-medical-record.entity';

export class PatientMedicalRecordService {
  private repository = PatientDataSource.getRepository(PatientMedicalRecord);

  async create(data: Partial<PatientMedicalRecord>): Promise<PatientMedicalRecord> {
    const record = this.repository.create({
      ...data,
      serviceDate: data.serviceDate || new Date(),
      revisionNumber: 1,
    });
    return await this.repository.save(record);
  }

  async findByPatient(patientId: string, tenantId: string): Promise<PatientMedicalRecord[]> {
    return await this.repository.find({
      where: { patientId, tenantId, deletedAt: null },
      order: { serviceDate: 'DESC' },
      relations: ['images'],
    });
  }

  async findById(id: string, tenantId: string): Promise<PatientMedicalRecord | null> {
    return await this.repository.findOne({
      where: { id, tenantId, deletedAt: null },
      relations: ['images', 'patient'],
    });
  }

  async update(id: string, tenantId: string, data: Partial<PatientMedicalRecord>): Promise<PatientMedicalRecord | null> {
    const existing = await this.findById(id, tenantId);
    if (!existing) return null;

    await this.repository.update(
      { id, tenantId },
      {
        ...data,
        revisionNumber: existing.revisionNumber + 1,
        revisedAt: new Date(),
      }
    );

    return await this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.repository.softDelete({ id, tenantId });
    return result.affected ? result.affected > 0 : false;
  }

  async getLatest(patientId: string, tenantId: string): Promise<PatientMedicalRecord | null> {
    return await this.repository.findOne({
      where: { patientId, tenantId, deletedAt: null },
      order: { serviceDate: 'DESC' },
    });
  }
}
