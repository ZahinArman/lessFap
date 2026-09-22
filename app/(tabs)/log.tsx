import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLogStore } from '../../src/store/useLogStore';
import { colors, spacing, typography, radii } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { MonthCalendar } from '../../src/components/MonthCalendar';
import { DayDetail } from '../../src/components/DayDetail';
import { LogEntry } from '../../src/types';
import { format, parseISO, isSameDay } from 'date-fns';

export default function LogScreen() {
  const router = useRouter();
  const { logs, deleteLog } = useLogStore();

  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [month, setMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthDate = useMemo(() => new Date(year, month, 1), [year, month]);

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() === month;
  }, [year, month]);

  const monthLogs = useMemo(() => {
    return logs.filter((log) => {
      const logDate = parseISO(log.timestamp);
      return logDate.getFullYear() === year && logDate.getMonth() === month;
    });
  }, [logs, year, month]);

  const activeDaysCount = useMemo(() => {
    const daySet = new Set<string>();
    monthLogs.forEach((log) => {
      daySet.add(format(parseISO(log.timestamp), 'yyyy-MM-dd'));
    });
    return daySet.size;
  }, [monthLogs]);

  const selectedDateLogs = useMemo(() => {
    if (!selectedDate) return [];
    return logs.filter((log) => isSameDay(parseISO(log.timestamp), selectedDate));
  }, [logs, selectedDate]);

  const handlePrevMonth = useCallback(() => {
    setSelectedDate(null);
    setMonth((prevMonth) => {
      if (prevMonth === 0) {
        setYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (year > currentYear || (year === currentYear && month >= currentMonth)) {
      return;
    }

    setSelectedDate(null);
    setMonth((prevMonth) => {
      if (prevMonth === 11) {
        setYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  }, [year, month]);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate((prev) => (prev && isSameDay(prev, date) ? null : date));
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        'Delete Log',
        'Are you sure you want to delete this log? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteLog(id),
          },
        ]
      );
    },
    [deleteLog]
  );

  const handleEdit = useCallback(
    (log: LogEntry) => {
      router.push(('/log-entry?editId=' + log.id) as any);
    },
    [router]
  );

  const handleAddLog = useCallback(
    (date: Date) => {
      router.push(('/log-entry?date=' + date.toISOString()) as any);
    },
    [router]
  );

  const monthName = format(monthDate, 'MMMM');
  const eventCount = monthLogs.length;
  const eventLabel = eventCount === 1 ? 'event' : 'events';
  const summaryTitle = isCurrentMonth
    ? `${monthName} so far: ${eventCount} ${eventLabel}`
    : `${monthName}: ${eventCount} ${eventLabel}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>

        <MonthCalendar
          year={year}
          month={month}
          logs={logs}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {selectedDate && (
          <View style={styles.detailContainer}>
            <DayDetail
              date={selectedDate}
              logs={selectedDateLogs}
              onClose={handleCloseDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddLog={handleAddLog}
            />
          </View>
        )}

        <Card style={styles.summaryCard} padding="lg">
          <Text style={styles.summaryTitle}>{summaryTitle}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{monthLogs.length}</Text>
              <Text style={styles.statLabel}>Total logs this month</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{activeDaysCount}</Text>
              <Text style={styles.statLabel}>Days with activity</Text>
            </View>
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
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.display,
    color: colors.textPrimary,
  },
  detailContainer: {
    marginTop: spacing.lg,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  summaryCard: {
    marginTop: spacing.lg,
  },
  summaryTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.display,
    color: colors.accentPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.sm,
  },
});
