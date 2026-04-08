import db from '../db/dexie';
import { generateId } from '../lib/ids';
import { trackChange } from '../sync/engine';
import { stampFields } from '../sync/conflict';

export async function getReminders(targetType, targetId) {
  return db.reminders
    .where('targetId').equals(targetId)
    .filter((r) => !r.deletedAt && r.targetType === targetType)
    .toArray();
}

export async function createReminder(userId, { targetType, targetId, reminderType, offsetMinutes, exactDatetime, channels }) {
  const now = new Date().toISOString();
  const reminder = {
    id: generateId(),
    userId,
    targetType,
    targetId,
    reminderType,
    offsetMinutes: offsetMinutes || null,
    exactDatetime: exactDatetime || null,
    channels: channels || ['push', 'email'],
    fired: false,
    fieldTimestamps: stampFields(['reminderType', 'offsetMinutes', 'exactDatetime', 'channels', 'fired']),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  await db.reminders.put(reminder);
  await trackChange('reminders', reminder.id);
  return reminder;
}

export async function deleteReminder(id) {
  const now = new Date().toISOString();
  const existing = await db.reminders.get(id);
  if (existing) {
    await db.reminders.put({ ...existing, deletedAt: now, updatedAt: now });
    await trackChange('reminders', id, 'delete');
  }
}

export async function markFired(id) {
  const existing = await db.reminders.get(id);
  if (existing) {
    const now = new Date().toISOString();
    await db.reminders.put({
      ...existing,
      fired: true,
      updatedAt: now,
      fieldTimestamps: stampFields(['fired'], existing.fieldTimestamps),
    });
    await trackChange('reminders', id);
  }
}
