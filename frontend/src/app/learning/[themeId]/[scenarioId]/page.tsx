'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useLearningStore } from '@/stores/learningStore';
import { useAuthStore } from '@/stores/authStore';
import {
  IconHedgehog,
  IconShield,
  IconParty,
  IconBook,
  IconAlertTriangle,
  IconLightbulb,
} from '@/components/icons/Icons';

type Stage = 'theory' | 'scenario' | 'debrief';

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function LearningModulePage() {
  const params = useParams();
  const router = useRouter();
  const themeId = params.themeId as string;
  const scenarioId = Number(params.scenarioId);

  const { isAuthenticated, isLoading: authLoading, fetchMe } = useAuthStore();
  const { currentModule, isLoading, fetchModule, submitAnswer } = useLearningStore();

  const [stage, setStage] = useState<Stage>('theory');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [expandedProtection, setExpandedProtection] = useState<number | null>(null);
  const [scoreChange, setScoreChange] = useState<number | null>(null);

  // Scroll to top when stage changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stage]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && scenarioId) {
      fetchModule(scenarioId);
    }
  }, [isAuthenticated, scenarioId, fetchModule]);

  const handleChoiceSelect = async (idx: number) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(idx);
    const choice = currentModule?.stage2_scenario.choices[idx];
    if (choice) {
      setAnsweredCorrectly(choice.correct);
      // Send result to backend
      const result = await submitAnswer(scenarioId, idx, choice.correct);
      if (result) {
        setScoreChange(result.change);
        // Refresh user data (XP, security_level)
        fetchMe();
      }
      // Scroll to feedback after animation
      setTimeout(() => {
        const feedbackElement = document.getElementById('choice-feedback');
        if (feedbackElement) {
          feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 400);
    }
  };

  const handleNext = () => {
    if (answeredCorrectly) {
      // show success, don't go to debrief
    } else {
      setStage('debrief');
    }
  };

  const handleRestart = () => {
    setStage('theory');
    setSelectedChoice(null);
    setAnsweredCorrectly(null);
    setExpandedProtection(null);
    setScoreChange(null);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="animate-bounce"><IconHedgehog size={48} /></div>
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="min-h-screen bg-page">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 text-center text-text-secondary py-20">
          Модуль не найден
        </div>
      </div>
    );
  }

  const { stage1_theory, stage2_scenario, stage3_wrong_answer_debrief } = currentModule;

  const stages: { key: Stage; label: string }[] = [
    { key: 'theory', label: 'Теория' },
    { key: 'scenario', label: 'Сценарий' },
    ...(answeredCorrectly === false ? [{ key: 'debrief' as Stage, label: 'Разбор' }] : []),
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === stage);

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => router.push(`/learning/${themeId}`)}
          className="text-sm text-text-secondary hover:text-primary mb-4 flex items-center gap-1"
        >
          &larr; К модулям
        </button>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-display text-2xl font-bold text-text-primary mb-6"
        >
          {currentModule.title}
        </motion.h1>

        {/* Progress stepper */}
        <div className="flex items-center gap-2 mb-8">
          {stages.map((s, idx) => (
            <div key={s.key} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (s.key === 'theory') setStage('theory');
                  else if (s.key === 'scenario' && currentStageIndex >= 1) setStage('scenario');
                  else if (s.key === 'debrief' && currentStageIndex >= 2) setStage('debrief');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  stage === s.key
                    ? 'bg-primary text-white shadow-md'
                    : idx < currentStageIndex
                    ? 'bg-primary-bg text-primary'
                    : 'bg-gray-100 text-text-secondary'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                {s.label}
              </button>
              {idx < stages.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    idx < currentStageIndex ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ==================== STAGE 1: THEORY ==================== */}
          {stage === 'theory' && (
            <motion.div
              key="theory"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Definition */}
              <div className="bg-white rounded-2xl shadow-card p-6 border-2 border-primary">
                <h2 className="font-display font-bold text-lg text-primary mb-3">
                  Определение
                </h2>
                <p className="text-text-primary leading-relaxed">
                  {stage1_theory.definition}
                </p>
              </div>

              {/* Stats grid */}
              {stage1_theory.stats.length > 0 && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                >
                  {stage1_theory.stats.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      variants={staggerItem}
                      className="bg-white rounded-2xl shadow-card p-5 text-center"
                    >
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-text-secondary mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Attack steps */}
              {stage1_theory.attack_steps.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="font-display font-bold text-lg text-text-primary mb-4">
                    Этапы атаки
                  </h2>
                  <motion.ol
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {stage1_theory.attack_steps.map((step, idx) => (
                      <motion.li
                        key={idx}
                        variants={staggerItem}
                        className="flex items-start gap-3"
                      >
                        <span className="w-7 h-7 bg-primary-bg text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-text-primary leading-relaxed">{step}</span>
                      </motion.li>
                    ))}
                  </motion.ol>
                </div>
              )}

              {/* Variants table */}
              {stage1_theory.variants_table.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card p-6 overflow-x-auto">
                  <h2 className="font-display font-bold text-lg text-text-primary mb-4">
                    Виды атак
                  </h2>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-primary-bg">
                        <th className="text-left py-3 px-3 font-semibold text-text-primary">
                          Тип
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-text-primary">
                          Описание
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-text-primary">
                          Пример
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stage1_theory.variants_table.map((v, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border last:border-0 hover:bg-primary-bg/30 transition-colors"
                        >
                          <td className="py-3 px-3 font-medium text-primary">{v.type}</td>
                          <td className="py-3 px-3 text-text-primary">{v.description}</td>
                          <td className="py-3 px-3 text-text-secondary italic">{v.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Red flags */}
              {stage1_theory.red_flags.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="font-display font-bold text-lg text-text-primary mb-4">
                    Красные флаги
                  </h2>
                  <motion.ul
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="space-y-2"
                  >
                    {stage1_theory.red_flags.map((flag, idx) => (
                      <motion.li
                        key={idx}
                        variants={staggerItem}
                        className="flex items-start gap-3 py-1"
                      >
                        <span className="text-primary font-bold mt-0.5">✓</span>
                        <span className="text-text-primary">{flag}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              )}

              {/* Protection levels */}
              {stage1_theory.protection_levels.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="font-display font-bold text-lg text-text-primary mb-4">
                    Уровни защиты
                  </h2>
                  <div className="space-y-3">
                    {stage1_theory.protection_levels.map((level, idx) => (
                      <div key={idx} className="border border-border rounded-xl overflow-hidden">
                        <button
                          onClick={() => {
                            setExpandedProtection(expandedProtection === idx ? null : idx);
                            // Scroll to expanded content after a short delay
                            if (expandedProtection !== idx) {
                              setTimeout(() => {
                                const element = document.getElementById(`protection-${idx}`);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                }
                              }, 100);
                            }
                          }}
                          className="w-full flex items-center justify-between px-5 py-3 bg-primary-bg/40 hover:bg-primary-bg transition-colors text-left"
                        >
                          <span className="font-semibold text-text-primary">{level.level}</span>
                          <motion.span
                            animate={{ rotate: expandedProtection === idx ? 180 : 0 }}
                            className="text-primary"
                          >
                            ▼
                          </motion.span>
                        </button>
                        <AnimatePresence>
                          {expandedProtection === idx && (
                            <motion.div
                              id={`protection-${idx}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <ul className="px-5 py-3 space-y-2">
                                {level.items.map((it, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span className="text-text-primary">{it}</span>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setStage('scenario')}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors text-lg"
                >
                  Перейти к сценарию →
                </button>
              </div>
            </motion.div>
          )}

          {/* ==================== STAGE 2: SCENARIO ==================== */}
          {stage === 'scenario' && (
            <motion.div
              key="scenario"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Intro */}
              <div className="bg-white rounded-2xl shadow-card p-6 border-l-4 border-primary">
                <p className="text-text-primary leading-relaxed whitespace-pre-line">
                  {stage2_scenario.intro}
                </p>
              </div>

              {/* Visual block */}
              <div className="bg-white rounded-2xl shadow-card p-6 border-2 border-dashed border-border">
                <pre className="font-mono text-sm text-text-primary whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {stage2_scenario.visual}
                </pre>
                {stage2_scenario.visual_hint && (
                  <p className="mt-3 text-sm text-text-secondary italic">
                    {stage2_scenario.visual_hint}
                  </p>
                )}
              </div>

              {/* Question */}
              <h2 className="font-display font-bold text-xl text-text-primary">
                {stage2_scenario.question}
              </h2>

              {/* Choices 2x2 grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stage2_scenario.choices.map((choice, idx) => {
                  const isSelected = selectedChoice === idx;
                  const isRevealed = selectedChoice !== null;
                  const isCorrect = choice.correct;

                  let borderClass = 'border-border hover:border-primary';
                  if (isRevealed) {
                    if (isSelected && isCorrect) {
                      borderClass = 'border-accent-success bg-green-50';
                    } else if (isSelected && !isCorrect) {
                      borderClass = 'border-accent-error bg-red-50';
                    } else if (isCorrect) {
                      borderClass = 'border-accent-success/50 bg-green-50/50';
                    } else {
                      borderClass = 'border-border opacity-60';
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      variants={fadeIn}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: idx * 0.08 }}
                      onClick={() => handleChoiceSelect(idx)}
                      disabled={selectedChoice !== null}
                      className={`bg-white rounded-2xl shadow-card p-5 border-2 text-left transition-all ${borderClass} ${
                        selectedChoice === null ? 'cursor-pointer hover:shadow-card-hover' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary-bg text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <div className="flex-1">
                          <p className="text-text-primary font-medium leading-relaxed">
                            {choice.text}
                          </p>
                          {isRevealed && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className={`mt-2 text-sm leading-relaxed ${
                                isCorrect ? 'text-green-700' : 'text-red-600'
                              }`}
                            >
                              {choice.hint}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* After selection */}
              {selectedChoice !== null && (
                <motion.div
                  id="choice-feedback"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {answeredCorrectly ? (
                    /* Success card */
                    <div className="bg-green-50 border-2 border-accent-success rounded-2xl p-6 text-center">
                      <div className="flex justify-center mb-3"><IconParty size={48} className="text-green-600" /></div>
                      <h3 className="font-display font-bold text-xl text-green-800 mb-2">
                        Правильно!
                      </h3>
                      <p className="text-green-700 mb-2">
                        Вы верно определили угрозу. Отличная работа!
                      </p>
                      {scoreChange !== null && (
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-lg mb-3">
                          <IconShield size={18} /><span>+{scoreChange} к уровню безопасности</span>
                          <span className="text-sm font-normal">| +10 XP</span>
                        </div>
                      )}
                      <br />
                      <button
                        onClick={() => router.push(`/learning/${themeId}`)}
                        className="mt-4 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
                      >
                        Вернуться к теме
                      </button>
                    </div>
                  ) : (
                    /* Wrong answer - continue to debrief */
                    <div className="space-y-3">
                      {scoreChange !== null && (
                        <div className="flex justify-center">
                          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full font-bold text-lg">
                            <IconShield size={18} /><span>{scoreChange} к уровню безопасности</span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button
                          onClick={handleNext}
                          className="bg-accent-error text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors text-lg"
                        >
                          Далее — разбор ошибки →
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ==================== STAGE 3: DEBRIEF ==================== */}
          {stage === 'debrief' && stage3_wrong_answer_debrief && (
            <motion.div
              key="debrief"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Outcome title */}
              <div className="bg-red-50 border-2 border-accent-error rounded-2xl p-6">
                <h2 className="font-display font-bold text-xl text-red-700">
                  {stage3_wrong_answer_debrief.outcome_title}
                </h2>
              </div>

              {/* Timeline */}
              {stage3_wrong_answer_debrief.timeline.length > 0 && (
                <div className="bg-amber-50 border-2 border-accent-warning rounded-2xl p-6">
                  <h3 className="font-display font-bold text-lg text-amber-800 mb-4">
                    Хронология событий
                  </h3>
                  <motion.ol
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {stage3_wrong_answer_debrief.timeline.map((step, idx) => (
                      <motion.li
                        key={idx}
                        variants={staggerItem}
                        className="flex items-start gap-3"
                      >
                        <span className="w-7 h-7 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-amber-900 leading-relaxed">{step}</span>
                      </motion.li>
                    ))}
                  </motion.ol>
                </div>
              )}

              {/* Why it happened */}
              {stage3_wrong_answer_debrief.why_it_happened.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="font-display font-bold text-lg text-text-primary mb-4">
                    Почему это произошло
                  </h3>
                  <ul className="space-y-2">
                    {stage3_wrong_answer_debrief.why_it_happened.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-text-primary">
                        <span className="text-accent-error mt-0.5">•</span>
                        <span className="leading-relaxed">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Theory link */}
              {stage3_wrong_answer_debrief.theory_link && (
                <div className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-3">
                  <IconBook size={24} className="text-primary" />
                  <div>
                    <p className="text-sm text-text-secondary">Ссылка на теорию</p>
                    <p className="text-text-primary font-medium">
                      {stage3_wrong_answer_debrief.theory_link}
                    </p>
                  </div>
                </div>
              )}

              {/* Ignored red flags */}
              {stage3_wrong_answer_debrief.ignored_red_flags.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="font-display font-bold text-lg text-accent-error mb-4">
                    Проигнорированные красные флаги
                  </h3>
                  <motion.ul
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="space-y-2"
                  >
                    {stage3_wrong_answer_debrief.ignored_red_flags.map((flag, idx) => (
                      <motion.li
                        key={idx}
                        variants={staggerItem}
                        className="flex items-start gap-3"
                      >
                        <IconAlertTriangle size={16} className="text-accent-error mt-0.5 flex-shrink-0" />
                        <span className="text-text-primary">{flag}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              )}

              {/* Correct choices with hints */}
              {stage3_wrong_answer_debrief.correct_choices_with_hints.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-lg text-text-primary">
                    Правильные действия
                  </h3>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {stage3_wrong_answer_debrief.correct_choices_with_hints.map((c, idx) => (
                      <motion.div
                        key={idx}
                        variants={staggerItem}
                        className="bg-green-50 border-2 border-accent-success rounded-2xl p-5"
                      >
                        <p className="font-semibold text-green-800">{c.text}</p>
                        <p className="text-green-700 text-sm mt-1 leading-relaxed">{c.hint}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* Action tips */}
              {stage3_wrong_answer_debrief.action_tips.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="font-display font-bold text-lg text-text-primary mb-4">
                    Советы к действию
                  </h3>
                  <ul className="space-y-2">
                    {stage3_wrong_answer_debrief.action_tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-text-primary">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mnemonic */}
              {stage3_wrong_answer_debrief.mnemonic && (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <IconLightbulb size={28} className="text-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-display font-bold text-lg text-blue-800 mb-2">
                        Запомни правило
                      </h3>
                      <p className="text-blue-900 font-medium leading-relaxed text-lg">
                        {stage3_wrong_answer_debrief.mnemonic}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleRestart}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors text-center"
                >
                  Пройти заново
                </button>
                <button
                  onClick={() => router.push(`/learning/${themeId}`)}
                  className="flex-1 border-2 border-primary text-primary py-3 rounded-xl font-semibold hover:bg-primary-bg transition-colors text-center"
                >
                  Вернуться к теме
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}
