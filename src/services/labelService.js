import db from '../db/dexie';
import { generateId } from '../lib/ids';
import { trackChange } from '../sync/engine';
import { stampFields } from '../sync/conflict';

/**
 * Get all active labels for current user, sorted by sortOrder.
 */
export async function getLabels(userId) {
  return db.labels
    .where('userId').equals(userId)
    .filter((l) => !l.deletedAt)
    .sortBy('sortOrder');
}

/**
 * Create a new label.
 */
export async function createLabel(userId, { name, color }) {
  const count = await db.labels.where('userId').equals(userId).count();
  const now = new Date().toISOString();
  const label = {
    id: generateId(),
    userId,
    name,
    color: color || '#185fa5',
    sortOrder: count,
    fieldTimestamps: stampFields(['name', 'color', 'sortOrder']),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.labels.put(label);
  await trackChange('labels', label.id);
  return label;
}

/**
 * Update a label.
 */
export async function updateLabel(id, changes) {
  const existing = await db.labels.get(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const changedFields = Object.keys(changes);
  const updated = {
    ...existing,
    ...changes,
    fieldTimestamps: stampFields(changedFields, existing.fieldTimestamps),
    updatedAt: now,
  };

  await db.labels.put(updated);
  await trackChange('labels', id);
  return updated;
}

/**
 * Soft-delete a label.
 */
export async function deleteLabel(id) {
  const existing = await db.labels.get(id);
  if (!existing) return;

  const now = new Date().toISOString();
  await db.labels.put({
    ...existing,
    deletedAt: now,
    updatedAt: now,
    fieldTimestamps: stampFields(['deletedAt'], existing.fieldTimestamps),
  });
  await trackChange('labels', id, 'delete');
}

/**
 * Reorder labels by providing the full ordered list of IDs.
 */
export async function reorderLabels(orderedIds) {
  const now = new Date().toISOString();
  await db.transaction('rw', db.labels, db.changeLog, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      const label = await db.labels.get(orderedIds[i]);
      if (label) {
        label.sortOrder = i;
        label.updatedAt = now;
        label.fieldTimestamps = stampFields(['sortOrder'], label.fieldTimestamps);
        await db.labels.put(label);
        await db.changeLog.add({
          table: 'labels',
          recordId: label.id,
          operation: 'upsert',
          timestamp: Date.now(),
        });
      }
    }
  });
}
