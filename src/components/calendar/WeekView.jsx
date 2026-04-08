import { useMemo } from 'react';
import { getDayHeaders, isToday, format } from '../../lib/dates';
import './Calendar.css';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function WeekView({ days, weekStart, dayNameFormat, events }) {
  const headers = useMemo(() => getDayHeaders(weekStart, dayNameFormat), [weekStart, dayNameFormat]);

  const getEventsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return events.filter((e) => e.eventDate === dayStr);
  };

  return (
    <div className="week-view">
      <div
        className="week-view-header"
        style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
      >
        {days.map((day, i) => (
          <div
            key={i}
            className={`week-view-header-cell ${isToday(day) ? 'week-view-header-cell--today' : ''}`}
          >
            <div>{headers[i % 7]}</div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      <div className="week-view-body">
        <div className="week-view-times">
          {HOURS.map((h) => (
            <div key={h} className="week-view-time">
              {h.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>
        <div
          className="week-view-columns"
          style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
        >
          {days.map((day, di) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div key={di} className="day-column">
                {HOURS.map((h) => (
                  <div key={h} className="day-column-slot" />
                ))}
                {dayEvents.map((ev) => {
                  if (!ev.startTime) return null;
                  const [hours, mins] = ev.startTime.split(':').map(Number);
                  const top = hours * 48 + (mins / 60) * 48;
                  const height = ev.endTime
                    ? (() => {
                        const [eh, em] = ev.endTime.split(':').map(Number);
                        return (eh * 48 + (em / 60) * 48) - top;
                      })()
                    : 48;

                  return (
                    <div
                      key={ev.id}
                      className="day-column-event"
                      style={{ top: `${top}px`, height: `${Math.max(height, 20)}px` }}
                    >
                      {ev.name}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
