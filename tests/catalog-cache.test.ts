import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { beforeEach, describe } from "node:test";
import {
  DEFAULT_CACHE_TTL_MS,
  getCacheFilePath,
  loadCatalog,
  readPersistentCache,
  refreshCatalog,
  writePersistentCache,
} from "../bin/lib/catalog.js";

describe("DevShelf CLI Persistent Cache & Provenance Suite (D2)", () => {
  const tmpCacheDir = path.join(os.tmpdir(), `devshelf-test-cache-${Date.now()}`);
  const sampleCatalog = {
    totalCount: 3,
    milestone: "530+",
    updatedAt: "2026-10-16T12:00:00.000Z",
    resources: [
      { name: "Tool A", category: "CLI", description: "Sample Tool A" },
      { name: "Tool B", category: "API", description: "Sample Tool B" },
      { name: "Tool C", category: "AI", description: "Sample Tool C" },
    ],
  };

  beforeEach(() => {
    process.env.DEVSHELF_CACHE_DIR = tmpCacheDir;
  });

  test("getCacheFilePath returns path within DEVSHELF_CACHE_DIR", () => {
    const cacheFile = getCacheFilePath();
    assert.strictEqual(cacheFile, path.join(tmpCacheDir, "catalog.json"));
  });

  test("writePersistentCache writes formatted JSON and readPersistentCache retrieves it", () => {
    const success = writePersistentCache(sampleCatalog);
    assert.strictEqual(success, true);
    assert.strictEqual(fs.existsSync(getCacheFilePath()), true);

    const retrieved = readPersistentCache();
    assert.ok(retrieved !== null);
    assert.strictEqual(retrieved.totalCount, 3);
    assert.strictEqual(retrieved.resources.length, 3);
  });

  test("loadCatalog serves fresh persistent cache with 'cached' source", async () => {
    const cachedData = {
      ...sampleCatalog,
      fetchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    };
    writePersistentCache(cachedData);

    const catalog = await loadCatalog({ forceReload: true, offline: true });
    assert.strictEqual(catalog.catalogSource, "cached");
    assert.strictEqual(typeof catalog.cacheAgeHours, "number");
    assert.ok(catalog.cacheAgeHours >= 1.9 && catalog.cacheAgeHours <= 2.1);
  });

  test("loadCatalog fetches live catalog when persistent cache is expired", async () => {
    const expiredData = {
      ...sampleCatalog,
      fetchedAt: new Date(Date.now() - (DEFAULT_CACHE_TTL_MS + 10000)).toISOString(), // Expired
    };
    writePersistentCache(expiredData);

    let fetchCalled = false;
    const mockFetch = async () => {
      fetchCalled = true;
      return new Response(
        JSON.stringify({
          ...sampleCatalog,
          totalCount: 533,
          updatedAt: "2026-10-16T14:00:00.000Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const catalog = await loadCatalog({
      forceReload: true,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    assert.strictEqual(fetchCalled, true);
    assert.strictEqual(catalog.catalogSource, "live");
    assert.strictEqual(catalog.totalCount, 533);
  });

  test("loadCatalog falls back to stale cache if live network fetch fails", async () => {
    const staleData = {
      ...sampleCatalog,
      totalCount: 42,
      fetchedAt: new Date(Date.now() - (DEFAULT_CACHE_TTL_MS + 60000)).toISOString(),
    };
    writePersistentCache(staleData);

    const mockFetch = async () => {
      throw new Error("Network unreachable");
    };

    const catalog = await loadCatalog({
      forceReload: true,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    assert.strictEqual(catalog.catalogSource, "cached");
    assert.strictEqual(catalog.isStale, true);
    assert.strictEqual(catalog.totalCount, 42);
  });

  test("loadCatalog falls back to bundled site/data.json when no cache exists and offline", async () => {
    // Delete any cached file in tmp directory
    const cacheFile = getCacheFilePath();
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }

    const catalog = await loadCatalog({ forceReload: true, offline: true });
    assert.strictEqual(catalog.catalogSource, "bundled");
    assert.ok(catalog.totalCount >= 500);
    assert.ok(Array.isArray(catalog.resources));
  });

  test("refreshCatalog forces live fetch and updates persistent cache file", async () => {
    let liveFetched = false;
    const mockFetch = async () => {
      liveFetched = true;
      return new Response(
        JSON.stringify({
          ...sampleCatalog,
          totalCount: 999,
          updatedAt: "2026-10-16T15:00:00.000Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const result = await refreshCatalog({
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    assert.strictEqual(liveFetched, true);
    assert.strictEqual(result.catalogSource, "live");
    assert.strictEqual(result.totalCount, 999);

    const stored = readPersistentCache();
    assert.strictEqual(stored.totalCount, 999);
  });
});
