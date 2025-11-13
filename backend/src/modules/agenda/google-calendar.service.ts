import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '@/shared/utils/logger';
import { Appointment } from './appointment.entity';
import { CrmDataSource } from '@/database/data-source';
import { Repository } from 'typeorm';

/**
 * Google Calendar Integration Entity
 * Armazena tokens OAuth2 e configurações por profissional
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CalendarSyncStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

@Entity('google_calendar_integrations')
export class GoogleCalendarIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  userId: string; // Professional/User ID

  @Column({ type: 'varchar' })
  tenantId: string;

  @Column({ type: 'text' })
  accessToken: string;

  @Column({ type: 'text' })
  refreshToken: string;

  @Column({ type: 'timestamp' })
  tokenExpiry: Date;

  @Column({ type: 'varchar', nullable: true })
  calendarId: string; // ID do calendário no Google (geralmente 'primary')

  @Column({
    type: 'enum',
    enum: CalendarSyncStatus,
    default: CalendarSyncStatus.ACTIVE,
  })
  status: CalendarSyncStatus;

  @Column({ type: 'boolean', default: true })
  syncEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    colorId?: string; // Cor dos eventos
    defaultReminders?: boolean;
    sendNotifications?: boolean;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'text', nullable: true })
  lastError: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Google Calendar Service
 * Gerencia sincronização bidirecional com Google Calendar
 */
