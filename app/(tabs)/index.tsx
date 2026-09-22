import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../../src/store/useProfileStore';
import { useLogStore } from '../../src/store/useLogStore';
import { colors, spacing, typography, radii } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { InsightCard } from '../../src/components/InsightCard';
import { getGreeting } from '../../src/utils/greetings';
import { computeWeeklySummary, getWeekBoundaries } from '../../src/utils/weekHelpers';
import { getEncouragementMessage } from '../../src/utils/encouragement';
import { generatePatternSummaries } from '../../src/utils/patternAnalysis';
import { refreshNotifications } from '../../src/utils/notifications';
import { format, addDays, isSameDay, isToday, isBefore, parseISO, startOfDay } from 'date-fns';
import { UserCircle, Wind, Plus, ArrowRight } from 'phosphor-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { logs, loadLogs } = useLogStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadLogs();
    const interval = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (profile?.notificationSettings && !profile.notificationSettings.allNotificationsDisabled) {
      const patterns = generatePatternSummaries(logs);
      refreshNotifications(profile.notificationSettings, patterns).catch(() => {});
    }
  }, [profile?.notificationSettings, logs]);

  if (!profile) return null;

  const weekStartsOn = profile.weekStartDay === 'monday' ? 1 : 0;

  const summary = computeWeeklySummary(
    logs,
    currentDate,
    weekStartsOn as 0 | 1,
    profile.goalType,
    profile.weeklyTarget
  );

  const greeting = getGreeting(profile.name);
  const formattedDate = format(currentDate, 'EEEE, MMMM d');
  const encouragement = getEncouragementMessage(summary);
  const isPositiveTrend = summary.totalLogs <= summary.previousWeekTotal;

  // Build 7-day grid data
  const weekDays = useMemo(() => {
    const { start } = getWeekBoundaries(currentDate, weekStartsOn as 0 | 1);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(start, i);
      const dayStart = startOfDay(day);
      const logsOnDay = logs.filter(log => isSameDay(parseISO(log.timestamp), dayStart));
      days.push({
        date: day,
        label: format(day, 'EEE'),
        dayNum: format(day, 'd'),
        isToday: isToday(day),
        isPast: isBefore(day, startOfDay(currentDate)),
        logCount: logsOnDay.length,
      });
    }
    return days;
  }, [logs, currentDate, weekStartsOn]);

  // Generate top pattern insight
  const topPattern = useMemo(() => {
    const patterns = generatePatternSummaries(logs);
    return patterns.length > 0 ? patterns[0] : null;
  }, [logs]);

  // Goal display text
  const goalText = useMemo(() => {
    switch (profile.goalType) {
      case 'target':
        return profile.weeklyTarget
          ? `Fewer than ${profile.weeklyTarget} per week`
          : 'Personal target';
      case 'reduce':
        return `Fewer than last week (${summary.previousWeekTotal})`;
      case 'abstinence':
        return 'Intentional abstinence';
      case 'awareness':
      default:
        return 'Awareness & reflection';
    }
  }, [profile.goalType, profile.weeklyTarget, summary.previousWeekTotal]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <TouchableOpacity onPress={() => router.navigate('/(tabs)/profile')} activeOpacity={0.7}>
            <UserCircle size={40} color={colors.textSecondary} weight="duotone" />
          </TouchableOpacity>
        </View>

        {/* Weekly Progress Card */}
        <Card style={styles.weekCard} padding="lg">
          <View style={styles.weekCardHeader}>
            <Text style={styles.weekCardTitle}>This week</Text>
            <View style={[styles.trendBadge, isPositiveTrend ? styles.trendPositive : styles.trendNeutral]}>
              <Text style={[styles.trendText, isPositiveTrend ? styles.trendTextPositive : styles.trendTextNeutral]}>
                {summary.totalLogs < summary.previousWeekTotal
                  ? '↓ Reducing'
                  : summary.totalLogs === summary.previousWeekTotal
                  ? '— Steady'
                  : '↑ More'}
              </Text>
            </View>
          </View>

          {/* 7-day grid */}
          <View style={styles.weekGrid}>
            {weekDays.map((day, idx) => {
              const hasLogs = day.logCount > 0;
              return (
                <View key={idx} style={styles.dayColumn}>
                  <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
                    {day.label}
                  </Text>
                  <View
                    style={[
                      styles.dayCircle,
                      day.isToday && styles.dayCircleToday,
                      hasLogs && styles.dayCircleLogged,
                    ]}
                  >
                    {hasLogs ? (
                      <Text style={styles.dayCircleLoggedText}>{day.logCount}</Text>
                    ) : (
                      <Text style={[styles.dayNum, day.isToday && styles.dayNumToday]}>
                        {day.dayNum}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{summary.totalLogs}</Text>
              <Text style={styles.statLabel}>this week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{summary.previousWeekTotal}</Text>
              <Text style={styles.statLabel}>last week</Text>
            </View>
            {(profile.goalType === 'target' || profile.goalType === 'reduce') && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {profile.goalType === 'target' ? (profile.weeklyTarget ?? '—') : `< ${summary.previousWeekTotal}`}
                  </Text>
                  <Text style={styles.statLabel}>goal</Text>
                </View>
              </>
            )}
          </View>

          {/* Days info */}
          <View style={styles.daysRow}>
            <Text style={styles.daysText}>
              Day {summary.daysElapsed} of 7 · {summary.daysRemaining} day{summary.daysRemaining !== 1 ? 's' : ''} remaining
            </Text>
          </View>

          {/* Encouragement */}
          <View style={styles.encouragementBox}>
            <Text style={styles.encouragementText}>{encouragement}</Text>
          </View>
        </Card>

        {/* Log Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/log-entry')}
          style={styles.logButton}
        >
          <View style={styles.logButtonIcon}>
            <Plus size={22} color={colors.surface} weight="bold" />
          </View>
          <View style={styles.logButtonTextContainer}>
            <Text style={styles.logButtonTitle}>+ Log</Text>
            <Text style={styles.logButtonSubtitle}>Log honestly, without judgment.</Text>
          </View>
        </TouchableOpacity>

        {/* Pause / Mindfulness Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/mindfulness')}
        >
          <Card style={styles.pauseCard} padding="lg">
            <View style={styles.pauseIconContainer}>
              <Wind size={28} color={colors.surface} weight="fill" />
            </View>
            <View style={styles.pauseTextContainer}>
              <Text style={styles.pauseTitle}>Pause for a moment</Text>
              <Text style={styles.pauseSubtitle}>Take a breath before you act.</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Pattern Insight Card */}
        {topPattern ? (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pattern insight</Text>
              <TouchableOpacity onPress={() => router.navigate('/(tabs)/insights')}>
                <View style={styles.viewAllButton}>
                  <Text style={styles.sectionLink}>View all</Text>
                  <ArrowRight size={12} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>
            <InsightCard
              summary={topPattern}
              onViewDetails={() => router.navigate('/(tabs)/insights')}
            />
          </View>
        ) : logs.length < 5 ? (
          <Card style={styles.emptyInsightCard} padding="lg">
            <Text style={styles.emptyInsightTitle}>Discover your patterns</Text>
            <Text style={styles.emptyInsightText}>
              Keep logging to unlock insights about your habits and timing. At least 5 logs are needed.
            </Text>
          </Card>
        ) : null}

        {/* Recent Reflections */}
        {logs.filter(l => l.reflection).length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent reflections</Text>
              <TouchableOpacity onPress={() => router.navigate('/(tabs)/log')}>
                <Text style={styles.sectionLink}>View all →</Text>
              </TouchableOpacity>
            </View>

            {logs.filter(l => l.reflection).slice(0, 2).map(log => (
              <Card key={log.id} style={styles.reflectionCard} padding="lg">
                <Text style={styles.reflectionDate}>{format(new Date(log.timestamp), 'MMM d, h:mm a')}</Text>
                {log.trigger && (
                  <View style={styles.triggerTag}>
                    <Text style={styles.triggerTagText}>{log.trigger.replace(/_/g, ' ')}</Text>
                  </View>
                )}
                <Text style={styles.reflectionText} numberOfLines={3}>"{log.reflection}"</Text>
              </Card>
            ))}
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  greeting: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Weekly Progress Card
  weekCard: {
    marginBottom: spacing.lg,
  },
  weekCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  weekCardTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  dayLabelToday: {
    color: colors.accentPrimary,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: colors.accentPrimary,
    backgroundColor: colors.surface,
  },
  dayCircleLogged: {
    backgroundColor: colors.accentRose,
  },
  dayCircleLoggedText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
  },
  dayNum: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  dayNumToday: {
    color: colors.accentPrimary,
    fontWeight: '700',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.title,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.label,
    color: colors.textTertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.divider,
  },

  // Trend Badge
  trendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  trendPositive: {
    backgroundColor: '#E6F4EA',
  },
  trendNeutral: {
    backgroundColor: '#F0EEFD',
  },
  trendText: {
    ...typography.label,
  },
  trendTextPositive: {
    color: colors.accentGreen,
  },
  trendTextNeutral: {
    color: colors.accentPrimary,
  },

  // Days info
  daysRow: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  daysText: {
    ...typography.label,
    color: colors.textTertiary,
  },

  // Encouragement
  encouragementBox: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  encouragementText: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Log Button
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.accentPrimary,
    borderStyle: 'dashed',
  },
  logButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  logButtonTextContainer: {
    flex: 1,
  },
  logButtonTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  logButtonSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Pause Card
  pauseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentBlue,
    marginBottom: spacing.xl,
  },
  pauseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  pauseTextContainer: {
    flex: 1,
  },
  pauseTitle: {
    ...typography.headline,
    color: colors.surface,
    marginBottom: 2,
  },
  pauseSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },

  // Pattern insight
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  sectionLink: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  // Empty insight
  emptyInsightCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    borderStyle: 'dashed',
  },
  emptyInsightTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyInsightText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Reflections
  reflectionCard: {
    marginBottom: spacing.md,
  },
  reflectionDate: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  triggerTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  triggerTagText: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  reflectionText: {
    ...typography.body,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
});
