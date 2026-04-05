export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  security_level: number;
  total_xp: number;
  current_league: string;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Scenario {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  difficulty: number;
  order_index: number;
  is_active: boolean;
  missions_count: number;
  completed_count: number;
}

export interface ScenarioDetail extends Scenario {
  missions: MissionListItem[];
}

export interface MissionListItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  attack_type: string;
  environment: string;
  difficulty: number;
  xp_reward: number;
  order_index: number;
  time_limit_seconds: number | null;
  status: string;
}

export interface StepChoice {
  id: string;
  choice_text: string;
  order_index: number;
}

export interface MissionStep {
  id: string;
  step_order: number;
  context_text: string;
  context_type: string;
  context_data: Record<string, unknown> | null;
  choices: StepChoice[];
}

export interface Mission {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  story_text: string | null;
  attack_type: string;
  environment: string;
  difficulty: number;
  xp_reward: number;
  time_limit_seconds: number | null;
  steps: MissionStep[];
}

export interface MissionStartResponse {
  mission: {
    id: string;
    slug: string;
    title: string;
    story_text: string | null;
    attack_type: string;
    environment: string;
    xp_reward: number;
    time_limit_seconds: number | null;
  };
  first_step: MissionStep | null;
  current_hp: number;
  current_step: number;
}

export interface AnswerResponse {
  is_correct: boolean;
  feedback_text: string;
  consequence_text: string | null;
  hp_change: number;
  current_hp: number;
  next_step: MissionStep | null;
  mission_completed: boolean;
  new_achievements: AchievementNotification[];
}

export interface MissionResult {
  xp_earned: number;
  correct_answers: number;
  wrong_answers: number;
  total_steps: number;
  accuracy_percent: number;
  new_achievements: AchievementNotification[];
  league_changed: boolean;
  new_league: string | null;
}

export interface ProgressSummary {
  total_missions: number;
  completed_missions: number;
  total_xp: number;
  security_level: number;
  accuracy_percent: number;
  total_errors: number;
}

export interface DashboardData {
  user_stats: ProgressSummary;
  recent_achievements: AchievementNotification[];
  scenario_progress: ScenarioProgress[];
  attack_type_stats: AttackTypeStat[];
}

export interface ScenarioProgress {
  slug: string;
  title: string;
  icon: string;
  total: number;
  completed: number;
}

export interface AttackTypeStat {
  type: string;
  total: number;
  completed: number;
}

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  xp_bonus: number;
  rarity: string;
  earned: boolean;
  earned_at: string | null;
}

export interface AchievementNotification {
  slug: string;
  title: string;
  description?: string;
  icon: string;
  rarity: string;
  xp_bonus?: number;
  earned_at?: string | null;
}

export interface LeaderboardEntry {
  position: number;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  missions_completed: number;
  accuracy_percent: number;
  league: string;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  user_position: number;
}

export interface LeagueData {
  slug: string;
  title: string;
  xp_min: number;
  xp_max: number | null;
  members_count: number;
  top_members: {
    username: string;
    display_name: string;
    total_xp: number;
    avatar_url: string | null;
  }[];
}

export interface HistoryItem {
  mission_id: string;
  mission_title: string;
  scenario_title: string;
  status: string;
  xp_earned: number;
  correct_answers: number;
  wrong_answers: number;
  completed_at: string | null;
}

// Learning Module types

export interface LearningTheme {
  id: string;
  name: string;
  icon: string;
  description: string;
  scenarios_count: number;
}

export interface LearningModule {
  scenario_id: number;
  theme: string;
  title: string;
  stage1_theory: {
    definition: string;
    stats: { value: string; label: string }[];
    attack_steps: string[];
    variants_table: { type: string; description: string; example: string }[];
    red_flags: string[];
    protection_levels: { level: string; items: string[] }[];
  };
  stage2_scenario: {
    intro: string;
    visual: string;
    visual_hint: string;
    question: string;
    choices: { text: string; correct: boolean; hint: string }[];
  };
  stage3_wrong_answer_debrief: {
    outcome_title: string;
    timeline: string[];
    why_it_happened: string[];
    theory_link: string;
    ignored_red_flags: string[];
    correct_choices_with_hints: { text: string; hint: string }[];
    action_tips: string[];
    mnemonic: string;
  };
}
