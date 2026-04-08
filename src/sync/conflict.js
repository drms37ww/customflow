/**
 * Field-level last-write-wins merge.
 * Compares field_timestamps per field and keeps the newer value.
 *
 * @param {Object} local - Local record from IndexedDB
 * @param {Object} remote - Remote record from Supabase
 * @returns {Object} Merged record
 */
export function mergeRecords(local, remote) {
  if (!local) return remote;
  if (!remote) return local;

  const localTs = local.fieldTimestamps || local.field_timestamps || {};
  const remoteTs = remote.fieldTimestamps || remote.field_timestamps || {};
  const merged = { ...local };
  const mergedTs = { ...localTs };

  // Get all fields that could differ (exclude meta fields)
  const metaFields = new Set([
    'id', 'userId', 'user_id', 'createdAt', 'created_at',
    'fieldTimestamps', 'field_timestamps', 'localId',
  ]);

  const allFields = new Set([
    ...Object.keys(local),
    ...Object.keys(remote),
  ]);

  for (const field of allFields) {
    if (metaFields.has(field)) continue;

    const localTime = localTs[field] ? new Date(localTs[field]).getTime() : 0;
    const remoteTime = remoteTs[field] ? new Date(remoteTs[field]).getTime() : 0;

    if (remoteTime > localTime) {
      merged[field] = remote[field];
      mergedTs[field] = remoteTs[field];
    }
    // If local is newer or equal, keep local (already in merged)
  }

  merged.fieldTimestamps = mergedTs;
  // Keep the later updatedAt
  const localUpdated = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
  const remoteUpdated = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
  merged.updatedAt = remoteUpdated > localUpdated ? remote.updatedAt : local.updatedAt;

  return merged;
}

/**
 * Create field_timestamps for a set of changed fields.
 * @param {string[]} fields - Names of fields that changed
 * @param {Object} existing - Existing field_timestamps
 * @returns {Object} Updated field_timestamps
 */
export function stampFields(fields, existing = {}) {
  const now = new Date().toISOString();
  const updated = { ...existing };
  for (const field of fields) {
    updated[field] = now;
  }
  return updated;
}
