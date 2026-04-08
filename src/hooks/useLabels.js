import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/dexie';
import { useAuthStore } from '../stores/authStore';

export function useLabels() {
  const userId = useAuthStore((s) => s.user?.id) || 'local';

  const labels = useLiveQuery(
    () =>
      db.labels
        .where('userId')
        .equals(userId)
        .filter((l) => !l.deletedAt)
        .sortBy('sortOrder'),
    [userId],
    []
  );

  return labels;
}
