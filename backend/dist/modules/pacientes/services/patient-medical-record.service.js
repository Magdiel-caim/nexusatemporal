"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientMedicalRecordService = void 0;
const typeorm_1 = require("typeorm");
const patient_datasource_1 = require("../database/patient.datasource");
const patient_medical_record_entity_1 = require("../entities/patient-medical-record.entity");
class PatientMedicalRecordService {
    repository = patient_datasource_1.PatientDataSource.getRepository(patient_medical_record_entity_1.PatientMedicalRecord);
    async create(data) {
        const record = this.repository.create({
            ...data,
            serviceDate: data.serviceDate || new Date(),
            revisionNumber: 1,
        });
        return await this.repository.save(record);
    }
    async findByPatient(patientId, tenantId) {
        return await this.repository.find({
            where: { patientId, tenantId, deletedAt: (0, typeorm_1.IsNull)() },
            order: { serviceDate: 'DESC' },
            relations: ['images'],
        });
    }
    async findById(id, tenantId) {
        return await this.repository.findOne({
            where: { id, tenantId, deletedAt: (0, typeorm_1.IsNull)() },
            relations: ['images', 'patient'],
        });
    }
    async update(id, tenantId, data) {
        const existing = await this.findById(id, tenantId);
        if (!existing)
            return null;
        await this.repository.update({ id, tenantId }, {
            ...data,
            revisionNumber: existing.revisionNumber + 1,
            revisedAt: new Date(),
        });
        return await this.findById(id, tenantId);
    }
    async delete(id, tenantId) {
        const result = await this.repository.softDelete({ id, tenantId });
        return result.affected ? result.affected > 0 : false;
    }
    async getLatest(patientId, tenantId) {
        return await this.repository.findOne({
            where: { patientId, tenantId, deletedAt: (0, typeorm_1.IsNull)() },
            order: { serviceDate: 'DESC' },
        });
    }
}
exports.PatientMedicalRecordService = PatientMedicalRecordService;
//# sourceMappingURL=patient-medical-record.service.js.map