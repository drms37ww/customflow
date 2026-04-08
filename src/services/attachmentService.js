import db from '../db/dexie';
import { generateId } from '../lib/ids';

/**
 * Save an attachment (image or file) to IndexedDB.
 * @param {string} userId
 * @param {string} targetType - 'card_front' | 'card_back' | 'todo'
 * @param {string} targetId - ID of the card or todo
 * @param {File} file - The file to store
 * @returns {Object} The attachment record (with id)
 */
export async function saveAttachment(userId, targetType, targetId, file) {
  const arrayBuffer = await file.arrayBuffer();
  const attachment = {
    id: generateId(),
    userId,
    targetType,
    targetId,
    filename: file.name,
    mimeType: file.type,
    blob: arrayBuffer,
    createdAt: new Date().toISOString(),
  };
  await db.attachments.put(attachment);
  return attachment;
}

/**
 * Get an attachment by ID.
 */
export async function getAttachment(id) {
  return db.attachments.get(id);
}

/**
 * Get a blob URL for an attachment.
 */
export async function getAttachmentUrl(id) {
  const attachment = await db.attachments.get(id);
  if (!attachment) return null;
  const blob = new Blob([attachment.blob], { type: attachment.mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Get all attachments for a target.
 */
export async function getAttachmentsForTarget(targetType, targetId) {
  return db.attachments
    .where('[targetType+targetId]')
    .equals([targetType, targetId])
    .toArray();
}

/**
 * Delete an attachment.
 */
export async function deleteAttachment(id) {
  await db.attachments.delete(id);
}

/**
 * Delete all attachments for a target.
 */
export async function deleteAttachmentsForTarget(targetType, targetId) {
  const attachments = await db.attachments
    .where('targetType').equals(targetType)
    .filter((a) => a.targetId === targetId)
    .toArray();
  const ids = attachments.map((a) => a.id);
  await db.attachments.bulkDelete(ids);
}
