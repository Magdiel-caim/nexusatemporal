"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientService = void 0;
const patient_datasource_1 = require("../database/patient.datasource");
const patient_entity_1 = require("../entities/patient.entity");
const typeorm_1 = require("typeorm");
class PatientService {
    repository = patient_datasource_1.PatientDataSource.getRepository(patient_entity_1.Patient);
    /**
     * Criar novo paciente
     */
    async create(data) {
        const patient = this.repository.create({
            ...data,
            status: 'active',
        });
        return await this.repository.save(patient);
    }
    /**
     * Buscar todos os pacientes com filtros
     */
    async findAll(params) {
        const { tenantId, search, status, limit = 50, offset = 0 } = params;
        const where = {
            tenantId,
            deletedAt: null,
        };
        if (status) {
            where.status = status;
        }
        let query = this.repository
            .createQueryBuilder('patient')
            .where('patient.tenantId = :tenantId', { tenantId })
            .andWhere('patient.deletedAt IS NULL');
        if (status) {
            query = query.andWhere('patient.status = :status', { status });
        }
        // Busca por texto (nome, CPF, telefone, email)
        if (search && search.trim()) {
            query = query.andWhere('(patient.name ILIKE :search OR patient.cpf ILIKE :search OR patient.whatsapp ILIKE :search OR patient.email ILIKE :search)', { search: `%${search}%` });
        }
        const [patients, total] = await query
            .orderBy('patient.createdAt', 'DESC')
            .skip(offset)
            .take(limit)
            .getManyAndCount();
        return { patients, total };
    }
    /**
     * Buscar paciente por ID
     */
    async findById(id, tenantId) {
        return await this.repository.findOne({
            where: { id, tenantId, deletedAt: null },
            relations: ['medicalRecords', 'images', 'appointments', 'transactions'],
        });
    }
    /**
     * Buscar paciente completo (com todas as relações)
     */
    async findByIdComplete(id, tenantId) {
        return await this.repository
            .createQueryBuilder('patient')
            .leftJoinAndSelect('patient.medicalRecords', 'medicalRecords')
            .leftJoinAndSelect('patient.images', 'images')
            .leftJoinAndSelect('patient.appointments', 'appointments')
            .leftJoinAndSelect('patient.transactions', 'transactions')
            .where('patient.id = :id', { id })
            .andWhere('patient.tenantId = :tenantId', { tenantId })
            .andWhere('patient.deletedAt IS NULL')
            .getOne();
    }
    /**
     * Buscar por CPF
     */
    async findByCpf(cpf, tenantId) {
        return await this.repository.findOne({
            where: { cpf, tenantId, deletedAt: null },
        });
    }
    /**
     * Buscar por WhatsApp
     */
    async findByWhatsapp(whatsapp, tenantId) {
        return await this.repository.findOne({
            where: { whatsapp, tenantId, deletedAt: null },
        });
    }
    /**
     * Atualizar paciente
     */
    async update(id, tenantId, data) {
        await this.repository.update({ id, tenantId }, {
            ...data,
            updatedAt: new Date(),
        });
        return await this.findById(id, tenantId);
    }
    /**
     * Soft delete (marcar como deletado)
     */
    async delete(id, tenantId) {
        const result = await this.repository.softDelete({ id, tenantId });
        return result.affected ? result.affected > 0 : false;
    }
    /**
     * Hard delete (remover permanentemente)
     */
    async hardDelete(id, tenantId) {
        const result = await this.repository.delete({ id, tenantId });
        return result.affected ? result.affected > 0 : false;
    }
    /**
     * Restaurar paciente deletado
     */
    async restore(id, tenantId) {
        const result = await this.repository.restore({ id, tenantId });
        return result.affected ? result.affected > 0 : false;
    }
    /**
     * Contar pacientes
     */
    async count(tenantId, status) {
        const where = {
            tenantId,
            deletedAt: null,
        };
        if (status) {
            where.status = status;
        }
        return await this.repository.count({ where });
    }
    /**
     * Atualizar foto de perfil
     */
    async updateProfilePhoto(id, tenantId, photoUrl, s3Key) {
        await this.repository.update({ id, tenantId }, {
            profilePhotoUrl: photoUrl,
            profilePhotoS3Key: s3Key,
        });
        return await this.findById(id, tenantId);
    }
    /**
     * Buscar pacientes por IDs (batch)
     */
    async findByIds(ids, tenantId) {
        return await this.repository.find({
            where: {
                id: (0, typeorm_1.In)(ids),
                tenantId,
                deletedAt: null,
            },
        });
    }
    /**
     * Verificar se CPF já existe
     */
    async cpfExists(cpf, tenantId, excludeId) {
        const query = this.repository
            .createQueryBuilder('patient')
            .where('patient.cpf = :cpf', { cpf })
            .andWhere('patient.tenantId = :tenantId', { tenantId })
            .andWhere('patient.deletedAt IS NULL');
        if (excludeId) {
            query.andWhere('patient.id != :excludeId', { excludeId });
        }
        const count = await query.getCount();
        return count > 0;
    }
}
exports.PatientService = PatientService;
//# sourceMappingURL=patient.service.js.map