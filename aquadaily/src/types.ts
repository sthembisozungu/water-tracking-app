export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface DailyGoal {
  user_id: string;
  goal_ml: number;
  reminder_frequency: number; // in minutes
  updated_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  created_at: string; // ISO string
}

export interface UserBehaviorStats {
  user_id: string;
  streak_days: number;
  average_daily_intake: number;
  last_logged_at: string;
  consistency_score: number; // 0-100
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SmartInsight {
  patternAnalysis: string;
  hydrationScore: number;
  goalSuggestion?: string;
  recommendation: string;
}

export enum TimeRange {
  WEEK = 'week',
  MONTH = 'month'
}