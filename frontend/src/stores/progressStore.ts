import { create } from 'zustand';
import api from '@/lib/api';
import type { DashboardData, Scenario, Achievement, LeaderboardData, HistoryItem } from '@/types';

interface ProgressState {
  dashboard: DashboardData | null;
  scenarios: Scenario[];
  achievements: Achievement[];
  leaderboard: LeaderboardData | null;
  history: HistoryItem[];
  isLoading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  fetchScenarios: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  fetchHistory: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set) => ({
  dashboard: null,
  scenarios: [],
  achievements: [],
  leaderboard: null,
  history: [],
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<DashboardData>('/api/progress/dashboard');
      set({ dashboard: response.data, isLoading: false });
    } catch {
      set({ error: 'Не удалось загрузить данные', isLoading: false });
    }
  },

  fetchScenarios: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<Scenario[]>('/api/scenarios/');
      set({ scenarios: response.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchAchievements: async () => {
    try {
      const response = await api.get<Achievement[]>('/api/achievements/');
      set({ achievements: response.data });
    } catch {
      // silent
    }
  },

  fetchLeaderboard: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<LeaderboardData>('/api/leaderboard/');
      set({ leaderboard: response.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchHistory: async () => {
    try {
      const response = await api.get<HistoryItem[]>('/api/progress/history');
      set({ history: response.data });
    } catch {
      // silent
    }
  },
}));
