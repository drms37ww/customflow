import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompletedTodos } from '../../hooks/useTodos';
import TodoItem from './TodoItem';
import { ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import './Todos.css';

export default function CompletedGroup({ onSelectTodo }) {
  const { t } = useTranslation();
  const completed = useCompletedTodos();
  const [expanded, setExpanded] = useState(false);

  if (completed.length === 0) return null;

  return (
    <div className="completed-group">
      <div className="completed-group-header" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <CheckCircle size={16} />
        <span>{t('todos.completed')} ({completed.length})</span>
      </div>
      {expanded && (
        <div>
          {completed.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onSelect={onSelectTodo} />
          ))}
        </div>
      )}
    </div>
  );
}
