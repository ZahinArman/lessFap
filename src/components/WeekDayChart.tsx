import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';

interface WeekDayChartProps {
  distribution: Record<string, number>;
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

export const WeekDayChart = ({ distribution }: WeekDayChartProps) => {
  const maxValue = Math.max(...DAY_ORDER.map((d) => distribution[d] || 0), 1);

  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        {DAY_ORDER.map((day) => {
          const count = distribution[day] || 0;
          const heightPercent = maxValue > 0 ? (count / maxValue) * 100 : 0;
          const isWeekend = day === 'Saturday' || day === 'Sunday';

          return (
            <View key={day} style={styles.barColumn}>
              <Text style={styles.countLabel}>{count > 0 ? count : ''}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${Math.max(heightPercent, count > 0 ? 8 : 0)}%`,
                      backgroundColor: isWeekend ? colors.accentWarm : colors.accentPrimary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, isWeekend && styles.dayLabelWeekend]}>
                {DAY_SHORT[day]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    gap: spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  countLabel: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
    minHeight: 14,
  },
  barTrack: {
    flex: 1,
    width: '100%',
    maxWidth: 32,
    backgroundColor: colors.divider,
    borderRadius: radii.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: radii.sm,
  },
  dayLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  dayLabelWeekend: {
    color: colors.accentWarm,
  },
});
