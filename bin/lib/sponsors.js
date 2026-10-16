import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_SPONSORS_DATA = {
  version: "1.0.0",
  updatedAt: "2026-10-16T16:00:00.000Z",
  stats: {
    totalPatrons: 6,
    totalContributedUSD: 600,
    totalContributedINR: 50200,
    goldCount: 3,
    silverCount: 2,
    bronzeCount: 1,
  },
  patrons: [
    {
      id: "patron-1",
      rank: 1,
      name: "RitualDev Core Team",
      github: "RitualDev-Lab",
      avatar: "https://github.com/RitualDev-Lab.png",
      url: "https://github.com/RitualDev-Lab",
      amountUSD: 250,
      amountINR: 21000,
      tier: "gold",
      date: "2026-10-15",
      comment:
        "Foundational grant to maintain zero-paywall API indexing, test pipelines, and continuous security audits.",
      badgeUrl: "https://devshelf.ritualdev.in/api/v1/badges/gold.svg",
    },
    {
      id: "patron-2",
      rank: 2,
      name: "Dramex",
      github: "Dramex",
      avatar: "https://github.com/Dramex.png",
      url: "https://github.com/Dramex",
      amountUSD: 150,
      amountINR: 12500,
      tier: "gold",
      date: "2026-10-14",
      comment:
        "Supporting open developer tools and secure AI CLI integrations like RowSafe! Keep innovating.",
      badgeUrl: "https://devshelf.ritualdev.in/api/v1/badges/gold.svg",
    },
    {
      id: "patron-3",
      rank: 3,
      name: "Sergiu Pogor",
      github: "SergiuPogor",
      avatar: "https://github.com/SergiuPogor.png",
      url: "https://github.com/SergiuPogor",
      amountUSD: 100,
      amountINR: 8400,
      tier: "gold",
      date: "2026-10-15",
      comment:
        "Excited to contribute CurlShot to DevShelf. Transparency and free-tier clarity are key.",
      badgeUrl: "https://devshelf.ritualdev.in/api/v1/badges/gold.svg",
    },
    {
      id: "patron-4",
      rank: 4,
      name: "Alox1d",
      github: "Alox1d",
      avatar: "https://github.com/Alox1d.png",
      url: "https://github.com/Alox1d",
      amountUSD: 50,
      amountINR: 4200,
      tier: "silver",
      date: "2026-10-12",
      comment:
        "DevShelf is hands-down the best directory without annoying trial credit card traps.",
      badgeUrl: "https://devshelf.ritualdev.in/api/v1/badges/silver.svg",
    },
    {
      id: "patron-5",
      rank: 5,
      name: "Eigenwise",
      github: "Eigenwise",
      avatar: "https://github.com/Eigenwise.png",
      url: "https://github.com/Eigenwise",
      amountUSD: 35,
      amountINR: 2900,
      tier: "silver",
      date: "2026-10-10",
      comment: "Toolshed maintainers are happy to stand behind this ecosystem!",
      badgeUrl: "https://devshelf.ritualdev.in/api/v1/badges/silver.svg",
    },
    {
      id: "patron-6",
      rank: 6,
      name: "Community Backer",
      github: "ghost",
      avatar: "https://github.com/ghost.png",
      url: "https://devshelf.ritualdev.in/sponsors.html",
      amountUSD: 15,
      amountINR: 1200,
      tier: "bronze",
      date: "2026-10-09",
      comment: "Local-first open-source forever.",
      badgeUrl: "https://devshelf.ritualdev.in/api/v1/badges/bronze.svg",
    },
  ],
};

let cachedSponsors = null;

/**
 * Load DevShelf Sponsors Ledger with 3-tier fallback strategy:
 * 1. Local data/sponsors.json or site/api/v1/sponsors.json
 * 2. Remote CDN (https://devshelf.ritualdev.in/api/v1/sponsors.json)
 * 3. Inlined default community patron seeds
 *
 * @param {{ forceReload?: boolean }} [options]
 * @returns {Promise<{ version: string, updatedAt: string, stats: Record<string, number>, patrons: Array<any> }>}
 */
export async function loadSponsors(options = {}) {
  if (cachedSponsors && !options.forceReload) {
    return cachedSponsors;
  }

  // Tier 1: Local file system
  const localCandidates = [
    path.join(__dirname, "..", "..", "data", "sponsors.json"),
    path.join(__dirname, "..", "..", "site", "api", "v1", "sponsors.json"),
  ];

  for (const candidate of localCandidates) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = fs.readFileSync(candidate, "utf8");
        cachedSponsors = JSON.parse(raw);
        return cachedSponsors;
      } catch {
        // Continue to next candidate
      }
    }
  }

  // Tier 2: Remote endpoint
  try {
    const res = await fetch("https://devshelf.ritualdev.in/api/v1/sponsors.json", {
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      cachedSponsors = await res.json();
      return cachedSponsors;
    }
  } catch {
    // Remote fetch failed, fall through to tier 3
  }

  // Tier 3: Inlined default patron seeds
  cachedSponsors = DEFAULT_SPONSORS_DATA;
  return cachedSponsors;
}
