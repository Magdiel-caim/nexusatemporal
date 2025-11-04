import { Request, Response } from 'express';
import { CrmDataSource } from '../../database/data-source';
import { Lead } from '../leads/lead.entity';
import { PatientDataSource } from '../pacientes/database/patient.datasource';
import { Patient } from '../pacientes/entities/patient.entity';

interface SearchResult {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  cpf: string | null;
  rg: string | null;
  source: 'lead' | 'patient';
}

export class SearchPatientsController {
  /**
   * GET /api/agenda/search-patients
   * Buscar pacientes e leads por nome, CPF ou RG
   */
  async searchPatients(req: Request, res: Response) {
    try {
      const { q, type } = req.query;
      const tenantId = req.user?.tenantId || 'default';

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro de busca "q" é obrigatório',
        });
      }

      const searchTerm = q.trim();
      const searchType = type as 'name' | 'cpf' | 'rg' | 'all' || 'all';

      const results: SearchResult[] = [];

      // Buscar em Leads
      const leadRepo = CrmDataSource.getRepository(Lead);
      let leadQuery = leadRepo
        .createQueryBuilder('lead')
        .where('lead.tenantId = :tenantId', { tenantId })
        .andWhere('lead.isActive = :isActive', { isActive: true });

      if (searchType === 'cpf') {
        // Para CPF, busca exata (se o campo existir em leads - geralmente não existe)
        // Leads não tem CPF, então pular
      } else if (searchType === 'rg') {
        // Para RG, busca exata (se o campo existir em leads - geralmente não existe)
        // Leads não tem RG, então pular
      } else {
        // Busca por nome (parcial)
        leadQuery = leadQuery.andWhere(
          '(lead.name ILIKE :search OR lead.phone ILIKE :search OR lead.whatsapp ILIKE :search OR lead.email ILIKE :search)',
          { search: `%${searchTerm}%` }
        );

        const leads = await leadQuery.take(20).getMany();

        results.push(
          ...leads.map((lead) => ({
            id: lead.id,
            name: lead.name,
            phone: lead.phone || null,
            whatsapp: lead.whatsapp || null,
            email: lead.email || null,
            cpf: null,
            rg: null,
            source: 'lead' as const,
          }))
        );
      }

      // Buscar em Pacientes
      if (PatientDataSource.isInitialized) {
        const patientRepo = PatientDataSource.getRepository(Patient);
        let patientQuery = patientRepo
          .createQueryBuilder('patient')
          .where('patient.tenantId = :tenantId', { tenantId })
          .andWhere('patient.deletedAt IS NULL')
          .andWhere('patient.status = :status', { status: 'active' });

        if (searchType === 'cpf') {
          // Busca exata por CPF
          const cpfClean = searchTerm.replace(/\D/g, '');
          patientQuery = patientQuery.andWhere('patient.cpf = :cpf', { cpf: cpfClean });
        } else if (searchType === 'rg') {
          // Busca exata por RG
          const rgClean = searchTerm.replace(/\D/g, '');
          patientQuery = patientQuery.andWhere('patient.rg = :rg', { rg: rgClean });
        } else {
          // Busca por nome (parcial)
          patientQuery = patientQuery.andWhere(
            '(patient.name ILIKE :search OR patient.cpf ILIKE :search OR patient.rg ILIKE :search OR patient.whatsapp ILIKE :search OR patient.email ILIKE :search)',
            { search: `%${searchTerm}%` }
          );
        }

        const patients = await patientQuery.take(20).getMany();

        results.push(
          ...patients.map((patient) => ({
            id: patient.id,
            name: patient.name,
            phone: patient.whatsapp || null,
            whatsapp: patient.whatsapp || null,
            email: patient.email || null,
            cpf: patient.cpf || null,
            rg: patient.rg || null,
            source: 'patient' as const,
          }))
        );
      }

      // Remover duplicados baseado no nome e telefone
      const uniqueResults = results.filter(
        (result, index, self) =>
          index ===
          self.findIndex(
            (r) =>
              r.name.toLowerCase() === result.name.toLowerCase() &&
              (r.phone === result.phone || r.whatsapp === result.whatsapp)
          )
      );

      res.json({
        success: true,
        data: uniqueResults.slice(0, 30), // Limitar a 30 resultados
        total: uniqueResults.length,
      });
    } catch (error: any) {
      console.error('Erro ao buscar pacientes:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new SearchPatientsController();
