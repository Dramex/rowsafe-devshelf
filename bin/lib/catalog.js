import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedCatalog = null;

export function getMilestone(totalCount) {
  const count = Number(totalCount) || 530;
  return `${Math.floor(count / 10) * 10}+`;
}

/**
 * Load DevShelf catalog data via 3-tier fallback strategy:
 * 1. Local pre-built site/data.json
 * 2. Remote CDN fallback (https://devshelf.ritualdev.in/data.json)
 * 3. Assembly from shelf/*.json source files
 *
 * @param {{ forceReload?: boolean }} [options]
 * @returns {Promise<{ totalCount: number, milestone: string, resources: Array<any>, reposCount?: number, counts?: Record<string, number> }>}
 */
export async function loadCatalog(options = {}) {
  if (cachedCatalog && !options.forceReload) {
    return cachedCatalog;
  }

  // Tier 1: Local site/data.json
  const localDataPath = path.join(__dirname, "..", "..", "site", "data.json");
  if (fs.existsSync(localDataPath)) {
    try {
      const raw = fs.readFileSync(localDataPath, "utf8");
      cachedCatalog = JSON.parse(raw);
      if (cachedCatalog) {
        cachedCatalog.milestone = getMilestone(cachedCatalog.totalCount);
        return cachedCatalog;
      }
    } catch {
      // Fall through to remote
    }
  }

  // Tier 2: Remote CDN fallback for npx / global execution
  try {
    const res = await fetch("https://devshelf.ritualdev.in/data.json", {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      cachedCatalog = await res.json();
      if (cachedCatalog) {
        cachedCatalog.milestone = getMilestone(cachedCatalog.totalCount);
        return cachedCatalog;
      }
    }
  } catch {
    // Remote failed
  }

  // Tier 3: Assemble from shelf/*.json source directory
  const shelfDir = path.join(__dirname, "..", "..", "shelf");
  if (fs.existsSync(shelfDir)) {
    const resources = [];
    const files = fs.readdirSync(shelfDir);
    for (const f of files) {
      if (f.endsWith(".json")) {
        const raw = fs.readFileSync(path.join(shelfDir, f), "utf8");
        const items = JSON.parse(raw.replace(/^\uFEFF/, ""));
        resources.push(...items);
      }
    }
    cachedCatalog = {
      totalCount: resources.length,
      milestone: getMilestone(resources.length),
      resources,
    };
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
