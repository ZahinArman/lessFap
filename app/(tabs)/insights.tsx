import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogStore } from '../../src/store/useLogStore';
import { colors, spacing, typography, radii } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { getWeekBoundaries } from '../../src/utils/weekHelpers';
import { subWeeks, format, parseISO, isWithinInterval } from 'date-fns';
import { BarChart } from 'react-native-gifted-charts';

export default function InsightsScreen() {
  const { logs } = useLogStore();

  const chartData = useMemo(() => {
    // Generate last 6 weeks of data
    const data = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const targetDate = subWeeks(now, i);
      const { start, end } = getWeekBoundaries(targetDate, 1);
      
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
  }, [logs]);

  const totalAllTime = logs.length;
  
  // Calculate most common trigger
  const topTrigger = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      if (log.trigger) {
        counts[log.trigger] = (counts[log.trigger] || 0) + 1;
      }
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries.length > 0 ? entries[0] : null;
  }, [logs]);

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

        <View style={styles.statsGrid}>
          <Card style={styles.gridCard} padding="md">
            <Text style={styles.gridValue}>{totalAllTime}</Text>
            <Text style={styles.gridLabel}>Total logs</Text>
          </Card>
          
          <Card style={styles.gridCard} padding="md">
            <Text style={styles.gridValue}>
              {topTrigger ? topTrigger[0].replace(/_/g, ' ') : '--'}
            </Text>
            <Text style={styles.gridLabel}>Top trigger</Text>
          </Card>
        </View>

        <Card style={styles.infoCard} padding="lg">
          <Text style={styles.infoTitle}>About your data</Text>
          <Text style={styles.infoText}>
            Your activity patterns are visible here. Remember that progress isn't always a straight line. 
            If numbers go up, use it as a moment of curiosity, not judgment.
          </Text>
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
    color: colors.accentPrimary,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  gridLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: '#F0EEFD',
    borderWidth: 0,
  },
  infoTitle: {
    ...typography.headline,
    color: colors.accentPrimary,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
