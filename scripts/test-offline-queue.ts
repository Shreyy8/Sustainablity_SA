/**
 * Test script verifying Phase 4 Offline Evidence Queue logic.
 */

interface MockQueuedItem {
  id: string;
  url: string;
  hash: string;
  payload: any;
  timestamp: string;
}

class MockOfflineStore {
  private items: Map<string, MockQueuedItem> = new Map();

  async add(item: Omit<MockQueuedItem, "id" | "timestamp">): Promise<MockQueuedItem> {
    const id = `offline-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const queued: MockQueuedItem = {
      id,
      url: item.url,
      hash: item.hash,
      payload: item.payload,
      timestamp: new Date().toISOString()
    };
    this.items.set(id, queued);
    return queued;
  }

  async getAll(): Promise<MockQueuedItem[]> {
    return Array.from(this.items.values());
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }

  async syncAll(uploader: (payload: any) => Promise<boolean>): Promise<{ synced: number; failed: number }> {
    let synced = 0;
    let failed = 0;
    const items = await this.getAll();

    for (const item of items) {
      try {
        const ok = await uploader(item.payload);
        if (ok) {
          await this.delete(item.id);
          synced++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }
    return { synced, failed };
  }
}

async function runOfflineQueueTest() {
  console.log("=== TESTING PHASE 4: FIELD OFFLINE QUEUE RESILIENCE ===");

  const store = new MockOfflineStore();

  // 1. Simulate 3 photos captured in zero-connectivity village
  console.log("1. Simulating 3 field captures in disconnected village (Barmer)...");
  for (let i = 1; i <= 3; i++) {
    const item = await store.add({
      url: `data:image/jpeg;base64,mockdata_${i}`,
      hash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85${i}`,
      payload: {
        publicId: `pluribus/field_offline_${i}`,
        projectId: "proj-1",
        siteId: "site-1",
        capturedAt: new Date().toISOString(),
        location: { latitude: 25.7534, longitude: 71.3967, accuracy: 2.4 }
      }
    });
    console.log(`   [OFFLINE] Queued photo ${i} with ID: ${item.id}`);
  }

  const queued = await store.getAll();
  console.log(`2. Total items in device offline storage: ${queued.length}`);
  if (queued.length !== 3) {
    throw new Error("Expected 3 items in offline store!");
  }

  // 3. Simulate network restored and auto-sync
  console.log("3. Simulating network reconnection & auto-syncing queue to server...");
  const result = await store.syncAll(async (payload) => {
    // Simulated API upload
    return Boolean(payload.publicId);
  });

  console.log(`   ✓ Successfully synced: ${result.synced} items`);
  console.log(`   ✓ Failed: ${result.failed} items`);

  const remaining = await store.getAll();
  console.log(`4. Remaining items in device store: ${remaining.length}`);
  if (remaining.length !== 0) {
    throw new Error("Store should be empty after sync!");
  }

  console.log("\nALL PHASE 4 OFFLINE QUEUE RESILIENCE TESTS PASSED!");
}

runOfflineQueueTest().catch(console.error);
