import fs from "node:fs";
import path from "node:path";
import { getAlternativeTo, getDockerCompose } from "./catalog-enrichment.js";

export const SHELF_ORDER = [
  { file: "ai-tools.json", type: "ai", section: "AI Agents & Local LLMs", countKey: "aiTools" },
  { file: "cli-tools.json", type: "cli", section: "CLI & Productivity Tools", countKey: "cliTools" },
  { file: "testing-qa.json", type: "testing", section: "Testing & QA Reliability", countKey: "testingQa" },
  { file: "apis.json", type: "api", section: "Free & Public APIs", countKey: "apis" },
  { file: "free-cloud.json", type: "cloud", section: "Free Cloud & Developer Tiers", countKey: "freeCloud" },
  { file: "perks.json", type: "perks", section: "Developer Discounts & Startup Perks", countKey: "perks" },
  { file: "boilerplates.json", type: "boilerplate", section: "One-Click Deployment Boilerplates", countKey: "boilerplates" },
  { file: "contributors-wanted.json", type: "contributors", section: "Contributors Wanted", countKey: "contributors" },
];

/**
 * Single canonical catalog assembly function
 * Reads raw shelf JSON files, attaches type and section, enriches with alternatives/docker,
 * and calculates all category counts and facets.
 *
 * @param {string} shelfDir - Path to shelf directory
 * @returns {{
 *   updatedAt: string,
 *   totalCount: number,
 *   reposCount: number,
 *   facets: { repos: number },
 *   counts: Record<string, number>,
 *   resources: Array<any>
 * }}
 */
export function assembleCatalogFromShelf(shelfDir) {
  const counts = {};
  const rawResources = [];

  for (const cfg of SHELF_ORDER) {
    const fullPath = path.join(shelfDir, cfg.file);
    let items = [];
    if (fs.existsSync(fullPath)) {
      const raw = fs.readFileSync(fullPath, "utf8");
      items = JSON.parse(raw.replace(/^\uFEFF/, ""));
    }
    counts[cfg.countKey] = items.length;

    for (const item of items) {
      rawResources.push({
        ...item,
        type: cfg.type,
        section: cfg.section,
      });
    }
  }

  const allResources = rawResources.map((item) => {
    const alternativeTo = getAlternativeTo(item.name);
    const dockerCompose = getDockerCompose(item.name);
    return {
      ...item,
      ...(alternativeTo ? { alternativeTo } : {}),
      ...(dockerCompose ? { dockerCompose } : {}),
    };
  });

  const reposCount = allResources.filter((r) => Boolean(r.repo)).length;

  return {
    updatedAt: new Date().toISOString(),
    totalCount: allResources.length,
    reposCount,
    facets: {
      repos: reposCount,
    },
    counts,
    resources: allResources,
  };
}
