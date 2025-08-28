import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Types for our application data
export interface CycleData {
  id: string;
  startDate: string;
  endDate?: string;
  cycleLength: number;
  periodLength: number;
  symptoms: string[];
  notes?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  type: 'pill' | 'injection' | 'condom' | 'other';
  title: string;
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  isActive: boolean;
  lastTaken?: string;
  createdAt: string;
}

export interface HealthLog {
  id: string;
  date: string;
  weight?: number;
  symptoms: string[];
  mood: string;
  notes?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  isAnonymous: boolean;
  createdAt: string;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  answer: string;
  isAnonymous: boolean;
  createdAt: string;
}

// LocalStorage keys
export const STORAGE_KEYS = {
  CYCLES: 'femcare_cycles',
  REMINDERS: 'femcare_reminders',
  HEALTH_LOGS: 'femcare_health_logs',
  QUESTIONS: 'femcare_questions',
  USER_PROFILE: 'femcare_user_profile'
} as const;

// Utility functions for data persistence
export const dataUtils = {
  // Cycle data functions
  saveCycleData: (cycles: CycleData[]): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(cycles));
      return true;
    } catch (error) {
      console.error('Error saving cycle data:', error);
      return false;
    }
  },

  getCycleData: (): CycleData[] => {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.CYCLES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting cycle data:', error);
      return [];
    }
  },

  // Reminder functions
  saveReminders: (reminders: Reminder[]): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
      return true;
    } catch (error) {
      console.error('Error saving reminders:', error);
      return false;
    }
  },

  getReminders: (): Reminder[] => {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  },

  // Health log functions
  saveHealthLogs: (logs: HealthLog[]): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(STORAGE_KEYS.HEALTH_LOGS, JSON.stringify(logs));
      return true;
    } catch (error) {
      console.error('Error saving health logs:', error);
      return false;
    }
  },

  getHealthLogs: (): HealthLog[] => {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.HEALTH_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting health logs:', error);
      return [];
    }
  },

  // Questions functions
  saveQuestions: (questions: Question[]): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
      return true;
    } catch (error) {
      console.error('Error saving questions:', error);
      return false;
    }
  },

  getQuestions: (): Question[] => {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting questions:', error);
      return [];
    }
  }
};

// Cycle calculation utilities
export const cycleUtils = {
  // Calculate next period date
  calculateNextPeriod: (lastPeriodStart: string, averageCycleLength: number): Date => {
    const lastDate = new Date(lastPeriodStart);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + averageCycleLength);
    return nextDate;
  },

  // Calculate ovulation date (typically 14 days before next period)
  calculateOvulation: (lastPeriodStart: string, averageCycleLength: number): Date => {
    const nextPeriod = cycleUtils.calculateNextPeriod(lastPeriodStart, averageCycleLength);
    const ovulationDate = new Date(nextPeriod);
    ovulationDate.setDate(nextPeriod.getDate() - 14);
    return ovulationDate;
  },

  // Calculate fertile window (5 days before ovulation + ovulation day + 1 day after)
  calculateFertileWindow: (lastPeriodStart: string, averageCycleLength: number): { start: Date; end: Date } => {
    const ovulationDate = cycleUtils.calculateOvulation(lastPeriodStart, averageCycleLength);
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(ovulationDate.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(ovulationDate.getDate() + 1);
    
    return { start: fertileStart, end: fertileEnd };
  },

  // Check if a date is in fertile window
  isInFertileWindow: (date: Date, lastPeriodStart: string, averageCycleLength: number): boolean => {
    const fertileWindow = cycleUtils.calculateFertileWindow(lastPeriodStart, averageCycleLength);
    return date >= fertileWindow.start && date <= fertileWindow.end;
  },

  // Calculate cycle day
  calculateCycleDay: (currentDate: Date, lastPeriodStart: string): number => {
    const lastPeriod = new Date(lastPeriodStart);
    const diffTime = Math.abs(currentDate.getTime() - lastPeriod.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  },

  // Get cycle phase
  getCyclePhase: (cycleDay: number, averageCycleLength: number): string => {
    if (cycleDay <= 5) return 'Menstrual';
    if (cycleDay <= 13) return 'Follicular';
    if (cycleDay <= 15) return 'Ovulation';
    return 'Luteal';
  }
};

// Date formatting utilities
export const dateUtils = {
  formatDate: (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  formatShortDate: (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  },

  getDaysUntil: (targetDate: Date): number => {
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  isToday: (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
};

// Generate unique IDs
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
