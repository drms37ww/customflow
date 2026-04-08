import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import db from '../db/dexie';
import { mergeRecords } from './conflict';
import { format } from 'date-fns';

const DATA_TABLES = [
  'labels', 'flashcardFolders', 'flashcardDecks', 'flashcardDeckLabels',
  'flashcardCards', 'todos', 'todoLabels', 'todoTabs',
  'calendarEvents', 'calendarEventLabels', 'reminders',
];

/**
 * Export all user data as a ZIP file.
 */
export async function exportData(userId) {
  const zip = new JSZip();
  const dataFolder = zip.folder('data');
  const attachFolder = zip.folder('attachments');

  // Manifest
  zip.file('manifest.json', JSON.stringify({
    version: '1.0',
    exportDate: new Date().toISOString(),
    userId,
  }, null, 2));

  // Data tables
  for (const table of DATA_TABLES) {
    const records = await db[table]
      .where('userId').equals(userId)
      .toArray();
    dataFolder.file(`${table}.json`, JSON.stringify(records, null, 2));
  }

  // Attachments
  const attachments = await db.attachments
    .where('userId').equals(userId)
    .toArray();

  for (const att of attachments) {
    const ext = att.mimeType?.split('/')[1] || 'bin';
    attachFolder.file(`${att.id}.${ext}`, att.blob);
    // Store metadata without blob
    const { blob, ...meta } = att;
    attachFolder.file(`${att.id}.meta.json`, JSON.stringify(meta));
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const filename = `customflow-export-${format(new Date(), 'yyyy-MM-dd')}.zip`;
  saveAs(content, filename);
}

/**
 * Import data from a ZIP file.
 */
export async function importData(file, userId) {
  const zip = await JSZip.loadAsync(file);

  // Read manifest
  const manifestStr = await zip.file('manifest.json')?.async('string');
  if (!manifestStr) throw new Error('Invalid export file: missing manifest');

  // Import data tables
  for (const table of DATA_TABLES) {
    const dataFile = zip.file(`data/${table}.json`);
    if (!dataFile) continue;

    const records = JSON.parse(await dataFile.async('string'));

    for (const record of records) {
      // Override userId to current user
      record.userId = userId;

      const existing = await db[table].get(record.id);
      if (existing) {
        // Field-level merge
        const merged = mergeRecords(existing, record);
        await db[table].put(merged);
      } else {
        await db[table].put(record);
      }
    }
  }

  // Import attachments
  const attachFolder = zip.folder('attachments');
  if (attachFolder) {
    const metaFiles = [];
    attachFolder.forEach((path, file) => {
      if (path.endsWith('.meta.json')) {
        metaFiles.push(file);
      }
    });

    for (const metaFile of metaFiles) {
      const meta = JSON.parse(await metaFile.async('string'));
      meta.userId = userId;

      const ext = meta.mimeType?.split('/')[1] || 'bin';
      const blobFile = attachFolder.file(`${meta.id}.${ext}`);
      if (blobFile) {
        const blob = await blobFile.async('arraybuffer');
        await db.attachments.put({ ...meta, blob });
      }
    }
  }
}
