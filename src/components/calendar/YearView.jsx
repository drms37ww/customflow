import { useMemo } from 'react';
import { getYearGrid, isSameMonth, isToday, format } from '../../lib/dates';
import './Calendar.css';

export default function YearView({ year, weekStart, events }) {
  const months = useMemo(() => getYearGrid(year, weekStart), [year, weekStart]);

  const eventDates = useMemo(() => {
    const set = new Set();
    events.forEach((e) => set.add(e.eventDate));
    return set;
  }, [events]);

  return (
    <div className="year-grid">
      {months.map((monthData) => (
        <div key={monthData.month} className="year-month">
          <div className="year-month-name">{monthData.monthName}</div>
          <div className="year-mini-grid">
            {monthData.weeks.flat().map((day, i) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isOther = !isSameMonth(day, monthData.firstDay);
              const today = isToday(day);
              const hasEvent = eventDates.has(dayStr);

              return (
                <div
                  key={i}
                  className={`year-mini-day ${isOther ? 'year-mini-day--other' : ''} ${today ? 'year-mini-day--today' : ''} ${hasEvent ? 'year-mini-day--has-event' : ''}`}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
