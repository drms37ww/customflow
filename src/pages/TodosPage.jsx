import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTodos, useStarredTodos, useTodoTabs } from '../hooks/useTodos';
import { createTodo, sortTodos } from '../services/todoService';
import TodoItem from '../components/todos/TodoItem';
import TodoDetail from '../components/todos/TodoDetail';
import CompletedGroup from '../components/todos/CompletedGroup';
import { Plus } from 'lucide-react';
import './PageStyles.css';
import '../components/todos/Todos.css';

export default function TodosPage() {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'default';
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');

  const allTodos = useTodos(null);
  const starredTodos = useStarredTodos();
  const customTabs = useTodoTabs();

  // Filter based on active tab
  let displayTodos = allTodos;
  if (activeTab === 'starred') {
    displayTodos = starredTodos;
  }

  const sorted = sortTodos(displayTodos, 'default');

  const handleNewTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    await createTodo(userId, { name: newTaskName.trim() });
    setNewTaskName('');
  };

  return (
    <div className="page">
      <h1 className="page-title">{t('todos.title')}</h1>

      {/* Tabs */}
      <div className="todo-tabs">
        <button
          className={`todo-tab ${activeTab === 'default' ? 'todo-tab--active' : ''}`}
          onClick={() => setSearchParams({})}
        >
          {t('todos.tabs.default')}
        </button>
        <button
          className={`todo-tab ${activeTab === 'starred' ? 'todo-tab--active' : ''}`}
          onClick={() => setSearchParams({ tab: 'starred' })}
        >
          {t('todos.tabs.starred')}
        </button>
        {customTabs.map((tab) => (
          <button
            key={tab.id}
            className={`todo-tab ${activeTab === tab.id ? 'todo-tab--active' : ''}`}
            onClick={() => setSearchParams({ tab: tab.id })}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* New task input */}
      <form className="new-task-input" onSubmit={handleNewTask}>
        <input
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder={t('todos.newTask')}
        />
        <button type="submit">
          <Plus size={16} />
        </button>
      </form>

      {/* Task list */}
      {sorted.length === 0 ? (
        <div className="placeholder-box">{t('todos.noTasks')}</div>
      ) : (
        <div>
          {sorted.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onSelect={setSelectedTodo}
            />
          ))}
        </div>
      )}

      {/* Completed group */}
      {activeTab === 'default' && (
        <CompletedGroup onSelectTodo={setSelectedTodo} />
      )}

      {/* Detail panel */}
      {selectedTodo && (
        <TodoDetail
          todo={selectedTodo}
          onClose={() => setSelectedTodo(null)}
        />
      )}
    </div>
  );
}
