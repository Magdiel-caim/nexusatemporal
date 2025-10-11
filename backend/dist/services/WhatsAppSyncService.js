"use strict";
/**
 * WhatsApp Sync Service - SOLUÇÃO TEMPORÁRIA DE POLLING
 *
 * OBJETIVO: Sincronizar mensagens do WAHA que não chegam via webhook
 *
 * COMO DESATIVAR:
 * 1. Setar variável de ambiente: ENABLE_WHATSAPP_POLLING=false
 * 2. OU comentar a linha de inicialização no server.ts
 *
 * QUANDO REMOVER:
 * - Quando webhooks do WAHA funcionarem 100% para mensagens reais
 * - Testar antes: enviar mensagem via WhatsApp Web e verificar webhook
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppSyncService = void 0;
const data_source_1 = require("@/database/data-source");
class WhatsAppSyncService {
    syncInterval = null;
    isRunning = false;
    io = null;
    // Configurações (pode mover para .env depois)
    POLLING_INTERVAL_MS = 5000; // 5 segundos
    WAHA_URL = 'https://apiwts.nexusatemporal.com.br';
    WAHA_API_KEY = 'bd0c416348b2f04d198ff8971b608a87';
    ENABLED = true; // REATIVADO - sincroniza TODAS as sessões automaticamente
    constructor(socketIO) {
        this.io = socketIO;
    }
    /**
     * Inicia o serviço de sincronização
     */
    start() {
        if (!this.ENABLED) {
            console.log('⏸️ WhatsApp Polling DESATIVADO via env var');
            return;
        }
        if (this.isRunning) {
            console.log('⚠️ WhatsApp Sync já está rodando');
            return;
        }
        console.log('🔄 Iniciando WhatsApp Sync Service...');
        console.log(`📡 Polling a cada ${this.POLLING_INTERVAL_MS}ms`);
        this.isRunning = true;
        this.syncInterval = setInterval(() => {
            this.syncMessages().catch(err => {
                console.error('❌ Erro no sync:', err.message);
            });
        }, this.POLLING_INTERVAL_MS);
        // Primeira execução imediata
        this.syncMessages().catch(err => {
            console.error('❌ Erro no sync inicial:', err.message);
        });
    }
    /**
     * Para o serviço de sincronização
     */
    stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            this.isRunning = false;
            console.log('🛑 WhatsApp Sync Service parado');
        }
    }
    /**
     * Sincroniza mensagens do WAHA com o banco
     * IMPORTANTE: Sincroniza APENAS sessões criadas pelo usuário no sistema
     */
    async syncMessages() {
        try {
            // Buscar sessões criadas PELO SISTEMA (tabela whatsapp_sessions)
            const userSessions = await this.getUserSessions();
            if (!userSessions || userSessions.length === 0) {
                return; // Sem sessões do usuário para sincronizar
            }
            console.log(`🔄 [SYNC] Sincronizando ${userSessions.length} sessão(ões) do sistema`);
            // Para cada sessão do usuário
            for (const dbSession of userSessions) {
                // Verificar status no WAHA
                const wahaStatus = await this.getWAHASessionStatus(dbSession.session_name);
                if (wahaStatus !== 'WORKING') {
                    continue; // Apenas sessões ativas
                }
                await this.syncSessionMessages(dbSession.session_name);
            }
        }
        catch (error) {
            console.error('❌ Erro ao sincronizar mensagens:', error.message);
        }
    }
    /**
     * Busca sessões criadas pelo usuário no sistema (tabela whatsapp_sessions)
     */
    async getUserSessions() {
        try {
            const sessions = await data_source_1.AppDataSource.query(`SELECT session_name, friendly_name, status
         FROM whatsapp_sessions
         WHERE status != 'STOPPED'
         ORDER BY created_at DESC`);
            return sessions;
        }
        catch (error) {
            console.error('❌ Erro ao buscar sessões do sistema:', error.message);
            return [];
        }
    }
    /**
     * Verifica status de uma sessão no WAHA
     */
    async getWAHASessionStatus(sessionName) {
        try {
            const response = await fetch(`${this.WAHA_URL}/api/sessions/${sessionName}`, {
                headers: {
                    'X-Api-Key': this.WAHA_API_KEY,
                },
            });
            if (!response.ok) {
                return 'FAILED';
            }
            const data = await response.json();
            return data.status || 'FAILED';
        }
        catch (error) {
            return 'FAILED';
        }
    }
    /**
     * Sincroniza mensagens de uma sessão específica
     */
    async syncSessionMessages(sessionName) {
        try {
            // Buscar chats ativos da sessão
            const chats = await this.getWAHAChats(sessionName);
            if (!chats || chats.length === 0) {
                return; // Sem chats para sincronizar
            }
            // Para cada chat, buscar mensagens recentes
            for (const chat of chats) {
                await this.syncChatMessages(sessionName, chat.id);
            }
        }
        catch (error) {
            // Silencioso - não logar cada erro de sessão individual
        }
    }
    /**
     * Busca lista de chats de uma sessão do WAHA
     */
    async getWAHAChats(sessionName) {
        try {
            const response = await fetch(`${this.WAHA_URL}/api/${sessionName}/chats`, {
                headers: {
                    'X-Api-Key': this.WAHA_API_KEY,
                },
            });
            if (!response.ok) {
                throw new Error(`WAHA API error: ${response.status}`);
            }
            return (await response.json());
        }
        catch (error) {
            // Silencioso - pode ser sessão sem chats
            return [];
        }
    }
    /**
     * Sincroniza mensagens de um chat específico de uma sessão
     */
    async syncChatMessages(sessionName, chatId) {
        try {
            // Ignorar grupos e status
            if (chatId.includes('@g.us') || chatId.includes('status@broadcast')) {
                return;
            }
            // Buscar últimas 20 mensagens do WAHA
            const response = await fetch(`${this.WAHA_URL}/api/${sessionName}/chats/${chatId}/messages?limit=20`, {
                headers: {
                    'X-Api-Key': this.WAHA_API_KEY,
                },
            });
            if (!response.ok) {
                return; // Chat pode não ter mensagens
            }
            const messages = (await response.json());
            // Processar cada mensagem
            for (const msg of messages) {
                await this.processMessage(sessionName, msg, chatId);
            }
        }
        catch (error) {
            // Silencioso - não logar cada erro de chat individual
        }
    }
    /**
     * Processa uma mensagem individual
     */
    async processMessage(sessionName, msg, chatId) {
        try {
            // Extrair número do telefone
            // Formato: 554192431011@c.us ou 554192431011@s.whatsapp.net ou 554192431011@lid
            const phoneNumber = chatId.replace(/@c\.us|@s\.whatsapp\.net|@lid/g, '');
            // Verificar se mensagem já existe no banco
            const existing = await data_source_1.AppDataSource.query(`SELECT id FROM chat_messages WHERE waha_message_id = $1`, [msg.id]);
            if (existing.length > 0) {
                return; // Mensagem já existe
            }
            // Determinar direção
            const direction = msg.fromMe ? 'outgoing' : 'incoming';
            const isRead = direction === 'outgoing';
            // Nome do contato
            const contactName = msg._data?.notifyName || phoneNumber;
            // Salvar no banco
            const result = await data_source_1.AppDataSource.query(`INSERT INTO chat_messages (
          session_name,
          phone_number,
          contact_name,
          direction,
          message_type,
          content,
          waha_message_id,
          status,
          created_at,
          is_read
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`, [
                sessionName, // Agora usa o nome da sessão correto
                phoneNumber,
                contactName,
                direction,
                msg.type || 'text',
                msg.body || '',
                msg.id,
                'received',
                new Date(msg.timestamp * 1000),
                isRead,
            ]);
            const savedMessage = result[0];
            console.log('✅ [SYNC] Nova mensagem salva:', {
                session: sessionName,
                id: savedMessage.id,
                phone: phoneNumber,
                direction,
            });
            // Emitir via WebSocket
            if (this.io) {
                this.io.emit('chat:new-message', {
                    id: savedMessage.id,
                    sessionName: savedMessage.session_name,
                    phoneNumber: savedMessage.phone_number,
                    contactName: savedMessage.contact_name,
                    direction: savedMessage.direction,
                    messageType: savedMessage.message_type,
                    content: savedMessage.content,
                    createdAt: savedMessage.created_at,
                });
            }
        }
        catch (error) {
            // Silencioso - pode ser mensagem duplicada ou erro temporário
        }
    }
}
exports.WhatsAppSyncService = WhatsAppSyncService;
exports.default = WhatsAppSyncService;
//# sourceMappingURL=WhatsAppSyncService.js.map