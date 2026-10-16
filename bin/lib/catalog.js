import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { assembleCatalogFromShelf } from "./catalog-assembler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedCatalog = null;

export const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getMilestone(totalCount) {
  const count = Number(totalCount) || 530;
  return `${Math.floor(count / 10) * 10}+`;
}

/**
 * Resolve cross-platform cache directory for DevShelf
 * @returns {string}
 */
export function getCacheDir() {
  if (process.env.DEVSHELF_CACHE_DIR) {
    return process.env.DEVSHELF_CACHE_DIR;
  }
  if (process.env.XDG_CACHE_HOME) {
    return path.join(process.env.XDG_CACHE_HOME, "devshelf");
  }
  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
    return path.join(localAppData, "devshelf");
  }
  return path.join(os.homedir(), ".cache", "devshelf");
}

/**
 * Resolve full path to cached catalog JSON file
 * @returns {string}
 */
export function getCacheFilePath() {
  return path.join(getCacheDir(), "catalog.json");
}

/**
 * Read catalog from persistent local disk cache
 * @returns {any | null}
 */
export function readPersistentCache() {
  const cacheFile = getCacheFilePath();
  if (!fs.existsSync(cacheFile)) return null;
  try {
    const raw = fs.readFileSync(cacheFile, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.resources)) {
      return parsed;
    }
  } catch {
    // Ignore corrupt cache file
  }
  return null;
}

/**
 * Write catalog data to persistent local disk cache
 * @param {any} catalogData
 * @returns {boolean}
 */
