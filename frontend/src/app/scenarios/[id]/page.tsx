'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import Navbar from '@/components/layout/Navbar';
import SecurityBar from '@/components/game/SecurityBar';
import ActionCard from '@/components/game/ActionCard';
import MissionBriefing from '@/components/game/MissionBriefing';
import AttackAnimation from '@/components/game/AttackAnimation';
import EmailClient from '@/components/game/EmailClient';
import MessengerClient from '@/components/game/MessengerClient';
import PhoneSettings from '@/components/game/PhoneSettings';
import BrowserSimulator from '@/components/game/BrowserSimulator';
import WifiSelector from '@/components/game/WifiSelector';
import api from '@/lib/api';
import type { ScenarioDetail, MissionListItem } from '@/types';
import { IconHedgehog, IconCheckCircle, IconXCircle, IconParty } from '@/components/icons/Icons';

export default function ScenarioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const game = useGameStore();

  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [selectedMission, setSelectedMission] = useState<MissionListItem | null>(null);
  const [phase, setPhase] = useState<'select' | 'briefing' | 'play' | 'result'>('select');
  const [isLoadingScenario, setIsLoadingScenario] = useState(true);

  // Scroll to top when phase changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phase]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && slug) {
      loadScenario();
    }
  }, [isAuthenticated, slug]);

  const loadScenario = async () => {
    try {
      const response = await api.get<ScenarioDetail>(`/api/scenarios/${slug}`);
      setScenario(response.data);
    } catch {
      router.push('/scenarios');
    } finally {
      setIsLoadingScenario(false);
    }
  };

  const handleSelectMission = (mission: MissionListItem) => {
    setSelectedMission(mission);
    setPhase('briefing');
  };

  const handleStartMission = async () => {
    if (!selectedMission) return;
    await game.startMission(selectedMission.id);
    setPhase('play');
    // Scroll to environment/interactive content after a short delay
    setTimeout(() => {
      const envElement = document.getElementById('game-environment');
      if (envElement) {
        envElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  const handleAnswer = async (choiceId: string) => {
    if (!game.currentStep) return;
    await game.submitAnswer(game.currentStep.id, choiceId);
    // Scroll to feedback after animation
    setTimeout(() => {
      const feedbackElement = document.getElementById('game-feedback');
      if (feedbackElement) {
        feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400);
  };

  const handleFeedbackClose = () => {
    game.closeFeedback();
    if (game.isCompleted || game.isFailed) {
      setPhase('result');
      if (game.isCompleted) {
        game.completeMission();
      }
    }
  };

  const handleBackToScenario = () => {
    game.reset();
    setPhase('select');
    setSelectedMission(null);
    loadScenario();
  };

  const renderEnvironment = () => {
    if (!game.currentStep?.context_data) return null;
    const data = game.currentStep.context_data as Record<string, unknown>;

    switch (game.environment) {
      case 'email':
        return <EmailClient data={data} />;
      case 'messenger':
        return <MessengerClient data={data} />;
      case 'phone_settings':
        return <PhoneSettings data={data} />;
      case 'browser':
        return <BrowserSimulator data={data} />;
      case 'wifi':
        return <WifiSelector data={data} />;
      default:
        return null;
    }
  };

  if (authLoading || isLoadingScenario) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="animate-bounce flex justify-center"><IconHedgehog size={48} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <Navbar />

      <main className="max-w-4xl mx-auto p-6">
        {/* Mission select */}
        {phase === 'select' && scenario && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button
              onClick={() => router.push('/scenarios')}
              className="text-sm text-text-secondary hover:text-primary mb-4 flex items-center gap-1"
            >
              &larr; К сценариям
            </button>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{scenario.icon}</span>
              <div>
                <h1 className="font-display text-2xl font-bold">{scenario.title}</h1>
                <p className="text-text-secondary">{scenario.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              {scenario.missions.map((mission, idx) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleSelectMission(mission)}
                  className="bg-white rounded-xl shadow-card p-5 hover:shadow-card-hover hover:border-primary border-2 border-transparent transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{mission.title}</h3>
                      <p className="text-text-secondary text-sm mt-1">{mission.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          mission.difficulty <= 1 ? 'bg-green-100 text-green-700' :
                          mission.difficulty <= 2 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {mission.difficulty <= 1 ? 'Лёгкий' : mission.difficulty <= 2 ? 'Средний' : 'Сложный'}
                        </span>
                        <span className="text-xs text-accent-success font-medium">+{mission.xp_reward} XP</span>
                      </div>
                    </div>
                    <div>
                      {mission.status === 'completed' ? (
                        <IconCheckCircle size={24} className="text-accent-success" />
                      ) : mission.status === 'failed' ? (
                        <IconXCircle size={24} className="text-accent-error" />
                      ) : (
                        <span className="text-primary text-2xl">▶</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Briefing */}
        {phase === 'briefing' && selectedMission && (
          <div>
            <button
              onClick={() => setPhase('select')}
              className="text-sm text-text-secondary hover:text-primary mb-4 flex items-center gap-1"
            >
              &larr; Назад
            </button>
            <MissionBriefing
              title={selectedMission.title}
              storyText={game.storyText || selectedMission.description}
              attackType={selectedMission.attack_type}
              environment={selectedMission.environment}
              xpReward={selectedMission.xp_reward}
              onStart={handleStartMission}
            />
          </div>
        )}

        {/* Gameplay */}
        {phase === 'play' && game.currentStep && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4">
              <SecurityBar hp={game.currentHp} />
            </div>

            <div id="game-environment" className="mb-6">{renderEnvironment()}</div>

            <AnimatePresence mode="wait">
              {game.showFeedback && game.lastAnswer ? (
                <motion.div
                  id="game-feedback"
                  key="feedback"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-xl p-6 mb-4 border-2 ${
                    game.lastAnswer.is_correct
                      ? 'bg-green-50 border-accent-success'
                      : 'bg-red-50 border-accent-error'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span>
                      {game.lastAnswer.is_correct ? <IconHedgehog size={36} /> : <IconXCircle size={36} className="text-accent-error" />}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        {game.lastAnswer.is_correct ? 'Правильно!' : 'Неправильно!'}
                      </h3>
                      <p className="text-sm leading-relaxed">{game.lastAnswer.feedback_text}</p>
                      <p className="text-sm mt-2 font-medium">
                        HP: {game.lastAnswer.hp_change > 0 ? '+' : ''}{game.lastAnswer.hp_change}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleFeedbackClose}
                    className="w-full mt-4 bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-hover transition-colors"
                  >
                    {game.isCompleted || game.isFailed ? 'Завершить миссию' : 'Далее'}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="choices" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ActionCard
                    choices={game.currentStep.choices}
                    onSelect={handleAnswer}
                    disabled={game.isLoading || game.showFeedback}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AttackAnimation
              attackType={game.attackType}
              show={game.showAttackAnimation && !game.lastAnswer?.is_correct}
              consequence={game.lastAnswer?.consequence_text || null}
              onClose={game.closeAttackAnimation}
            />
          </motion.div>
        )}

        {/* Result */}
        {phase === 'result' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-card p-8 max-w-lg mx-auto text-center"
          >
            <div className="flex justify-center mb-4">
              {game.isFailed ? <IconXCircle size={64} className="text-accent-error" /> : <IconParty size={64} className="text-primary" />}
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">
              {game.isFailed ? 'Миссия провалена' : 'Миссия выполнена!'}
            </h1>

            {game.missionResult && (
              <div className="space-y-3 my-6">
                <div className="bg-page rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Заработано XP</p>
                      <p className="text-xl font-bold text-primary">+{game.missionResult.xp_earned}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Точность</p>
                      <p className="text-xl font-bold">{game.missionResult.accuracy_percent}%</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Правильных</p>
                      <p className="text-xl font-bold text-accent-success">{game.missionResult.correct_answers}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Ошибок</p>
                      <p className="text-xl font-bold text-accent-error">{game.missionResult.wrong_answers}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleBackToScenario}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
              >
                К сценарию
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 border-2 border-primary text-primary py-3 rounded-xl font-semibold hover:bg-primary-bg transition-colors"
              >
                На главную
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
