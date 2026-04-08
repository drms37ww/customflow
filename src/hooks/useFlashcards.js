import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/dexie';
import { useAuthStore } from '../stores/authStore';

export function useFolders(parentId = null) {
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  return useLiveQuery(
    () => db.flashcardFolders
      .where('userId').equals(userId)
      .filter((f) => !f.deletedAt && (parentId ? f.parentId === parentId : !f.parentId))
      .sortBy('sortOrder'),
    [userId, parentId],
    []
  );
}

export function useAllFolders() {
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  return useLiveQuery(
    () => db.flashcardFolders
      .where('userId').equals(userId)
      .filter((f) => !f.deletedAt)
      .sortBy('sortOrder'),
    [userId],
    []
  );
}

export function useDecks(folderId) {
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  return useLiveQuery(
    () => folderId
      ? db.flashcardDecks
          .where('userId').equals(userId)
          .filter((d) => !d.deletedAt && d.folderId === folderId)
          .sortBy('sortOrder')
      : Promise.resolve([]),
    [userId, folderId],
    []
  );
}

export function useAllDecks() {
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  return useLiveQuery(
    () => db.flashcardDecks
      .where('userId').equals(userId)
      .filter((d) => !d.deletedAt)
      .sortBy('sortOrder'),
    [userId],
    []
  );
}

export function useStarredDecks() {
  const userId = useAuthStore((s) => s.user?.id) || 'local';
  return useLiveQuery(
    () => db.flashcardDecks
      .where('userId').equals(userId)
      .filter((d) => !d.deletedAt && d.starred)
      .sortBy('sortOrder'),
    [userId],
    []
  );
}

export function useCards(deckId) {
  return useLiveQuery(
    () => deckId
      ? db.flashcardCards
          .where('deckId').equals(deckId)
          .filter((c) => !c.deletedAt)
          .sortBy('sortOrder')
      : Promise.resolve([]),
    [deckId],
    []
  );
}

export function useDueCards(deckId) {
  const now = new Date().toISOString();
  return useLiveQuery(
    () => deckId
      ? db.flashcardCards
          .where('deckId').equals(deckId)
          .filter((c) => !c.deletedAt && (!c.fsrsDue || c.fsrsDue <= now))
          .toArray()
      : Promise.resolve([]),
    [deckId],
    []
  );
}
