"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    /**
     * Buscar agendamentos do paciente
     */
    async getPatientAppointments(patientId, tenantId) {
        try {
            const { CrmDataSource } = await Promise.resolve().then(() => __importStar(require('../../../database/data-source')));
            const { Appointment } = await Promise.resolve().then(() => __importStar(require('../../agenda/appointment.entity')));
            const { Lead } = await Promise.resolve().then(() => __importStar(require('../../leads/lead.entity')));
            const appointmentRepository = CrmDataSource.getRepository(Appointment);
            const leadRepository = CrmDataSource.getRepository(Lead);
            // Buscar paciente
            const patient = await this.findById(patientId, tenantId);
            if (!patient) {
                return [];
            }
            // Buscar lead associado ao paciente (por WhatsApp)
            let lead = null;
            if (patient.whatsapp) {
                const phoneNumber = patient.whatsapp.replace(/\D/g, '');
                lead = await leadRepository.findOne({
                    where: { whatsapp: phoneNumber, tenantId: tenantId },
                });
            }
            if (!lead) {
                return [];
            }
            // Buscar agendamentos do lead
            const appointments = await appointmentRepository.find({
                where: { leadId: lead.id },
                relations: ['procedure', 'professional'],
                order: { createdAt: 'DESC' },
                take: 50,
            });
            return appointments;
        }
        catch (error) {
            console.error('Error fetching patient appointments:', error);
            return [];
        }
    }
    /**
     * Buscar transações financeiras do paciente
     */
    async getPatientTransactions(patientId, tenantId) {
        try {
            const { CrmDataSource } = await Promise.resolve().then(() => __importStar(require('../../../database/data-source')));
            const { Transaction } = await Promise.resolve().then(() => __importStar(require('../../financeiro/transaction.entity')));
            const { Lead } = await Promise.resolve().then(() => __importStar(require('../../leads/lead.entity')));
            const transactionRepository = CrmDataSource.getRepository(Transaction);
            const leadRepository = CrmDataSource.getRepository(Lead);
            // Buscar paciente
            const patient = await this.findById(patientId, tenantId);
            if (!patient) {
                return { transactions: [], summary: { total: 0, paid: 0, pending: 0 } };
            }
            // Buscar lead associado ao paciente (por WhatsApp)
            let lead = null;
            if (patient.whatsapp) {
                const phoneNumber = patient.whatsapp.replace(/\D/g, '');
                lead = await leadRepository.findOne({
                    where: { whatsapp: phoneNumber, tenantId: tenantId },
                });
            }
            if (!lead) {
                return { transactions: [], summary: { total: 0, paid: 0, pending: 0 } };
            }
            // Buscar transações do lead
            const transactions = await transactionRepository.find({
                where: { leadId: lead.id, tenantId },
                order: { createdAt: 'DESC' },
                take: 100,
            });
            // Calcular resumo
            const summary = transactions.reduce((acc, transaction) => {
                acc.total += transaction.amount;
                if (transaction.status === 'confirmada') {
                    acc.paid += transaction.amount;
                }
                else if (transaction.status === 'pendente') {
                    acc.pending += transaction.amount;
                }
                return acc;
            }, { total: 0, paid: 0, pending: 0 });
            return { transactions, summary };
        }
        catch (error) {
            console.error('Error fetching patient transactions:', error);
            return { transactions: [], summary: { total: 0, paid: 0, pending: 0 } };
        }
    }
    /**
     * Buscar conversas/mensagens do paciente
     */
    async getPatientConversations(patientId, tenantId) {
        try {
            const { CrmDataSource } = await Promise.resolve().then(() => __importStar(require('../../../database/data-source')));
            const { Conversation } = await Promise.resolve().then(() => __importStar(require('../../chat/conversation.entity')));
            const { Message } = await Promise.resolve().then(() => __importStar(require('../../chat/message.entity')));
            const conversationRepository = CrmDataSource.getRepository(Conversation);
            // Buscar paciente
            const patient = await this.findById(patientId, tenantId);
            if (!patient) {
                return [];
            }
            if (!patient.whatsapp) {
                return [];
            }
            // Limpar número do WhatsApp
            const phoneNumber = patient.whatsapp.replace(/\D/g, '');
            // Buscar conversas do paciente (por telefone)
            const conversations = await conversationRepository.find({
                where: [
                    { phoneNumber },
                    { phoneNumber: `55${phoneNumber}` },
                    { phoneNumber: `+55${phoneNumber}` },
                ],
                relations: ['messages'],
                order: { lastMessageAt: 'DESC' },
                take: 10,
            });
            return conversations;
        }
        catch (error) {
            console.error('Error fetching patient conversations:', error);
            return [];
        }
    }
}
exports.PatientService = PatientService;
//# sourceMappingURL=patient.service.js.map