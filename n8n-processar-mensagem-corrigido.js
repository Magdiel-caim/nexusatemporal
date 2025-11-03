// ===================================================
// NÓ: Processar Mensagem1 (CORRIGIDO - Opção 2)
// ===================================================
// Este código extrai o base64 direto do payload WAHA
// sem precisar fazer download separado
// ===================================================

// Processar dados da mensagem WAHA
const payload = $input.item.json.body.payload;
const session = $input.item.json.body.session;

// Detectar se é grupo ou conversa individual
const isGroup = payload.from && payload.from.includes('@g.us');

// Para grupos, usar participant; para individual, usar from
let phoneNumber = '';
if (isGroup && payload.participant) {
  phoneNumber = payload.participant.replace(/@lid|@s.whatsapp.net|@c.us/g, '');
} else if (payload.from) {
  phoneNumber = payload.from.replace(/@c.us|@lid/g, '');
}

// Nome do contato
const contactName = payload._data?.Info?.PushName || payload._data?.notifyName || phoneNumber;

// ✅ CORREÇÃO: Verificar se mídia já vem em base64
let mediaBase64 = null;
let messageType = 'text';
let hasMedia = false;

// Verificar se tem mídia em base64 diretamente no payload
if (payload._data && payload._data.mediaUrl && payload._data.mediaUrl.startsWith('data:')) {
  // Mídia já vem em base64
  mediaBase64 = payload._data.mediaUrl;
  hasMedia = true;

  console.log('✅ Base64 encontrado no payload:', {
    id: payload.id,
    base64Length: mediaBase64.length,
    base64Preview: mediaBase64.substring(0, 50) + '...'
  });

  // Detectar tipo pela mimetype do base64
  if (mediaBase64.includes('image')) {
    messageType = 'image';
  } else if (mediaBase64.includes('video')) {
    messageType = 'video';
  } else if (mediaBase64.includes('audio')) {
    messageType = 'audio';
  } else if (mediaBase64.includes('application')) {
    messageType = 'document';
  }
} else if (payload.media && payload.media.mimetype) {
  // Tem mídia mas não tem base64 (cenário incomum)
  hasMedia = true;

  console.log('⚠️ Mídia detectada mas sem base64:', {
    id: payload.id,
    mimetype: payload.media.mimetype,
    hasUrl: !!payload.media.url
  });

  // Detectar tipo pelo mimetype
  if (payload.media.mimetype.includes('image')) {
    messageType = 'image';
  } else if (payload.media.mimetype.includes('video')) {
    messageType = 'video';
  } else if (payload.media.mimetype.includes('audio')) {
    messageType = 'audio';
  } else if (payload.media.mimetype.includes('application')) {
    messageType = 'document';
  }
}

console.log('📥 Mensagem processada:', {
  id: payload.id,
  hasMedia: hasMedia,
  hasBase64: !!mediaBase64,
  type: messageType,
  phoneNumber: phoneNumber,
  contactName: contactName
});

return {
  sessionName: session,
  wahaMessageId: payload.id,
  phoneNumber: phoneNumber,
  contactName: contactName,
  messageType: messageType,
  content: payload.body || '',
  mediaBase64: mediaBase64,  // ✅ Já inclui base64 se disponível
  hasMedia: hasMedia,
  direction: payload.fromMe ? 'outgoing' : 'incoming',
  timestamp: payload.timestamp ? payload.timestamp * 1000 : Date.now(),
  rawPayload: payload
};
