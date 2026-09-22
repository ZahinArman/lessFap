import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDate,
  getDaysInMonth,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { LogEntry } from '../types';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface MonthSummary {
  totalLogs: number;
  activeDays: number;
  daysInMonth: number;
  isPartial: boolean;
}

/**
 * Generates a 6x7 grid (42 days) of calendar days for a given month and year.
 * Weeks start on Monday ({ weekStartsOn: 1 }). Includes padding days from
 * the previous and next months to maintain a consistent 6-row grid.
 *
 * @param year - 4-digit calendar year
 * @param month - 0-indexed month (0 = January, 11 = December)
 */
export const getCalendarDays = (
  year: number,
  month: number
): { date: Date; isCurrentMonth: boolean; isToday: boolean }[] => {
  const monthDate = new Date(year, month, 1);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // A complete monthly calendar grid requires 6 rows x 7 days = 42 days
  while (days.length < 42) {
    const nextDay = addDays(days[days.length - 1], 1);
    days.push(nextDay);
  }

  return days.map((date) => ({
    date,
    isCurrentMonth: isSameMonth(date, monthDate),
    isToday: isToday(date),
  }));
};

/**
 * Filters log entries that occurred on a specific calendar date in the local timezone.
 *
 * @param logs - Array of LogEntry records
 * @param date - Target calendar date
 */
export const getLogsForDate = (logs: LogEntry[], date: Date): LogEntry[] => {
  return logs.filter((log) => isSameDay(parseISO(log.timestamp), date));
};

/**
 * Returns the number of log entries for a specific calendar date.
 *
 * @param logs - Array of LogEntry records
 * @param date - Target calendar date
 */
export const getLogCountForDate = (logs: LogEntry[], date: Date): number => {
  return getLogsForDate(logs, date).length;
};

/**
 * Returns a bullet dot indicator string representing logging frequency for a calendar cell.
 * - 0 logs: ''
 * - 1 log:  '•'
 * - 2 logs: '••'
 * - 3+ logs:'•••'
 *
 * @param count - Number of logs on the date
 */
export const getDotIndicator = (count: number): string => {
  if (count <= 0) return '';
  if (count === 1) return '•';
  if (count === 2) return '••';
  return '•••';
};

/**
 * Determines whether the specified year and month is the currently ongoing month.
 *
 * @param year - 4-digit calendar year
 * @param month - 0-indexed month (0 = January, 11 = December)
 */
export const isPartialMonth = (year: number, month: number): boolean => {
  return isSameMonth(new Date(year, month, 1), new Date());
};

/**
 * Calculates summary metrics for a given month:
 * - totalLogs: Total number of logs logged in this month
 * - activeDays: Count of unique calendar days with at least one log
 * - daysInMonth: Total number of days in the month
 * - isPartial: Whether this month is the current ongoing month
 *
 * @param logs - Array of LogEntry records
 * @param year - 4-digit calendar year
 * @param month - 0-indexed month (0 = January, 11 = December)
 */
export const getMonthSummary = (
  logs: LogEntry[],
  year: number,
  month: number
): { totalLogs: number; activeDays: number; daysInMonth: number; isPartial: boolean } => {
  const monthDate = new Date(year, month, 1);
  const activeDaySet = new Set<number>();
  let totalLogs = 0;

  for (const log of logs) {
    const logDate = parseISO(log.timestamp);
    if (isSameMonth(logDate, monthDate)) {
      totalLogs++;
      activeDaySet.add(getDate(logDate));
    }
  }

  return {
    totalLogs,
    activeDays: activeDaySet.size,
    daysInMonth: getDaysInMonth(monthDate),
    isPartial: isPartialMonth(year, month),
  };
};

/**
 * Returns a friendly, awareness-focused month label.
 * - Current month: e.g. 'September so far'
 * - Other months: e.g. 'September 2026'
 *
 * @param year - 4-digit calendar year
 * @param month - 0-indexed month (0 = January, 11 = December)
 */
export const getMonthLabel = (year: number, month: number): string => {
  const date = new Date(year, month, 1);
  if (isPartialMonth(year, month)) {
    return `${format(date, 'MMMM')} so far`;
  }
  return format(date, 'MMMM yyyy');
};

/**
 * Calculates the previous or next month and year, handling year boundaries seamlessly.
 *
 * @param year - 4-digit calendar year
 * @param month - 0-indexed month (0 = January, 11 = December)
 * @param direction - 'prev' to navigate backward, 'next' to navigate forward
 */
export const navigateMonth = (
  year: number,
  month: number,
  direction: 'prev' | 'next'
): { year: number; month: number } => {
  const baseDate = new Date(year, month, 1);
  const targetDate = direction === 'prev' ? subMonths(baseDate, 1) : addMonths(baseDate, 1);
  return {
    year: targetDate.getFullYear(),
    month: targetDate.getMonth(),
  };
};
