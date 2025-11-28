import React, { useEffect, useState } from 'react';
import { getSmartInsights, hasApiKey } from '../services/geminiService';
import { WaterLog, SmartInsight } from '../types';
import { Brain, Sparkles, TrendingUp, Award } from 'lucide-react';

interface Props {
  logs: WaterLog[];
  dailyGoal: number;
}

const SmartInsights: React.FC<Props> = ({ logs, dailyGoal }) => {
  const [insight, setInsight] = useState<SmartInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!hasApiKey()) return;
      if (logs.length === 0) return;

      setLoading(true);
      try {
        const data = await getSmartInsights(logs, dailyGoal);
        setInsight(data);
      } catch (err) {
        setError("Could not generate insights.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [logs.length, dailyGoal]); // Re-run if logs count changes significantly

  if (!hasApiKey()) return null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Gemini Smart Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Score Card */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Hydration Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{insight.hydrationScore}/100</p>
          </div>
        </div>

        {/* Suggestion Card */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-xl flex items-center gap-4">
           <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
             <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Goal Suggestion</p>
             <p className="text-sm font-medium text-gray-900 dark:text-white">{insight.goalSuggestion}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex gap-3 items-start">
           <Brain className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
           <div>
             <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pattern Analysis</p>
             <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{insight.patternAnalysis}</p>
           </div>
        </div>
        
        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> {insight.recommendation}
        </div>
      </div>
    </div>
  );
};

export default SmartInsights;