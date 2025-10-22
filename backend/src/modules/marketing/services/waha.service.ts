import { getRepository } from 'typeorm';
import axios from 'axios';
import { WahaSession, WahaSessionStatus } from '../entities';

export class WahaService {
  private repository = getRepository(WahaSession);

  /**
   * Create WAHA session
   */
  async createSession(
    tenantId: string,
    data: {
      name: string;
      displayName?: string;
      wahaServerUrl: string;
      wahaApiKey: string;
      isPrimary?: boolean;
      failoverEnabled?: boolean;
      failoverPriority?: number;
      maxMessagesPerMinute?: number;
      minDelaySeconds?: number;
      maxDelaySeconds?: number;
    },
    userId?: string
  ): Promise<WahaSession> {
    // If isPrimary, unset other primary sessions
    if (data.isPrimary) {
      await this.repository.update(
        { tenantId, isPrimary: true },
        { isPrimary: false }
      );
    }

    const session = this.repository.create({
      tenantId,
      name: data.name,
      displayName: data.displayName || data.name,
      wahaServerUrl: data.wahaServerUrl,
      wahaApiKey: data.wahaApiKey,
      isPrimary: data.isPrimary || false,
      failoverEnabled: data.failoverEnabled || false,
      failoverPriority: data.failoverPriority || 0,
      maxMessagesPerMinute: data.maxMessagesPerMinute || 30,
      minDelaySeconds: data.minDelaySeconds || 1,
      maxDelaySeconds: data.maxDelaySeconds || 5,
      status: WahaSessionStatus.STOPPED,
      createdBy: userId,
    });

    const savedSession = await this.repository.save(session);

    // Create session on WAHA server
    try {
      await this.createWahaSession(savedSession);
    } catch (error: any) {
      console.error('[WahaService] Error creating session on WAHA:', error);
      savedSession.status = WahaSessionStatus.FAILED;
      savedSession.errorMessage = error.message;
      await this.repository.save(savedSession);
    }

    return savedSession;
  }

