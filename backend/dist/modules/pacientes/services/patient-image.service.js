"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientImageService = void 0;
const typeorm_1 = require("typeorm");
const patient_datasource_1 = require("../database/patient.datasource");
const patient_image_entity_1 = require("../entities/patient-image.entity");
const s3_storage_service_1 = require("./s3-storage.service");
class PatientImageService {
    repository = patient_datasource_1.PatientDataSource.getRepository(patient_image_entity_1.PatientImage);
    s3Service = new s3_storage_service_1.S3StorageService();
    async create(data) {
        const image = this.repository.create(data);
        return await this.repository.save(image);
    }
    async findByPatient(patientId, tenantId, type) {
        const where = { patientId, tenantId, deletedAt: (0, typeorm_1.IsNull)() };
        if (type)
            where.type = type;
        return await this.repository.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id, tenantId) {
        return await this.repository.findOne({
            where: { id, tenantId, deletedAt: (0, typeorm_1.IsNull)() },
        });
    }
    async delete(id, tenantId) {
        const image = await this.findById(id, tenantId);
        if (!image)
            return false;
        // Deletar do S3
        await this.s3Service.deleteImage(tenantId, image.s3Key);
        // Soft delete no banco
        const result = await this.repository.softDelete({ id, tenantId });
        return result.affected ? result.affected > 0 : false;
    }
    async getSignedUrl(id, tenantId) {
        const image = await this.findById(id, tenantId);
        if (!image)
            return null;
        return await this.s3Service.getSignedUrl(tenantId, image.s3Key, 3600);
    }
    async pairImages(beforeId, afterId, tenantId) {
        await this.repository.update({ id: beforeId, tenantId }, { pairedImageId: afterId });
        await this.repository.update({ id: afterId, tenantId }, { pairedImageId: beforeId });
        return true;
    }
}
exports.PatientImageService = PatientImageService;
//# sourceMappingURL=patient-image.service.js.map