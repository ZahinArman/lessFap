import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, TextInput, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '../../src/store/useProfileStore';
import { useLogStore } from '../../src/store/useLogStore';
import { useJournalStore } from '../../src/store/useJournalStore';
import { colors, spacing, typography, radii } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { useRouter } from 'expo-router';
import { NotificationSettings } from '../../src/types';
import { requestNotificationPermissions, refreshNotifications } from '../../src/utils/notifications';
import { generatePatternSummaries } from '../../src/utils/patternAnalysis';

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  smartPatternRemindersEnabled: false,
  weeklyReviewEnabled: false,
  monthlyReviewEnabled: false,
  personalRemindersEnabled: false,
  personalReminderHour: 21,
  personalReminderMinute: 0,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  cooldownMinutes: 480,
  notificationPreviewDetail: 'minimal',
  allNotificationsDisabled: true,
};

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, clearProfile } = useProfileStore();
  const { logs, loadLogs, clearAllLogs } = useLogStore();
  const { clearAllEntries } = useJournalStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    if (profile?.name) {
      setNameInput(profile.name);
    }
  }, [profile?.name]);

  if (!profile) return null;

  const notificationSettings: NotificationSettings = {
    ...DEFAULT_NOTIFICATION_SETTINGS,
    ...(profile.notificationSettings || {}),
  };

  const updateNotificationSetting = async (updates: Partial<NotificationSettings>) => {
    const updatedSettings: NotificationSettings = {
      ...notificationSettings,
      ...updates,
    };

    if (updates.allNotificationsDisabled === false) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Notifications Permission',
          'Please enable notifications in your device settings to receive mindful reminders.'
        );
      }
    }

    await updateProfile({
      notificationSettings: updatedSettings,
      notificationsEnabled: !updatedSettings.allNotificationsDisabled,
    });

    const patterns = generatePatternSummaries(logs);
    await refreshNotifications(updatedSettings, patterns);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (trimmed.length > 0) {
      await updateProfile({ name: trimmed });
    } else {
      setNameInput(profile.name || '');
    }
    setEditingName(false);
  };

  const handleCancelEditName = () => {
    setNameInput(profile.name || '');
    setEditingName(false);
  };

  const formatGoalType = (type?: string, weeklyTarget?: number) => {
    switch (type) {
      case 'reduce':
        return 'Gradual reduction';
      case 'target':
        return weeklyTarget ? `Personal weekly target (${weeklyTarget}/week)` : 'Personal weekly target';
      case 'awareness':
        return 'Awareness and reflection';
      case 'abstinence':
        return 'Intentional abstinence';
      default:
        return 'Awareness and reflection';
    }
  };

  const handleExportData = async () => {
    try {
      const exportJson = JSON.stringify(logs, null, 2);
      await Share.share({
        title: 'Less App - Log Data Export',
        message: exportJson,
      });
    } catch (error) {
      Alert.alert('Export Error', 'Unable to export data at this time. Please try again.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Delete all data',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearAllLogs();
            await clearAllEntries();
            await clearProfile();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const weekStartDay = profile.weekStartDay ?? 'monday';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Profile</Text>

        {/* 1. Personal Info Card */}
        <Card style={styles.section} padding="md">
          {editingName ? (
            <View style={styles.nameEditContainer}>
              <Text style={styles.rowTitle}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Enter your name"
                placeholderTextColor={colors.textTertiary}
                autoFocus
                maxLength={40}
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <View style={styles.editActionRow}>
                <TouchableOpacity
                  style={[styles.smallButton, styles.cancelButton]}
                  onPress={handleCancelEditName}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallButton, styles.saveButton]}
                  onPress={handleSaveName}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.row}
              onPress={() => {
                setNameInput(profile.name || '');
                setEditingName(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.flexOne}>
                <Text style={styles.rowTitle}>Name</Text>
                <Text style={styles.rowSubtitle}>{profile.name || 'Tap to set your name'}</Text>
              </View>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/goal-editor')}
            activeOpacity={0.7}
          >
            <View style={styles.flexOne}>
              <Text style={styles.rowTitle}>Current Goal</Text>
              <Text style={styles.rowSubtitle}>
                {formatGoalType(profile.goalType, profile.weeklyTarget)}
              </Text>
            </View>
            <Text style={styles.actionText}>Edit →</Text>
          </TouchableOpacity>
        </Card>

        {/* 2. Tracking Preferences Card */}
        <Text style={styles.sectionHeading}>Tracking Preferences</Text>
        <Card style={styles.section} padding="md">
          <View style={styles.row}>
            <View style={styles.flexOne}>
              <Text style={styles.rowTitle}>Track pornography</Text>
              <Text style={styles.rowSubtitle}>Show option when logging</Text>
            </View>
            <Switch
              value={profile.trackPornography}
              onValueChange={(val) => updateProfile({ trackPornography: val })}
              trackColor={{ false: colors.divider, true: colors.accentPrimary }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.preferenceColumn}>
            <Text style={styles.rowTitle}>Week starts on</Text>
            <Text style={styles.rowSubtitle}>Used for weekly goals and summary reviews</Text>
            <View style={styles.buttonSelector}>
              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  weekStartDay === 'monday' && styles.selectorButtonActive,
                ]}
                onPress={() => updateProfile({ weekStartDay: 'monday' })}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.selectorButtonText,
                    weekStartDay === 'monday' && styles.selectorButtonTextActive,
                  ]}
                >
                  Monday
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  weekStartDay === 'sunday' && styles.selectorButtonActive,
                ]}
                onPress={() => updateProfile({ weekStartDay: 'sunday' })}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.selectorButtonText,
                    weekStartDay === 'sunday' && styles.selectorButtonTextActive,
                  ]}
                >
                  Sunday
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* 3. Notification Settings Card */}
        <Text style={styles.sectionHeading}>Notification Settings</Text>
        <Card style={styles.section} padding="md">
          <View style={styles.row}>
            <View style={styles.flexOne}>
              <Text style={styles.rowTitle}>Enable notifications</Text>
              <Text style={styles.rowSubtitle}>Receive mindful reminders and reviews</Text>
            </View>
            <Switch
              value={!notificationSettings.allNotificationsDisabled}
              onValueChange={(enabled) =>
                updateNotificationSetting({ allNotificationsDisabled: !enabled })
              }
              trackColor={{ false: colors.divider, true: colors.accentPrimary }}
            />
          </View>

          {!notificationSettings.allNotificationsDisabled && (
            <>
              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.flexOne}>
                  <Text style={styles.rowTitle}>Smart pattern reminders</Text>
                  <Text style={styles.rowSubtitle}>Gentle prompt during typical urge hours</Text>
                </View>
                <Switch
                  value={notificationSettings.smartPatternRemindersEnabled}
                  onValueChange={(val) =>
                    updateNotificationSetting({ smartPatternRemindersEnabled: val })
                  }
                  trackColor={{ false: colors.divider, true: colors.accentPrimary }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.flexOne}>
                  <Text style={styles.rowTitle}>Weekly review reminders</Text>
                  <Text style={styles.rowSubtitle}>Gentle prompt to reflect on your week</Text>
                </View>
                <Switch
                  value={notificationSettings.weeklyReviewEnabled}
                  onValueChange={(val) =>
                    updateNotificationSetting({ weeklyReviewEnabled: val })
                  }
                  trackColor={{ false: colors.divider, true: colors.accentPrimary }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.flexOne}>
                  <Text style={styles.rowTitle}>Monthly review reminders</Text>
                  <Text style={styles.rowSubtitle}>Overview of habit trends and growth</Text>
                </View>
                <Switch
                  value={notificationSettings.monthlyReviewEnabled}
                  onValueChange={(val) =>
                    updateNotificationSetting({ monthlyReviewEnabled: val })
                  }
                  trackColor={{ false: colors.divider, true: colors.accentPrimary }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.flexOne}>
                  <Text style={styles.rowTitle}>Personal daily reminder</Text>
                  <Text style={styles.rowSubtitle}>
                    Daily check-in at{' '}
                    {String(notificationSettings.personalReminderHour).padStart(2, '0')}:
                    {String(notificationSettings.personalReminderMinute).padStart(2, '0')}
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.personalRemindersEnabled}
                  onValueChange={(val) =>
                    updateNotificationSetting({ personalRemindersEnabled: val })
                  }
                  trackColor={{ false: colors.divider, true: colors.accentPrimary }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.preferenceColumn}>
                <Text style={styles.rowTitle}>Notification preview</Text>
                <Text style={styles.rowSubtitle}>Level of detail displayed on lock screen</Text>
                <View style={styles.buttonSelector}>
                  <TouchableOpacity
                    style={[
                      styles.selectorButton,
                      notificationSettings.notificationPreviewDetail === 'minimal' &&
                        styles.selectorButtonActive,
                    ]}
                    onPress={() =>
                      updateNotificationSetting({ notificationPreviewDetail: 'minimal' })
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.selectorButtonText,
                        notificationSettings.notificationPreviewDetail === 'minimal' &&
                          styles.selectorButtonTextActive,
                      ]}
                    >
                      Minimal
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectorButton,
                      notificationSettings.notificationPreviewDetail === 'detailed' &&
                        styles.selectorButtonActive,
                    ]}
                    onPress={() =>
                      updateNotificationSetting({ notificationPreviewDetail: 'detailed' })
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.selectorButtonText,
                        notificationSettings.notificationPreviewDetail === 'detailed' &&
                          styles.selectorButtonTextActive,
                      ]}
                    >
                      Detailed
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.flexOne}>
                  <Text style={styles.rowTitle}>Quiet hours</Text>
                  <Text style={styles.rowSubtitle}>No notifications will be delivered</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {String(notificationSettings.quietHoursStart).padStart(2, '0')}:00 -{' '}
                    {String(notificationSettings.quietHoursEnd).padStart(2, '0')}:00
                  </Text>
                </View>
              </View>
            </>
          )}
        </Card>

        {/* 4. Data & Privacy Card */}
        <Text style={styles.sectionHeading}>Data & Privacy</Text>
        <Card style={styles.section} padding="md">
          <View style={styles.row}>
            <View style={styles.flexOne}>
              <Text style={styles.rowTitle}>Local Storage Only</Text>
              <Text style={styles.rowSubtitle}>Your data never leaves this device.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.row}
            onPress={handleExportData}
            activeOpacity={0.7}
          >
            <View style={styles.flexOne}>
              <Text style={styles.rowTitle}>Export Data</Text>
              <Text style={styles.rowSubtitle}>Share all recorded logs as JSON</Text>
            </View>
            <Text style={styles.actionText}>Export →</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.row}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <View style={styles.flexOne}>
              <Text style={[styles.rowTitle, { color: colors.accentRose }]}>Delete all data</Text>
              <Text style={styles.rowSubtitle}>Reset all logs, journal entries, and profile</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* 5. About Card */}
        <Text style={styles.sectionHeading}>About</Text>
        <Card style={styles.section} padding="md">
          <View style={styles.row}>
            <View style={styles.flexOne}>
              <Text style={styles.rowTitle}>Less</Text>
              <Text style={styles.rowSubtitle}>Version 1.0.0</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.philosophyBox}>
            <Text style={styles.philosophyLabel}>Philosophy</Text>
            <Text style={styles.philosophyText}>
              Less, not perfection. More awareness, more intention, more control over your attention.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  headerTitle: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  sectionHeading: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    marginTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  flexOne: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  rowTitle: {
    ...typography.body,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionText: {
    ...typography.caption,
    color: colors.accentPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  preferenceColumn: {
    paddingVertical: spacing.sm,
  },
  buttonSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.xs,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  selectorButtonActive: {
    backgroundColor: colors.accentPrimary,
  },
  selectorButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  selectorButtonTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  badge: {
    backgroundColor: colors.accentPrimaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  badgeText: {
    ...typography.caption,
    color: colors.accentPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  nameEditContainer: {
    paddingVertical: spacing.xs,
  },
  textInput: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  smallButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cancelButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.accentPrimary,
  },
  saveButtonText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  philosophyBox: {
    backgroundColor: colors.accentPrimaryLight,
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.xs,
  },
  philosophyLabel: {
    ...typography.label,
    color: colors.accentPrimary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  philosophyText: {
    ...typography.body,
    color: colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