  /**
   * Get all sessions for tenant
   */
  async getSessions(tenantId: string, filters?: { isActive?: boolean }): Promise<WahaSession[]> {
    const query: any = { tenantId };

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    return await this.repository.find({
      where: query,
      order: { failoverPriority: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string, tenantId: string): Promise<WahaSession | undefined> {
    const result = await this.repository.findOne({
      where: { id: sessionId, tenantId },
    });
    return result || undefined;
  }

  /**
   * Get primary session
   */
  async getPrimarySession(tenantId: string): Promise<WahaSession | undefined> {
    const result = await this.repository.findOne({
      where: { tenantId, isPrimary: true, isActive: true, status: WahaSessionStatus.WORKING },
    });
    return result || undefined;
  }

  /**
   * Get available session with failover
   */
  async getAvailableSession(tenantId: string): Promise<WahaSession | undefined> {
    // Try primary first
    let session = await this.getPrimarySession(tenantId);

    if (!session) {
      // Get failover session with highest priority
      const sessions = await this.repository.find({
        where: {
          tenantId,
          isActive: true,
          failoverEnabled: true,
          status: WahaSessionStatus.WORKING,
        },
        order: { failoverPriority: 'DESC' },
        take: 1,
      });

      session = sessions[0];
    }

    return session;
  }

  /**
   * Start WAHA session
   */
  async startSession(sessionId: string, tenantId: string): Promise<{ session: WahaSession; qrCode?: string }> {
    const session = await this.getSession(sessionId, tenantId);

    if (!session) {
      throw new Error('Session not found');
    }

    try {
      session.status = WahaSessionStatus.STARTING;
      await this.repository.save(session);

      // Start session on WAHA
      const response = await axios.post(
        `${session.wahaServerUrl}/api/sessions/${session.name}/start`,
        {},
        {
          headers: { 'X-Api-Key': session.wahaApiKey },
        }
      );

      session.status = WahaSessionStatus.SCAN_QR_CODE;
      await this.repository.save(session);

      // Get QR code
      const qrCode = await this.getQRCode(sessionId, tenantId);

      return { session, qrCode };
    } catch (error: any) {
      console.error('[WahaService] Error starting session:', error);
      session.status = WahaSessionStatus.FAILED;
      session.errorMessage = error.response?.data?.message || error.message;
      session.lastErrorAt = new Date();
      await this.repository.save(session);

      throw error;
    }
  }

  /**
   * Stop WAHA session
   */
  async stopSession(sessionId: string, tenantId: string): Promise<WahaSession> {
    const session = await this.getSession(sessionId, tenantId);

    if (!session) {
      throw new Error('Session not found');
    }

    try {
      // Stop session on WAHA
      await axios.post(
        `${session.wahaServerUrl}/api/sessions/${session.name}/stop`,
        {},
        {
          headers: { 'X-Api-Key': session.wahaApiKey },
        }
      );

      session.status = WahaSessionStatus.STOPPED;
      await this.repository.save(session);

      return session;
    } catch (error: any) {
      console.error('[WahaService] Error stopping session:', error);
      session.errorMessage = error.response?.data?.message || error.message;
      session.lastErrorAt = new Date();
      await this.repository.save(session);

      throw error;
    }
  }

  /**
   * Get QR code
   */
  async getQRCode(sessionId: string, tenantId: string): Promise<string | undefined> {
    const session = await this.getSession(sessionId, tenantId);

    if (!session) {
      throw new Error('Session not found');
    }

    try {
      const response = await axios.get(
        `${session.wahaServerUrl}/api/sessions/${session.name}/auth/qr`,
        {
          headers: { 'X-Api-Key': session.wahaApiKey },
        }
      );

      const qrCode = response.data?.qr || response.data?.qrCode;

      // Save QR code
      session.qrCode = qrCode;
      await this.repository.save(session);

      return qrCode;
    } catch (error: any) {
      console.error('[WahaService] Error getting QR code:', error);
      return undefined;
    }
  }

  /**
   * Update session status from webhook
   */
  async updateSessionStatus(
    sessionId: string,
    tenantId: string,
    status: WahaSessionStatus,
    phoneNumber?: string
  ): Promise<WahaSession> {
    const session = await this.getSession(sessionId, tenantId);

    if (!session) {
      throw new Error('Session not found');
    }

    session.status = status;

    if (phoneNumber) {
      session.phoneNumber = phoneNumber;
    }

    if (status === WahaSessionStatus.WORKING) {
      session.lastConnectedAt = new Date();
      session.errorMessage = undefined;
    }

    return await this.repository.save(session);
  }

  /**
   * Send WhatsApp message via WAHA
   */
  async sendMessage(
    sessionId: string,
    tenantId: string,
    data: {
      phoneNumber: string;
      message: string;
      mediaUrl?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const session = await this.getSession(sessionId, tenantId);

    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.status !== WahaSessionStatus.WORKING) {
      return { success: false, error: 'Session is not active' };
    }

    try {
      const chatId = `${data.phoneNumber.replace(/\D/g, '')}@c.us`;

      let response;

      if (data.mediaUrl) {
        // Send media message
        response = await axios.post(
          `${session.wahaServerUrl}/api/sendImage`,
          {
            session: session.name,
            chatId,
            file: {
              url: data.mediaUrl,
            },
            caption: data.message,
          },
          {
            headers: { 'X-Api-Key': session.wahaApiKey },
          }
        );
      } else {
        // Send text message
        response = await axios.post(
          `${session.wahaServerUrl}/api/sendText`,
          {
            session: session.name,
            chatId,
            text: data.message,
          },
          {
            headers: { 'X-Api-Key': session.wahaApiKey },
          }
        );
      }

      return {
        success: true,
        messageId: response.data?.id || response.data?.messageId,
      };
    } catch (error: any) {
      console.error('[WahaService] Error sending message:', error);

      // Update session error
      session.errorMessage = error.response?.data?.message || error.message;
      session.lastErrorAt = new Date();
      await this.repository.save(session);

      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string, tenantId: string): Promise<boolean> {
    const session = await this.getSession(sessionId, tenantId);

    if (!session) {
      return false;
    }

    try {
      // Delete session on WAHA
      await axios.delete(`${session.wahaServerUrl}/api/sessions/${session.name}`, {
        headers: { 'X-Api-Key': session.wahaApiKey },
      });
    } catch (error) {
      console.error('[WahaService] Error deleting session on WAHA:', error);
      // Continue anyway to delete from database
    }

    const result = await this.repository.delete({ id: sessionId, tenantId });

    return (result.affected || 0) > 0;
  }

  /**
   * Private: Create session on WAHA server
   */
  private async createWahaSession(session: WahaSession): Promise<void> {
    await axios.post(
      `${session.wahaServerUrl}/api/sessions`,
      {
        name: session.name,
        config: {
          engine: 'GOWS',
          webhooks: [
            {
              url: `${process.env.BACKEND_URL}/api/marketing/waha/webhook`,
              events: ['message', 'session.status'],
            },
          ],
        },
      },
      {
        headers: { 'X-Api-Key': session.wahaApiKey },
      }
    );
  }
}
