"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientController = void 0;
const patient_service_1 = require("../services/patient.service");
const patient_image_service_1 = require("../services/patient-image.service");
const patient_medical_record_service_1 = require("../services/patient-medical-record.service");
const s3_storage_service_1 = require("../services/s3-storage.service");
const multer_1 = __importDefault(require("multer"));
// Configurar multer para upload de arquivos em memória
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo não permitido. Apenas imagens são aceitas.'));
        }
    },
});
class PatientController {
    patientService = new patient_service_1.PatientService();
    imageService = new patient_image_service_1.PatientImageService();
    medicalRecordService = new patient_medical_record_service_1.PatientMedicalRecordService();
    s3Service = new s3_storage_service_1.S3StorageService();
    // Middleware para upload
    uploadMiddleware = upload.single('file');
    /**
     * GET /api/pacientes
     * Listar pacientes com filtros
     */
    getAll = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const { search, status, limit, offset } = req.query;
            const result = await this.patientService.findAll({
                tenantId,
                search: search,
                status: status,
                limit: limit ? parseInt(limit) : 50,
                offset: offset ? parseInt(offset) : 0,
            });
            res.json(result);
        }
        catch (error) {
            console.error('Error fetching patients:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * GET /api/pacientes/:id
     * Buscar paciente por ID
     */
    getById = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const patient = await this.patientService.findByIdComplete(id, tenantId);
            if (!patient) {
                return res.status(404).json({ error: 'Paciente não encontrado' });
            }
            res.json(patient);
        }
        catch (error) {
            console.error('Error fetching patient:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * POST /api/pacientes
     * Criar novo paciente
     */
    create = async (req, res) => {
        try {
            const { tenantId, id: userId } = req.user;
            const data = req.body;
            // Validar CPF duplicado
            if (data.cpf) {
                const exists = await this.patientService.cpfExists(data.cpf, tenantId);
                if (exists) {
                    return res.status(400).json({ error: 'CPF já cadastrado' });
                }
            }
            const patient = await this.patientService.create({
                ...data,
                tenantId,
                createdBy: userId,
            });
            res.status(201).json(patient);
        }
        catch (error) {
            console.error('Error creating patient:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * PUT /api/pacientes/:id
     * Atualizar paciente
     */
    update = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const data = req.body;
            // Validar CPF duplicado (exceto do próprio paciente)
            if (data.cpf) {
                const exists = await this.patientService.cpfExists(data.cpf, tenantId, id);
                if (exists) {
                    return res.status(400).json({ error: 'CPF já cadastrado para outro paciente' });
                }
            }
            const patient = await this.patientService.update(id, tenantId, data);
            if (!patient) {
                return res.status(404).json({ error: 'Paciente não encontrado' });
            }
            res.json(patient);
        }
        catch (error) {
            console.error('Error updating patient:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * DELETE /api/pacientes/:id
     * Deletar paciente (soft delete)
     */
    delete = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const success = await this.patientService.delete(id, tenantId);
            if (!success) {
                return res.status(404).json({ error: 'Paciente não encontrado' });
            }
            res.json({ success: true, message: 'Paciente deletado com sucesso' });
        }
        catch (error) {
            console.error('Error deleting patient:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * POST /api/pacientes/:id/imagens
     * Upload de imagem do paciente
     */
    uploadImage = async (req, res) => {
        try {
            const { id: patientId } = req.params;
            const { tenantId, id: userId } = req.user;
            const { type, category, description, procedureName } = req.body;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }
            // Upload para S3
            const uploadResult = await this.s3Service.uploadPatientImage(tenantId, patientId, file.buffer, file.originalname, type || 'document');
            // Salvar no banco
            const image = await this.imageService.create({
                patientId,
                tenantId,
                type: type || 'document',
                category,
                imageUrl: uploadResult.signedUrl,
                s3Key: uploadResult.s3Key,
                filename: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                description,
                procedureName,
                uploadedBy: userId,
            });
            res.status(201).json(image);
        }
        catch (error) {
            console.error('Error uploading image:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * GET /api/pacientes/:id/imagens
     * Listar imagens do paciente
     */
    getImages = async (req, res) => {
        try {
            const { id: patientId } = req.params;
            const { tenantId } = req.user;
            const { type } = req.query;
            const images = await this.imageService.findByPatient(patientId, tenantId, type);
            // Gerar URLs assinadas para todas as imagens
            const imagesWithUrls = await Promise.all(images.map(async (img) => ({
                ...img,
                signedUrl: await this.s3Service.getSignedUrl(tenantId, img.s3Key, 3600),
            })));
            res.json(imagesWithUrls);
        }
        catch (error) {
            console.error('Error fetching images:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * DELETE /api/pacientes/:id/imagens/:imageId
     * Deletar imagem do paciente
     */
    deleteImage = async (req, res) => {
        try {
            const { id: patientId, imageId } = req.params;
            const { tenantId } = req.user;
            const deleted = await this.imageService.delete(imageId, tenantId);
            if (!deleted) {
                return res.status(404).json({ error: 'Image not found' });
            }
            res.json({ success: true, message: 'Image deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting image:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * GET /api/pacientes/:id/prontuarios
     * Listar prontuários do paciente
     */
    getMedicalRecords = async (req, res) => {
        try {
            const { id: patientId } = req.params;
            const { tenantId } = req.user;
            const records = await this.medicalRecordService.findByPatient(patientId, tenantId);
            res.json(records);
        }
        catch (error) {
            console.error('Error fetching medical records:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * POST /api/pacientes/:id/prontuarios
     * Criar prontuário para o paciente
     */
    createMedicalRecord = async (req, res) => {
        try {
            const { id: patientId } = req.params;
            const { tenantId, id: userId } = req.user;
            const data = req.body;
            const record = await this.medicalRecordService.create({
                ...data,
                patientId,
                tenantId,
                createdBy: userId,
            });
            res.status(201).json(record);
        }
        catch (error) {
            console.error('Error creating medical record:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * GET /api/pacientes/stats
     * Estatísticas de pacientes
     */
    getStats = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const total = await this.patientService.count(tenantId);
            const active = await this.patientService.count(tenantId, 'active');
            const inactive = await this.patientService.count(tenantId, 'inactive');
            res.json({ total, active, inactive });
        }
        catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * GET /api/pacientes/:id/agendamentos
     * Buscar agendamentos do paciente
     */
    getAppointments = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const appointments = await this.patientService.getPatientAppointments(id, tenantId);
            res.json(appointments);
        }
        catch (error) {
            console.error('Error fetching appointments:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * GET /api/pacientes/:id/transacoes
     * Buscar transações financeiras do paciente
     */
    getTransactions = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const transactions = await this.patientService.getPatientTransactions(id, tenantId);
            res.json(transactions);
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * GET /api/pacientes/:id/conversas
     * Buscar conversas/mensagens do paciente
     */
    getConversations = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const conversations = await this.patientService.getPatientConversations(id, tenantId);
            res.json(conversations);
        }
        catch (error) {
            console.error('Error fetching conversations:', error);
            res.status(500).json({ error: error.message });
        }
    };
}
exports.PatientController = PatientController;
//# sourceMappingURL=patient.controller.js.map