export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private integrationRepo: Repository<GoogleCalendarIntegration>;
  private appointmentRepo: Repository<Appointment>;

  constructor() {
    // Configurar OAuth2 Client
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || `${process.env.BACKEND_URL}/api/agenda/google-calendar/callback`
    );

    this.integrationRepo = CrmDataSource.getRepository(GoogleCalendarIntegration);
    this.appointmentRepo = CrmDataSource.getRepository(Appointment);
  }

  /**
   * Gera URL de autorização OAuth2
   */
  getAuthUrl(userId: string, tenantId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    const state = Buffer.from(JSON.stringify({ userId, tenantId })).toString('base64');

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Necessário para refresh token
      scope: scopes,
      state, // Para identificar o usuário no callback
      prompt: 'consent', // Força solicitação de consent para obter refresh token
    });
  }

  /**
   * Troca código de autorização por tokens
   */
  async exchangeCodeForTokens(
    code: string,
    userId: string,
    tenantId: string
  ): Promise<GoogleCalendarIntegration> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to obtain tokens from Google');
      }

      // Salvar ou atualizar integração
      let integration = await this.integrationRepo.findOne({
        where: { userId, tenantId },
      });

      if (integration) {
        // Atualizar tokens existentes
        integration.accessToken = tokens.access_token;
        integration.refreshToken = tokens.refresh_token!;
        integration.tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000);
        integration.status = CalendarSyncStatus.ACTIVE;
        integration.syncEnabled = true;
        integration.lastError = undefined as any;
      } else {
        // Criar nova integração
        integration = this.integrationRepo.create({
          userId,
          tenantId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token!,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000),
          calendarId: 'primary',
          status: CalendarSyncStatus.ACTIVE,
          syncEnabled: true,
          settings: {
            colorId: '9', // Azul padrão
            defaultReminders: true,
            sendNotifications: true,
          },
        });
      }

      await this.integrationRepo.save(integration);

      logger.info(`✅ Google Calendar integration configured for user ${userId}`);

      return integration;
    } catch (error: any) {
      logger.error('❌ Error exchanging code for tokens:', { error: error.message });
      throw error;
    }
  }

  /**
   * Obtém cliente autenticado do Google Calendar
   */
  private async getAuthenticatedClient(
    userId: string,
    tenantId: string
  ): Promise<calendar_v3.Calendar> {
    const integration = await this.integrationRepo.findOne({
      where: { userId, tenantId, syncEnabled: true },
    });

    if (!integration) {
      throw new Error('Google Calendar integration not found or disabled');
    }

    // Verificar se token está expirado
    const now = new Date();
    if (integration.tokenExpiry <= now) {
      // Renovar token
      await this.refreshAccessToken(integration);
    }

    // Configurar cliente com tokens
    this.oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
    });

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Renova access token usando refresh token
   */
  private async refreshAccessToken(integration: GoogleCalendarIntegration): Promise<void> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: integration.refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (credentials.access_token) {
        integration.accessToken = credentials.access_token;
        integration.tokenExpiry = credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : new Date(Date.now() + 3600000);

        await this.integrationRepo.save(integration);

        logger.info(`🔄 Access token refreshed for user ${integration.userId}`);
      }
    } catch (error: any) {
      logger.error('❌ Error refreshing access token:', { error: error.message });
      integration.status = CalendarSyncStatus.ERROR;
      integration.lastError = error.message;
      await this.integrationRepo.save(integration);
      throw error;
    }
  }

  /**
   * Sincroniza agendamento do Nexus → Google Calendar
   * Cria ou atualiza evento no Google Calendar
   */
  async syncAppointmentToGoogle(appointmentId: string, tenantId: string): Promise<void> {
    try {
      const appointment = await this.appointmentRepo.findOne({
        where: { id: appointmentId, tenantId },
        relations: ['lead', 'professional', 'procedure'],
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Verificar se há integração configurada para o profissional
      if (!appointment.professionalId) {
        logger.warn('⚠️  Appointment has no professional assigned, skipping Google Calendar sync');
        return;
      }

      const calendar = await this.getAuthenticatedClient(appointment.professionalId, tenantId);

      const integration = await this.integrationRepo.findOne({
        where: { userId: appointment.professionalId, tenantId },
      });

      if (!integration) {
        logger.warn(`⚠️  No Google Calendar integration for user ${appointment.professionalId}`);
        return;
      }

      // Calcular horário de término
      const startTime = new Date(appointment.scheduledDate);
      const endTime = new Date(startTime.getTime() + (appointment.estimatedDuration || 60) * 60000);

      // Preparar evento
      const event: calendar_v3.Schema$Event = {
        summary: `${appointment.lead?.name || 'Cliente'} - ${appointment.procedure?.name || 'Procedimento'}`,
        description: appointment.notes || '',
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        location: appointment.location,
        colorId: integration.settings?.colorId || '9',
        reminders: integration.settings?.defaultReminders
          ? {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 24 * 60 }, // 24h antes
                { method: 'popup', minutes: 30 }, // 30 min antes
              ],
            }
          : undefined,
      };

      // Verificar se já existe evento associado
      const googleEventId = (appointment as any).googleEventId; // Precisaria adicionar esta coluna no entity

      if (googleEventId) {
        // Atualizar evento existente
        await calendar.events.update({
          calendarId: integration.calendarId || 'primary',
          eventId: googleEventId,
          requestBody: event,
        });

        logger.info(`📅 Updated Google Calendar event ${googleEventId} for appointment ${appointmentId}`);
      } else {
        // Criar novo evento
        const response = await calendar.events.insert({
          calendarId: integration.calendarId || 'primary',
          requestBody: event,
        });

        // Salvar ID do evento no agendamento
        // Nota: Isso requer adicionar campo googleEventId no entity Appointment
        // await this.appointmentRepo.update(appointmentId, { googleEventId: response.data.id });

        logger.info(`📅 Created Google Calendar event ${response.data.id} for appointment ${appointmentId}`);
      }

      // Atualizar último sync
      integration.lastSyncAt = new Date();
      await this.integrationRepo.save(integration);
    } catch (error: any) {
      logger.error('❌ Error syncing appointment to Google Calendar:', {
        appointmentId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Deleta evento do Google Calendar quando agendamento é cancelado
   */
  async deleteAppointmentFromGoogle(appointmentId: string, tenantId: string): Promise<void> {
    try {
      const appointment = await this.appointmentRepo.findOne({
        where: { id: appointmentId, tenantId },
      });

      if (!appointment || !appointment.professionalId) {
        return;
      }

      const googleEventId = (appointment as any).googleEventId;

      if (!googleEventId) {
        logger.warn('⚠️  Appointment has no associated Google Calendar event');
        return;
      }

      const calendar = await this.getAuthenticatedClient(appointment.professionalId, tenantId);

      const integration = await this.integrationRepo.findOne({
        where: { userId: appointment.professionalId, tenantId },
      });

      if (!integration) {
        return;
      }

      await calendar.events.delete({
        calendarId: integration.calendarId || 'primary',
        eventId: googleEventId,
      });

      logger.info(`🗑️  Deleted Google Calendar event ${googleEventId} for appointment ${appointmentId}`);

      // Atualizar último sync
      integration.lastSyncAt = new Date();
      await this.integrationRepo.save(integration);
    } catch (error: any) {
      logger.error('❌ Error deleting appointment from Google Calendar:', {
        appointmentId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Desconecta integração com Google Calendar
   */
  async disconnectIntegration(userId: string, tenantId: string): Promise<void> {
    const integration = await this.integrationRepo.findOne({
      where: { userId, tenantId },
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    // Revogar token no Google
    try {
      await this.oauth2Client.revokeToken(integration.accessToken);
    } catch (error: any) {
      logger.warn('Failed to revoke token (may already be revoked):', error.message);
    }

    // Desativar integração
    integration.syncEnabled = false;
    integration.status = CalendarSyncStatus.INACTIVE;
    await this.integrationRepo.save(integration);

    logger.info(`🔌 Disconnected Google Calendar integration for user ${userId}`);
  }

  /**
   * Verifica status da integração
   */
  async getIntegrationStatus(userId: string, tenantId: string): Promise<{
    connected: boolean;
    lastSync: Date | null;
    status: CalendarSyncStatus | null;
    error: string | null;
  }> {
    const integration = await this.integrationRepo.findOne({
      where: { userId, tenantId },
    });

    if (!integration) {
      return {
        connected: false,
        lastSync: null,
        status: null,
        error: null,
      };
    }

    return {
      connected: integration.syncEnabled,
      lastSync: integration.lastSyncAt,
      status: integration.status,
      error: integration.lastError,
    };
  }
}
