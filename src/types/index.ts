export type TriggerType =
  | 'boredom'
  | 'stress'
  | 'loneliness'
  | 'habit'
  | 'sexual_content'
  | 'sleep_difficulty'
  | 'emotional_discomfort'
  | 'other'
  | 'prefer_not_to_say';

export interface UserProfile {
  name: string;
  createdAt: string;
  goalType: 'reduce' | 'target' | 'awareness' | 'abstinence';
  weeklyTarget?: number;
  trackPornography: boolean;
  weekStartDay: 'monday' | 'sunday';
  notificationsEnabled: boolean;
  notificationPreferences: {
    dailyReflection: boolean;
    weeklyReview: boolean;
    mindfulnessReminder: boolean;
  };
  hasCompletedOnboarding: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  trigger?: TriggerType;
  reflection?: string;
  includedPornography?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: 'good' | 'okay' | 'difficult' | 'mixed';
  createdAt: string;
  updatedAt?: string;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalLogs: number;
  triggers: Record<TriggerType, number>;
  pornographyCount: number;
  daysElapsed: number;
  daysRemaining: number;
  previousWeekTotal: number;
  goalMet: boolean | null;
}
