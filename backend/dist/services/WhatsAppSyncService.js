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
    SESSION_NAME = 'session_01k77wpm5edhch4b97qbgenk7p';
    WAHA_URL = 'https://apiwts.nexusatemporal.com.br';
    WAHA_API_KEY = 'bd0c416348b2f04d198ff8971b608a87';
    ENABLED = true; // Habilitado para polling
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
     */
    async syncMessages() {
        try {
            // Buscar chats ativos do WAHA
            const chats = await this.getWAHAChats();
            if (!chats || chats.length === 0) {
                return; // Sem chats para sincronizar
            }
            // Para cada chat, buscar mensagens recentes
            for (const chat of chats) {
                await this.syncChatMessages(chat.id);
            }
        }
        catch (error) {
            console.error('❌ Erro ao sincronizar mensagens:', error.message);
        }
    }
    /**
     * Busca lista de chats do WAHA
     */
    async getWAHAChats() {
        try {
            const response = await fetch(`${this.WAHA_URL}/api/${this.SESSION_NAME}/chats`, {
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
            console.error('❌ Erro ao buscar chats do WAHA:', error.message);
            return [];
        }
    }
    /**
     * Sincroniza mensagens de um chat específico
     */
    async syncChatMessages(chatId) {
        try {
            // Ignorar grupos e status
            if (chatId.includes('@g.us') || chatId.includes('status@broadcast')) {
                return;
            }
            // Buscar últimas 20 mensagens do WAHA
            const response = await fetch(`${this.WAHA_URL}/api/${this.SESSION_NAME}/chats/${chatId}/messages?limit=20`, {
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
                await this.processMessage(msg, chatId);
            }
        }
        catch (error) {
            // Silencioso - não logar cada erro de chat individual
        }
    }
    /**
     * Processa uma mensagem individual
     */
    async processMessage(msg, chatId) {
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
                this.SESSION_NAME,
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