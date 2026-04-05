import { create } from 'zustand';
import api from '@/lib/api';
import type { User, TokenPair } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const response = await api.post<TokenPair>('/api/auth/login', { email, password });
    const { access_token, refresh_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  register: async (username, email, password) => {
    const response = await api.post<TokenPair>('/api/auth/register', { username, email, password });
    const { access_token, refresh_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      if (stored && token) {
        try {
          const user = JSON.parse(stored) as User;
          set({ user, isAuthenticated: true, isLoading: false });
          return;
        } catch {
          // ignore
        }
      }
    }
    set({ isLoading: false });
  },

  fetchMe: async () => {
    try {
      const response = await api.get<User>('/api/auth/me');
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
