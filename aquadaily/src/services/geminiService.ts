import { GoogleGenAI, Type } from "@google/genai";
import { WaterLog, SmartInsight } from "../types";

// Helper to get client securely
const getClient = () => {
  // Use Vite's import.meta.env for environment variables
  const key = import.meta.env.VITE_API_KEY || localStorage.getItem('GEMINI_API_KEY');
  if (!key) throw new Error("API Key missing");
  return new GoogleGenAI({ apiKey: key });
};

export const setApiKey = (key: string) => {
  localStorage.setItem('GEMINI_API_KEY', key);
};

export const hasApiKey = (): boolean => {
  return !!(import.meta.env.VITE_API_KEY || localStorage.getItem('GEMINI_API_KEY'));
};

export const getMotivationalQuotes = async (): Promise<string[]> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Give me 3 short, punchy motivational quotes from famous athletes about discipline, water, health, or consistency. Return them as a JSON array of strings.",
      config: {
        responseMimeType: "application/json",
         responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return ["Stay hydrated, stay winning.", "Water is life.", "Discipline equals freedom."];
  } catch (e) {
    console.error("Gemini Quote Error", e);
    return ["Hydration is the key to performance.", "Your body is your temple.", "Drink water, conquer the day."];
  }
};

export const getSmartInsights = async (logs: WaterLog[], dailyGoal: number): Promise<SmartInsight> => {
  try {
    const ai = getClient();
    
    // Prepare data for the model
    const logSummary = logs.map(l => ({
      time: l.created_at,
      amount: l.amount_ml
    }));

    const prompt = `
      Analyze these water logs for a user with a daily goal of ${dailyGoal}ml.
      Logs: ${JSON.stringify(logSummary)}
      
      Provide a smart analysis including:
      1. Pattern Analysis (when do they drink most?)
      2. A hydration score (0-100 based on consistency)
      3. A suggestion for their goal (keep, increase, or decrease)
      4. A brief specific recommendation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patternAnalysis: { type: Type.STRING },
            hydrationScore: { type: Type.INTEGER },
            goalSuggestion: { type: Type.STRING },
            recommendation: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SmartInsight;
    }
    throw new Error("No data returned");
  } catch (e) {
    console.error("Gemini Insight Error", e);
    return {
      patternAnalysis: "Not enough data to analyze patterns yet.",
      hydrationScore: 50,
      goalSuggestion: "Keep at 2000ml",
      recommendation: "Try to log water every time you finish a glass."
    };
  }
};