import db from '../db/dexie';
import { generateId } from '../lib/ids';
import { trackChange } from '../sync/engine';
import { stampFields } from '../sync/conflict';

// ============ TASKS ============

export async function getTodos(userId, parentId = null) {
  return db.todos
    .where('userId').equals(userId)
    .filter((t) => !t.deletedAt && (parentId ? t.parentId === parentId : !t.parentId))
    .sortBy('sortOrder');
}

export async function getAllTodos(userId) {
  return db.todos
    .where('userId').equals(userId)
    .filter((t) => !t.deletedAt)
    .toArray();
}

export async function getTodo(id) {
  return db.todos.get(id);
}

export async function getSubtasks(parentId) {
  return db.todos
    .where('parentId').equals(parentId)
    .filter((t) => !t.deletedAt)
    .sortBy('sortOrder');
}

export async function createTodo(userId, data) {
  const siblings = await getTodos(userId, data.parentId || null);
  const now = new Date().toISOString();
  const todo = {
    id: generateId(),
    userId,
    parentId: data.parentId || null,
    name: data.name || '',
    description: data.description || '',
    dueDate: data.dueDate || null,
    dueTime: data.dueTime || null,
    priority: data.priority || 0,
    starred: data.starred || false,
    completed: false,
    completedAt: null,
    sortOrder: siblings.length,
    urlLinks: data.urlLinks || [],
    recurrence: data.recurrence || null,
    linkedDeckId: data.linkedDeckId || null,
    linkedFolderId: data.linkedFolderId || null,
    hasAttachments: false,
    fieldTimestamps: stampFields([
      'name', 'description', 'dueDate', 'dueTime', 'priority',
      'starred', 'completed', 'sortOrder', 'recurrence',
    ]),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  await db.todos.put(todo);
  await trackChange('todos', todo.id);
  return todo;
}

export async function updateTodo(id, changes) {
  const existing = await db.todos.get(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const updated = {
    ...existing,
    ...changes,
    fieldTimestamps: stampFields(Object.keys(changes), existing.fieldTimestamps),
    updatedAt: now,
  };
  await db.todos.put(updated);
  await trackChange('todos', id);
  return updated;
}

export async function completeTodo(id) {
  const now = new Date().toISOString();
  return updateTodo(id, { completed: true, completedAt: now });
}

export async function restoreTodo(id) {
  return updateTodo(id, { completed: false, completedAt: null });
}

/**
 * Get effective due date: earliest incomplete descendant's due date (recursive).
 * Falls back to own due date when all children are complete.
 */
export async function getEffectiveDueDate(todoId) {
  const todo = await db.todos.get(todoId);
  if (!todo) return null;

  const children = await db.todos
    .where('parentId').equals(todoId)
    .filter((t) => !t.deletedAt && !t.completed)
    .toArray();

  if (children.length === 0) {
    return todo.dueDate;
  }

  let earliest = todo.dueDate;
  for (const child of children) {
    const childDue = await getEffectiveDueDate(child.id);
    if (childDue && (!earliest || childDue < earliest)) {
      earliest = childDue;
    }
  }
  return earliest;
}

// ============ SORT ============

export function sortTodos(todos, sortConfig) {
  if (sortConfig === 'manual') return todos;

  return [...todos].sort((a, b) => {
    // Date first
    const aDate = a.dueDate || '9999-12-31';
    const bDate = b.dueDate || '9999-12-31';
    if (aDate !== bDate) return aDate.localeCompare(bDate);

    // Then priority (higher first)
    if (a.priority !== b.priority) return b.priority - a.priority;

    // Then alphabetical
    return a.name.localeCompare(b.name);
  });
}

// ============ TABS ============

export async function getTabs(userId) {
  return db.todoTabs
    .where('userId').equals(userId)
    .filter((t) => !t.deletedAt)
    .sortBy('sortOrder');
}

export async function createTab(userId, { name, filterConfig }) {
  const siblings = await getTabs(userId);
  const now = new Date().toISOString();
  const tab = {
    id: generateId(),
    userId,
    name,
    filterConfig: filterConfig || { logic: 'AND', conditions: [] },
    sortOrder: siblings.length,
    fieldTimestamps: stampFields(['name', 'filterConfig', 'sortOrder']),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  await db.todoTabs.put(tab);
  await trackChange('todoTabs', tab.id);
  return tab;
}

export async function updateTab(id, changes) {
  const existing = await db.todoTabs.get(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const updated = {
    ...existing,
    ...changes,
    fieldTimestamps: stampFields(Object.keys(changes), existing.fieldTimestamps),
    updatedAt: now,
  };
  await db.todoTabs.put(updated);
  await trackChange('todoTabs', id);
  return updated;
}

export async function deleteTab(id) {
  const now = new Date().toISOString();
  const existing = await db.todoTabs.get(id);
  if (existing) {
    await db.todoTabs.put({ ...existing, deletedAt: now, updatedAt: now });
    await trackChange('todoTabs', id, 'delete');
  }
}

// ============ FILTER ============

/**
 * Apply a filter config to a list of todos.
 * @param {Array} todos
 * @param {Object} filterConfig - { logic: 'AND'|'OR', conditions: [{field, operator, value}] }
 * @returns {Array} Filtered todos
 */
export function applyFilter(todos, filterConfig) {
  if (!filterConfig || !filterConfig.conditions || filterConfig.conditions.length === 0) {
    return todos;
  }

  const { logic, conditions } = filterConfig;

  return todos.filter((todo) => {
    const results = conditions.map((cond) => matchCondition(todo, cond));
    return logic === 'OR' ? results.some(Boolean) : results.every(Boolean);
  });
}

function matchCondition(todo, { field, operator, value }) {
  const actual = todo[field];

  switch (operator) {
    case 'equals': return actual === value;
    case 'not_equals': return actual !== value;
    case 'contains': return String(actual || '').toLowerCase().includes(String(value).toLowerCase());
    case 'gt': return actual > value;
    case 'lt': return actual < value;
    case 'gte': return actual >= value;
    case 'lte': return actual <= value;
    case 'is_true': return !!actual;
    case 'is_false': return !actual;
    case 'in': return Array.isArray(value) && value.includes(actual);
    case 'has_label': {
      // Check todoLabels junction - this is simplified, actual implementation would query DB
      return true; // TODO: implement label filter via join
    }
    default: return true;
  }
}
