import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  subWeeks,
  isWithinInterval,
  differenceInDays,
  parseISO,
} from 'date-fns';
import { LogEntry, TriggerType, WeeklySummary } from '../types';

export const getWeekBoundaries = (date: Date = new Date(), weekStartsOn: 0 | 1 = 1) => {
  const start = startOfWeek(date, { weekStartsOn });
  const end = endOfWeek(date, { weekStartsOn });
  return { start, end };
};

export const getDaysElapsedAndRemaining = (date: Date = new Date(), weekStartsOn: 0 | 1 = 1) => {
  const { start, end } = getWeekBoundaries(date, weekStartsOn);
  const now = startOfDay(date);
  
  const elapsed = differenceInDays(now, start) + 1; // including today
  const remaining = differenceInDays(end, now);
  
  return { elapsed, remaining };
};

export const computeWeeklySummary = (
  logs: LogEntry[],
  currentDate: Date = new Date(),
  weekStartsOn: 0 | 1 = 1,
  goalType: 'reduce' | 'target' | 'awareness' | 'abstinence',
  weeklyTarget?: number
): WeeklySummary => {
  const currentWeek = getWeekBoundaries(currentDate, weekStartsOn);
  const previousWeekDate = subWeeks(currentDate, 1);
  const previousWeek = getWeekBoundaries(previousWeekDate, weekStartsOn);

  let currentTotal = 0;
  let previousTotal = 0;
  let pornographyCount = 0;
  const triggers: Record<TriggerType, number> = {
    boredom: 0,
    stress: 0,
    loneliness: 0,
    habit: 0,
    sexual_content: 0,
    sleep_difficulty: 0,
    emotional_discomfort: 0,
    other: 0,
    prefer_not_to_say: 0,
  };

  logs.forEach((log) => {
    const logDate = parseISO(log.timestamp);

    // Current week logic
    if (isWithinInterval(logDate, currentWeek)) {
      currentTotal++;
      if (log.includedPornography) pornographyCount++;
      if (log.trigger) {
        triggers[log.trigger] = (triggers[log.trigger] || 0) + 1;
      }
    }

    // Previous week logic
    if (isWithinInterval(logDate, previousWeek)) {
      previousTotal++;
    }
  });

  const { elapsed, remaining } = getDaysElapsedAndRemaining(currentDate, weekStartsOn);

  let goalMet: boolean | null = null;
  if (goalType === 'target' && weeklyTarget !== undefined) {
    goalMet = currentTotal <= weeklyTarget;
  } else if (goalType === 'reduce') {
    goalMet = currentTotal < previousTotal;
  } else if (goalType === 'abstinence') {
    goalMet = currentTotal === 0;
  }

  return {
    weekStart: currentWeek.start.toISOString(),
    weekEnd: currentWeek.end.toISOString(),
    totalLogs: currentTotal,
    triggers,
    pornographyCount,
    daysElapsed: elapsed,
    daysRemaining: remaining,
    previousWeekTotal: previousTotal,
    goalMet,
  };
};
