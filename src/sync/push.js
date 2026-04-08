import db from '../db/dexie';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useSyncStore } from '../stores/syncStore';

// Map local table names to Supabase table names
const TABLE_MAP = {
  labels: 'labels',
  flashcardFolders: 'flashcard_folders',
  flashcardDecks: 'flashcard_decks',
  flashcardDeckLabels: 'flashcard_deck_labels',
  flashcardCards: 'flashcard_cards',
  todos: 'todos',
  todoLabels: 'todo_labels',
  todoTabs: 'todo_tabs',
  calendarEvents: 'calendar_events',
  calendarEventLabels: 'calendar_event_labels',
  reminders: 'reminders',
  pushSubscriptions: 'push_subscriptions',
};

// Convert camelCase local record to snake_case for Supabase
function toSnakeCase(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'localId') continue; // skip local-only fields
    const snakeKey = key.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
    result[snakeKey] = value;
  }
  return result;
}

/**
 * Process the changeLog queue and push changes to Supabase.
 * @returns {number} Number of changes pushed
 */
export async function pushChanges() {
  if (!isSupabaseConfigured()) return 0;

  const changes = await db.changeLog.orderBy('localId').toArray();
  if (changes.length === 0) return 0;

  let pushed = 0;

  for (const change of changes) {
    const supabaseTable = TABLE_MAP[change.table];
    if (!supabaseTable) {
      // Unknown table, remove from queue
      await db.changeLog.delete(change.localId);
      continue;
    }

    try {
      if (change.operation === 'delete') {
        // Soft delete: set deleted_at
        await supabase
          .from(supabaseTable)
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', change.recordId);
      } else {
        // Get the current local record
        const record = await db[change.table].get(change.recordId);
        if (record) {
          const data = toSnakeCase(record);
          await supabase.from(supabaseTable).upsert(data, { onConflict: 'id' });
        }
      }

      await db.changeLog.delete(change.localId);
      pushed++;
    } catch (err) {
      console.error(`Sync push failed for ${change.table}/${change.recordId}:`, err);
      // Leave in queue for retry
    }
  }

  useSyncStore.getState().setPendingChanges(
    await db.changeLog.count()
  );

  return pushed;
}
