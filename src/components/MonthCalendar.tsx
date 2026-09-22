import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';
import { CaretLeft, CaretRight } from 'phosphor-react-native';
import { LogEntry } from '../types';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday as checkIsToday,
  format,
  parseISO,
} from 'date-fns';

interface MonthCalendarProps {
  year: number;
  month: number; // 0-indexed
  logs: LogEntry[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MonthCalendar = ({
  year,
  month,
  logs,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: MonthCalendarProps) => {
  const calendarDays = useMemo(() => {
    const monthDate = new Date(year, month, 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calStart, end: calEnd }).map((date) => ({
      date,
      isCurrentMonth: isSameMonth(date, monthDate),
      isToday: checkIsToday(date),
    }));
  }, [year, month]);

  const logCountByDay = useMemo(() => {
    const counts = new Map<string, number>();
    logs.forEach((log) => {
      const key = format(parseISO(log.timestamp), 'yyyy-MM-dd');
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [logs]);

  const monthLabel = format(new Date(year, month, 1), 'MMMM yyyy');
  const isCurrentMonth =
    new Date().getFullYear() === year && new Date().getMonth() === month;
  const isFutureMonth =
    year > new Date().getFullYear() ||
    (year === new Date().getFullYear() && month > new Date().getMonth());

  return (
    <View style={styles.container}>
      {/* Month header with navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.navButton} activeOpacity={0.6}>
          <CaretLeft size={20} color={colors.textPrimary} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity
          onPress={onNextMonth}
          style={[styles.navButton, isFutureMonth && styles.navButtonDisabled]}
          activeOpacity={0.6}
          disabled={isFutureMonth}
        >
          <CaretRight
            size={20}
            color={isFutureMonth ? colors.textTertiary : colors.textPrimary}
            weight="bold"
          />
        </TouchableOpacity>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {calendarDays.map((day, index) => {
          const dayKey = format(day.date, 'yyyy-MM-dd');
          const logCount = logCountByDay.get(dayKey) || 0;
          const isSelected = selectedDate ? isSameDay(day.date, selectedDate) : false;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.dayCellOutside,
              ]}
              onPress={() => day.isCurrentMonth && onSelectDate(day.date)}
              activeOpacity={day.isCurrentMonth ? 0.6 : 1}
              disabled={!day.isCurrentMonth}
            >
              <View
                style={[
                  styles.dayCircle,
                  day.isToday && styles.dayCircleToday,
                  isSelected && styles.dayCircleSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !day.isCurrentMonth && styles.dayTextOutside,
                    day.isToday && styles.dayTextToday,
                    isSelected && styles.dayTextSelected,
                  ]}
                >
                  {format(day.date, 'd')}
                </Text>
              </View>
              {/* Dot indicators */}
              {logCount > 0 && day.isCurrentMonth && (
                <View style={styles.dotRow}>
                  {logCount >= 1 && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
                  {logCount >= 2 && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
                  {logCount >= 3 && <View style={[styles.dot, styles.dotPlus, isSelected && styles.dotSelected]} />}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Month summary */}
      {isCurrentMonth && (
        <Text style={styles.partialLabel}>
          {format(new Date(year, month, 1), 'MMMM')} so far
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.background,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  monthLabel: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    ...typography.label,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  dayCellOutside: {
    opacity: 0.3,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: colors.accentPrimary,
  },
  dayCircleSelected: {
    backgroundColor: colors.accentPrimary,
  },
  dayText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  dayTextOutside: {
    color: colors.textTertiary,
  },
  dayTextToday: {
    color: colors.accentPrimary,
    fontWeight: '700',
  },
  dayTextSelected: {
    color: colors.surface,
    fontWeight: '700',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    height: 6,
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accentPrimary,
  },
  dotPlus: {
    backgroundColor: colors.accentWarm,
  },
  dotSelected: {
    backgroundColor: colors.accentPrimary + '80',
  },
  partialLabel: {
    ...typography.label,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
});
