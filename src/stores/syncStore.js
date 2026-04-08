import { create } from 'zustand';

export const useSyncStore = create((set) => ({
  isSyncing: false,
  lastSyncTime: null,
  pendingChanges: 0,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncError: null,

  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
  setPendingChanges: (pendingChanges) => set({ pendingChanges }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setSyncError: (syncError) => set({ syncError }),
}));
