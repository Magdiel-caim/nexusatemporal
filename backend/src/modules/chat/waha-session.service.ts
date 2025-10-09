import axios from 'axios';
import { AppDataSource } from '@/database/data-source';
import { Conversation } from './conversation.entity';

export interface WAHASession {
  name: string;
  status: 'STOPPED' | 'STARTING' | 'SCAN_QR_CODE' | 'WORKING' | 'FAILED';
  config?: {
    webhooks?: {
      url: string;
      events: string[];
    }[];
  };
}

export interface WAHAQRCode {
  value: string; // QR Code em base64 ou URL
}

export class WAHASessionService {
  private wahaUrl: string;
  private wahaToken: string;
  private conversationRepository = AppDataSource.getRepository(Conversation);

  constructor() {
    this.wahaUrl = process.env.WAHA_URL || 'https://apiwts.nexusatemporal.com.br';
    this.wahaToken = process.env.WAHA_API_KEY || 'bd0c416348b2f04d198ff8971b608a87';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Api-Key': this.wahaToken,
    };
  }

  // ===== SESSION MANAGEMENT =====

  /**
   * Cria uma nova sessão no WAHA
   */
  async createSession(sessionName: string, userId: string): Promise<WAHASession> {
    try {
      const webhookUrl = `${process.env.BACKEND_URL}/api/chat/webhook/waha/status`;

      const response = await axios.post(
        `${this.wahaUrl}/api/sessions`,
        {
          name: sessionName,
          config: {
            webhooks: [
              {
                url: webhookUrl,
                events: ['session.status', 'message'],
              },
            ],
          },
        },
        { headers: this.getHeaders() }
      );

      // Criar conversation no nosso banco
      await this.conversationRepository.save({
        contactName: `WhatsApp - ${sessionName}`,
        phoneNumber: sessionName,
        whatsappInstanceId: sessionName,
        assignedUserId: userId,
        status: 'waiting',
        metadata: {
          wahaSessionName: sessionName,
          createdBy: userId,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error creating WAHA session:', error.response?.data || error.message);
      throw new Error(`Failed to create session: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Inicia uma sessão (gera QR Code)
   */
  async startSession(sessionName: string): Promise<WAHASession> {
    try {
      const response = await axios.post(
        `${this.wahaUrl}/api/sessions/${sessionName}/start`,
        {},
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error starting WAHA session:', error.response?.data || error.message);
      throw new Error(`Failed to start session: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obtém o QR Code da sessão
   */
  async getQRCode(sessionName: string): Promise<WAHAQRCode> {
    try {
      const response = await axios.get(
        `${this.wahaUrl}/api/sessions/${sessionName}/auth/qr`,
        {
          headers: this.getHeaders(),
          responseType: 'json',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting QR code:', error.response?.data || error.message);
      throw new Error(`Failed to get QR code: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obtém status da sessão
   */
  async getSessionStatus(sessionName: string): Promise<WAHASession> {
    try {
      const response = await axios.get(
        `${this.wahaUrl}/api/sessions/${sessionName}`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting session status:', error.response?.data || error.message);
      throw new Error(`Failed to get session status: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Lista todas as sessões
   */
  async listSessions(): Promise<WAHASession[]> {
    try {
      const response = await axios.get(
        `${this.wahaUrl}/api/sessions`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error listing sessions:', error.response?.data || error.message);
      throw new Error(`Failed to list sessions: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Para uma sessão
   */
  async stopSession(sessionName: string): Promise<void> {
    try {
      await axios.post(
        `${this.wahaUrl}/api/sessions/${sessionName}/stop`,
        {},
        { headers: this.getHeaders() }
      );
    } catch (error: any) {
      console.error('Error stopping session:', error.response?.data || error.message);
      throw new Error(`Failed to stop session: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Faz logout de uma sessão
   */
  async logoutSession(sessionName: string): Promise<void> {
    try {
      await axios.post(
        `${this.wahaUrl}/api/sessions/${sessionName}/logout`,
        {},
        { headers: this.getHeaders() }
      );

      // Atualizar conversation no banco
      await this.conversationRepository.update(
        { whatsappInstanceId: sessionName },
        { status: 'closed' }
      );
    } catch (error: any) {
      console.error('Error logging out session:', error.response?.data || error.message);
      throw new Error(`Failed to logout session: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Deleta uma sessão
   */
  async deleteSession(sessionName: string): Promise<void> {
    try {
      await axios.delete(
        `${this.wahaUrl}/api/sessions/${sessionName}`,
        { headers: this.getHeaders() }
      );

      // Atualizar conversation no banco
      await this.conversationRepository.update(
        { whatsappInstanceId: sessionName },
        { status: 'archived' }
      );
    } catch (error: any) {
      console.error('Error deleting session:', error.response?.data || error.message);
      throw new Error(`Failed to delete session: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Trata mudanças de status da sessão (chamado pelo webhook)
   */
  async handleStatusChange(sessionName: string, newStatus: string): Promise<void> {
    console.log(`Session ${sessionName} status changed to: ${newStatus}`);

    // Atualizar conversation no banco
    let conversationStatus: 'active' | 'waiting' | 'closed' = 'waiting';

    if (newStatus === 'WORKING') {
      conversationStatus = 'active';
    } else if (newStatus === 'FAILED' || newStatus === 'STOPPED') {
      conversationStatus = 'closed';
    }

    await this.conversationRepository.update(
      { whatsappInstanceId: sessionName },
      {
        status: conversationStatus,
        metadata: {
          wahaStatus: newStatus,
          lastStatusUpdate: new Date(),
        } as any,
      }
    );
  }
}
