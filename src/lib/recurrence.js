import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter, isEqual, getDay, getDate, format } from 'date-fns';

/**
 * Expand a recurrence rule into concrete dates within a range.
 *
 * Recurrence shape:
 * {
 *   interval: { every: 1, unit: 'days'|'weeks'|'months'|'years' },
 *   patterns: [{ weekdays: [0-6], daysOfMonth: [1-31], time: 'HH:mm' }],
 *   customDates: ['2026-04-10', '2026-05-01'],
 *   startDate: '2026-04-08'
 * }
 *
 * All three modes are combinable.
 *
 * @param {Object} rule - Recurrence definition
 * @param {Date} rangeStart
 * @param {Date} rangeEnd
 * @returns {Date[]} Array of dates within range
 */
export function expandRecurrence(rule, rangeStart, rangeEnd) {
  if (!rule) return [];
  const dates = new Set();
  const start = rule.startDate ? new Date(rule.startDate) : rangeStart;

  // Interval-based
  if (rule.interval && rule.interval.every && rule.interval.unit) {
    const { every, unit } = rule.interval;
    const addFn = { days: addDays, weeks: addWeeks, months: addMonths, years: addYears }[unit];
    if (addFn) {
      let d = new Date(start);
      while (isBefore(d, rangeEnd) || isEqual(d, rangeEnd)) {
        if ((isAfter(d, rangeStart) || isEqual(d, rangeStart)) && (isBefore(d, rangeEnd) || isEqual(d, rangeEnd))) {
          dates.add(format(d, 'yyyy-MM-dd'));
        }
        d = addFn(d, every);
      }
    }
  }

  // Pattern-based
  if (rule.patterns && rule.patterns.length > 0) {
    let d = new Date(rangeStart);
    while (isBefore(d, rangeEnd) || isEqual(d, rangeEnd)) {
      const dayOfWeek = getDay(d); // 0=Sun
      const dayOfMonth = getDate(d);

      for (const pattern of rule.patterns) {
        const matchWeekday = !pattern.weekdays?.length || pattern.weekdays.includes(dayOfWeek);
        const matchDayOfMonth = !pattern.daysOfMonth?.length || pattern.daysOfMonth.includes(dayOfMonth);

        if (matchWeekday && matchDayOfMonth) {
          dates.add(format(d, 'yyyy-MM-dd'));
        }
      }
      d = addDays(d, 1);
    }
  }

  // Custom dates
  if (rule.customDates && rule.customDates.length > 0) {
    for (const dateStr of rule.customDates) {
      const d = new Date(dateStr);
      if ((isAfter(d, rangeStart) || isEqual(d, rangeStart)) && (isBefore(d, rangeEnd) || isEqual(d, rangeEnd))) {
        dates.add(format(d, 'yyyy-MM-dd'));
      }
    }
  }

  return Array.from(dates).sort().map((s) => new Date(s));
}
