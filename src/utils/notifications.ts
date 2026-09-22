import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { NotificationSettings, PatternSummary } from '../types';

let Notifications: any = null;
let isNotificationsSupported = false;

try {
  Notifications = require('expo-notifications');
  if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    isNotificationsSupported = true;
  }
} catch (error) {
  console.log(
    'expo-notifications is not supported in this environment (e.g. Expo Go on Android SDK 53+). Notifications will require a development build.'
  );
  isNotificationsSupported = false;
}

/**
 * Request notification permissions and set up Android channel.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isNotificationsSupported || !Notifications) {
    console.log('Notifications not supported in current environment (Expo Go)');
    return false;
  }

  if (!Device.isDevice) {
    console.log('Notifications require a physical device');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('less-reminders', {
        name: 'Mindful Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200],
        lightColor: '#7C6BF0',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.SECRET,
      });
    }

    return true;
  } catch (error) {
    console.warn('Failed to request notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a weekly review reminder notification.
 */
export async function scheduleWeeklyReview(
  dayOfWeek: number = 1, // Monday
  hour: number = 10,
  minute: number = 0,
  previewDetail: 'minimal' | 'detailed' = 'minimal'
): Promise<string | null> {
  if (!isNotificationsSupported || !Notifications) return null;

  try {
    const content =
      previewDetail === 'minimal'
        ? {
            title: 'Less',
            body: 'Your weekly reflection is ready.',
            data: { route: '/(tabs)/insights', type: 'weekly_review' },
          }
        : {
            title: 'Weekly Review',
            body: 'Take a moment to review your patterns from the past week.',
            data: { route: '/(tabs)/insights', type: 'weekly_review' },
          };

    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: dayOfWeek,
        hour,
        minute,
        channelId: 'less-reminders',
      },
    });
    return id;
  } catch (error) {
    console.warn('Failed to schedule weekly review:', error);
    return null;
  }
}

/**
 * Schedule a monthly review reminder notification.
 */
export async function scheduleMonthlyReview(
  hour: number = 10,
  minute: number = 0,
  previewDetail: 'minimal' | 'detailed' = 'minimal'
): Promise<string | null> {
  if (!isNotificationsSupported || !Notifications) return null;

  try {
    const content =
      previewDetail === 'minimal'
        ? {
            title: 'Less',
            body: 'Your monthly review is ready.',
            data: { route: '/(tabs)/insights', type: 'monthly_review' },
          }
        : {
            title: 'Monthly Review',
            body: 'Take a look at your patterns from the past month.',
            data: { route: '/(tabs)/insights', type: 'monthly_review' },
          };

    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, hour, minute);

    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: targetDate,
        channelId: 'less-reminders',
      },
    });
    return id;
  } catch (error) {
    console.warn('Failed to schedule monthly review:', error);
    return null;
  }
}

/**
 * Schedule a personal reminder at a custom time daily.
 */
export async function schedulePersonalReminder(
  hour: number = 21,
  minute: number = 0,
  previewDetail: 'minimal' | 'detailed' = 'minimal'
): Promise<string | null> {
  if (!isNotificationsSupported || !Notifications) return null;

  try {
    const content =
      previewDetail === 'minimal'
        ? {
            title: 'Less',
            body: 'Take a moment for yourself.',
            data: { route: '/(tabs)', type: 'personal_reminder' },
          }
        : {
            title: 'Mindful Reminder',
            body: 'Pause and reflect on your intentions for the evening.',
            data: { route: '/(tabs)', type: 'personal_reminder' },
          };

    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'less-reminders',
      },
    });
    return id;
  } catch (error) {
    console.warn('Failed to schedule personal reminder:', error);
    return null;
  }
}

/**
 * Schedule a pattern-based reminder. Only called when a reliable pattern exists.
 */
export async function schedulePatternReminder(
  pattern: PatternSummary,
  hour: number,
  previewDetail: 'minimal' | 'detailed' = 'minimal'
): Promise<string | null> {
  if (!isNotificationsSupported || !Notifications) return null;

  try {
    const reminderHour = Math.max(0, hour - 1);

    const content =
      previewDetail === 'minimal'
        ? {
            title: 'Less',
            body: 'A gentle reminder based on your patterns.',
            data: { route: '/(tabs)/insights', type: 'pattern_reminder' },
          }
        : {
            title: 'Pattern Reminder',
            body: pattern.observation,
            data: { route: '/(tabs)/insights', type: 'pattern_reminder' },
          };

    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminderHour,
        minute: 0,
        channelId: 'less-reminders',
      },
    });
    return id;
  } catch (error) {
    console.warn('Failed to schedule pattern reminder:', error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  if (!isNotificationsSupported || !Notifications) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Failed to cancel notifications:', error);
  }
}

/**
 * Get all currently scheduled notifications.
 */
export async function getScheduledNotifications(): Promise<any[]> {
  if (!isNotificationsSupported || !Notifications) return [];

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Failed to get scheduled notifications:', error);
    return [];
  }
}

/**
 * Check if a given hour falls within quiet hours.
 */
export function isInQuietHours(
  currentHour: number,
  quietStart: number,
  quietEnd: number
): boolean {
  if (quietStart <= quietEnd) {
    return currentHour >= quietStart || currentHour < quietEnd;
  }
  return currentHour >= quietStart || currentHour < quietEnd;
}

/**
 * Refresh all scheduled notifications based on current settings and patterns.
 */
export async function refreshNotifications(
  settings: NotificationSettings,
  patterns: PatternSummary[]
): Promise<void> {
  if (!isNotificationsSupported || !Notifications) return;

  await cancelAllNotifications();

  if (settings.allNotificationsDisabled) return;

  if (settings.weeklyReviewEnabled) {
    await scheduleWeeklyReview(2, 10, 0, settings.notificationPreviewDetail);
  }

  if (settings.monthlyReviewEnabled) {
    await scheduleMonthlyReview(10, 0, settings.notificationPreviewDetail);
  }

  if (settings.personalRemindersEnabled) {
    await schedulePersonalReminder(
      settings.personalReminderHour,
      settings.personalReminderMinute,
      settings.notificationPreviewDetail
    );
  }

  if (settings.smartPatternRemindersEnabled && patterns.length > 0) {
    const timePattern = patterns.find(
      (p) => p.type === 'time' && p.confidence === 'reliable' && !p.dismissed
    );
    if (timePattern) {
      const hourMap: Record<string, number> = {
        morning: 8,
        afternoon: 14,
        evening: 19,
        night: 22,
      };
      const matchedCategory = Object.keys(hourMap).find((cat) =>
        timePattern.observation.toLowerCase().includes(cat)
      );
      if (matchedCategory) {
        await schedulePatternReminder(
          timePattern,
          hourMap[matchedCategory],
          settings.notificationPreviewDetail
        );
      }
    }
  }
}
