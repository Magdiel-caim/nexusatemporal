import { PatientDataSource } from '../database/patient.datasource';
import { Patient } from '../entities/patient.entity';
import { FindOptionsWhere, ILike, In } from 'typeorm';

interface CreatePatientDTO {
  tenantId: string;
  name: string;
  birthDate?: Date;
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
  createdBy: string;
  source?: string;
  sourceId?: string;
}

interface SearchPatientDTO {
  tenantId: string;
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export class PatientService {
  private repository = PatientDataSource.getRepository(Patient);

  /**
   * Criar novo paciente
   */
  async create(data: CreatePatientDTO): Promise<Patient> {
    const patient = this.repository.create({
      ...data,
      status: 'active',
    });

    return await this.repository.save(patient);
  }

  /**
   * Buscar todos os pacientes com filtros
   */
  async findAll(params: SearchPatientDTO): Promise<{ patients: Patient[]; total: number }> {
    const { tenantId, search, status, limit = 50, offset = 0 } = params;

    const where: FindOptionsWhere<Patient> = {
      tenantId,
      deletedAt: null as any,
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
      query = query.andWhere(
        '(patient.name ILIKE :search OR patient.cpf ILIKE :search OR patient.whatsapp ILIKE :search OR patient.email ILIKE :search)',
        { search: `%${search}%` }
      );
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
  async findById(id: string, tenantId: string): Promise<Patient | null> {
    return await this.repository.findOne({
      where: { id, tenantId, deletedAt: null as any },
      relations: ['medicalRecords', 'images', 'appointments', 'transactions'],
    });
  }

  /**
   * Buscar paciente completo (com todas as relações)
   */
  async findByIdComplete(id: string, tenantId: string): Promise<Patient | null> {
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
  async findByCpf(cpf: string, tenantId: string): Promise<Patient | null> {
    return await this.repository.findOne({
      where: { cpf, tenantId, deletedAt: null as any },
    });
  }

  /**
   * Buscar por WhatsApp
   */
  async findByWhatsapp(whatsapp: string, tenantId: string): Promise<Patient | null> {
    return await this.repository.findOne({
      where: { whatsapp, tenantId, deletedAt: null as any },
    });
  }

  /**
   * Atualizar paciente
   */
  async update(id: string, tenantId: string, data: Partial<Patient>): Promise<Patient | null> {
    // Remove relationship properties that cannot be updated via repository.update()
    const { medicalRecords, images, appointments, transactions, ...updateData } = data as any;

    await this.repository.update(
      { id, tenantId },
      {
        ...updateData,
        updatedAt: new Date(),
      }
    );

    return await this.findById(id, tenantId);
  }

  /**
   * Soft delete (marcar como deletado)
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.repository.softDelete({ id, tenantId });
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Hard delete (remover permanentemente)
   */
  async hardDelete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.repository.delete({ id, tenantId });
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Restaurar paciente deletado
   */
  async restore(id: string, tenantId: string): Promise<boolean> {
    const result = await this.repository.restore({ id, tenantId });
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Contar pacientes
   */
  async count(tenantId: string, status?: string): Promise<number> {
    const where: FindOptionsWhere<Patient> = {
      tenantId,
      deletedAt: null as any,
    };

    if (status) {
      where.status = status;
    }

    return await this.repository.count({ where });
  }

  /**
   * Atualizar foto de perfil
   * IMPORTANTE: Não salvamos signedUrl pois ela expira. Apenas s3Key.
   */
  async updateProfilePhoto(
    id: string,
    tenantId: string,
    s3Key: string
  ): Promise<Patient | null> {
    await this.repository.update(
      { id, tenantId },
      {
        profilePhotoS3Key: s3Key,
      }
    );

    return await this.findById(id, tenantId);
  }

  /**
   * Buscar pacientes por IDs (batch)
   */
  async findByIds(ids: string[], tenantId: string): Promise<Patient[]> {
    return await this.repository.find({
      where: {
        id: In(ids),
        tenantId,
        deletedAt: null as any,
      },
    });
  }

  /**
   * Verificar se CPF já existe
   */
  async cpfExists(cpf: string, tenantId: string, excludeId?: string): Promise<boolean> {
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
  async getPatientAppointments(patientId: string, tenantId: string) {
    try {
      const { CrmDataSource } = await import('../../../database/data-source');
      const { Appointment } = await import('../../agenda/appointment.entity');
      const { Lead } = await import('../../leads/lead.entity');

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
          where: { whatsapp: phoneNumber, tenantId: tenantId as any },
        });
      }

      if (!lead) {
        return [];
      }

      // Buscar agendamentos do lead
      const appointments = await appointmentRepository.find({
        where: { leadId: lead.id },
        relations: ['procedure', 'professional'],
        order: { createdAt: 'DESC' } as any,
        take: 50,
      });

      return appointments;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return [];
    }
  }

  /**
   * Buscar transações financeiras do paciente
   */
  async getPatientTransactions(patientId: string, tenantId: string) {
    try {
      const { CrmDataSource } = await import('../../../database/data-source');
      const { Transaction } = await import('../../financeiro/transaction.entity');
      const { Lead } = await import('../../leads/lead.entity');

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
          where: { whatsapp: phoneNumber, tenantId: tenantId as any },
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
      const summary = transactions.reduce(
        (acc, transaction) => {
          acc.total += transaction.amount;
          if (transaction.status === 'confirmada') {
            acc.paid += transaction.amount;
          } else if (transaction.status === 'pendente') {
            acc.pending += transaction.amount;
          }
          return acc;
        },
        { total: 0, paid: 0, pending: 0 }
      );

      return { transactions, summary };
    } catch (error) {
      console.error('Error fetching patient transactions:', error);
      return { transactions: [], summary: { total: 0, paid: 0, pending: 0 } };
    }
  }

  /**
   * Buscar conversas/mensagens do paciente
   */
  async getPatientConversations(patientId: string, tenantId: string) {
    try {
      const { CrmDataSource } = await import('../../../database/data-source');
      const { Conversation } = await import('../../chat/conversation.entity');
      const { Message } = await import('../../chat/message.entity');

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
    } catch (error) {
      console.error('Error fetching patient conversations:', error);
      return [];
    }
  }
}
