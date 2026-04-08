import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/dexie';
import { useAuthStore } from '../stores/authStore';

export function useTodos(parentId = null) {
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  return useLiveQuery(
    () => db.todos
      .where('userId').equals(userId)
      .filter((t) => !t.deletedAt && !t.completed && (parentId ? t.parentId === parentId : !t.parentId))
      .sortBy('sortOrder'),
    [userId, parentId],
    []
  );
}

export function useCompletedTodos() {
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  return useLiveQuery(
    () => db.todos
      .where('userId').equals(userId)
      .filter((t) => !t.deletedAt && t.completed && !t.parentId)
      .toArray(),
    [userId],
    []
  );
}

export function useStarredTodos() {
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  return useLiveQuery(
    () => db.todos
      .where('userId').equals(userId)
      .filter((t) => !t.deletedAt && !t.completed && t.starred)
      .toArray(),
    [userId],
    []
  );
}

export function useSubtasks(parentId) {
  return useLiveQuery(
    () => parentId
      ? db.todos
          .where('parentId').equals(parentId)
          .filter((t) => !t.deletedAt)
          .sortBy('sortOrder')
      : Promise.resolve([]),
    [parentId],
    []
  );
}

export function useTodoTabs() {
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  return useLiveQuery(
    () => db.todoTabs
      .where('userId').equals(userId)
      .filter((t) => !t.deletedAt)
      .sortBy('sortOrder'),
    [userId],
    []
  );
}
