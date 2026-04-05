import { create } from 'zustand';
import api from '@/lib/api';
import type { LearningTheme, LearningModule } from '@/types';

interface LearningState {
  themes: LearningTheme[];
  modules: LearningModule[];
  currentModule: LearningModule | null;
  isLoading: boolean;
  error: string | null;
  fetchThemes: () => Promise<void>;
  fetchThemeModules: (themeId: string) => Promise<void>;
  fetchModule: (scenarioId: number) => Promise<void>;
  clearModules: () => void;
  submitAnswer: (scenarioId: number, choiceIndex: number, isCorrect: boolean) => Promise<{ security_level: number; total_xp: number; change: number } | null>;
}

export const useLearningStore = create<LearningState>((set) => ({
  themes: [],
  modules: [],
  currentModule: null,
  isLoading: false,
  error: null,

  fetchThemes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<LearningTheme[]>('/api/learning/themes');
      set({ themes: response.data, isLoading: false });
    } catch {
      set({ error: 'Не удалось загрузить темы', isLoading: false });
    }
  },

  clearModules: () => set({ modules: [], currentModule: null }),

  submitAnswer: async (scenarioId: number, choiceIndex: number, isCorrect: boolean) => {
    try {
      const response = await api.post('/api/learning/submit', {
        scenario_id: scenarioId,
        choice_index: choiceIndex,
        is_correct: isCorrect,
      });
      return response.data;
    } catch {
      return null;
    }
  },

  fetchThemeModules: async (themeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<LearningModule[]>(`/api/learning/themes/${themeId}/modules`);
      set({ modules: response.data, isLoading: false });
    } catch {
      set({ error: 'Не удалось загрузить модули', isLoading: false });
    }
  },

  fetchModule: async (scenarioId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<LearningModule>(`/api/learning/modules/${scenarioId}`);
      set({ currentModule: response.data, isLoading: false });
    } catch {
      set({ error: 'Не удалось загрузить модуль', isLoading: false });
    }
  },
}));
