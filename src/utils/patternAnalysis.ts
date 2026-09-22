import {
  parseISO,
  getHours,
  getDay,
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  subWeeks,
} from 'date-fns';
import { LogEntry, TimeCategory, PatternSummary } from '../types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Categorizes a date into a time-of-day category:
 * - Morning: 5AM-12PM (05:00 - 11:59)
 * - Afternoon: 12PM-5PM (12:00 - 16:59)
 * - Evening: 5PM-10PM (17:00 - 21:59)
 * - Night: 10PM-5AM (22:00 - 04:59)
 */
export function getTimeCategory(date: Date): TimeCategory {
  const hour = getHours(date);
  if (hour >= 5 && hour < 12) {
    return 'morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }
  if (hour >= 17 && hour < 22) {
    return 'evening';
  }
  return 'night';
}

/**
 * Counts logs in each time category.
 */
export function getTimeCategoryDistribution(logs: LogEntry[]): Record<TimeCategory, number> {
  const distribution: Record<TimeCategory, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  for (const log of logs) {
    if (!log.timestamp) continue;
    try {
      const date = parseISO(log.timestamp);
      if (!isNaN(date.getTime())) {
        const category = getTimeCategory(date);
        distribution[category]++;
      }
    } catch {
      // ignore invalid timestamps
    }
  }

  return distribution;
}

/**
 * Counts logs by day name (Monday through Sunday).
 */
export function getDayOfWeekDistribution(logs: LogEntry[]): Record<string, number> {
  const distribution: Record<string, number> = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };

  for (const log of logs) {
    if (!log.timestamp) continue;
    try {
      const date = parseISO(log.timestamp);
      if (!isNaN(date.getTime())) {
        const dayName = DAY_NAMES[getDay(date)];
        if (dayName in distribution) {
          distribution[dayName]++;
        }
      }
    } catch {
      // ignore invalid timestamps
    }
  }

  return distribution;
}

/**
 * Returns trigger frequencies and percentages, only for logs with triggers,
 * sorted descending by count.
 */
export function getTriggerDistribution(
  logs: LogEntry[]
): { trigger: string; count: number; percentage: number }[] {
  const counts: Record<string, number> = {};
  let totalWithTriggers = 0;

  for (const log of logs) {
    if (log.trigger) {
      counts[log.trigger] = (counts[log.trigger] || 0) + 1;
      totalWithTriggers++;
    }
  }

  if (totalWithTriggers === 0) {
    return [];
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([trigger, count]) => ({
      trigger,
      count,
      percentage: Math.round((count / totalWithTriggers) * 100),
    }));
}

/**
 * Returns dominant time category or null if no logs.
 */
export function getMostCommonTimeCategory(
  logs: LogEntry[]
): { category: TimeCategory; count: number } | null {
  if (logs.length === 0) {
    return null;
  }

  const dist = getTimeCategoryDistribution(logs);
  const categories: TimeCategory[] = ['morning', 'afternoon', 'evening', 'night'];
  let dominantCategory: TimeCategory = categories[0];
  let maxCount = -1;

  for (const cat of categories) {
    if (dist[cat] > maxCount) {
      maxCount = dist[cat];
      dominantCategory = cat;
    }
  }

  if (maxCount <= 0) {
    return null;
  }

  return { category: dominantCategory, count: maxCount };
}

/**
 * Returns most frequent day or null if no logs.
 */
export function getMostCommonDay(
  logs: LogEntry[]
): { day: string; count: number } | null {
  if (logs.length === 0) {
    return null;
  }

  const dist = getDayOfWeekDistribution(logs);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let dominantDay = days[0];
  let maxCount = -1;

  for (const day of days) {
    if (dist[day] > maxCount) {
      maxCount = dist[day];
      dominantDay = day;
    }
  }

  if (maxCount <= 0) {
    return null;
  }

  return { day: dominantDay, count: maxCount };
}

/**
 * Compares weekend (Sat+Sun) vs weekday averages.
 */
