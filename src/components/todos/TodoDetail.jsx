import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { updateTodo } from '../../services/todoService';
import { useAuthStore } from '../../stores/authStore';
import { createTodo } from '../../services/todoService';
import { X, Plus } from 'lucide-react';
import './Todos.css';

export default function TodoDetail({ todo, onClose }) {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  const [name, setName] = useState(todo?.name || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [dueDate, setDueDate] = useState(todo?.dueDate || '');
  const [dueTime, setDueTime] = useState(todo?.dueTime || '');
  const [priority, setPriority] = useState(todo?.priority || 0);

  useEffect(() => {
    if (todo) {
      setName(todo.name || '');
      setDescription(todo.description || '');
      setDueDate(todo.dueDate || '');
      setDueTime(todo.dueTime || '');
      setPriority(todo.priority || 0);
    }
  }, [todo?.id]);

  const handleSave = async () => {
    if (!todo) return;
    await updateTodo(todo.id, { name, description, dueDate: dueDate || null, dueTime: dueTime || null, priority });
    onClose();
  };

  const handleAddSubtask = async () => {
    await createTodo(userId, {
      parentId: todo.id,
      name: t('todos.newSubtask'),
    });
  };

  if (!todo) return null;

  return (
    <div className="todo-detail-overlay" onClick={onClose}>
      <div className="todo-detail" onClick={(e) => e.stopPropagation()}>
        <div className="todo-detail-header">
          <h3>{t('common.edit')}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="todo-detail-field">
          <label>{t('common.name')}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => updateTodo(todo.id, { name })}
          />
        </div>

        <div className="todo-detail-field">
          <label>{t('common.description')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => updateTodo(todo.id, { description })}
            placeholder={t('common.description')}
          />
        </div>

        <div className="todo-detail-row">
          <div className="todo-detail-field">
            <label>{t('todos.dueDate')}</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => { setDueDate(e.target.value); updateTodo(todo.id, { dueDate: e.target.value || null }); }}
            />
          </div>
          <div className="todo-detail-field">
            <label>{t('todos.dueTime')}</label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => { setDueTime(e.target.value); updateTodo(todo.id, { dueTime: e.target.value || null }); }}
            />
          </div>
        </div>

        <div className="todo-detail-field">
          <label>{t('common.priority')}</label>
          <select
            value={priority}
            onChange={(e) => { const v = Number(e.target.value); setPriority(v); updateTodo(todo.id, { priority: v }); }}
          >
            <option value={0}>{t('todos.priority.none')}</option>
            <option value={1}>{t('todos.priority.low')}</option>
            <option value={2}>{t('todos.priority.medium')}</option>
            <option value={3}>{t('todos.priority.high')}</option>
            <option value={4}>{t('todos.priority.urgent')}</option>
          </select>
        </div>

        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
            padding: 'var(--space-sm) var(--space-md)',
            color: 'var(--color-accent)', fontSize: 'var(--font-size-sm)', fontWeight: 500,
          }}
          onClick={handleAddSubtask}
        >
          <Plus size={16} /> {t('todos.newSubtask')}
        </button>
      </div>
    </div>
  );
}
