import CryptoJS from 'crypto-js';
import crypto from 'crypto';

/**
 * Serviço de Criptografia
 * Responsável por criptografar/descriptografar tokens OAuth
 */
class EncryptionService {
    private key: string;

    constructor() {
        this.key = process.env.NOTIFICAME_ENCRYPTION_KEY || '';

        if (!this.key) {
            throw new Error('NOTIFICAME_ENCRYPTION_KEY não configurada no .env');
        }

        if (this.key.length < 32) {
            throw new Error('NOTIFICAME_ENCRYPTION_KEY deve ter pelo menos 32 caracteres');
        }
    }

    /**
     * Criptografa um texto usando AES-256
     */
    encrypt(plainText: string): string {
        try {
            if (!plainText) {
                throw new Error('Texto vazio não pode ser criptografado');
            }

            const encrypted = CryptoJS.AES.encrypt(plainText, this.key).toString();
            return encrypted;
        } catch (error) {
            console.error('Erro ao criptografar:', error);
            throw new Error('Falha na criptografia');
        }
    }

    /**
     * Descriptografa um texto
     */
    decrypt(encryptedText: string): string {
        try {
            if (!encryptedText) {
                throw new Error('Texto criptografado vazio');
            }

            const bytes = CryptoJS.AES.decrypt(encryptedText, this.key);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);

            if (!decrypted) {
                throw new Error('Falha ao descriptografar - chave incorreta?');
            }

            return decrypted;
        } catch (error) {
            console.error('Erro ao descriptografar:', error);
            throw new Error('Falha na descriptografia');
        }
    }

    /**
     * Gera hash SHA-256 de um texto
     */
    hash(text: string): string {
        return crypto
            .createHash('sha256')
            .update(text)
            .digest('hex');
    }

    /**
     * Gera string aleatória segura
     */
    generateRandomString(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Compara hash de forma segura (timing-safe)
     */
    compareHash(hash1: string, hash2: string): boolean {
        try {
            return crypto.timingSafeEqual(
                Buffer.from(hash1),
                Buffer.from(hash2)
            );
        } catch {
            return false;
        }
    }

    /**
     * Valida se uma chave de criptografia é forte
     */
    static validateEncryptionKey(key: string): boolean {
        if (!key) return false;
        if (key.length < 32) return false;

        // Verificar entropia mínima
        const uniqueChars = new Set(key).size;
        return uniqueChars >= 16;
    }
}

export default new EncryptionService();
