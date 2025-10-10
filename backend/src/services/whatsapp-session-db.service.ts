import { AppDataSource } from '@/database/data-source';

export interface WhatsAppSession {
  id: string;
  session_name: string;
  friendly_name: string;
  status: string;
  user_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export class WhatsAppSessionDBService {
  /**
   * Salvar ou atualizar sessão no banco
   */
  async upsertSession(
    sessionName: string,
    friendlyName: string,
    status: string = 'SCAN_QR_CODE',
    userId?: string
  ): Promise<WhatsAppSession> {
    const query = `
      INSERT INTO whatsapp_sessions (session_name, friendly_name, status, user_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (session_name)
      DO UPDATE SET
        friendly_name = EXCLUDED.friendly_name,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await AppDataSource.query(query, [sessionName, friendlyName, status, userId || null]);
    return result[0];
  }

  /**
   * Atualizar status da sessão
   */
  async updateStatus(sessionName: string, status: string): Promise<void> {
    const query = `
      UPDATE whatsapp_sessions
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE session_name = $2
    `;

    await AppDataSource.query(query, [status, sessionName]);
  }

  /**
   * Buscar sessão por nome
   */
  async getSessionByName(sessionName: string): Promise<WhatsAppSession | null> {
    const query = `SELECT * FROM whatsapp_sessions WHERE session_name = $1`;
    const result = await AppDataSource.query(query, [sessionName]);
    return result[0] || null;
  }

  /**
   * Listar todas as sessões
   */
  async listSessions(userId?: string): Promise<WhatsAppSession[]> {
    let query = `SELECT * FROM whatsapp_sessions`;
    const params: any[] = [];

    if (userId) {
      query += ` WHERE user_id = $1`;
      params.push(userId);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await AppDataSource.query(query, params);
    return result;
  }

  /**
   * Deletar sessão
   */
  async deleteSession(sessionName: string): Promise<void> {
    const query = `DELETE FROM whatsapp_sessions WHERE session_name = $1`;
    await AppDataSource.query(query, [sessionName]);
  }
}
