"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchPatientsController = void 0;
const data_source_1 = require("../../database/data-source");
const lead_entity_1 = require("../leads/lead.entity");
const patient_datasource_1 = require("../pacientes/database/patient.datasource");
const patient_entity_1 = require("../pacientes/entities/patient.entity");
class SearchPatientsController {
    /**
     * GET /api/agenda/search-patients
     * Buscar pacientes e leads por nome, CPF ou RG
     */
    async searchPatients(req, res) {
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
            const searchType = type || 'all';
            const results = [];
            // Buscar em Leads
            const leadRepo = data_source_1.CrmDataSource.getRepository(lead_entity_1.Lead);
            let leadQuery = leadRepo
                .createQueryBuilder('lead')
                .where('lead.tenantId = :tenantId', { tenantId })
                .andWhere('lead.isActive = :isActive', { isActive: true });
            if (searchType === 'cpf') {
                // Para CPF, busca exata (se o campo existir em leads - geralmente não existe)
                // Leads não tem CPF, então pular
            }
            else if (searchType === 'rg') {
                // Para RG, busca exata (se o campo existir em leads - geralmente não existe)
                // Leads não tem RG, então pular
            }
            else {
                // Busca por nome (parcial)
                leadQuery = leadQuery.andWhere('(lead.name ILIKE :search OR lead.phone ILIKE :search OR lead.whatsapp ILIKE :search OR lead.email ILIKE :search)', { search: `%${searchTerm}%` });
                const leads = await leadQuery.take(20).getMany();
                results.push(...leads.map((lead) => ({
                    id: lead.id,
                    name: lead.name,
                    phone: lead.phone || null,
                    whatsapp: lead.whatsapp || null,
                    email: lead.email || null,
                    cpf: null,
                    rg: null,
                    source: 'lead',
                })));
            }
            // Buscar em Pacientes
            if (patient_datasource_1.PatientDataSource.isInitialized) {
                const patientRepo = patient_datasource_1.PatientDataSource.getRepository(patient_entity_1.Patient);
                let patientQuery = patientRepo
                    .createQueryBuilder('patient')
                    .where('patient.tenantId = :tenantId', { tenantId })
                    .andWhere('patient.deletedAt IS NULL')
                    .andWhere('patient.status = :status', { status: 'active' });
                if (searchType === 'cpf') {
                    // Busca exata por CPF
                    const cpfClean = searchTerm.replace(/\D/g, '');
                    patientQuery = patientQuery.andWhere('patient.cpf = :cpf', { cpf: cpfClean });
                }
                else if (searchType === 'rg') {
                    // Busca exata por RG
                    const rgClean = searchTerm.replace(/\D/g, '');
                    patientQuery = patientQuery.andWhere('patient.rg = :rg', { rg: rgClean });
                }
                else {
                    // Busca por nome (parcial)
                    patientQuery = patientQuery.andWhere('(patient.name ILIKE :search OR patient.cpf ILIKE :search OR patient.rg ILIKE :search OR patient.whatsapp ILIKE :search OR patient.email ILIKE :search)', { search: `%${searchTerm}%` });
                }
                const patients = await patientQuery.take(20).getMany();
                results.push(...patients.map((patient) => ({
                    id: patient.id,
                    name: patient.name,
                    phone: patient.whatsapp || null,
                    whatsapp: patient.whatsapp || null,
                    email: patient.email || null,
                    cpf: patient.cpf || null,
                    rg: patient.rg || null,
                    source: 'patient',
                })));
            }
            // Remover duplicados baseado no nome e telefone
            const uniqueResults = results.filter((result, index, self) => index ===
                self.findIndex((r) => r.name.toLowerCase() === result.name.toLowerCase() &&
                    (r.phone === result.phone || r.whatsapp === result.whatsapp)));
            res.json({
                success: true,
                data: uniqueResults.slice(0, 30), // Limitar a 30 resultados
                total: uniqueResults.length,
            });
        }
        catch (error) {
            console.error('Erro ao buscar pacientes:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.SearchPatientsController = SearchPatientsController;
exports.default = new SearchPatientsController();
//# sourceMappingURL=search-patients.controller.js.map