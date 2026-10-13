import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockDashboardData, mockQuizQuestions, mockRoadmapSubjects, mockStudyNotes, mockLeaderboard, mockPlannerDays } from './mock-data';

const TOKEN_KEY = 'propella_mobile_token';
const API_URL_KEY = 'propella_api_url';

export const DEFAULT_API_URL = 'http://localhost:5000';

export async function getStoredToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredToken(token: string | null): Promise<void> {
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore error
  }
}

export async function getBaseApiUrl(): Promise<string> {
  try {
    const custom = await AsyncStorage.getItem(API_URL_KEY);
    return custom || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

export const mobileApi = {
  getDashboard: async () => {
    try {
      const baseUrl = await getBaseApiUrl();
      const token = await getStoredToken();
      const res = await fetch(`${baseUrl}/api/dashboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        return json.data ?? mockDashboardData;
      }
    } catch {
      // Fallback to rich mock data
    }
    return mockDashboardData;
  },

  getRoadmap: async () => {
    try {
      const baseUrl = await getBaseApiUrl();
      const res = await fetch(`${baseUrl}/api/roadmap`);
      if (res.ok) {
        const json = await res.json();
        return json.data ?? mockRoadmapSubjects;
      }
    } catch {
      // Fallback
    }
    return mockRoadmapSubjects;
  },

  getQuizzes: async (subject?: string) => {
    if (subject && subject !== 'all') {
      return mockQuizQuestions.filter(q => q.subjectSlug === subject);
    }
    return mockQuizQuestions;
  },

  getNotes: async (subject?: string) => {
    if (subject && subject !== 'all') {
      return mockStudyNotes.filter(n => n.subjectSlug === subject);
    }
    return mockStudyNotes;
  },

  getLeaderboard: async () => {
    return mockLeaderboard;
  },

  getPlanner: async () => {
    return mockPlannerDays;
  },
};
