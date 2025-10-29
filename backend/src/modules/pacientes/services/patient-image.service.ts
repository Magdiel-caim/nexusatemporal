import { PatientDataSource } from '../database/patient.datasource';
import { PatientImage } from '../entities/patient-image.entity';
import { S3StorageService } from './s3-storage.service';

export class PatientImageService {
  private repository = PatientDataSource.getRepository(PatientImage);
  private s3Service = new S3StorageService();

  async create(data: Partial<PatientImage>): Promise<PatientImage> {
    const image = this.repository.create(data);
    return await this.repository.save(image);
  }

  async findByPatient(patientId: string, tenantId: string, type?: string): Promise<PatientImage[]> {
    const where: any = { patientId, tenantId, deletedAt: null };
    if (type) where.type = type;
    
    return await this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, tenantId: string): Promise<PatientImage | null> {
    return await this.repository.findOne({
      where: { id, tenantId, deletedAt: null },
    });
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const image = await this.findById(id, tenantId);
    if (!image) return false;

    // Deletar do S3
    await this.s3Service.deleteImage(tenantId, image.s3Key);
    
    // Soft delete no banco
    const result = await this.repository.softDelete({ id, tenantId });
    return result.affected ? result.affected > 0 : false;
  }

  async getSignedUrl(id: string, tenantId: string): Promise<string | null> {
    const image = await this.findById(id, tenantId);
    if (!image) return null;

    return await this.s3Service.getSignedUrl(tenantId, image.s3Key, 3600);
  }

  async pairImages(beforeId: string, afterId: string, tenantId: string): Promise<boolean> {
    await this.repository.update({ id: beforeId, tenantId }, { pairedImageId: afterId });
    await this.repository.update({ id: afterId, tenantId }, { pairedImageId: beforeId });
    return true;
  }
}
