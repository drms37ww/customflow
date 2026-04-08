import Dexie from 'dexie';

export const db = new Dexie('customFlowDB');

db.version(1).stores({
  // Sync metadata
  syncMeta: 'key',

  // Labels
  labels: 'id, userId, sortOrder, updatedAt, deletedAt',

  // Flashcards
  flashcardFolders: 'id, userId, parentId, sortOrder, updatedAt, deletedAt',
  flashcardDecks: 'id, userId, folderId, starred, sortOrder, updatedAt, deletedAt',
  flashcardDeckLabels: 'id, deckId, labelId, userId',
  flashcardCards: 'id, userId, deckId, sortOrder, fsrsDue, fsrsState, updatedAt, deletedAt',

  // Todos
  todos: 'id, userId, parentId, dueDate, priority, starred, completed, sortOrder, updatedAt, deletedAt',
  todoLabels: 'id, todoId, labelId, userId',
  todoTabs: 'id, userId, sortOrder, updatedAt, deletedAt',

  // Calendar
  calendarEvents: 'id, userId, eventDate, source, sourceId, updatedAt, deletedAt',
  calendarEventLabels: 'id, eventId, labelId, userId',

  // Reminders
  reminders: 'id, userId, targetType, targetId, fired, updatedAt, deletedAt',

  // Attachments (local-only, never synced)
  attachments: 'id, userId, targetType, targetId, createdAt',

  // Sync change log (outbound queue)
  changeLog: '++localId, table, recordId, operation, timestamp',

  // Push subscription (local copy)
  pushSubscriptions: 'id, userId',

  // User settings (local copy)
  userSettings: 'userId',
});

export default db;
