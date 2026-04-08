import { useSyncStore } from '../../stores/syncStore';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import './SyncIndicator.css';

export default function SyncIndicator() {
  const { isSyncing, isOnline, pendingChanges } = useSyncStore();

  if (!isOnline) {
    return (
      <div className="sync-indicator sync-indicator--offline" title="Offline">
        <CloudOff size={14} />
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="sync-indicator sync-indicator--syncing" title="Syncing...">
        <RefreshCw size={14} className="sync-spin" />
      </div>
    );
  }

  if (pendingChanges > 0) {
    return (
      <div className="sync-indicator sync-indicator--pending" title={`${pendingChanges} pending`}>
        <Cloud size={14} />
        <span className="sync-badge">{pendingChanges}</span>
      </div>
    );
  }

  return null;
}
