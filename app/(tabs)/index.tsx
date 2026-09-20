import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../../src/store/useProfileStore';
import { useLogStore } from '../../src/store/useLogStore';
import { colors, spacing, typography, radii } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { getGreeting } from '../../src/utils/greetings';
import { computeWeeklySummary, getWeekBoundaries } from '../../src/utils/weekHelpers';
import { getEncouragementMessage } from '../../src/utils/encouragement';
import { format, addDays, isSameDay, isToday, isBefore, parseISO, startOfDay } from 'date-fns';
import { UserCircle, Wind, Plus } from 'phosphor-react-native';

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
  const formattedDate = format(currentDate, 'dd MMMM yyyy');
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
        label: format(day, 'EEE'),     // Mon, Tue...
        dayNum: format(day, 'd'),       // 1, 2, 3...
        isToday: isToday(day),
        isPast: isBefore(day, startOfDay(currentDate)),
        logCount: logsOnDay.length,
      });
    }
    return days;
  }, [logs, currentDate, weekStartsOn]);

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

        {/* 7-Day Week Grid */}
        <Card style={styles.weekCard} padding="lg">
          <Text style={styles.weekCardTitle}>This week</Text>
          <View style={styles.weekGrid}>
            {weekDays.map((day, idx) => {
              const hasLogs = day.logCount > 0;
              const isClean = !hasLogs && (day.isPast || day.isToday);
              return (
                <View key={idx} style={styles.dayColumn}>
                  <Text style={[
                    styles.dayLabel, 
                    day.isToday && styles.dayLabelToday
                  ]}>
                    {day.label}
                  </Text>
                  <View style={[
                    styles.dayCircle,
                    day.isToday && styles.dayCircleToday,
                    hasLogs && styles.dayCircleLogged,
                    isClean && styles.dayCircleClean,
                  ]}>
                    {hasLogs ? (
                      <Text style={styles.dayCircleLoggedText}>{day.logCount}</Text>
                    ) : isClean ? (
                      <Text style={styles.dayCircleCleanText}>✓</Text>
                    ) : (
                      <Text style={[
                        styles.dayNum,
                        day.isToday && styles.dayNumToday
                      ]}>
                        {day.dayNum}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Stats row */}
          <View style={styles.miniStatsRow}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatNum}>{summary.totalLogs}</Text>
              <Text style={styles.miniStatLabel}>this week</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatNum}>{summary.previousWeekTotal}</Text>
              <Text style={styles.miniStatLabel}>last week</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <View style={[styles.trendBadge, isPositiveTrend ? styles.trendPositive : styles.trendNeutral]}>
                <Text style={[styles.trendText, isPositiveTrend ? styles.trendTextPositive : styles.trendTextNeutral]}>
                  {summary.totalLogs < summary.previousWeekTotal ? '↓ Reducing' : summary.totalLogs === summary.previousWeekTotal ? '— Steady' : '↑ More'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.encouragementBox}>
            <Text style={styles.encouragementText}>{encouragement}</Text>
          </View>
        </Card>

        {/* Log Button — Primary action */}
        <TouchableOpacity 
          activeOpacity={0.85}
          onPress={() => router.push('/log-entry')}
          style={styles.logButton}
        >
          <View style={styles.logButtonIcon}>
            <Plus size={22} color={colors.surface} weight="bold" />
          </View>
          <View style={styles.logButtonTextContainer}>
            <Text style={styles.logButtonTitle}>I relapsed</Text>
            <Text style={styles.logButtonSubtitle}>Log it honestly. No judgment.</Text>
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

  // === 7-Day Week Grid ===
  weekCard: {
    marginBottom: spacing.lg,
  },
  weekCardTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
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
  dayCircleClean: {
    backgroundColor: '#E6F4EA',
  },
  dayCircleLoggedText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
  },
  dayCircleCleanText: {
    fontSize: 14,
    color: colors.accentGreen,
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

  // === Mini Stats Row ===
  miniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatNum: {
    ...typography.title,
    color: colors.textPrimary,
  },
  miniStatLabel: {
    ...typography.label,
    color: colors.textTertiary,
    marginTop: 2,
  },
  miniStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.divider,
  },
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

  // === Log Button ===
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.accentRose,
    borderStyle: 'dashed',
  },
  logButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentRose,
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

  // === Pause Card ===
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

  // === Reflections ===
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
