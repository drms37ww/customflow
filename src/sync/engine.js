import db from '../db/dexie';
import { isSupabaseConfigured } from '../config/supabase';
import { useSyncStore } from '../stores/syncStore';
import { pushChanges } from './push';
import { pullChanges } from './pull';

/**
 * Run a full sync cycle: pull remote changes, then push local changes.
 */
export async function syncAll() {
  if (!isSupabaseConfigured()) return;

  const store = useSyncStore.getState();
  if (store.isSyncing || !store.isOnline) return;

  store.setIsSyncing(true);
  store.setSyncError(null);

  try {
    // Get last sync time
    const meta = await db.syncMeta.get('lastSyncTime');
    const since = meta?.value || null;

    // Pull first, then push (reduces conflicts)
    await pullChanges(since);
    await pushChanges();

    // Update last sync time
    const now = new Date().toISOString();
    await db.syncMeta.put({ key: 'lastSyncTime', value: now });
    store.setLastSyncTime(now);

    // Update pending count
    const pending = await db.changeLog.count();
    store.setPendingChanges(pending);
  } catch (err) {
    console.error('Sync failed:', err);
    store.setSyncError(err.message);
  } finally {
    store.setIsSyncing(false);
  }
}

/**
 * Track a local change in the changeLog for later sync.
 * @param {string} table - Local table name
 * @param {string} recordId - Record ID
 * @param {string} operation - 'upsert' or 'delete'
 */
export async function trackChange(table, recordId, operation = 'upsert') {
  await db.changeLog.add({
    table,
    recordId,
    operation,
    timestamp: Date.now(),
  });

  const pending = await db.changeLog.count();
  useSyncStore.getState().setPendingChanges(pending);
}
