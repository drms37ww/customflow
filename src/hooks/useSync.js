import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { startRealtimeSubscriptions, stopRealtimeSubscriptions } from '../sync/realtime';
import { startPeriodicSync, stopPeriodicSync } from '../sync/periodic';
import { syncAll } from '../sync/engine';

export function useSync() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user?.id) return;

    // Initial sync
    syncAll();

    // Start realtime + periodic
    startRealtimeSubscriptions(user.id);
    startPeriodicSync();

    return () => {
      stopRealtimeSubscriptions();
      stopPeriodicSync();
    };
  }, [user?.id]);
}
