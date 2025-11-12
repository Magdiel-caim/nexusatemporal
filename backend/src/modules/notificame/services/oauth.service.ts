import axios from 'axios';
import logger from '../utils/logger';

interface TokenResponse {
    access_token: string;
    token_type?: string;
    expires_in?: number;
}

interface InstagramProfile {
    username: string;
    account_type: string;
    user_id: string;
}

interface FacebookPageData {
    data: Array<{
        id: string;
        name: string;
        access_token: string;
    }>;
}

class OAuthService {
    private facebookAppId: string;
    private facebookAppSecret: string;
    private facebookApiVersion: string;

    constructor() {
        this.facebookAppId = process.env.FACEBOOK_APP_ID || '';
        this.facebookAppSecret = process.env.FACEBOOK_APP_SECRET || '';
        this.facebookApiVersion = process.env.FACEBOOK_API_VERSION || 'v18.0';

        if (!this.facebookAppId || !this.facebookAppSecret) {
            logger.warn('Credenciais do Facebook não configuradas completamente');
        }
    }

    /**
     * Constrói URL de autorização do Instagram
     */
    buildInstagramAuthUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: this.facebookAppId,
            redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || '',
            scope: 'instagram_basic,instagram_manage_messages',
            response_type: 'code',
            state: state
        });

        return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
    }

    /**
     * Troca código de autorização por access_token (Instagram)
     */
    async exchangeInstagramCode(code: string): Promise<{ access_token: string; user_id: string }> {
        try {
            logger.info('[OAuthService] Trocando código Instagram por token');

            const response = await axios.post(
                'https://api.instagram.com/oauth/access_token',
                new URLSearchParams({
                    client_id: this.facebookAppId,
                    client_secret: this.facebookAppSecret,
                    grant_type: 'authorization_code',
                    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || '',
                    code: code
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout: 15000
                }
            );

            return {
                access_token: response.data.access_token,
                user_id: response.data.user_id
            };
        } catch (error: any) {
            logger.error('[OAuthService] Erro ao trocar código Instagram:', error.response?.data || error);

            if (error.response?.data) {
                throw new Error(error.response.data.error_message || 'Erro ao obter token');
            }
            throw error;
        }
    }

    /**
     * Obtém dados do perfil Instagram
     */
    async getInstagramProfile(access_token: string, user_id: string): Promise<InstagramProfile> {
        try {
            logger.info(`[OAuthService] Buscando perfil Instagram: ${user_id}`);

            const response = await axios.get(
                `https://graph.instagram.com/${user_id}`,
                {
                    params: {
                        fields: 'username,account_type',
                        access_token: access_token
                    },
                    timeout: 10000
                }
            );

            return {
                username: response.data.username,
                account_type: response.data.account_type,
                user_id: user_id
            };
        } catch (error: any) {
            logger.error('[OAuthService] Erro ao buscar perfil Instagram:', error.response?.data || error);
            throw error;
        }
    }

    /**
     * Troca short-lived token por long-lived token (Instagram)
     */
    async exchangeForLongLivedToken(short_token: string): Promise<TokenResponse> {
        try {
            logger.info('[OAuthService] Trocando por long-lived token');

            const response = await axios.get(
                'https://graph.instagram.com/access_token',
                {
                    params: {
                        grant_type: 'ig_exchange_token',
                        client_secret: this.facebookAppSecret,
                        access_token: short_token
                    },
                    timeout: 10000
                }
            );

            return {
                access_token: response.data.access_token,
                token_type: response.data.token_type,
                expires_in: response.data.expires_in // 60 dias
            };
        } catch (error: any) {
            logger.error('[OAuthService] Erro ao obter long-lived token:', error);
            throw error;
        }
    }

    /**
     * Constrói URL de autorização do Facebook
     */
    buildFacebookAuthUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: this.facebookAppId,
            redirect_uri: process.env.FACEBOOK_REDIRECT_URI || '',
            scope: 'pages_show_list,pages_messaging,pages_manage_metadata',
            response_type: 'code',
            state: state
        });

        return `https://www.facebook.com/${this.facebookApiVersion}/dialog/oauth?${params.toString()}`;
    }

    /**
     * Troca código de autorização por access_token (Facebook)
     */
    async exchangeFacebookCode(code: string): Promise<TokenResponse> {
        try {
            logger.info('[OAuthService] Trocando código Facebook por token');

            const response = await axios.get(
                `https://graph.facebook.com/${this.facebookApiVersion}/oauth/access_token`,
                {
                    params: {
                        client_id: this.facebookAppId,
                        client_secret: this.facebookAppSecret,
                        redirect_uri: process.env.FACEBOOK_REDIRECT_URI || '',
                        code: code
                    },
                    timeout: 15000
                }
            );

            return {
                access_token: response.data.access_token,
                token_type: response.data.token_type,
                expires_in: response.data.expires_in
            };
        } catch (error: any) {
            logger.error('[OAuthService] Erro ao trocar código Facebook:', error.response?.data || error);

            if (error.response?.data?.error) {
                throw new Error(error.response.data.error.message);
            }
            throw error;
        }
    }

    /**
     * Obtém páginas do Facebook do usuário
     */
    async getFacebookPages(access_token: string): Promise<FacebookPageData> {
        try {
            logger.info('[OAuthService] Buscando páginas do Facebook');

            const response = await axios.get(
                `https://graph.facebook.com/${this.facebookApiVersion}/me/accounts`,
                {
                    params: {
                        access_token: access_token
                    },
                    timeout: 10000
                }
            );

            return response.data;
        } catch (error: any) {
            logger.error('[OAuthService] Erro ao buscar páginas Facebook:', error);
            throw error;
        }
    }

    /**
     * Refresh token quando estiver próximo de expirar
     */
    async refreshToken(refresh_token: string): Promise<TokenResponse> {
        try {
            logger.info('[OAuthService] Refreshing token');

            const response = await axios.get(
                `https://graph.facebook.com/${this.facebookApiVersion}/oauth/access_token`,
                {
                    params: {
                        grant_type: 'fb_exchange_token',
                        client_id: this.facebookAppId,
                        client_secret: this.facebookAppSecret,
                        fb_exchange_token: refresh_token
                    }
                }
            );

            return {
                access_token: response.data.access_token,
                expires_in: response.data.expires_in
            };
        } catch (error: any) {
            logger.error('[OAuthService] Erro ao refresh token:', error);
            throw error;
        }
    }
}

export default new OAuthService();
