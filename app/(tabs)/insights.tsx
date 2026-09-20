import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogStore } from '../../src/store/useLogStore';
import { useProfileStore } from '../../src/store/useProfileStore';
import { colors, spacing, typography, radii } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { getWeekBoundaries } from '../../src/utils/weekHelpers';
import { subWeeks, format, parseISO, isWithinInterval, differenceInDays } from 'date-fns';
import { BarChart } from 'react-native-gifted-charts';

export default function InsightsScreen() {
  const { logs } = useLogStore();
  const { profile } = useProfileStore();

  const weekStartsOn = profile?.weekStartDay === 'monday' ? 1 : 0;

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const targetDate = subWeeks(now, i);
      const { start, end } = getWeekBoundaries(targetDate, weekStartsOn as 0 | 1);
      
      const count = logs.filter(log => {
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
  }, [logs, weekStartsOn]);

  const { thisWeekCount, lastWeekCount, averagePerWeek } = useMemo(() => {
    if (chartData.length < 2) return { thisWeekCount: 0, lastWeekCount: 0, averagePerWeek: 0 };
    const thisWk = chartData[5].value;
    const lastWk = chartData[4].value;
    
    // Average based on all logs and first log date
    let avg = 0;
    if (logs.length > 0) {
      const firstLogDate = parseISO(logs[logs.length - 1].timestamp); // logs are sorted desc
      const daysElapsed = Math.max(1, differenceInDays(new Date(), firstLogDate));
      const weeksElapsed = daysElapsed / 7;
      avg = Math.round((logs.length / weeksElapsed) * 10) / 10;
    }

    return { thisWeekCount: thisWk, lastWeekCount: lastWk, averagePerWeek: avg };
  }, [chartData, logs]);

  const triggerDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalWithTriggers = 0;
    
    logs.forEach(log => {
      if (log.trigger) {
        counts[log.trigger] = (counts[log.trigger] || 0) + 1;
        totalWithTriggers++;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([trigger, count]) => ({
        trigger: trigger.replace(/_/g, ' '),
        count,
        percentage: totalWithTriggers > 0 ? Math.round((count / totalWithTriggers) * 100) : 0,
      }));
  }, [logs]);

  const trendText = useMemo(() => {
    if (thisWeekCount < lastWeekCount) {
      return "You are logging fewer times this week than last week. Great progress.";
    } else if (thisWeekCount === lastWeekCount) {
      return "Your frequency is steady compared to last week.";
    } else {
      return "You have logged more times this week. Be gentle with yourself and keep building awareness.";
    }
  }, [thisWeekCount, lastWeekCount]);

  if (logs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySubtitle}>Keep logging to discover your personal patterns.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Insights</Text>

        <Card style={styles.chartCard} padding="lg">
          <Text style={styles.cardTitle}>Last 6 Weeks</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              height={180}
              barWidth={28}
              spacing={16}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
              noOfSections={4}
              maxValue={Math.max(...chartData.map(d => d.value), 4)}
              labelWidth={40}
              xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10, textAlign: 'center' }}
            />
          </View>
        </Card>

        {/* Weekly Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.gridCard} padding="md">
            <Text style={styles.gridValue}>{averagePerWeek}</Text>
            <Text style={styles.gridLabel}>Weekly average</Text>
          </Card>
          
          <Card style={styles.gridCard} padding="md">
            <Text style={[styles.gridValue, { color: thisWeekCount <= lastWeekCount ? colors.accentGreen : colors.accentRose }]}>
              {thisWeekCount} <Text style={{fontSize: 14, color: colors.textTertiary}}>vs {lastWeekCount}</Text>
            </Text>
            <Text style={styles.gridLabel}>This wk vs Last wk</Text>
          </Card>
        </View>

        <Text style={styles.trendText}>{trendText}</Text>

        {/* Trigger Distribution */}
        {triggerDistribution.length > 0 && (
          <Card style={styles.triggerCard} padding="lg">
            <Text style={styles.cardTitle}>Triggers Breakdown</Text>
            
            {triggerDistribution.map((item, index) => (
              <View key={index} style={styles.triggerRow}>
                <View style={styles.triggerLabelContainer}>
                  <Text style={styles.triggerLabel}>{item.trigger}</Text>
                  <Text style={styles.triggerPercent}>{item.percentage}%</Text>
                </View>
                
                <View style={styles.barBackground}>
                  <View 
                    style={[
                      styles.barFill, 
                      { width: `${item.percentage}%` },
                      index === 0 ? { backgroundColor: colors.accentPrimary } : null
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
  chartCard: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  chartContainer: {
    alignItems: 'center',
    marginLeft: -10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  gridCard: {
    flex: 1,
    alignItems: 'flex-start',
  },
  gridValue: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  gridLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  trendText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.sm,
  },
  triggerCard: {
    marginBottom: spacing.lg,
  },
  triggerRow: {
    marginBottom: spacing.lg,
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
