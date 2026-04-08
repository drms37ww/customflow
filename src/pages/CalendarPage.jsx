import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { getEventsForRange, createEvent, updateEvent } from '../services/calendarService';
import { getWeekRange, getDayRange, addMonths, subMonths, addDays, format, startOfWeek } from '../lib/dates';
import MonthView from '../components/calendar/MonthView';
import YearView from '../components/calendar/YearView';
import WeekView from '../components/calendar/WeekView';
import EventEditor from '../components/calendar/EventEditor';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import './PageStyles.css';
import '../components/calendar/Calendar.css';

const VIEWS = ['year', 'month', '3week', 'week', '3day'];

export default function CalendarPage() {
  const { t } = useTranslation();
  const { view: urlView } = useParams();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  const weekStart = useSettingsStore((s) => s.weekStart);
  const dayNameFormat = useSettingsStore((s) => s.dayNameFormat);
  const defaultView = useSettingsStore((s) => s.calendarDefaultView);

  const [currentView, setCurrentView] = useState(urlView || defaultView || 'month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Compute date range based on view
  const range = useMemo(() => {
    switch (currentView) {
      case 'year':
        return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
      case 'month':
        return { start: new Date(year, month, 1), end: new Date(year, month + 1, 0) };
      case '3week':
        return getWeekRange(currentDate, weekStart, 3);
      case 'week':
        return getWeekRange(currentDate, weekStart, 1);
      case '3day':
        return getDayRange(currentDate, 3);
      default:
        return { start: new Date(year, month, 1), end: new Date(year, month + 1, 0) };
    }
  }, [currentView, currentDate, year, month, weekStart]);

  const events = useLiveQuery(
    () => getEventsForRange(userId, range.start, range.end),
    [userId, range.start?.getTime(), range.end?.getTime()],
    []
  );

  const handlePrev = () => {
    switch (currentView) {
      case 'year': setCurrentDate(new Date(year - 1, 0, 1)); break;
      case 'month': setCurrentDate(subMonths(currentDate, 1)); break;
      case '3week': setCurrentDate(addDays(currentDate, -21)); break;
      case 'week': setCurrentDate(addDays(currentDate, -7)); break;
      case '3day': setCurrentDate(addDays(currentDate, -3)); break;
    }
  };

  const handleNext = () => {
    switch (currentView) {
      case 'year': setCurrentDate(new Date(year + 1, 0, 1)); break;
      case 'month': setCurrentDate(addMonths(currentDate, 1)); break;
      case '3week': setCurrentDate(addDays(currentDate, 21)); break;
      case 'week': setCurrentDate(addDays(currentDate, 7)); break;
      case '3day': setCurrentDate(addDays(currentDate, 3)); break;
    }
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (day) => {
    setSelectedDate(format(day, 'yyyy-MM-dd'));
    setEditingEvent(null);
    setEditorOpen(true);
  };

  const handleSaveEvent = async (data) => {
    if (editingEvent && !editingEvent.id.startsWith('todo-')) {
      await updateEvent(editingEvent.id, data);
    } else {
      await createEvent(userId, { ...data, eventDate: data.eventDate || selectedDate });
    }
    setEditorOpen(false);
    setEditingEvent(null);
  };

  const title = currentView === 'year'
    ? String(year)
    : format(currentDate, 'MMMM yyyy');

  return (
    <div className="page">
      <h1 className="page-title">{t('calendar.title')}</h1>

      <div className="calendar-shell">
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={handlePrev}><ChevronLeft size={16} /></button>
          <button className="calendar-nav-btn" onClick={handleToday}>{t('calendar.today')}</button>
          <button className="calendar-nav-btn" onClick={handleNext}><ChevronRight size={16} /></button>
          <span className="calendar-nav-title">{title}</span>

          <button
            className="calendar-nav-btn"
            onClick={() => { setSelectedDate(format(new Date(), 'yyyy-MM-dd')); setEditorOpen(true); }}
            style={{ marginLeft: 'auto' }}
          >
            <Plus size={16} /> {t('calendar.newEvent')}
          </button>

          <div className="calendar-view-selector">
            {VIEWS.map((v) => (
              <button
                key={v}
                className={`calendar-view-btn ${currentView === v ? 'calendar-view-btn--active' : ''}`}
                onClick={() => setCurrentView(v)}
              >
                {t(`calendar.views.${v === '3week' ? 'threeWeek' : v === '3day' ? 'threeDay' : v}`)}
              </button>
            ))}
          </div>
        </div>

        {currentView === 'year' && (
          <YearView year={year} weekStart={weekStart} events={events} />
        )}

        {currentView === 'month' && (
          <MonthView
            year={year}
            month={month}
            weekStart={weekStart}
            dayNameFormat={dayNameFormat}
            events={events}
            onDayClick={handleDayClick}
          />
        )}

        {(currentView === 'week' || currentView === '3week' || currentView === '3day') && range.days && (
          <WeekView
            days={range.days}
            weekStart={weekStart}
            dayNameFormat={dayNameFormat}
            events={events}
          />
        )}
      </div>

      {editorOpen && (
        <EventEditor
          event={editingEvent}
          onSave={handleSaveEvent}
          onClose={() => { setEditorOpen(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
}
