"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8NWebhookController = void 0;
var data_source_1 = require("@/database/data-source");
var N8NWebhookController = /** @class */ (function () {
    function N8NWebhookController() {
    }
    /**
     * Recebe mensagens do N8N (vindas da WAHA)
     * POST /api/chat/webhook/n8n/message
     */
    N8NWebhookController.prototype.receiveMessage = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, result, savedMessage, io, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        payload = req.body;
                        console.log('📨 Mensagem recebida do N8N:', {
                            session: payload.sessionName,
                            from: payload.phoneNumber,
                            type: payload.messageType,
                            direction: payload.direction,
                        });
                        return [4 /*yield*/, data_source_1.AppDataSource.query("INSERT INTO chat_messages (\n          session_name,\n          phone_number,\n          contact_name,\n          direction,\n          message_type,\n          content,\n          media_url,\n          waha_message_id,\n          status,\n          metadata,\n          created_at\n        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)\n        RETURNING *", [
                                payload.sessionName,
                                payload.phoneNumber,
                                payload.contactName || payload.phoneNumber,
                                payload.direction,
                                payload.messageType,
                                payload.content,
                                payload.mediaUrl || null,
                                payload.wahaMessageId || null,
                                payload.status || 'received',
                                JSON.stringify(payload.rawPayload || {}),
                                payload.timestamp ? new Date(payload.timestamp) : new Date(),
                            ])];
                    case 1:
                        result = _a.sent();
                        savedMessage = result[0];
                        io = req.app.get('io');
                        if (io) {
                            io.emit('chat:new-message', {
                                id: savedMessage.id,
                                sessionName: savedMessage.session_name,
                                phoneNumber: savedMessage.phone_number,
                                contactName: savedMessage.contact_name,
                                direction: savedMessage.direction,
                                messageType: savedMessage.message_type,
                                content: savedMessage.content,
                                mediaUrl: savedMessage.media_url,
                                createdAt: savedMessage.created_at,
                            });
                            console.log('✅ Mensagem emitida via WebSocket');
                        }
                        res.json({
                            success: true,
                            message: 'Message received and saved',
                            data: {
                                id: savedMessage.id,
                                sessionName: savedMessage.session_name,
                                phoneNumber: savedMessage.phone_number,
                            },
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ Erro ao processar mensagem do N8N:', error_1);
                        res.status(500).json({
                            success: false,
                            error: error_1.message,
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Lista mensagens de uma sessão (com filtro opcional de phoneNumber)
     * GET /api/chat/n8n/messages/:sessionName?phoneNumber=xxx
     */
    N8NWebhookController.prototype.getMessages = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionName, _a, _b, limit, _c, offset, phoneNumber, query, params, messages, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        sessionName = req.params.sessionName;
                        _a = req.query, _b = _a.limit, limit = _b === void 0 ? 50 : _b, _c = _a.offset, offset = _c === void 0 ? 0 : _c, phoneNumber = _a.phoneNumber;
                        query = "SELECT\n          id,\n          session_name as \"sessionName\",\n          phone_number as \"phoneNumber\",\n          contact_name as \"contactName\",\n          direction,\n          message_type as \"messageType\",\n          content,\n          media_url as \"mediaUrl\",\n          status,\n          created_at as \"createdAt\"\n        FROM chat_messages\n        WHERE session_name = $1";
                        params = [sessionName];
                        // Se phoneNumber for fornecido, adicionar ao filtro
                        if (phoneNumber) {
                            query += " AND phone_number = $".concat(params.length + 1);
                            params.push(phoneNumber);
                        }
                        query += " ORDER BY created_at ASC LIMIT $".concat(params.length + 1, " OFFSET $").concat(params.length + 2);
                        params.push(limit, offset);
                        return [4 /*yield*/, data_source_1.AppDataSource.query(query, params)];
                    case 1:
                        messages = _d.sent();
                        res.json({
                            success: true,
                            data: messages, // Já está em ordem cronológica (ASC)
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _d.sent();
                        console.error('❌ Erro ao buscar mensagens:', error_2);
                        res.status(500).json({
                            success: false,
                            error: error_2.message,
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Lista todas as conversas (sessões com última mensagem)
     * GET /api/chat/conversations
     *
     * IMPORTANTE: Lista apenas conversas de sessões criadas pelo sistema (tabela whatsapp_sessions)
     * Ignora mensagens de sessões externas (ex: Chatwoot)
     */
    N8NWebhookController.prototype.getConversations = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var conversations, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, data_source_1.AppDataSource.query("\n        WITH latest_messages AS (\n          SELECT DISTINCT ON (cm.session_name, cm.phone_number)\n            cm.session_name,\n            cm.phone_number,\n            cm.contact_name,\n            cm.content,\n            cm.created_at\n          FROM chat_messages cm\n          INNER JOIN whatsapp_sessions ws ON cm.session_name = ws.session_name\n          ORDER BY cm.session_name, cm.phone_number, cm.created_at DESC\n        ),\n        unread_counts AS (\n          SELECT\n            cm.session_name,\n            cm.phone_number,\n            COUNT(*) FILTER (WHERE cm.is_read = false AND cm.direction = 'incoming') as unread_count\n          FROM chat_messages cm\n          INNER JOIN whatsapp_sessions ws ON cm.session_name = ws.session_name\n          GROUP BY cm.session_name, cm.phone_number\n        )\n        SELECT\n          lm.session_name as \"sessionName\",\n          lm.phone_number as \"phoneNumber\",\n          lm.contact_name as \"contactName\",\n          lm.content as \"lastMessage\",\n          lm.created_at as \"lastMessageAt\",\n          COALESCE(uc.unread_count, 0) as \"unreadCount\",\n          CASE\n            WHEN lm.phone_number LIKE '%@g.us' THEN 'group'\n            ELSE 'individual'\n          END as \"chatType\"\n        FROM latest_messages lm\n        LEFT JOIN unread_counts uc ON lm.session_name = uc.session_name AND lm.phone_number = uc.phone_number\n        ORDER BY lm.created_at DESC\n      ")];
                    case 1:
                        conversations = _a.sent();
                        res.json({
                            success: true,
                            data: conversations,
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('❌ Erro ao buscar conversas:', error_3);
                        res.status(500).json({
                            success: false,
                            error: error_3.message,
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Marca todas as mensagens de uma conversa como lidas
     * POST /api/chat/n8n/messages/:sessionName/mark-read?phoneNumber=xxx
     */
    N8NWebhookController.prototype.markAsRead = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionName, phoneNumber, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sessionName = req.params.sessionName;
                        phoneNumber = req.query.phoneNumber;
                        if (!phoneNumber) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    error: 'phoneNumber is required',
                                })];
                        }
                        return [4 /*yield*/, data_source_1.AppDataSource.query("UPDATE chat_messages\n         SET is_read = true\n         WHERE session_name = $1\n         AND phone_number = $2\n         AND direction = 'incoming'\n         AND is_read = false", [sessionName, phoneNumber])];
                    case 1:
                        _a.sent();
                        res.json({
                            success: true,
                            message: 'Messages marked as read',
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('❌ Erro ao marcar mensagens como lidas:', error_4);
                        res.status(500).json({
                            success: false,
                            error: error_4.message,
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deleta uma mensagem específica
     * DELETE /api/chat/n8n/messages/:messageId
     */
    N8NWebhookController.prototype.deleteMessage = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var messageId, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        messageId = req.params.messageId;
                        return [4 /*yield*/, data_source_1.AppDataSource.query("DELETE FROM chat_messages WHERE id = $1 RETURNING id", [messageId])];
                    case 1:
                        result = _a.sent();
                        if (result.length === 0) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    error: 'Message not found',
                                })];
                        }
                        res.json({
                            success: true,
                            message: 'Message deleted successfully',
                            id: result[0].id,
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('❌ Erro ao deletar mensagem:', error_5);
                        res.status(500).json({
                            success: false,
                            error: error_5.message,
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Envia mensagem via WhatsApp
     * POST /api/chat/n8n/send-message
     */
    N8NWebhookController.prototype.sendMessage = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, sessionName, phoneNumber, content, wahaUrl, wahaApiKey, wahaResponse, errorText, wahaData, result, savedMessage, io, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        _a = req.body, sessionName = _a.sessionName, phoneNumber = _a.phoneNumber, content = _a.content;
                        if (!sessionName || !phoneNumber || !content) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    error: 'sessionName, phoneNumber and content are required',
                                })];
                        }
                        console.log('📤 Enviando mensagem via WAHA:', {
                            session: sessionName,
                            phone: phoneNumber,
                        });
                        wahaUrl = "https://apiwts.nexusatemporal.com.br/api/sendText";
                        wahaApiKey = 'bd0c416348b2f04d198ff8971b608a87';
                        return [4 /*yield*/, fetch(wahaUrl, {
                                method: 'POST',
                                headers: {
                                    'X-Api-Key': wahaApiKey,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    session: sessionName,
                                    chatId: "".concat(phoneNumber, "@c.us"),
                                    text: content,
                                }),
                            })];
                    case 1:
                        wahaResponse = _b.sent();
                        if (!!wahaResponse.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, wahaResponse.text()];
                    case 2:
                        errorText = _b.sent();
                        throw new Error("WAHA API error: ".concat(wahaResponse.status, " - ").concat(errorText));
                    case 3: return [4 /*yield*/, wahaResponse.json()];
                    case 4:
                        wahaData = _b.sent();
                        console.log('✅ Mensagem enviada via WAHA:', wahaData.id);
                        return [4 /*yield*/, data_source_1.AppDataSource.query("INSERT INTO chat_messages (\n          session_name,\n          phone_number,\n          contact_name,\n          direction,\n          message_type,\n          content,\n          waha_message_id,\n          status,\n          created_at,\n          is_read\n        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)\n        RETURNING *", [
                                sessionName,
                                phoneNumber,
                                phoneNumber, // contactName
                                'outgoing',
                                'text',
                                content,
                                wahaData.id,
                                'sent',
                                new Date(),
                                true, // outgoing sempre lida
                            ])];
                    case 5:
                        result = _b.sent();
                        savedMessage = result[0];
                        console.log('✅ Mensagem salva no banco:', savedMessage.id);
                        io = req.app.get('io');
                        if (io) {
                            io.emit('chat:new-message', {
                                id: savedMessage.id,
                                sessionName: savedMessage.session_name,
                                phoneNumber: savedMessage.phone_number,
                                contactName: savedMessage.contact_name,
                                direction: savedMessage.direction,
                                messageType: savedMessage.message_type,
                                content: savedMessage.content,
                                createdAt: savedMessage.created_at,
                            });
                            console.log('🔊 Mensagem emitida via WebSocket');
                        }
                        res.json({
                            success: true,
                            data: {
                                id: savedMessage.id,
                                sessionName: savedMessage.session_name,
                                phoneNumber: savedMessage.phone_number,
                                direction: savedMessage.direction,
                                messageType: savedMessage.message_type,
                                content: savedMessage.content,
                                status: savedMessage.status,
                                createdAt: savedMessage.created_at,
                            },
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_6 = _b.sent();
                        console.error('❌ Erro ao enviar mensagem:', error_6);
                        res.status(500).json({
                            success: false,
                            error: error_6.message,
                        });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Recebe webhooks DIRETAMENTE do WAHA (sem passar pelo N8N)
     * POST /api/chat/webhook/waha/message
     */
    N8NWebhookController.prototype.receiveWAHAWebhook = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var wahaPayload, revokedMessageId, deletedResult, deletedMessage, io_1, payload, session, isGroup, isStatus, phoneNumber, contactName, messageType, content, mediaUrl, direction, timestamp, isRead, result, savedMessage, io, error_7;
            var _a, _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 5, , 6]);
                        wahaPayload = req.body;
                        console.log('🔔 Webhook WAHA recebido:', {
                            event: wahaPayload.event,
                            session: wahaPayload.session,
                            from: (_a = wahaPayload.payload) === null || _a === void 0 ? void 0 : _a.from,
                        });
                        if (!(wahaPayload.event === 'message.revoked')) return [3 /*break*/, 3];
                        console.log('🗑️ Mensagem revogada recebida:', {
                            session: wahaPayload.session,
                            revokedMessageId: (_b = wahaPayload.payload) === null || _b === void 0 ? void 0 : _b.revokedMessageId
                        });
                        revokedMessageId = (_c = wahaPayload.payload) === null || _c === void 0 ? void 0 : _c.revokedMessageId;
                        if (!revokedMessageId) return [3 /*break*/, 2];
                        return [4 /*yield*/, data_source_1.AppDataSource.query("DELETE FROM chat_messages WHERE waha_message_id = $1 RETURNING id, session_name, phone_number", [revokedMessageId])];
                    case 1:
                        deletedResult = _h.sent();
                        if (deletedResult.length > 0) {
                            deletedMessage = deletedResult[0];
                            console.log('✅ Mensagem deletada do banco:', deletedMessage.id);
                            io_1 = req.app.get('io');
                            if (io_1) {
                                io_1.emit('chat:message-deleted', {
                                    messageId: deletedMessage.id,
                                    sessionName: deletedMessage.session_name,
                                    phoneNumber: deletedMessage.phone_number,
                                });
                                console.log('🔊 Evento de exclusão emitido via WebSocket');
                            }
                            return [2 /*return*/, res.json({
                                    success: true,
                                    message: 'Message revoked and deleted',
                                    deletedMessageId: deletedMessage.id,
                                })];
                        }
                        else {
                            console.log('⚠️ Mensagem não encontrada no banco:', revokedMessageId);
                        }
                        _h.label = 2;
                    case 2: return [2 /*return*/, res.json({ success: true, message: 'Message revoked event processed' })];
                    case 3:
                        // Filtrar apenas eventos de mensagem (só processar 'message', ignorar 'message.any' para evitar duplicação)
                        if (wahaPayload.event !== 'message') {
                            console.log('⏭️ Evento ignorado (não é "message"):', wahaPayload.event);
                            return [2 /*return*/, res.json({ success: true, message: 'Event ignored (not a message)' })];
                        }
                        payload = wahaPayload.payload;
                        session = wahaPayload.session;
                        isGroup = payload.from && payload.from.includes('@g.us');
                        isStatus = payload.from && payload.from.includes('status@broadcast');
                        // IMPORTANTE: Ignorar apenas status do WhatsApp (grupos são permitidos)
                        if (isStatus) {
                            console.log('⏭️ Status ignorado:', payload.from);
                            return [2 /*return*/, res.json({
                                    success: true,
                                    message: 'Status messages ignored',
                                    ignored: true
                                })];
                        }
                        phoneNumber = '';
                        if (payload.from) {
                            if (isGroup) {
                                // Para grupos, manter @g.us
                                phoneNumber = payload.from;
                            }
                            else {
                                // Para individuais, remover sufixos @c.us, @lid, @s.whatsapp.net
                                phoneNumber = payload.from.replace(/@c\.us|@lid|@s\.whatsapp\.net/g, '');
                            }
                        }
                        contactName = ((_e = (_d = payload._data) === null || _d === void 0 ? void 0 : _d.Info) === null || _e === void 0 ? void 0 : _e.PushName) ||
                            ((_f = payload._data) === null || _f === void 0 ? void 0 : _f.notifyName) ||
                            phoneNumber;
                        messageType = payload.type || 'text';
                        content = payload.body || '';
                        mediaUrl = ((_g = payload._data) === null || _g === void 0 ? void 0 : _g.mediaUrl) || null;
                        direction = payload.fromMe ? 'outgoing' : 'incoming';
                        timestamp = payload.timestamp ? payload.timestamp * 1000 : Date.now();
                        console.log('📝 Mensagem processada:', {
                            sessionName: session,
                            phoneNumber: phoneNumber,
                            contactName: contactName,
                            messageType: messageType,
                            direction: direction,
                            isGroup: isGroup,
                        });
                        isRead = direction === 'outgoing';
                        return [4 /*yield*/, data_source_1.AppDataSource.query("INSERT INTO chat_messages (\n          session_name,\n          phone_number,\n          contact_name,\n          direction,\n          message_type,\n          content,\n          media_url,\n          waha_message_id,\n          status,\n          metadata,\n          created_at,\n          is_read\n        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)\n        RETURNING *", [
                                session,
                                phoneNumber,
                                contactName,
                                direction,
                                messageType,
                                content,
                                mediaUrl,
                                payload.id,
                                'received',
                                JSON.stringify(wahaPayload),
                                new Date(timestamp),
                                isRead,
                            ])];
                    case 4:
                        result = _h.sent();
                        savedMessage = result[0];
                        console.log('✅ Mensagem salva no banco:', {
                            id: savedMessage.id,
                            session: savedMessage.session_name,
                            phone: savedMessage.phone_number,
                        });
                        io = req.app.get('io');
                        if (io) {
                            io.emit('chat:new-message', {
                                id: savedMessage.id,
                                sessionName: savedMessage.session_name,
                                phoneNumber: savedMessage.phone_number,
                                contactName: savedMessage.contact_name,
                                direction: savedMessage.direction,
                                messageType: savedMessage.message_type,
                                content: savedMessage.content,
                                mediaUrl: savedMessage.media_url,
                                createdAt: savedMessage.created_at,
                            });
                            console.log('🔊 Mensagem emitida via WebSocket');
                        }
                        res.json({
                            success: true,
                            message: 'WAHA webhook received and processed',
                            data: {
                                id: savedMessage.id,
                                sessionName: savedMessage.session_name,
                                phoneNumber: savedMessage.phone_number,
                            },
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_7 = _h.sent();
                        console.error('❌ Erro ao processar webhook WAHA:', error_7);
                        res.status(500).json({
                            success: false,
                            error: error_7.message,
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return N8NWebhookController;
}());
exports.N8NWebhookController = N8NWebhookController;
