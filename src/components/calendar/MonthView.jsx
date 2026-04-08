import { useMemo } from 'react';
import { getMonthGrid, getDayHeaders, isSameDay, isSameMonth, isToday, format } from '../../lib/dates';
import './Calendar.css';

export default function MonthView({ year, month, weekStart, dayNameFormat, events, onDayClick }) {
  const grid = useMemo(() => getMonthGrid(year, month, weekStart), [year, month, weekStart]);
  const headers = useMemo(() => getDayHeaders(weekStart, dayNameFormat), [weekStart, dayNameFormat]);
  const monthDate = new Date(year, month, 1);

  const getEventsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return events.filter((e) => e.eventDate === dayStr);
  };

  return (
    <div className="month-grid">
      {headers.map((h, i) => (
        <div key={i} className="month-header-cell">{h}</div>
      ))}
      {grid.weeks.flat().map((day, i) => {
        const dayEvents = getEventsForDay(day);
        const isOther = !isSameMonth(day, monthDate);
        const today = isToday(day);

        return (
          <div
            key={i}
            className={`month-day-cell ${isOther ? 'month-day-cell--other-month' : ''} ${today ? 'month-day-cell--today' : ''}`}
            onClick={() => onDayClick?.(day)}
          >
            <div className={today ? 'month-day-number month-day-number--today' : 'month-day-number'}>
              {format(day, 'd')}
            </div>
            {dayEvents.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                className={`month-event-chip ${ev.source === 'todo' ? 'month-event-chip--todo' : 'month-event-chip--standalone'} ${ev.completed ? 'month-event-chip--completed' : ''}`}
              >
                {ev.startTime && <span>{ev.startTime.slice(0, 5)} </span>}
                {ev.name}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="month-event-more">+{dayEvents.length - 3}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