export function getWeekendVsWeekdayComparison(logs: LogEntry[]): {
  weekdayAvg: number;
  weekendAvg: number;
  higher: 'weekday' | 'weekend' | 'equal';
} {
  const dist = getDayOfWeekDistribution(logs);
  const weekdayTotal =
    dist.Monday + dist.Tuesday + dist.Wednesday + dist.Thursday + dist.Friday;
  const weekendTotal = dist.Saturday + dist.Sunday;

  const weekdayAvg = Math.round((weekdayTotal / 5) * 10) / 10;
  const weekendAvg = Math.round((weekendTotal / 2) * 10) / 10;

  let higher: 'weekday' | 'weekend' | 'equal' = 'equal';
  if (weekdayAvg > weekendAvg) {
    higher = 'weekday';
  } else if (weekendAvg > weekdayAvg) {
    higher = 'weekend';
  }

  return { weekdayAvg, weekendAvg, higher };
}

/**
 * Helper to format trigger identifier into a friendly display name.
 */
function formatTriggerLabel(trigger: string): string {
  const words = trigger.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
}

/**
 * Generates insight summaries with data thresholds:
 * - < 5 logs: return empty array
 * - 5-9 logs: 'tentative' confidence, only time and trigger patterns
 * - 10+ logs: 'reliable' confidence, all patterns
 */
export function generatePatternSummaries(logs: LogEntry[]): PatternSummary[] {
  if (logs.length < 5) {
    return [];
  }

  const confidence: 'tentative' | 'reliable' = logs.length < 10 ? 'tentative' : 'reliable';
  const summaries: PatternSummary[] = [];

  // 1. Time Pattern
  const dominantTime = getMostCommonTimeCategory(logs);
  if (dominantTime) {
    const timeLabels: Record<TimeCategory, string> = {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Late evening',
      night: 'Late night',
    };
    const label = timeLabels[dominantTime.category] || 'Late evening';
    summaries.push({
      id: `pattern-time-${logs.length}`,
      type: 'time',
      title: 'Time of Day',
      observation: `${label} is your most common logging period over the last 30 days.`,
      period: 'Last 30 days',
      confidence,
      dismissed: false,
    });
  }

  // 2. Trigger Pattern
  const triggerDist = getTriggerDistribution(logs);
  if (triggerDist.length > 0) {
    const topTrigger = triggerDist[0];
    const triggerName = formatTriggerLabel(topTrigger.trigger);
    summaries.push({
      id: `pattern-trigger-${logs.length}`,
      type: 'trigger',
      title: 'Primary Trigger',
      observation: `${triggerName} was the most frequently selected trigger in your recent logs.`,
      period: 'Recent logs',
      confidence,
      dismissed: false,
    });
  }

  // 3. Day and Trend Patterns (only for 10+ logs)
  if (logs.length >= 10) {
    // Day Pattern
    const comparison = getWeekendVsWeekdayComparison(logs);
    let dayObservation = '';
    let dayTitle = 'Day Pattern';

    if (comparison.higher === 'weekend') {
      dayTitle = 'Weekend Activity';
      dayObservation = 'Your logged activity was higher on weekends than weekdays.';
    } else if (comparison.higher === 'weekday') {
      dayTitle = 'Weekday Activity';
      dayObservation = 'Your logged activity was higher on weekdays than weekends.';
    } else {
      const mostCommonDay = getMostCommonDay(logs);
      dayTitle = 'Weekly Rhythm';
      if (mostCommonDay) {
        dayObservation = `${mostCommonDay.day} was your most frequent logging day in recent logs.`;
      } else {
        dayObservation = 'Your logged activity was evenly distributed across the week.';
      }
    }

    summaries.push({
      id: `pattern-day-${logs.length}`,
      type: 'day',
      title: dayTitle,
      observation: dayObservation,
      period: 'Past 4 weeks',
      confidence: 'reliable',
      dismissed: false,
    });

    // Trend Pattern
    const now = new Date();
    const weeklyCounts: number[] = [];
    for (let i = 0; i < 4; i++) {
      const targetDate = subWeeks(now, i);
      const start = startOfWeek(targetDate, { weekStartsOn: 1 });
      const end = endOfWeek(targetDate, { weekStartsOn: 1 });
      const count = logs.filter((log) => {
        try {
          const d = parseISO(log.timestamp);
          return isWithinInterval(d, { start, end });
        } catch {
          return false;
        }
      }).length;
      weeklyCounts.push(count);
    }

    let trendObservation = 'Your weekly totals have varied over the last four weeks.';
    if (
      weeklyCounts[0] < weeklyCounts[1] &&
      weeklyCounts[1] < weeklyCounts[2] &&
      weeklyCounts[2] < weeklyCounts[3]
    ) {
      trendObservation = 'Your weekly totals have steadily decreased over the last four weeks.';
    } else if (
      weeklyCounts[0] > weeklyCounts[1] &&
      weeklyCounts[1] > weeklyCounts[2] &&
      weeklyCounts[2] > weeklyCounts[3]
    ) {
      trendObservation = 'Your weekly totals have shown an upward trend over recent weeks.';
    } else if (weeklyCounts.every((count) => count === weeklyCounts[0])) {
      trendObservation = 'Your weekly totals have remained consistent over the last four weeks.';
    }

    summaries.push({
      id: `pattern-trend-${logs.length}`,
      type: 'trend',
      title: 'Weekly Trend',
      observation: trendObservation,
      period: 'Last 4 weeks',
      confidence: 'reliable',
      dismissed: false,
    });
  }

  return summaries;
}

