import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { Droplet, Plus, Moon, Sun, LogOut, Settings, Award, ArrowLeft } from 'lucide-react';
import * as api from './services/mockBackend';
import { getMotivationalQuotes, setApiKey, hasApiKey } from './services/geminiService';
import SmartInsights from './components/SmartInsights';
import Charts from './components/Charts';
import { User, DailyGoal, WaterLog } from './types';

// --- Components (Inline for simplicity as per single file structure guidance for smaller components) ---

const Layout = ({ children, darkMode, toggleTheme, user, onLogout }: any) => (
  <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
    <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Droplet className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AquaDaily
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hi, {user.name}
                  </span>
                  <button onClick={onLogout} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                    <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                   {/* Buttons handled in Landing Component */}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  </div>
);

const Landing = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<string[]>([]);
  const [keyInput, setKeyInput] = useState("");
  
  useEffect(() => {
    if (hasApiKey()) {
        getMotivationalQuotes().then(setQuotes);
    }
  }, []);

  const handleSaveKey = () => {
    if (keyInput) {
        setApiKey(keyInput);
        getMotivationalQuotes().then(setQuotes);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center pt-10 text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
        Master Your <span className="text-blue-500">Hydration</span>.
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-10">
        Intelligent tracking, adaptive goals, and insights powered by AI to keep you at peak performance.
      </p>

      {!hasApiKey() && (
        <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg max-w-md w-full">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">Enter Gemini API Key for AI Features</p>
            <div className="flex gap-2">
                <input 
                    type="password" 
                    placeholder="API Key" 
                    className="flex-1 p-2 border rounded dark:bg-gray-800 dark:text-white"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                />
                <button onClick={handleSaveKey} className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700">Save</button>
            </div>
        </div>
      )}

      <div className="flex gap-4 mb-16">
        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-white dark:bg-gray-800 text-blue-600 font-semibold rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
          Login
        </button>
        <button onClick={() => navigate('/register')} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 transform">
          Get Started
        </button>
      </div>

      {quotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {quotes.map((quote, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 italic">"{quote}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AuthForm = ({ type }: { type: 'login' | 'register' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (type === 'register') {
        await api.register(email, password, name);
      } else {
        await api.login(email, password);
      }
      navigate('/dashboard');
      window.location.reload(); // Simple reload to pick up session state in App
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      <button 
        onClick={() => navigate('/')}
        className="mb-6 flex items-center text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Menu
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white capitalize">{type}</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full p-2 border border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full p-2 border border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
        >
          {type === 'register' ? 'Create Account' : 'Sign In'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        {type === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span 
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate(type === 'register' ? '/login' : '/register')}
        >
            {type === 'register' ? 'Login' : 'Register'}
        </span>
      </p>
    </div>
  );
};

const Dashboard = ({ user }: { user: User }) => {
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [todayLogs, setTodayLogs] = useState<WaterLog[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const g = await api.getDailyGoal(user.id);
      const l = await api.getWaterLogs(user.id);
      const t = await api.getTodayLogs(user.id);
      setGoal(g);
      setLogs(l);
      setTodayLogs(t);
    };
    loadData();
  }, [user.id, refresh]);

  const handleAddWater = async (amount: number) => {
    await api.logWater(user.id, amount);
    setRefresh(prev => prev + 1);
  };

  const handleGoalUpdate = async () => {
    if (!goal) return;
    const newGoal = prompt("Enter new daily goal (ml):", goal.goal_ml.toString());
    if (newGoal && !isNaN(Number(newGoal))) {
      await api.updateDailyGoal(user.id, Number(newGoal));
      setRefresh(prev => prev + 1);
    }
  };

  if (!goal) return <div className="p-8 text-center">Loading your hydration data...</div>;

  const todayTotal = todayLogs.reduce((sum, log) => sum + log.amount_ml, 0);
  const percentage = Math.min(Math.round((todayTotal / goal.goal_ml) * 100), 100);

  return (
    <div className="space-y-8">
      {/* Top Section: Progress & Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Progress Card */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Droplet className="w-64 h-64 text-blue-500" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Today's Hydration</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Keep up the good work!</p>
              
              <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">{todayTotal}</span>
                 <span className="text-xl text-gray-500">/ {goal.goal_ml} ml</span>
              </div>
              
              <button onClick={handleGoalUpdate} className="mt-4 text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                <Settings size={14} /> Adjust Goal
              </button>
            </div>

            {/* Circular Progress (Simplified CSS) */}
            <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="80" cy="80" r="70"
                        stroke="currentColor" strokeWidth="12" fill="transparent"
                        className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                        cx="80" cy="80" r="70"
                        stroke="currentColor" strokeWidth="12" fill="transparent"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * percentage) / 100}
                        className="text-blue-500 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800 dark:text-white">{percentage}%</span>
                </div>
            </div>
          </div>
        </div>

        {/* Quick Add Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Add</h3>
            <div className="grid grid-cols-1 gap-4">
                {[200, 300, 500].map(amt => (
                    <button 
                        key={amt}
                        onClick={() => handleAddWater(amt)}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                    >
                        <span className="font-medium text-gray-700 dark:text-gray-300">Glass / Bottle</span>
                        <div className="flex items-center gap-2 text-blue-500 font-bold">
                            <Plus size={16} /> {amt}ml
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Analytics & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* History Chart */}
         <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weekly History</h3>
            <Charts logs={logs} />
         </div>

         {/* Smart AI Section */}
         <div className="flex flex-col gap-6">
             <SmartInsights logs={logs} dailyGoal={goal.goal_ml} />
             
             <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Award className="w-6 h-6 text-yellow-300" />
                    <h3 className="font-bold text-lg">Current Streak</h3>
                </div>
                {/* Simplified streak logic for demo */}
                <p className="text-4xl font-extrabold mb-1">3 Days</p> 
                <p className="text-blue-100 text-sm">You are on fire! Keep drinking to maintain it.</p>
             </div>
         </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check auth
    const session = api.getSession();
    if (session) setUser(session.user);

    // Check system preference for theme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <Router>
      <Layout darkMode={darkMode} toggleTheme={toggleTheme} user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route path="/login" element={!user ? <AuthForm type="login" /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <AuthForm type="register" /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </Layout>
    </Router>
  );
}