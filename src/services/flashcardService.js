import db from '../db/dexie';
import { generateId } from '../lib/ids';
import { trackChange } from '../sync/engine';
import { stampFields } from '../sync/conflict';
import { initCardState } from '../lib/fsrs';

// ============ FOLDERS ============

export async function getFolders(userId, parentId = null) {
  return db.flashcardFolders
    .where('userId').equals(userId)
    .filter((f) => !f.deletedAt && (parentId ? f.parentId === parentId : !f.parentId))
    .sortBy('sortOrder');
}

export async function getAllFolders(userId) {
  return db.flashcardFolders
    .where('userId').equals(userId)
    .filter((f) => !f.deletedAt)
    .sortBy('sortOrder');
}

export async function getFolder(id) {
  return db.flashcardFolders.get(id);
}

export async function createFolder(userId, { name, parentId = null }) {
  const siblings = await getFolders(userId, parentId);
  const now = new Date().toISOString();
  const folder = {
    id: generateId(),
    userId,
    parentId,
    name,
    sortOrder: siblings.length,
    fieldTimestamps: stampFields(['name', 'parentId', 'sortOrder']),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  await db.flashcardFolders.put(folder);
  await trackChange('flashcardFolders', folder.id);
  return folder;
}

export async function updateFolder(id, changes) {
  const existing = await db.flashcardFolders.get(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const updated = {
    ...existing,
    ...changes,
    fieldTimestamps: stampFields(Object.keys(changes), existing.fieldTimestamps),
    updatedAt: now,
  };
  await db.flashcardFolders.put(updated);
  await trackChange('flashcardFolders', id);
  return updated;
}

export async function deleteFolder(id) {
  const now = new Date().toISOString();
  // Recursively soft-delete children
  const children = await db.flashcardFolders.where('parentId').equals(id).toArray();
  for (const child of children) {
    await deleteFolder(child.id);
  }
  // Soft-delete decks in this folder
  const decks = await db.flashcardDecks.where('folderId').equals(id).toArray();
  for (const deck of decks) {
    await deleteDeck(deck.id);
  }
  const existing = await db.flashcardFolders.get(id);
  if (existing) {
    await db.flashcardFolders.put({ ...existing, deletedAt: now, updatedAt: now });
    await trackChange('flashcardFolders', id, 'delete');
  }
}

// ============ DECKS ============

export async function getDecks(userId, folderId) {
  return db.flashcardDecks
    .where('userId').equals(userId)
    .filter((d) => !d.deletedAt && d.folderId === folderId)
    .sortBy('sortOrder');
}

export async function getAllDecks(userId) {
  return db.flashcardDecks
    .where('userId').equals(userId)
    .filter((d) => !d.deletedAt)
    .sortBy('sortOrder');
}

export async function getStarredDecks(userId) {
  return db.flashcardDecks
    .where('userId').equals(userId)
    .filter((d) => !d.deletedAt && d.starred)
    .sortBy('sortOrder');
}

export async function getDeck(id) {
  return db.flashcardDecks.get(id);
}

export async function createDeck(userId, { name, folderId }) {
  const siblings = await getDecks(userId, folderId);
  const now = new Date().toISOString();
  const deck = {
    id: generateId(),
    userId,
    folderId,
    name,
    displayMode: 'front_first',
    starred: false,
    sortOrder: siblings.length,
    fieldTimestamps: stampFields(['name', 'folderId', 'displayMode', 'starred', 'sortOrder']),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  await db.flashcardDecks.put(deck);
  await trackChange('flashcardDecks', deck.id);
  return deck;
}

export async function updateDeck(id, changes) {
  const existing = await db.flashcardDecks.get(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const updated = {
    ...existing,
    ...changes,
    fieldTimestamps: stampFields(Object.keys(changes), existing.fieldTimestamps),
    updatedAt: now,
  };
  await db.flashcardDecks.put(updated);
  await trackChange('flashcardDecks', id);
  return updated;
}

export async function deleteDeck(id) {
  const now = new Date().toISOString();
  // Soft-delete all cards
  const cards = await db.flashcardCards.where('deckId').equals(id).toArray();
  for (const card of cards) {
    await db.flashcardCards.put({ ...card, deletedAt: now, updatedAt: now });
    await trackChange('flashcardCards', card.id, 'delete');
  }
  const existing = await db.flashcardDecks.get(id);
  if (existing) {
    await db.flashcardDecks.put({ ...existing, deletedAt: now, updatedAt: now });
    await trackChange('flashcardDecks', id, 'delete');
  }
}

// ============ CARDS ============

export async function getCards(deckId) {
  return db.flashcardCards
    .where('deckId').equals(deckId)
    .filter((c) => !c.deletedAt)
    .sortBy('sortOrder');
}

export async function getDueCards(deckId) {
  const now = new Date().toISOString();
  return db.flashcardCards
    .where('deckId').equals(deckId)
    .filter((c) => !c.deletedAt && (!c.fsrsDue || c.fsrsDue <= now))
    .toArray();
}

export async function getDueCardsForFolder(userId, folderId) {
  const now = new Date().toISOString();
  // Get all descendant deck IDs
  const deckIds = await getDescendantDeckIds(userId, folderId);
  return db.flashcardCards
    .where('deckId').anyOf(deckIds)
    .filter((c) => !c.deletedAt && (!c.fsrsDue || c.fsrsDue <= now))
    .toArray();
}

async function getDescendantDeckIds(userId, folderId) {
  const decks = await db.flashcardDecks
    .where('folderId').equals(folderId)
    .filter((d) => !d.deletedAt)
    .toArray();
  const deckIds = decks.map((d) => d.id);

  const subfolders = await db.flashcardFolders
    .where('parentId').equals(folderId)
    .filter((f) => !f.deletedAt)
    .toArray();

  for (const sub of subfolders) {
    const childIds = await getDescendantDeckIds(userId, sub.id);
    deckIds.push(...childIds);
  }
  return deckIds;
}

export async function getCard(id) {
  return db.flashcardCards.get(id);
}

export async function createCard(userId, { deckId, frontText = '', backText = '', frontImageId, backImageId }) {
  const siblings = await getCards(deckId);
  const now = new Date().toISOString();
  const card = {
    id: generateId(),
    userId,
    deckId,
    frontText,
    backText,
    frontImageId: frontImageId || null,
    backImageId: backImageId || null,
    sortOrder: siblings.length,
    ...initCardState(),
    fieldTimestamps: stampFields([
      'frontText', 'backText', 'frontImageId', 'backImageId', 'sortOrder',
      'fsrsState', 'fsrsStability', 'fsrsDifficulty', 'fsrsDue',
    ]),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  await db.flashcardCards.put(card);
  await trackChange('flashcardCards', card.id);
  return card;
}

export async function updateCard(id, changes) {
  const existing = await db.flashcardCards.get(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const updated = {
    ...existing,
    ...changes,
    fieldTimestamps: stampFields(Object.keys(changes), existing.fieldTimestamps),
    updatedAt: now,
  };
  await db.flashcardCards.put(updated);
  await trackChange('flashcardCards', id);
  return updated;
}

export async function deleteCard(id) {
  const now = new Date().toISOString();
  const existing = await db.flashcardCards.get(id);
  if (existing) {
    await db.flashcardCards.put({ ...existing, deletedAt: now, updatedAt: now });
    await trackChange('flashcardCards', id, 'delete');
  }
}
