import { Request, Response } from 'express';
import medicalRecordService from './medical-record.service';

export class MedicalRecordController {
  // ========== PRONTUÁRIOS ==========

  async createMedicalRecord(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const tenantId = (req as any).user.tenantId;

      const medicalRecord = await medicalRecordService.createMedicalRecord(
        req.body,
        userId,
        tenantId
      );

      res.status(201).json({
        success: true,
        data: medicalRecord,
      });
    } catch (error: any) {
      console.error('Error creating medical record:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar prontuário',
        error: error.message,
      });
    }
  }

  async getMedicalRecordById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user.tenantId;

      const medicalRecord = await medicalRecordService.getMedicalRecordById(id, tenantId);

      if (!medicalRecord) {
        return res.status(404).json({
          success: false,
          message: 'Prontuário não encontrado',
        });
      }

      res.json({
        success: true,
        data: medicalRecord,
      });
    } catch (error: any) {
      console.error('Error getting medical record:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar prontuário',
        error: error.message,
      });
    }
  }

  async getMedicalRecordByLeadId(req: Request, res: Response) {
    try {
      const { leadId } = req.params;
      const tenantId = (req as any).user.tenantId;

      const medicalRecord = await medicalRecordService.getMedicalRecordByLeadId(leadId, tenantId);

      if (!medicalRecord) {
        return res.status(404).json({
          success: false,
          message: 'Prontuário não encontrado para este lead',
        });
      }

      res.json({
        success: true,
        data: medicalRecord,
      });
    } catch (error: any) {
      console.error('Error getting medical record by lead:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar prontuário',
        error: error.message,
      });
    }
  }

  async getMedicalRecordComplete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user.tenantId;

      const medicalRecord = await medicalRecordService.getMedicalRecordComplete(id, tenantId);

      if (!medicalRecord) {
        return res.status(404).json({
          success: false,
          message: 'Prontuário não encontrado',
        });
      }

      res.json({
        success: true,
        data: medicalRecord,
      });
    } catch (error: any) {
      console.error('Error getting complete medical record:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar prontuário completo',
        error: error.message,
      });
    }
  }

  async getAllMedicalRecords(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user.tenantId;

      const medicalRecords = await medicalRecordService.getAllMedicalRecords(tenantId);

      res.json({
        success: true,
        data: medicalRecords,
      });
    } catch (error: any) {
      console.error('Error getting medical records:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar prontuários',
        error: error.message,
      });
    }
  }

  async updateMedicalRecord(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      const tenantId = (req as any).user.tenantId;

      const medicalRecord = await medicalRecordService.updateMedicalRecord(
        id,
        req.body,
        userId,
        tenantId
      );

      if (!medicalRecord) {
        return res.status(404).json({
          success: false,
          message: 'Prontuário não encontrado',
        });
      }

      res.json({
        success: true,
        data: medicalRecord,
      });
    } catch (error: any) {
      console.error('Error updating medical record:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar prontuário',
        error: error.message,
      });
    }
  }

  async deleteMedicalRecord(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user.tenantId;

      const deleted = await medicalRecordService.deleteMedicalRecord(id, tenantId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Prontuário não encontrado',
        });
      }

      res.json({
        success: true,
        message: 'Prontuário excluído com sucesso',
      });
    } catch (error: any) {
      console.error('Error deleting medical record:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir prontuário',
        error: error.message,
      });
    }
  }

  // ========== ANAMNESE ==========

  async createAnamnesis(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const tenantId = (req as any).user.tenantId;

      const anamnesis = await medicalRecordService.createAnamnesis(
        req.body,
        userId,
        tenantId
      );

      res.status(201).json({
        success: true,
        data: anamnesis,
      });
    } catch (error: any) {
      console.error('Error creating anamnesis:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar anamnese',
        error: error.message,
      });
    }
  }

  async getAnamnesisListByMedicalRecord(req: Request, res: Response) {
    try {
      const { medicalRecordId } = req.params;
      const tenantId = (req as any).user.tenantId;

      const anamnesisList = await medicalRecordService.getAnamnesisListByMedicalRecord(
        medicalRecordId,
        tenantId
      );

      res.json({
        success: true,
        data: anamnesisList,
      });
    } catch (error: any) {
      console.error('Error getting anamnesis list:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar anamneses',
        error: error.message,
      });
    }
  }

  async getAnamnesisById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user.tenantId;

      const anamnesis = await medicalRecordService.getAnamnesisById(id, tenantId);

      if (!anamnesis) {
        return res.status(404).json({
          success: false,
          message: 'Anamnese não encontrada',
        });
      }

      res.json({
        success: true,
        data: anamnesis,
      });
    } catch (error: any) {
      console.error('Error getting anamnesis:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar anamnese',
        error: error.message,
      });
    }
  }

  // ========== HISTÓRICO DE PROCEDIMENTOS ==========

  async createProcedureHistory(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user.tenantId;

      const procedureHistory = await medicalRecordService.createProcedureHistory(
        req.body,
        tenantId
      );

      res.status(201).json({
        success: true,
        data: procedureHistory,
      });
    } catch (error: any) {
      console.error('Error creating procedure history:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar histórico de procedimento',
        error: error.message,
      });
    }
  }

  async getProcedureHistoryByMedicalRecord(req: Request, res: Response) {
    try {
      const { medicalRecordId } = req.params;
      const tenantId = (req as any).user.tenantId;

      const procedureHistory = await medicalRecordService.getProcedureHistoryByMedicalRecord(
        medicalRecordId,
        tenantId
      );

      res.json({
        success: true,
        data: procedureHistory,
      });
    } catch (error: any) {
      console.error('Error getting procedure history:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico de procedimentos',
        error: error.message,
      });
    }
  }

  async getProcedureHistoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user.tenantId;

      const procedureHistory = await medicalRecordService.getProcedureHistoryById(id, tenantId);

      if (!procedureHistory) {
        return res.status(404).json({
          success: false,
          message: 'Histórico de procedimento não encontrado',
        });
      }

      res.json({
        success: true,
        data: procedureHistory,
      });
    } catch (error: any) {
      console.error('Error getting procedure history:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico de procedimento',
        error: error.message,
      });
    }
  }
}

export default new MedicalRecordController();
