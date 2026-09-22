import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';
import { TimeCategory } from '../types';

interface TimeOfDayChartProps {
  distribution: Record<TimeCategory, number>;
}

const CATEGORIES: { key: TimeCategory; label: string; timeRange: string }[] = [
  { key: 'morning', label: 'Morning', timeRange: '5 AM – 12 PM' },
  { key: 'afternoon', label: 'Afternoon', timeRange: '12 PM – 5 PM' },
  { key: 'evening', label: 'Evening', timeRange: '5 PM – 10 PM' },
  { key: 'night', label: 'Night', timeRange: '10 PM – 5 AM' },
];

const BAR_COLORS: Record<TimeCategory, string> = {
  morning: colors.accentWarm,
  afternoon: colors.accentBlue,
  evening: colors.accentPrimary,
  night: '#6B7280',
};

export const TimeOfDayChart = ({ distribution }: TimeOfDayChartProps) => {
  const maxValue = Math.max(...Object.values(distribution), 1);

  return (
    <View style={styles.container}>
      {CATEGORIES.map((cat) => {
        const count = distribution[cat.key] || 0;
        const widthPercent = maxValue > 0 ? (count / maxValue) * 100 : 0;

        return (
          <View key={cat.key} style={styles.row}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>{cat.label}</Text>
              <Text style={styles.timeRange}>{cat.timeRange}</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(widthPercent, count > 0 ? 8 : 0)}%`,
                      backgroundColor: BAR_COLORS[cat.key],
                    },
                  ]}
                />
              </View>
              <Text style={styles.count}>{count}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  row: {
    gap: spacing.xs,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  timeRange: {
    ...typography.label,
    color: colors.textTertiary,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barBackground: {
    flex: 1,
    height: 10,
    backgroundColor: colors.divider,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  count: {
    ...typography.caption,
    color: colors.textSecondary,
    minWidth: 20,
    textAlign: 'right',
  },
});
