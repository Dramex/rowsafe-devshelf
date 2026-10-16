import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const BADGES_DIR = path.join(ROOT_DIR, "site", "api", "v1", "badges");

export interface BadgeOptions {
  name?: string;
  handle?: string;
  tier?: "gold" | "silver" | "bronze" | "supporter";
  amountUSD?: number;
  style?: "pill" | "card";
}

function escapeXml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generatePillBadgeSvg(options: BadgeOptions): string {
  const tier =
    options.tier ||
    (options.amountUSD && options.amountUSD >= 100
      ? "gold"
      : options.amountUSD && options.amountUSD >= 50
        ? "silver"
        : "bronze");

  let rightBg = "#7c3aed";
  let rightText = "☕ Supporter";
  let borderColor = "rgba(168, 85, 247, 0.4)";

  if (tier === "gold") {
    rightBg = "#b45309";
    rightText = "👑 Gold Patron";
    borderColor = "rgba(245, 158, 11, 0.5)";
  } else if (tier === "silver") {
    rightBg = "#334155";
    rightText = "🛡️ Silver Backer";
    borderColor = "rgba(148, 163, 184, 0.5)";
  } else if (tier === "bronze") {
    rightBg = "#9a3412";
    rightText = "⚡ Supporter";
    borderColor = "rgba(249, 115, 22, 0.5)";
  }

  const safeLabel = escapeXml(rightText);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="28" viewBox="0 0 220 28" role="img" aria-label="DevShelf Sponsor: ${safeLabel}">
  <defs>
    <clipPath id="pill-clip">
      <rect width="220" height="28" rx="6" fill="#fff"/>
    </clipPath>
  </defs>
  <g clip-path="url(#pill-clip)">
    <rect width="105" height="28" fill="#0f172a"/>
    <rect x="105" width="115" height="28" fill="${rightBg}"/>
    <rect width="220" height="28" fill="none" stroke="${borderColor}" stroke-width="2"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="11" font-weight="700">
    <text x="52" y="18" fill="#e2e8f0">💖 DevShelf</text>
    <text x="162" y="18" fill="#ffffff">${safeLabel}</text>
  </g>
</svg>`;
}

export function generateCardBadgeSvg(options: BadgeOptions): string {
  const tier =
    options.tier ||
    (options.amountUSD && options.amountUSD >= 100
      ? "gold"
      : options.amountUSD && options.amountUSD >= 50
        ? "silver"
        : "bronze");
  const rawName = options.name || (options.handle ? `@${options.handle}` : "DevShelf Patron");
  const safeName = escapeXml(rawName);

  let borderStart = "#f59e0b";
  let tierLabel = "Gold Patron ★ Verified Sponsor";
  let tierBadgeBg = "#78350f";
  let tierBadgeText = "#fde68a";
  let icon = "👑";

  if (tier === "silver") {
    borderStart = "#94a3b8";
    tierLabel = "Silver Backer ★ Verified Sponsor";
    tierBadgeBg = "#1e293b";
    tierBadgeText = "#e2e8f0";
    icon = "🛡️";
  } else if (tier === "bronze" || tier === "supporter") {
    borderStart = "#a855f7";
    tierLabel = "Dev Supporter ★ Verified Sponsor";
    tierBadgeBg = "#581c87";
    tierBadgeText = "#f3e8ff";
    icon = "💖";
  }

  const safeTierLabel = escapeXml(tierLabel);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="92" viewBox="0 0 380 92" fill="none" role="img" aria-label="DevShelf Sponsor Card: ${safeName}">
  <defs>
    <linearGradient id="card-bg" x1="0" y1="0" x2="380" y2="92" gradientUnits="userSpaceOnUse">
      <stop stop-color="#090d16"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="card-border" x1="0" y1="0" x2="380" y2="92" gradientUnits="userSpaceOnUse">
      <stop stop-color="${borderStart}" stop-opacity="0.8"/>
      <stop offset="1" stop-color="#8b5cf6" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <rect width="380" height="92" rx="14" fill="url(#card-bg)"/>
  <rect x="0.5" y="0.5" width="379" height="91" rx="13.5" stroke="url(#card-border)"/>
  <circle cx="46" cy="46" r="23" fill="#0f172a" stroke="${borderStart}" stroke-width="1.5"/>
  <text x="46" y="53" font-size="20" text-anchor="middle">${icon}</text>
  <g font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
    <text x="82" y="34" fill="#ffffff" font-size="14" font-weight="700">${safeName}</text>
    <text x="82" y="53" fill="${borderStart}" font-size="11" font-weight="600">${safeTierLabel}</text>
    <text x="82" y="73" fill="#64748b" font-family="monospace" font-size="10">devshelf.ritualdev.in/sponsors</text>
  </g>
  <rect x="302" y="16" width="62" height="20" rx="10" fill="${tierBadgeBg}" stroke="${borderStart}" stroke-width="1"/>
  <text x="333" y="30" fill="${tierBadgeText}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="10" font-weight="700" text-anchor="middle">✓ Backer</text>
</svg>`;
}

export async function buildStaticBadges() {
  await fs.mkdir(BADGES_DIR, { recursive: true });

  const tiers: Array<BadgeOptions["tier"]> = ["gold", "silver", "bronze", "supporter"];
  for (const t of tiers) {
    const pill = generatePillBadgeSvg({ tier: t });
    const card = generateCardBadgeSvg({ tier: t });
    await fs.writeFile(path.join(BADGES_DIR, `${t}.svg`), pill, "utf8");
    await fs.writeFile(path.join(BADGES_DIR, `${t}-card.svg`), card, "utf8");
  }

  // Default badges
  const defaultPill = generatePillBadgeSvg({ tier: "bronze" });
  const defaultCard = generateCardBadgeSvg({ tier: "gold", name: "DevShelf Verified Backer" });
  await fs.writeFile(path.join(BADGES_DIR, "default.svg"), defaultPill, "utf8");
  await fs.writeFile(path.join(BADGES_DIR, "verified.svg"), defaultCard, "utf8");

  // Sample handle badges for default sponsors
  const defaultPatrons = [
    { handle: "cloudsec", name: "Sarah M. (@cloudsec)", tier: "gold" as const },
    { handle: "alexk", name: "Alex K. (SuperFile Maintainer)", tier: "gold" as const },
    { handle: "maboroshi", name: "Maboroshi / Terminal Tools", tier: "silver" as const },
    { handle: "davidchen", name: "David Chen", tier: "silver" as const },
    { handle: "eigenwise", name: "Eigenwise", tier: "silver" as const },
    { handle: "ghost", name: "Community Backer", tier: "bronze" as const },
  ];

  for (const p of defaultPatrons) {
    const pill = generatePillBadgeSvg(p);
    const card = generateCardBadgeSvg(p);
    await fs.writeFile(path.join(BADGES_DIR, `${p.handle}.svg`), pill, "utf8");
    await fs.writeFile(path.join(BADGES_DIR, `${p.handle}-card.svg`), card, "utf8");
  }

  console.log(`🎖️ [DevShelf Badge Engine] Generated static SVG badges under site/api/v1/badges/`);
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith("generate-badges.ts")) {
  buildStaticBadges().catch((err) => {
    console.error("Badge generation error:", err);
    process.exit(1);
  });
}
