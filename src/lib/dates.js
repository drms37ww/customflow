import {
  startOfYear, endOfYear, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addWeeks, addMonths, addYears, subMonths,
  eachDayOfInterval, getDay, format, isSameDay, isSameMonth, isToday,
} from 'date-fns';

/**
 * Get a year grid: 12 months, each with their day grids.
 */
export function getYearGrid(year, weekStart = 1) {
  const months = [];
  for (let m = 0; m < 12; m++) {
    months.push(getMonthGrid(year, m, weekStart));
  }
  return months;
}

/**
 * Get a month grid (6 rows x 7 cols).
 */
export function getMonthGrid(year, month, weekStart = 1) {
  const firstDay = new Date(year, month, 1);
  const lastDay = endOfMonth(firstDay);
  const start = startOfWeek(firstDay, { weekStartsOn: weekStart });
  const end = endOfWeek(lastDay, { weekStartsOn: weekStart });

  const days = eachDayOfInterval({ start, end });
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return {
    year,
    month,
    monthName: format(firstDay, 'MMMM'),
    weeks,
    firstDay,
  };
}

/**
 * Get a date range for N weeks.
 */
export function getWeekRange(date, weekStart = 1, weekCount = 1) {
  const start = startOfWeek(date, { weekStartsOn: weekStart });
  const end = addDays(addWeeks(start, weekCount), -1);
  return { start, end, days: eachDayOfInterval({ start, end }) };
}

/**
 * Get a date range for N days.
 */
export function getDayRange(date, dayCount = 1) {
  const start = date;
  const end = addDays(start, dayCount - 1);
  return { start, end, days: eachDayOfInterval({ start, end }) };
}

/**
 * Get a custom date range.
 */
export function getCustomRange(date, count, unit, weekStart = 1) {
  const addFns = { days: addDays, weeks: addWeeks, months: addMonths, years: addYears };
  const addFn = addFns[unit] || addDays;
  const end = addDays(addFn(date, count), -1);
  return { start: date, end, days: eachDayOfInterval({ start: date, end }) };
}

/**
 * Get day-of-week headers.
 */
export function getDayHeaders(weekStart = 1, formatStyle = 'short') {
  const base = startOfWeek(new Date(), { weekStartsOn: weekStart });
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(base, i);
    return formatStyle === 'full'
      ? format(d, 'EEEE')
      : format(d, 'EEE');
  });
}

export { format, isSameDay, isSameMonth, isToday, addDays, addWeeks, addMonths, subMonths, startOfWeek };
