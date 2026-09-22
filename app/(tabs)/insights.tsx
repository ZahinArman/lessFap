import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogStore } from '../../src/store/useLogStore';
import { useProfileStore } from '../../src/store/useProfileStore';
import { colors, spacing, typography, radii } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { InsightCard } from '../../src/components/InsightCard';
import { TimeOfDayChart } from '../../src/components/TimeOfDayChart';
import { WeekDayChart } from '../../src/components/WeekDayChart';
import { getWeekBoundaries, computeWeeklySummary } from '../../src/utils/weekHelpers';
import {
  getTimeCategoryDistribution,
  getDayOfWeekDistribution,
  getTriggerDistribution,
  generatePatternSummaries,
  getMonthlyComparison,
} from '../../src/utils/patternAnalysis';
import {
  subWeeks,
  format,
  parseISO,
  isWithinInterval,
  differenceInDays,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { BarChart } from 'react-native-gifted-charts';
import { TimeCategory, PatternSummary } from '../../src/types';

export default function InsightsScreen() {
  const { logs } = useLogStore();
  const { profile } = useProfileStore();

  const [dismissedPatternIds, setDismissedPatternIds] = useState<string[]>([]);

  const weekStartsOn = profile?.weekStartDay === 'monday' ? 1 : 0;
  const now = useMemo(() => new Date(), []);

  // Weekly summary and progress calculations
  const weeklySummary = useMemo(() => {
    return computeWeeklySummary(
      logs,
      now,
      weekStartsOn as 0 | 1,
      profile?.goalType || 'awareness',
      profile?.weeklyTarget
    );
  }, [logs, now, weekStartsOn, profile?.goalType, profile?.weeklyTarget]);

  // Weekly comparison trend badge and message
  const weeklyTrend = useMemo(() => {
    if (weeklySummary.totalLogs < weeklySummary.previousWeekTotal) {
      return {
        label: 'Reducing',
        color: colors.accentGreen,
        bg: colors.accentGreen + '1A',
        message: 'You have logged fewer times this week than last week. Great mindful progress.',
      };
    } else if (weeklySummary.totalLogs === weeklySummary.previousWeekTotal) {
      return {
        label: 'Steady',
        color: colors.textSecondary,
        bg: colors.divider,
        message: 'Your frequency is steady compared to last week. Building consistent self-awareness.',
      };
    } else {
      return {
        label: 'More than last wk',
        color: colors.accentWarm,
        bg: colors.accentWarm + '1A',
        message: 'You have logged more times this week. Be gentle with yourself and stay mindful.',
      };
    }
  }, [weeklySummary.totalLogs, weeklySummary.previousWeekTotal]);

  // Personal goal information
  const goalInfo = useMemo(() => {
    if (!profile) return null;

    if (profile.goalType === 'target' && profile.weeklyTarget !== undefined) {
      const isMet = weeklySummary.totalLogs <= profile.weeklyTarget;
      return {
        targetLabel: `Target: ≤ ${profile.weeklyTarget}/wk`,
        statusText: isMet ? 'On track' : `${weeklySummary.totalLogs - profile.weeklyTarget} over`,
        statusColor: isMet ? colors.accentGreen : colors.accentWarm,
      };
    } else if (profile.goalType === 'reduce') {
      const isMet = weeklySummary.totalLogs < weeklySummary.previousWeekTotal;
      return {
        targetLabel: 'Goal: Reduce vs last wk',
        statusText: isMet ? 'On track' : 'Above last wk',
        statusColor: isMet ? colors.accentGreen : colors.accentWarm,
      };
    } else if (profile.goalType === 'abstinence') {
      const isMet = weeklySummary.totalLogs === 0;
      return {
        targetLabel: 'Goal: Abstinence',
        statusText: isMet ? 'Clean week' : 'Active this week',
        statusColor: isMet ? colors.accentGreen : colors.textSecondary,
      };
    } else if (profile.goalType === 'awareness') {
      return {
        targetLabel: 'Goal: Mindful Awareness',
        statusText: 'Active',
        statusColor: colors.accentPrimary,
      };
    }

    return null;
  }, [profile, weeklySummary.totalLogs, weeklySummary.previousWeekTotal]);

  // 6-Week bar chart data
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = subWeeks(now, i);
      const { start, end } = getWeekBoundaries(targetDate, weekStartsOn as 0 | 1);

      const count = logs.filter((log) => {
        const d = parseISO(log.timestamp);
        return isWithinInterval(d, { start, end });
      }).length;

      data.push({
        value: count,
        label: i === 0 ? 'This Wk' : format(start, 'MMM d'),
        frontColor: i === 0 ? colors.accentPrimary : colors.divider,
      });
    }
    return data;
  }, [logs, now, weekStartsOn]);

  const averagePerWeek = useMemo(() => {
    if (logs.length === 0) return 0;
    const firstLogDate = parseISO(logs[logs.length - 1].timestamp);
    const daysElapsed = Math.max(1, differenceInDays(now, firstLogDate));
    const weeksElapsed = daysElapsed / 7;
    return Math.round((logs.length / weeksElapsed) * 10) / 10;
  }, [logs, now]);

  // Monthly comparison
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const monthlyComparison = useMemo(() => {
    return getMonthlyComparison(logs, currentYear, currentMonthIndex);
  }, [logs, currentYear, currentMonthIndex]);

  const currentMonthName = useMemo(() => format(now, 'MMMM'), [now]);
  const previousMonthName = useMemo(() => {
    const prevMonthDate = subWeeks(startOfMonth(now), 1);
    return format(prevMonthDate, 'MMMM');
  }, [now]);

  const daysElapsedInMonth = useMemo(() => {
    return differenceInDays(now, startOfMonth(now)) + 1;
  }, [now]);

  const daysLeftInMonth = useMemo(() => {
    return Math.max(0, differenceInDays(endOfMonth(now), now));
  }, [now]);

  const monthlyEncouragement = useMemo(() => {
    if (monthlyComparison.currentMonth < monthlyComparison.previousMonth) {
      return `You have logged fewer times this month than in ${previousMonthName}. Consistent awareness is having an impact.`;
    } else if (monthlyComparison.currentMonth === monthlyComparison.previousMonth) {
      return `Activity is level with ${previousMonthName}. Maintaining balanced observation through your routines.`;
    } else {
      return `You have logged more times than in ${previousMonthName}. Every entry is an opportunity for self-understanding.`;
    }
  }, [monthlyComparison, previousMonthName]);

  // Pattern summaries
  const patterns = useMemo(() => generatePatternSummaries(logs), [logs]);
  const visiblePatterns = useMemo(() => {
    return patterns.filter((pattern) => !dismissedPatternIds.includes(pattern.id));
  }, [patterns, dismissedPatternIds]);

  // Time of Day distribution
  const timeCategoryDistribution = useMemo(() => {
    return getTimeCategoryDistribution(logs);
  }, [logs]);

  // Day of Week distribution
  const dayOfWeekDistribution = useMemo(() => {
    return getDayOfWeekDistribution(logs);
  }, [logs]);

  // Trigger distribution
  const triggerDistribution = useMemo(() => {
    return getTriggerDistribution(logs);
  }, [logs]);

  // Empty state when no logs exist
  if (logs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySubtitle}>
            Keep logging to discover your personal patterns.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Insights</Text>

        {/* 1. Weekly Overview Card */}
        <Card style={styles.sectionCard} padding="lg">
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Weekly Overview</Text>
            <View style={[styles.trendBadge, { backgroundColor: weeklyTrend.bg }]}>
              <Text style={[styles.trendBadgeText, { color: weeklyTrend.color }]}>
                {weeklyTrend.label}
              </Text>
            </View>
          </View>

          <View style={styles.statNumbersRow}>
            <View style={styles.statNumberItem}>
              <Text style={styles.largeStatNumber}>{weeklySummary.totalLogs}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statNumberItem}>
              <Text style={styles.largeStatNumberSecondary}>
                {weeklySummary.previousWeekTotal}
              </Text>
              <Text style={styles.statLabel}>Last Week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statNumberItem}>
              <Text style={styles.largeStatNumber}>{averagePerWeek}</Text>
              <Text style={styles.statLabel}>Weekly Avg</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Day {weeklySummary.daysElapsed} of 7 • {weeklySummary.daysRemaining}{' '}
              {weeklySummary.daysRemaining === 1 ? 'day' : 'days'} remaining
            </Text>
          </View>

          {goalInfo && (
            <View style={styles.goalRow}>
              <Text style={styles.goalLabel}>{goalInfo.targetLabel}</Text>
              <View
                style={[
                  styles.goalStatusBadge,
                  { backgroundColor: goalInfo.statusColor + '1A' },
                ]}
              >
                <Text style={[styles.goalStatusText, { color: goalInfo.statusColor }]}>
                  {goalInfo.statusText}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.encouragementContainer}>
            <Text style={styles.encouragementText}>{weeklyTrend.message}</Text>
          </View>
        </Card>

        {/* 2. Past 6 Weeks Trend Chart */}
        <Card style={styles.sectionCard} padding="lg">
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Past 6 Weeks</Text>
            <Text style={styles.cardBadge}>{averagePerWeek} avg / wk</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Weekly logging frequency over the last 6 weeks.
          </Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              height={170}
              barWidth={26}
              spacing={16}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
              noOfSections={4}
              maxValue={Math.max(...chartData.map((d) => d.value), 4)}
              labelWidth={42}
              xAxisLabelTextStyle={{
                color: colors.textSecondary,
                fontSize: 10,
                textAlign: 'center',
              }}
            />
          </View>
        </Card>

        {/* 3. Monthly Overview Card */}
        <Card style={styles.sectionCard} padding="lg">
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Monthly Overview</Text>
            <Text style={styles.cardBadge}>{currentMonthName}</Text>
          </View>

          <Text style={styles.monthlyHeadline}>
            {monthlyComparison.isPartial
              ? `${currentMonthName} so far: ${monthlyComparison.currentMonth} ${
                  monthlyComparison.currentMonth === 1 ? 'event' : 'events'
                }`
              : `${currentMonthName}: ${monthlyComparison.currentMonth} ${
                  monthlyComparison.currentMonth === 1 ? 'event' : 'events'
                }`}
          </Text>

          <View style={styles.statNumbersRow}>
            <View style={styles.statNumberItem}>
              <Text style={styles.largeStatNumber}>{monthlyComparison.currentMonth}</Text>
              <Text style={styles.statLabel}>
                {monthlyComparison.isPartial ? 'This Month (so far)' : 'This Month'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statNumberItem}>
              <Text style={styles.largeStatNumberSecondary}>
                {monthlyComparison.previousMonth}
              </Text>
              <Text style={styles.statLabel}>{previousMonthName}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statNumberItem}>
              <Text style={styles.largeStatNumber}>
                {monthlyComparison.currentMonthDays}
              </Text>
              <Text style={styles.statLabel}>Active Days</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {monthlyComparison.currentMonthDays} active{' '}
              {monthlyComparison.currentMonthDays === 1 ? 'day' : 'days'} out of{' '}
              {daysElapsedInMonth} days elapsed
              {daysLeftInMonth > 0
                ? ` • ${daysLeftInMonth} ${daysLeftInMonth === 1 ? 'day' : 'days'} left`
                : ''}
            </Text>
          </View>

          <View style={styles.encouragementContainer}>
            <Text style={styles.encouragementText}>{monthlyEncouragement}</Text>
          </View>
        </Card>

        {/* 4. Pattern Summaries Section (only if patterns exist) */}
        {visiblePatterns.length > 0 && (
          <View style={styles.patternsSection}>
            <Text style={styles.sectionHeaderTitle}>Patterns & Insights</Text>
            {visiblePatterns.map((pattern) => (
              <InsightCard
                key={pattern.id}
                summary={pattern}
                onDismiss={(id) => setDismissedPatternIds((prev) => [...prev, id])}
              />
            ))}
          </View>
        )}

        {/* 5. Time of Day Analysis Card (only if 5+ logs) */}
        {logs.length >= 5 && (
          <Card style={styles.sectionCard} padding="lg">
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Time of Day Analysis</Text>
              <Text style={styles.cardBadge}>24-hr breakdown</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Identifies the periods of the day when urge occurrences are most frequent.
            </Text>
            <TimeOfDayChart distribution={timeCategoryDistribution} />
          </Card>
        )}

        {/* 6. Day of Week Analysis Card (only if 5+ logs) */}
        {logs.length >= 5 && (
          <Card style={styles.sectionCard} padding="lg">
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Day of Week Analysis</Text>
              <Text style={styles.cardBadge}>Mon – Sun</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Highlights which days of the week have higher activity or heightened frequency.
            </Text>
            <WeekDayChart distribution={dayOfWeekDistribution} />
          </Card>
        )}

        {/* 7. Trigger Analysis Card (only if logs with triggers) */}
        {triggerDistribution.length > 0 && (
          <Card style={styles.sectionCard} padding="lg">
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Triggers Breakdown</Text>
              <Text style={styles.cardBadge}>Self-reflection</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Situations and emotional triggers most often connected to your urges.
            </Text>

            {triggerDistribution.map((item, index) => (
              <View key={item.trigger} style={styles.triggerRow}>
                <View style={styles.triggerLabelContainer}>
                  <Text style={styles.triggerLabel}>{item.trigger}</Text>
                  <Text style={styles.triggerPercent}>
                    {item.count} ({item.percentage}%)
                  </Text>
                </View>

                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.max(item.percentage, item.count > 0 ? 6 : 0)}%` },
                      index === 0 ? { backgroundColor: colors.accentPrimary } : null,
                    ]}
                  />
                </View>
              </View>
            ))}
          </Card>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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
  sectionCard: {
    marginBottom: spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  cardBadge: {
    ...typography.label,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  trendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  trendBadgeText: {
    ...typography.label,
    fontWeight: '600',
  },
  statNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: spacing.md,
  },
  statNumberItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
  },
  largeStatNumber: {
    ...typography.title,
    color: colors.textPrimary,
    fontSize: 24,
  },
  largeStatNumberSecondary: {
    ...typography.title,
    color: colors.textSecondary,
    fontSize: 24,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  metaText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  goalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  goalStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  goalStatusText: {
    ...typography.label,
  },
  encouragementContainer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.md,
  },
  encouragementText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
  monthlyHeadline: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  patternsSection: {
    marginBottom: spacing.lg,
  },
  sectionHeaderTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
    marginLeft: -10,
    marginTop: spacing.xs,
  },
  triggerRow: {
    marginBottom: spacing.md,
  },
  triggerLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  triggerLabel: {
    ...typography.label,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  triggerPercent: {
    ...typography.label,
    color: colors.textTertiary,
  },
  barBackground: {
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.textTertiary,
    borderRadius: radii.full,
  },
});