/**
 * Compares current month vs previous month, detecting if current month is partial.
 *
 * @param logs - Array of LogEntry records
 * @param year - 4-digit year (e.g. 2026)
 * @param month - 0-indexed month (0 = January, 11 = December)
 */
export function getMonthlyComparison(
  logs: LogEntry[],
  year: number,
  month: number
): {
  currentMonth: number;
  previousMonth: number;
  currentMonthDays: number;
  previousMonthDays: number;
  isPartial: boolean;
} {
  const currentMonthDate = new Date(year, month, 1);
  const previousMonthDate = subMonths(currentMonthDate, 1);

  const currentMonthStart = startOfMonth(currentMonthDate);
  const currentMonthEnd = endOfMonth(currentMonthDate);
  const previousMonthStart = startOfMonth(previousMonthDate);
  const previousMonthEnd = endOfMonth(previousMonthDate);

  let currentMonthCount = 0;
  let previousMonthCount = 0;

  for (const log of logs) {
    if (!log.timestamp) continue;
    try {
      const date = parseISO(log.timestamp);
      if (isNaN(date.getTime())) continue;

      if (isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd })) {
        currentMonthCount++;
      } else if (isWithinInterval(date, { start: previousMonthStart, end: previousMonthEnd })) {
        previousMonthCount++;
      }
    } catch {
      // ignore
    }
  }

  const isPartial = isSameMonth(currentMonthDate, new Date());
  const currentMonthDays = currentMonthEnd.getDate();
  const previousMonthDays = previousMonthEnd.getDate();

  return {
    currentMonth: currentMonthCount,
    previousMonth: previousMonthCount,
    currentMonthDays,
    previousMonthDays,
    isPartial,
  };
}

/**
 * Filters logs falling within the specified date range (inclusive).
 */
export function filterLogsByDateRange(
  logs: LogEntry[],
  start: Date,
  end: Date
): LogEntry[] {
  const intervalStart = start <= end ? start : end;
  const intervalEnd = start <= end ? end : start;

  return logs.filter((log) => {
    if (!log.timestamp) return false;
    try {
      const date = parseISO(log.timestamp);
      if (isNaN(date.getTime())) return false;
      return isWithinInterval(date, { start: intervalStart, end: intervalEnd });
    } catch {
      return false;
    }
  });
}
