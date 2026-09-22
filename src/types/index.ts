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

export type TimeCategory = 'morning' | 'afternoon' | 'evening' | 'night';

export type MoodType = 'good' | 'okay' | 'difficult' | 'mixed';

export interface NotificationSettings {
  smartPatternRemindersEnabled: boolean;
  weeklyReviewEnabled: boolean;
  monthlyReviewEnabled: boolean;
  personalRemindersEnabled: boolean;
  personalReminderHour: number;
  personalReminderMinute: number;
  quietHoursStart: number; // hour 0-23
  quietHoursEnd: number; // hour 0-23
  cooldownMinutes: number;
  notificationPreviewDetail: 'minimal' | 'detailed';
  allNotificationsDisabled: boolean;
}

export interface PatternSummary {
  id: string;
  type: 'time' | 'day' | 'trigger' | 'trend' | 'weekend';
  title: string;
  observation: string;
  period: string;
  confidence: 'tentative' | 'reliable';
  dismissed: boolean;
}

export interface GoalSettings {
  goalType: 'reduce' | 'target' | 'awareness' | 'abstinence';
  weeklyTarget?: number;
  effectiveDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  name: string;
  createdAt: string;
  goalType: 'reduce' | 'target' | 'awareness' | 'abstinence';
  weeklyTarget?: number;
  trackPornography: boolean;
  weekStartDay: 'monday' | 'sunday';
  notificationsEnabled: boolean;
  notificationPreferences?: {
    dailyReflection: boolean;
    weeklyReview: boolean;
    mindfulnessReminder: boolean;
  };
  notificationSettings?: NotificationSettings;
  timezone?: string;
  hasCompletedOnboarding: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  trigger?: TriggerType;
  reflection?: string;
  includedPornography?: boolean;
  mood?: MoodType;
  createdAt: string;
  updatedAt?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: MoodType;
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

