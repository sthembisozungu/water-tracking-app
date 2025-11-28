import { User, DailyGoal, WaterLog, UserBehaviorStats, AuthResponse, TimeRange } from '../types';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  USERS: 'aquadaily_users',
  LOGS: 'aquadaily_logs',
  GOALS: 'aquadaily_goals',
  STATS: 'aquadaily_stats',
  SESSION: 'aquadaily_session'
};

// Initial Data Seeding
const seedData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.GOALS)) localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.STATS)) localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify([]));
};
seedData();

// --- Auth Services ---

export const register = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  await delay(500);
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  
  if (users.find(u => u.email === email)) {
    throw new Error("User already exists");
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    name,
    created_at: new Date().toISOString()
  };
  
  // Set default goal
  const newGoal: DailyGoal = {
    user_id: newUser.id,
    goal_ml: 2000,
    reminder_frequency: 120,
    updated_at: new Date().toISOString()
  };

  // Set default stats
  const newStats: UserBehaviorStats = {
    user_id: newUser.id,
    streak_days: 0,
    average_daily_intake: 0,
    last_logged_at: new Date().toISOString(),
    consistency_score: 50
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
  goals.push(newGoal);
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));

  const stats = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS) || '[]');
  stats.push(newStats);
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

  const token = `fake-jwt-${newUser.id}`;
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ user: newUser, token }));

  return { user: newUser, token };
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  await delay(500);
  // Password check skipped for mock simplicity
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const user = users.find(u => u.email === email);

  if (!user) throw new Error("Invalid credentials");

  const token = `fake-jwt-${user.id}`;
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ user, token }));
  return { user, token };
};

export const logout = async () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};

export const getSession = (): AuthResponse | null => {
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  return session ? JSON.parse(session) : null;
};

// --- Data Services ---

export const getDailyGoal = async (userId: string): Promise<DailyGoal> => {
  await delay(200);
  const goals: DailyGoal[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
  const goal = goals.find(g => g.user_id === userId);
  return goal || { user_id: userId, goal_ml: 2000, reminder_frequency: 120, updated_at: new Date().toISOString() };
};

export const updateDailyGoal = async (userId: string, goalMl: number): Promise<DailyGoal> => {
  await delay(200);
  const goals: DailyGoal[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
  const index = goals.findIndex(g => g.user_id === userId);
  
  const updatedGoal = {
    user_id: userId,
    goal_ml: goalMl,
    reminder_frequency: 120,
    updated_at: new Date().toISOString()
  };

  if (index >= 0) {
    goals[index] = updatedGoal;
  } else {
    goals.push(updatedGoal);
  }
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  return updatedGoal;
};

export const logWater = async (userId: string, amount: number): Promise<WaterLog> => {
  await delay(200);
  const logs: WaterLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
  const newLog: WaterLog = {
    id: crypto.randomUUID(),
    user_id: userId,
    amount_ml: amount,
    created_at: new Date().toISOString()
  };
  
  logs.push(newLog);
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));

  // Update Stats simply for the mock
  const statsList: UserBehaviorStats[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS) || '[]');
  const userStatsIdx = statsList.findIndex(s => s.user_id === userId);
  if (userStatsIdx >= 0) {
    const s = statsList[userStatsIdx];
    s.last_logged_at = new Date().toISOString();
    // Simplified streak logic logic would go here in real backend
    statsList[userStatsIdx] = s;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(statsList));
  }

  return newLog;
};

export const getWaterLogs = async (userId: string, range: TimeRange = TimeRange.WEEK): Promise<WaterLog[]> => {
  await delay(300);
  const logs: WaterLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
  const now = new Date();
  const past = new Date();
  
  if (range === TimeRange.WEEK) past.setDate(now.getDate() - 7);
  else past.setDate(now.getDate() - 30);

  return logs.filter(l => l.user_id === userId && new Date(l.created_at) >= past);
};

export const getTodayLogs = async (userId: string): Promise<WaterLog[]> => {
  const logs = await getWaterLogs(userId, TimeRange.WEEK); // Fetch recent
  const today = new Date().toDateString();
  return logs.filter(l => new Date(l.created_at).toDateString() === today);
};