import { create } from 'zustand';
import { authService, User, LoginCredentials, RegisterData } from '@/services/authService';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getUser(),
  token: authService.getToken(),
  isAuthenticated: !!authService.getToken(),
  isLoading: false,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authService.login(credentials);
      authService.setToken(token);
      authService.setUser(user);
      set({ user, token, isAuthenticated: true, isLoading: false });
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.error || 'Erro ao fazer login');
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authService.register(userData);
      authService.setToken(token);
      authService.setUser(user);
      set({ user, token, isAuthenticated: true, isLoading: false });
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.error || 'Erro ao criar conta');
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      set({ user: null, token: null, isAuthenticated: false });
      toast.success('Logout realizado com sucesso!');
    }
  },

  loadUser: () => {
    const user = authService.getUser();
    const token = authService.getToken();
    set({
      user,
      token,
      isAuthenticated: !!token,
    });
  },
}));
