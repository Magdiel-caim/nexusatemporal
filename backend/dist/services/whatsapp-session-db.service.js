"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppSessionDBService = void 0;
const data_source_1 = require("../database/data-source");
class WhatsAppSessionDBService {
    /**
     * Salvar ou atualizar sessão no banco
     */
    async upsertSession(sessionName, friendlyName, status = 'SCAN_QR_CODE', userId) {
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
        const result = await data_source_1.AppDataSource.query(query, [sessionName, friendlyName, status, userId || null]);
        return result[0];
    }
    /**
     * Atualizar status da sessão
     */
    async updateStatus(sessionName, status) {
        const query = `
      UPDATE whatsapp_sessions
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE session_name = $2
    `;
        await data_source_1.AppDataSource.query(query, [status, sessionName]);
    }
    /**
     * Buscar sessão por nome
     */
    async getSessionByName(sessionName) {
        const query = `SELECT * FROM whatsapp_sessions WHERE session_name = $1`;
        const result = await data_source_1.AppDataSource.query(query, [sessionName]);
        return result[0] || null;
    }
    /**
     * Listar todas as sessões
     */
    async listSessions(userId) {
        let query = `SELECT * FROM whatsapp_sessions`;
        const params = [];
        if (userId) {
            query += ` WHERE user_id = $1`;
            params.push(userId);
        }
        query += ` ORDER BY created_at DESC`;
        const result = await data_source_1.AppDataSource.query(query, params);
        return result;
    }
    /**
     * Deletar sessão
     */
    async deleteSession(sessionName) {
        const query = `DELETE FROM whatsapp_sessions WHERE session_name = $1`;
        await data_source_1.AppDataSource.query(query, [sessionName]);
    }
}
exports.WhatsAppSessionDBService = WhatsAppSessionDBService;
//# sourceMappingURL=whatsapp-session-db.service.js.map