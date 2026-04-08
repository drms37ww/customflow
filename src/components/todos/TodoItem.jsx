import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { completeTodo, restoreTodo, updateTodo } from '../../services/todoService';
import { useSubtasks } from '../../hooks/useTodos';
import { useUiStore } from '../../stores/uiStore';
import { Star, ChevronDown, ChevronRight, Calendar, Check } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import './Todos.css';

const PRIORITY_LABELS = ['', 'low', 'medium', 'high', 'urgent'];

export default function TodoItem({ todo, onSelect, depth = 0 }) {
  const { t } = useTranslation();
  const subtasks = useSubtasks(todo.id);
  const expanded = useUiStore((s) => s.todoExpandedItems[todo.id]);
  const toggleExpanded = useUiStore((s) => s.toggleTodoExpanded);
  const hasSubtasks = subtasks.length > 0;

  const handleCheck = async (e) => {
    e.stopPropagation();
    if (todo.completed) {
      await restoreTodo(todo.id);
    } else {
      await completeTodo(todo.id);
    }
  };

  const handleStar = async (e) => {
    e.stopPropagation();
    await updateTodo(todo.id, { starred: !todo.starred });
  };

  const handleExpand = (e) => {
    e.stopPropagation();
    toggleExpanded(todo.id);
  };

  const isOverdue = todo.dueDate && isPast(new Date(todo.dueDate)) && !isToday(new Date(todo.dueDate)) && !todo.completed;

  return (
    <div>
      <div className="todo-item" onClick={() => onSelect?.(todo)}>
        <div
          className={`todo-checkbox ${todo.completed ? 'todo-checkbox--checked' : ''} ${todo.priority ? `todo-checkbox--priority-${todo.priority}` : ''}`}
          onClick={handleCheck}
        >
          {todo.completed && <Check size={12} />}
        </div>

        <div className="todo-item-body">
          <div className={`todo-item-name ${todo.completed ? 'todo-item-name--completed' : ''}`}>
            {todo.name}
          </div>
          <div className="todo-item-meta">
            {todo.dueDate && (
              <span className={`todo-item-due ${isOverdue ? 'todo-item-due--overdue' : ''}`}>
                <Calendar size={12} />
                {format(new Date(todo.dueDate), 'MMM d')}
                {todo.dueTime && ` ${todo.dueTime}`}
              </span>
            )}
            {todo.priority > 0 && (
              <span className={`todo-item-priority todo-item-priority--${todo.priority}`}>
                {t(`todos.priority.${PRIORITY_LABELS[todo.priority]}`)}
              </span>
            )}
            {hasSubtasks && (
              <button className="todo-expand-btn" onClick={handleExpand}>
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {subtasks.filter(s => !s.completed).length}/{subtasks.length}
              </button>
            )}
          </div>
        </div>

        <div className="todo-item-actions">
          <button
            className={`todo-star ${todo.starred ? 'todo-star--active' : ''}`}
            onClick={handleStar}
          >
            <Star size={16} fill={todo.starred ? '#eab308' : 'none'} />
          </button>
        </div>
      </div>

      {expanded && hasSubtasks && (
        <div className="subtask-list">
          {subtasks.map((sub) => (
            <TodoItem key={sub.id} todo={sub} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
