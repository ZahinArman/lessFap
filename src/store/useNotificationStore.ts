import { create } from 'zustand';
import { NotificationSettings } from '../types';
import { prefsStorage } from '../utils/storage';

export const NOTIFICATION_STORAGE_KEY = 'lessFap_notification_settings';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  smartPatternRemindersEnabled: false,
  weeklyReviewEnabled: false,
  monthlyReviewEnabled: false,
  personalRemindersEnabled: false,
  personalReminderHour: 21,
  personalReminderMinute: 0,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  cooldownMinutes: 480, // 8 hours
  notificationPreviewDetail: 'minimal',
  allNotificationsDisabled: true,
};

interface StoredNotificationData {
  settings: NotificationSettings;
  lastPatternNotificationAt: string | null;
}

export interface NotificationState {
  settings: NotificationSettings;
  lastPatternNotificationAt: string | null;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<NotificationSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  recordPatternNotification: () => Promise<void>;
  canSendPatternNotification: (date?: Date) => boolean;
  isInQuietHours: (date?: Date) => boolean;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  settings: DEFAULT_NOTIFICATION_SETTINGS,
  lastPatternNotificationAt: null,
  isLoading: true,

  loadSettings: async () => {
    try {
      const raw = await prefsStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Support both wrapped { settings: {...}, lastPatternNotificationAt }
          // and flat NotificationSettings format
          const loadedSettings =
            'settings' in parsed && parsed.settings && typeof parsed.settings === 'object'
              ? parsed.settings
              : parsed;

          const lastPatternNotificationAt =
            typeof parsed.lastPatternNotificationAt === 'string'
              ? parsed.lastPatternNotificationAt
              : null;

          set({
            settings: {
              ...DEFAULT_NOTIFICATION_SETTINGS,
              ...loadedSettings,
            },
            lastPatternNotificationAt,
            isLoading: false,
          });
          return;
        }
      }

      set({
        settings: DEFAULT_NOTIFICATION_SETTINGS,
        lastPatternNotificationAt: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      set({
        settings: DEFAULT_NOTIFICATION_SETTINGS,
        lastPatternNotificationAt: null,
        isLoading: false,
      });
    }
  },

  updateSettings: async (updates: Partial<NotificationSettings>) => {
    const currentSettings = get().settings;
    const updatedSettings: NotificationSettings = {
      ...currentSettings,
      ...updates,
    };

    // Optimistic update
    set({ settings: updatedSettings });

    try {
      const payload: StoredNotificationData = {
        settings: updatedSettings,
        lastPatternNotificationAt: get().lastPatternNotificationAt,
      };
      await prefsStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  },

  resetSettings: async () => {
    set({
      settings: DEFAULT_NOTIFICATION_SETTINGS,
      lastPatternNotificationAt: null,
    });

    try {
      await prefsStorage.removeItem(NOTIFICATION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset notification settings:', error);
    }
  },

  recordPatternNotification: async () => {
    const timestamp = new Date().toISOString();
    set({ lastPatternNotificationAt: timestamp });

    try {
      const payload: StoredNotificationData = {
        settings: get().settings,
        lastPatternNotificationAt: timestamp,
      };
      await prefsStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to record pattern notification timestamp:', error);
    }
  },

  canSendPatternNotification: (date?: Date): boolean => {
    const { lastPatternNotificationAt, settings } = get();

    if (!lastPatternNotificationAt) {
      return true;
    }

    const lastSentTime = new Date(lastPatternNotificationAt).getTime();
    if (isNaN(lastSentTime)) {
      return true;
    }

    const now = date ?? new Date();
    const cooldownMs = (settings.cooldownMinutes ?? 480) * 60 * 1000;
    const elapsedMs = now.getTime() - lastSentTime;

    return elapsedMs >= cooldownMs;
  },

  isInQuietHours: (date?: Date): boolean => {
    const { quietHoursStart, quietHoursEnd } = get().settings;
    const currentHour = (date ?? new Date()).getHours();

    if (quietHoursStart === quietHoursEnd) {
      return false;
    }

    if (quietHoursStart > quietHoursEnd) {
      // Quiet hours span across midnight (e.g., 22:00 to 07:00)
      return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
    }

    // Quiet hours within the same day (e.g., 13:00 to 17:00)
    return currentHour >= quietHoursStart && currentHour < quietHoursEnd;
  },
}));
