import { syncAll } from './engine';

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
let intervalId = null;

/**
 * Start periodic sync (every 5 minutes).
 * Also syncs on visibility change (tab focus) and online event.
 */
export function startPeriodicSync() {
  stopPeriodicSync();

  intervalId = setInterval(() => {
    syncAll();
  }, SYNC_INTERVAL);

  // Sync when tab becomes visible
  document.addEventListener('visibilitychange', handleVisibility);

  // Sync when coming back online
  window.addEventListener('online', handleOnline);
}

export function stopPeriodicSync() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  document.removeEventListener('visibilitychange', handleVisibility);
  window.removeEventListener('online', handleOnline);
}

function handleVisibility() {
  if (document.visibilityState === 'visible') {
    syncAll();
  }
}

function handleOnline() {
  syncAll();
}
