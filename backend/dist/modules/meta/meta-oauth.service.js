"use strict";
/**
 * Meta OAuth Service
 * Handles OAuth 2.0 flow for Instagram & Messenger via Meta Graph API
 *
 * @module modules/meta
 * @description Manages OAuth authentication, token exchange, and encryption for Meta integrations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaOAuthService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
class MetaOAuthService {
    appId;
    appSecret;
    redirectUri;
    scopes;
    graphApiVersion = 'v21.0';
    constructor() {
        this.appId = process.env.META_APP_ID || '';
        this.appSecret = process.env.META_APP_SECRET || '';
        this.redirectUri = process.env.META_OAUTH_REDIRECT_URI || '';
        this.scopes = (process.env.META_OAUTH_SCOPES || '').split(',').filter(Boolean);
        if (!this.appId || !this.appSecret) {
            console.warn('[MetaOAuth] Warning: META_APP_ID and META_APP_SECRET not configured');
        }
    }
    /**
     * Generate OAuth authorization URL
     * @param state - Random state string for CSRF protection
     * @returns Authorization URL to redirect user to
     */
    getAuthorizationUrl(state) {
        const params = new URLSearchParams({
            client_id: this.appId,
            redirect_uri: this.redirectUri,
            scope: this.scopes.join(','),
            response_type: 'code',
            state: state,
        });
        return `https://www.facebook.com/${this.graphApiVersion}/dialog/oauth?${params.toString()}`;
    }
    /**
     * Exchange authorization code for access token
     * @param code - Authorization code from OAuth callback
     * @returns Access token data
     */
    async exchangeCodeForToken(code) {
        try {
            const params = new URLSearchParams({
                client_id: this.appId,
                client_secret: this.appSecret,
                redirect_uri: this.redirectUri,
                code: code,
            });
            const response = await axios_1.default.get(`https://graph.facebook.com/${this.graphApiVersion}/oauth/access_token?${params.toString()}`);
            console.log('[MetaOAuth] Successfully exchanged code for token');
            return response.data;
        }
        catch (error) {
            console.error('[MetaOAuth] Error exchanging code:', error.response?.data || error.message);
            throw new Error('Failed to exchange code for access token');
        }
    }
    /**
     * Exchange short-lived token for long-lived token (60 days validity)
     * @param shortLivedToken - Short-lived access token
     * @returns Long-lived token data
     */
    async getLongLivedToken(shortLivedToken) {
        try {
            const params = new URLSearchParams({
                grant_type: 'fb_exchange_token',
                client_id: this.appId,
                client_secret: this.appSecret,
                fb_exchange_token: shortLivedToken,
            });
            const response = await axios_1.default.get(`https://graph.facebook.com/${this.graphApiVersion}/oauth/access_token?${params.toString()}`);
            console.log('[MetaOAuth] Successfully obtained long-lived token');
            return response.data;
        }
        catch (error) {
            console.error('[MetaOAuth] Error getting long-lived token:', error.response?.data || error.message);
            throw new Error('Failed to obtain long-lived token');
        }
    }
    /**
     * Get Instagram Business Account connected to user
     * @param accessToken - Access token
     * @returns Instagram account data
     */
    async getInstagramAccount(accessToken) {
        try {
            // First, get user's Facebook Pages
            const pagesResponse = await axios_1.default.get(`https://graph.facebook.com/${this.graphApiVersion}/me/accounts`, {
                params: {
                    access_token: accessToken,
                    fields: 'id,name,instagram_business_account',
                },
            });
            const pages = pagesResponse.data.data;
            // Find page with Instagram Business Account
            const pageWithInstagram = pages.find((page) => page.instagram_business_account);
            if (!pageWithInstagram) {
                throw new Error('No Instagram Business Account found. Please connect your Instagram to a Facebook Page.');
            }
            const instagramAccountId = pageWithInstagram.instagram_business_account.id;
            // Get Instagram account details
            const instagramResponse = await axios_1.default.get(`https://graph.facebook.com/${this.graphApiVersion}/${instagramAccountId}`, {
                params: {
                    access_token: accessToken,
                    fields: 'id,username,name,profile_picture_url',
                },
            });
            const instagramData = instagramResponse.data;
            console.log('[MetaOAuth] Successfully retrieved Instagram account:', instagramData.username);
            return {
                id: instagramData.id,
                username: instagramData.username,
                name: instagramData.name,
                profile_picture_url: instagramData.profile_picture_url,
                facebook_page_id: pageWithInstagram.id,
                facebook_page_name: pageWithInstagram.name,
            };
        }
        catch (error) {
            console.error('[MetaOAuth] Error getting Instagram account:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || 'Failed to retrieve Instagram account');
        }
    }
    /**
     * Generate random state for CSRF protection
     * @returns Random state string
     */
    generateState() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    /**
     * Validate OAuth state
     * @param receivedState - State from callback
     * @param savedState - State saved before authorization
     * @returns True if valid
     */
    validateState(receivedState, savedState) {
        return receivedState === savedState;
    }
    /**
     * Encrypt token before storing in database (AES-256-CBC)
     * @param token - Plain text token
     * @returns Encrypted token (format: iv:encrypted)
     */
    encryptToken(token) {
        const algorithm = 'aes-256-cbc';
        const key = crypto_1.default.scryptSync(this.appSecret, 'salt', 32);
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(token, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }
    /**
     * Decrypt token from database
     * @param encryptedToken - Encrypted token (format: iv:encrypted)
     * @returns Plain text token
     */
    decryptToken(encryptedToken) {
        try {
            const algorithm = 'aes-256-cbc';
            const key = crypto_1.default.scryptSync(this.appSecret, 'salt', 32);
            const [ivHex, encrypted] = encryptedToken.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            console.error('[MetaOAuth] Error decrypting token:', error);
            throw new Error('Failed to decrypt token');
        }
    }
    /**
     * Refresh token if expired (for future implementation)
     * Note: Meta long-lived tokens need to be refreshed before they expire (60 days)
     */
    async refreshToken(currentToken) {
        // Use the same endpoint as getLongLivedToken
        return this.getLongLivedToken(currentToken);
    }
}
exports.MetaOAuthService = MetaOAuthService;
//# sourceMappingURL=meta-oauth.service.js.map