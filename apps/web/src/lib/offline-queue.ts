/**
 * Pluribus PWA Offline Evidence Queue (IndexedDB)
 * Allows field officers to capture geotagged CSR evidence in zero-connectivity rural zones.
 * Automatically synchronizes with the server when network connectivity is restored.
 */

const DB_NAME = "pluribus_offline_db";
const DB_VERSION = 1;
const STORE_NAME = "pending_evidence";

export interface QueuedEvidenceItem {
  id: string;
  url: string;
  hash: string;
  payload: any;
  timestamp: string;
  attempts: number;
}

export function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported on this platform."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Store a captured evidence item into IndexedDB for offline retention.
 */
export async function queueOfflineEvidence(item: {
  url: string;
  hash: string;
  payload: any;
}): Promise<QueuedEvidenceItem> {
  const db = await openOfflineDb();
  const queuedItem: QueuedEvidenceItem = {
    id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    url: item.url,
    hash: item.hash,
    payload: item.payload,
    timestamp: new Date().toISOString(),
    attempts: 0
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(queuedItem);

    req.onsuccess = () => resolve(queuedItem);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve all currently pending offline evidence items.
 */
export async function getQueuedEvidence(): Promise<QueuedEvidenceItem[]> {
  try {
    const db = await openOfflineDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Remove an item from IndexedDB after successful upload.
 */
export async function removeQueuedEvidence(id: string): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Synchronize all queued offline items with the server.
 */
export async function syncOfflineQueue(
  onProgress?: (synced: number, total: number, currentItem?: QueuedEvidenceItem) => void
): Promise<{ success: boolean; syncedCount: number; errors: any[] }> {
  const items = await getQueuedEvidence();
  if (items.length === 0) {
    return { success: true, syncedCount: 0, errors: [] };
  }

  let syncedCount = 0;
  const errors: any[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      if (onProgress) {
        onProgress(syncedCount, items.length, item);
      }

      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload)
      });

      if (!res.ok) {
        throw new Error(`Upload failed with HTTP status ${res.status}`);
      }

      // Success: remove from local IndexedDB
      await removeQueuedEvidence(item.id);
      syncedCount++;
    } catch (err: any) {
      console.error(`Sync error on item ${item.id}:`, err);
      errors.push({ id: item.id, error: err.message });
    }
  }

  if (onProgress) {
    onProgress(syncedCount, items.length);
  }

  return {
    success: errors.length === 0,
    syncedCount,
    errors
  };
}
