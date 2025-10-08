import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
  permissions?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', credentials);
    // Backend retorna data.data com accessToken, precisamos mapear para token
    return {
      user: data.data.user,
      token: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    };
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', userData);
    // Backend retorna data.data
    return {
      user: data.data,
      token: '', // Registro não retorna token imediatamente
      refreshToken: '',
    };
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get('/auth/profile');
    return data;
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