export function writePersistentCache(catalogData) {
  try {
    const cacheDir = getCacheDir();
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    const cacheFile = getCacheFilePath();
    fs.writeFileSync(cacheFile, JSON.stringify(catalogData, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch catalog from remote production CDN endpoint
 * @param {number} [timeoutMs=4000]
 * @param {typeof fetch} [fetchFn=fetch]
 * @returns {Promise<any>}
 */
export async function fetchLiveCatalog(timeoutMs = 4000, fetchFn = fetch) {
  const res = await fetchFn("https://devshelf.ritualdev.in/data.json", {
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch live catalog: HTTP ${res.status} ${res.statusText || ""}`.trim(),
    );
  }

  const data = await res.json();
  if (!data || typeof data !== "object" || !Array.isArray(data.resources)) {
    throw new Error("Invalid catalog payload format received from remote CDN");
  }

  const now = new Date().toISOString();
  data.catalogSource = "live";
  data.catalogTimestamp = data.updatedAt || now;
  data.fetchedAt = now;
  data.cacheAgeHours = 0;
  data.milestone = getMilestone(data.totalCount || data.resources.length);
  return data;
}

/**
 * Explicitly refresh local persistent cache from live CDN
 * @param {{ timeoutMs?: number, fetchFn?: typeof fetch }} [options]
 * @returns {Promise<any>}
 */
export async function refreshCatalog(options = {}) {
  const data = await fetchLiveCatalog(options.timeoutMs || 8000, options.fetchFn || fetch);
  writePersistentCache(data);
  cachedCatalog = data;
  return data;
}

/**
 * Load DevShelf catalog data via multi-tier caching & fallback hierarchy:
 * 1. In-memory cache
 * 2. Persistent on-disk cache (if fresh, TTL 24h)
 * 3. Live remote CDN fetch (auto-cached to disk)
 * 4. Stale on-disk cache (stale-while-revalidate / offline recovery)
 * 5. Bundled site/data.json (distributed package offline fallback)
 * 6. Local source directory shelf/*.json
 *
 * @param {{
 *   forceReload?: boolean,
 *   refresh?: boolean,
 *   forceRemote?: boolean,
 *   maxAgeMs?: number,
 *   offline?: boolean,
 *   fetchFn?: typeof fetch
 * }} [options]
 * @returns {Promise<{
 *   totalCount: number,
 *   milestone: string,
 *   resources: Array<any>,
 *   catalogSource: "live" | "cached" | "bundled" | "source",
 *   catalogTimestamp: string,
 *   cacheAgeHours?: number,
 *   isStale?: boolean,
 *   reposCount?: number,
 *   counts?: Record<string, number>
 * }>}
 */
export async function loadCatalog(options = {}) {
  if (cachedCatalog && !options.forceReload && !options.refresh) {
    return cachedCatalog;
  }

  // Explicit refresh requested
  if (options.refresh || options.forceRemote) {
    return refreshCatalog(options);
  }

  const ttl = typeof options.maxAgeMs === "number" ? options.maxAgeMs : DEFAULT_CACHE_TTL_MS;
  const now = Date.now();

  // Tier 1: Fresh Persistent Local Disk Cache
  const persistent = readPersistentCache();
  if (persistent) {
    const fetchedTime = persistent.fetchedAt ? new Date(persistent.fetchedAt).getTime() : 0;
    const isFresh = fetchedTime > 0 && now - fetchedTime < ttl;

    if (isFresh && !options.forceReload) {
      persistent.catalogSource = "cached";
      persistent.cacheAgeHours = Math.round(((now - fetchedTime) / (1000 * 60 * 60)) * 10) / 10;
      persistent.milestone = getMilestone(persistent.totalCount || persistent.resources.length);
      cachedCatalog = persistent;
      return cachedCatalog;
    }
  }

  // Tier 2: Live Remote CDN Fetch (if online)
  if (!options.offline) {
    try {
      const liveData = await fetchLiveCatalog(4000, options.fetchFn || fetch);
      writePersistentCache(liveData);
      cachedCatalog = liveData;
      return cachedCatalog;
    } catch {
      // Remote fetch failed — proceed to offline fallbacks
    }
  }

  // Tier 3: Stale Persistent Local Disk Cache
  if (persistent) {
    const fetchedTime = persistent.fetchedAt ? new Date(persistent.fetchedAt).getTime() : 0;
    persistent.catalogSource = "cached";
    persistent.isStale = true;
    persistent.cacheAgeHours =
      fetchedTime > 0 ? Math.round(((now - fetchedTime) / (1000 * 60 * 60)) * 10) / 10 : undefined;
    persistent.milestone = getMilestone(persistent.totalCount || persistent.resources.length);
    cachedCatalog = persistent;
    return cachedCatalog;
  }

  // Tier 4: Bundled site/data.json
  const localDataPath = path.join(__dirname, "..", "..", "site", "data.json");
  if (fs.existsSync(localDataPath)) {
    try {
      const raw = fs.readFileSync(localDataPath, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.resources)) {
        parsed.catalogSource = "bundled";
        parsed.catalogTimestamp = parsed.updatedAt || new Date().toISOString();
        parsed.milestone = getMilestone(parsed.totalCount || parsed.resources.length);
        cachedCatalog = parsed;
        return cachedCatalog;
      }
    } catch {
      // Fall through to shelf/*.json
    }
  }

  // Tier 5: Source directory shelf/*.json
  const shelfDir = path.join(__dirname, "..", "..", "shelf");
  if (fs.existsSync(shelfDir)) {
    const payload = assembleCatalogFromShelf(shelfDir);
    payload.catalogSource = "source";
    payload.catalogTimestamp = payload.updatedAt;
    payload.milestone = getMilestone(payload.totalCount);
    cachedCatalog = payload;
    return cachedCatalog;
  }

  throw new Error("Could not load DevShelf catalog data locally, remotely, or from shelf/*.json");
}

/**
 * Extract canonical target URL for a resource
 * @param {any} item
 * @returns {string}
 */
export function getResourceUrl(item) {
  if (!item || typeof item !== "object") return "";
  return item.url || item.repo || item.deployUrl || "";
}

/**
 * Filter catalog resources with complete field matching
 * Covers name, description, category, language, alternativeTo, auth, freeTier, and statusTags.
 *
 * @param {Array<any>} resources
 * @param {string} query
 * @returns {Array<any>}
 */
export function searchCatalog(resources, query) {
  if (!Array.isArray(resources) || !query) return [];
  const q = String(query).toLowerCase().trim();
  if (!q) return [];

  return resources.filter((item) => {
    const searchTarget = [
      item.name,
      item.description,
      item.category,
      item.section,
      item.type,
      item.language,
      item.alternativeTo,
      item.auth,
      item.freeTier,
      item.license,
      ...(Array.isArray(item.statusTags) ? item.statusTags : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchTarget.includes(q);
  });
}
