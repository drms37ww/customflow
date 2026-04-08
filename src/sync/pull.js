import db from '../db/dexie';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { mergeRecords } from './conflict';

// Map Supabase table names to local table names
const REVERSE_TABLE_MAP = {
  labels: 'labels',
  flashcard_folders: 'flashcardFolders',
  flashcard_decks: 'flashcardDecks',
  flashcard_deck_labels: 'flashcardDeckLabels',
  flashcard_cards: 'flashcardCards',
  todos: 'todos',
  todo_labels: 'todoLabels',
  todo_tabs: 'todoTabs',
  calendar_events: 'calendarEvents',
  calendar_event_labels: 'calendarEventLabels',
  reminders: 'reminders',
};

const SYNCABLE_TABLES = Object.keys(REVERSE_TABLE_MAP);

// Convert snake_case Supabase record to camelCase for local storage
function toCamelCase(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

/**
 * Pull changes from Supabase since lastSyncTime and merge into IndexedDB.
 * @param {string|null} since - ISO timestamp of last sync
 * @returns {number} Number of records merged
 */
export async function pullChanges(since) {
  if (!isSupabaseConfigured()) return 0;

  let merged = 0;

  for (const supabaseTable of SYNCABLE_TABLES) {
    const localTable = REVERSE_TABLE_MAP[supabaseTable];

    try {
      let query = supabase.from(supabaseTable).select('*');

      if (since) {
        query = query.gte('updated_at', since);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) continue;

      for (const remoteRecord of data) {
        const local = toCamelCase(remoteRecord);
        const existing = await db[localTable].get(local.id);

        if (local.deletedAt) {
          // Soft-deleted remotely
          if (existing) {
            await db[localTable].put({ ...existing, deletedAt: local.deletedAt });
          }
          merged++;
          continue;
        }

        const result = mergeRecords(existing, local);
        await db[localTable].put(result);
        merged++;
      }
    } catch (err) {
      console.error(`Sync pull failed for ${supabaseTable}:`, err);
    }
  }

  return merged;
}
