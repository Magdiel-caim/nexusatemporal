import validator from 'validator';

/**
 * Valida UUID
 */
export const isValidUUID = (uuid: string): boolean => {
    if (!uuid) return false;
    return validator.isUUID(uuid);
};

/**
 * Valida email
 */
export const isValidEmail = (email: string): boolean => {
    if (!email) return false;
    return validator.isEmail(email);
};

/**
 * Valida URL
 */
export const isValidURL = (url: string): boolean => {
    if (!url) return false;
    return validator.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true
    });
};

/**
 * Valida plataforma de rede social
 */
export const isValidPlatform = (platform: string): boolean => {
    const validPlatforms = ['instagram', 'facebook', 'whatsapp'];
    return validPlatforms.includes(platform);
};

/**
 * Valida username (Instagram/Facebook)
 */
export const isValidUsername = (username: string): boolean => {
    if (!username) return false;

    // Username deve ter entre 1-30 caracteres
    // Pode conter letras, números, underscores e pontos
    const usernameRegex = /^[a-zA-Z0-9._]{1,30}$/;
    return usernameRegex.test(username);
};

/**
 * Valida número de telefone (formato internacional)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
    if (!phone) return false;

    // Formato: +XXYYZZZZZZZZZ (com +)
    const phoneRegex = /^\+\d{1,3}\d{4,14}$/;
    return phoneRegex.test(phone);
};

/**
 * Sanitiza string (remove caracteres perigosos)
 */
export const sanitizeString = (str: string): string => {
    if (!str) return '';
    return validator.escape(validator.trim(str));
};

/**
 * Valida objeto de conexão
 */
export const validateConnectionData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.cliente_id || !isValidUUID(data.cliente_id)) {
        errors.push('ID de cliente inválido');
    }

    if (!data.platform || !isValidPlatform(data.platform)) {
        errors.push('Plataforma inválida');
    }

    if (!data.access_token || data.access_token.length < 10) {
        errors.push('Access token inválido');
    }

    if (!data.user_id || data.user_id.length < 1) {
        errors.push('User ID inválido');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

/**
 * Valida dados de webhook
 */
export const validateWebhookData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.platform || !isValidPlatform(data.platform)) {
        errors.push('Plataforma inválida');
    }

    if (!data.payload || typeof data.payload !== 'object') {
        errors.push('Payload inválido');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

/**
 * Valida state OAuth
 */
export const isValidOAuthState = (state: string): boolean => {
    if (!state) return false;

    // State deve ser string hexadecimal de 64 caracteres
    const stateRegex = /^[a-f0-9]{64}$/;
    return stateRegex.test(state);
};

/**
 * Valida código de autorização OAuth
 */
export const isValidAuthorizationCode = (code: string): boolean => {
    if (!code) return false;

    // Código deve ter entre 10-500 caracteres
    return code.length >= 10 && code.length <= 500;
};

/**
 * Rate limit - Verifica se excedeu limite de requisições
 */
const requestCounts = new Map<string, number[]>();

export const checkRateLimit = (
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60000
): { allowed: boolean; remaining?: number; retryAfter?: number } => {
    const now = Date.now();
    const userRequests = requestCounts.get(identifier) || [];

    // Remover requisições antigas (fora da janela)
    const recentRequests = userRequests.filter(timestamp => {
        return now - timestamp < windowMs;
    });

    if (recentRequests.length >= maxRequests) {
        return {
            allowed: false,
            retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
        };
    }

    recentRequests.push(now);
    requestCounts.set(identifier, recentRequests);

    return {
        allowed: true,
        remaining: maxRequests - recentRequests.length
    };
};
