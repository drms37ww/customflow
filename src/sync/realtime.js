import { supabase, isSupabaseConfigured } from '../config/supabase';
import db from '../db/dexie';
import { mergeRecords } from './conflict';

const SUBSCRIPTIONS = [];

// Map Supabase table names to local table names
const TABLE_MAP = {
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

function toCamelCase(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

async function handleRealtimeChange(supabaseTable, payload) {
  const localTable = TABLE_MAP[supabaseTable];
  if (!localTable) return;

  const remote = toCamelCase(payload.new || payload.old || {});

  if (payload.eventType === 'DELETE' || remote.deletedAt) {
    const existing = await db[localTable].get(remote.id);
    if (existing) {
      await db[localTable].put({ ...existing, deletedAt: remote.deletedAt || new Date().toISOString() });
    }
    return;
  }

  const existing = await db[localTable].get(remote.id);
  const merged = mergeRecords(existing, remote);
  await db[localTable].put(merged);
}

/**
 * Subscribe to realtime changes on all syncable tables.
 * @param {string} userId - Current user's ID
 */
export function startRealtimeSubscriptions(userId) {
  if (!isSupabaseConfigured() || !userId) return;

  stopRealtimeSubscriptions();

  for (const supabaseTable of Object.keys(TABLE_MAP)) {
    const channel = supabase
      .channel(`sync-${supabaseTable}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: supabaseTable,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => handleRealtimeChange(supabaseTable, payload)
      )
      .subscribe();

    SUBSCRIPTIONS.push(channel);
  }
}

/**
 * Unsubscribe from all realtime channels.
 */
export function stopRealtimeSubscriptions() {
  for (const channel of SUBSCRIPTIONS) {
    supabase.removeChannel(channel);
  }
  SUBSCRIPTIONS.length = 0;
}
