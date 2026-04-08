import db from '../db/dexie';
import { generateId } from '../lib/ids';
import { trackChange } from '../sync/engine';
import { stampFields } from '../sync/conflict';
import { format } from 'date-fns';

export async function getEvents(userId) {
  return db.calendarEvents
    .where('userId').equals(userId)
    .filter((e) => !e.deletedAt)
    .toArray();
}

export async function getEventsForRange(userId, startDate, endDate) {
  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate, 'yyyy-MM-dd');

  // Standalone events
  const standalone = await db.calendarEvents
    .where('userId').equals(userId)
    .filter((e) => !e.deletedAt && e.eventDate >= start && e.eventDate <= end)
    .toArray();

  // Tasks with due dates in range
  const tasks = await db.todos
    .where('userId').equals(userId)
    .filter((t) => !t.deletedAt && t.dueDate && t.dueDate >= start && t.dueDate <= end)
    .toArray();

  const taskEvents = tasks.map((t) => ({
    id: `todo-${t.id}`,
    name: t.name,
    eventDate: t.dueDate,
    startTime: t.dueTime,
    endTime: null,
    source: 'todo',
    sourceId: t.id,
    completed: t.completed,
    priority: t.priority,
    linkedDeckId: t.linkedDeckId,
    linkedFolderId: t.linkedFolderId,
  }));

  return [...standalone, ...taskEvents];
}

export async function createEvent(userId, data) {
  const now = new Date().toISOString();
  const event = {
    id: generateId(),
    userId,
    name: data.name || '',
    description: data.description || '',
    eventDate: data.eventDate,
    startTime: data.startTime || null,
    endTime: data.endTime || null,
    recurrence: data.recurrence || null,
    source: 'standalone',
    sourceId: null,
    fieldTimestamps: stampFields(['name', 'description', 'eventDate', 'startTime', 'endTime', 'recurrence']),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  await db.calendarEvents.put(event);
  await trackChange('calendarEvents', event.id);
  return event;
}

export async function updateEvent(id, changes) {
  const existing = await db.calendarEvents.get(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const updated = {
    ...existing,
    ...changes,
    fieldTimestamps: stampFields(Object.keys(changes), existing.fieldTimestamps),
    updatedAt: now,
  };
  await db.calendarEvents.put(updated);
  await trackChange('calendarEvents', id);
  return updated;
}

export async function deleteEvent(id) {
  const now = new Date().toISOString();
  const existing = await db.calendarEvents.get(id);
  if (existing) {
    await db.calendarEvents.put({ ...existing, deletedAt: now, updatedAt: now });
    await trackChange('calendarEvents', id, 'delete');
  }
}
