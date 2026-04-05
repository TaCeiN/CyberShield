import { create } from 'zustand';
import api from '@/lib/api';
import type { MissionStep, AnswerResponse, MissionResult, MissionStartResponse } from '@/types';

interface GameState {
  missionId: string | null;
  missionTitle: string;
  attackType: string;
  environment: string;
  storyText: string | null;
  currentStep: MissionStep | null;
  currentHp: number;
  stepIndex: number;
  isCompleted: boolean;
  isFailed: boolean;
  lastAnswer: AnswerResponse | null;
  missionResult: MissionResult | null;
  showFeedback: boolean;
  showAttackAnimation: boolean;
  isLoading: boolean;

  startMission: (missionId: string) => Promise<void>;
  submitAnswer: (stepId: string, choiceId: string) => Promise<void>;
  completeMission: () => Promise<void>;
  closeFeedback: () => void;
  closeAttackAnimation: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  missionId: null,
  missionTitle: '',
  attackType: '',
  environment: '',
  storyText: null,
  currentStep: null,
  currentHp: 100,
  stepIndex: 0,
  isCompleted: false,
  isFailed: false,
  lastAnswer: null,
  missionResult: null,
  showFeedback: false,
  showAttackAnimation: false,
  isLoading: false,

  startMission: async (missionId: string) => {
    set({ isLoading: true });
    const response = await api.post<MissionStartResponse>(`/api/missions/${missionId}/start`);
    const data = response.data;
    set({
      missionId,
      missionTitle: data.mission.title,
      attackType: data.mission.attack_type,
      environment: data.mission.environment,
      storyText: data.mission.story_text,
      currentStep: data.first_step,
      currentHp: data.current_hp,
      stepIndex: 0,
      isCompleted: false,
      isFailed: false,
      lastAnswer: null,
      missionResult: null,
      showFeedback: false,
      showAttackAnimation: false,
      isLoading: false,
    });
  },

  submitAnswer: async (stepId: string, choiceId: string) => {
    const { missionId } = get();
    if (!missionId) return;

    set({ isLoading: true });
    const response = await api.post<AnswerResponse>(`/api/missions/${missionId}/answer`, {
      step_id: stepId,
      choice_id: choiceId,
    });
    const answer = response.data;

    set({
      lastAnswer: answer,
      currentHp: answer.current_hp,
      showFeedback: true,
      isLoading: false,
    });

    if (!answer.is_correct && answer.consequence_text) {
      set({ showAttackAnimation: true });
    }

    if (answer.mission_completed) {
      if (answer.current_hp <= 0) {
        set({ isFailed: true });
      } else {
        set({ isCompleted: true });
      }
    }
  },

  completeMission: async () => {
    const { missionId } = get();
    if (!missionId) return;

    const response = await api.post<MissionResult>(`/api/missions/${missionId}/complete`);
    set({ missionResult: response.data });
  },

  closeFeedback: () => {
    const { lastAnswer } = get();
    if (lastAnswer?.next_step) {
      set({
        currentStep: lastAnswer.next_step,
        stepIndex: get().stepIndex + 1,
        showFeedback: false,
        showAttackAnimation: false,
      });
    } else {
      set({ showFeedback: false, showAttackAnimation: false });
    }
  },

  closeAttackAnimation: () => {
    set({ showAttackAnimation: false });
  },

  reset: () => {
    set({
      missionId: null,
      missionTitle: '',
      attackType: '',
      environment: '',
      storyText: null,
      currentStep: null,
      currentHp: 100,
      stepIndex: 0,
      isCompleted: false,
      isFailed: false,
      lastAnswer: null,
      missionResult: null,
      showFeedback: false,
      showAttackAnimation: false,
      isLoading: false,
    });
  },
}));
