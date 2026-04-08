import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import './Calendar.css';

export default function EventEditor({ event, onSave, onClose }) {
  const { t } = useTranslation();
  const [name, setName] = useState(event?.name || '');
  const [eventDate, setEventDate] = useState(event?.eventDate || '');
  const [startTime, setStartTime] = useState(event?.startTime || '');
  const [endTime, setEndTime] = useState(event?.endTime || '');
  const [description, setDescription] = useState(event?.description || '');

  const handleSave = () => {
    onSave({
      name,
      eventDate,
      startTime: startTime || null,
      endTime: endTime || null,
      description,
    });
  };

  return (
    <div className="event-editor-overlay" onClick={onClose}>
      <div className="event-editor" onClick={(e) => e.stopPropagation()}>
        <div className="event-editor-header">
          <h3>{event ? t('common.edit') : t('calendar.newEvent')}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="event-editor-field">
          <label>{t('common.name')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="event-editor-field">
          <label>{t('common.date')}</label>
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </div>
        <div className="event-editor-row">
          <div className="event-editor-field">
            <label>{t('calendar.startTime')}</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="event-editor-field">
            <label>{t('calendar.endTime')}</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        <div className="event-editor-field">
          <label>{t('common.description')}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="event-editor-actions">
          <button onClick={onClose} style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
            {t('common.cancel')}
          </button>
          <button onClick={handleSave} style={{ background: 'var(--color-accent)', color: 'white' }}>
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
