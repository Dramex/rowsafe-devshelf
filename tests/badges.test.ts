import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {
  generatePillBadgeSvg,
  generateCardBadgeSvg,
  buildStaticBadges,
} from "../scripts/generate-badges.ts";

test("Badge Generator - Pill Badge Output", () => {
  const goldPill = generatePillBadgeSvg({ tier: "gold" });
  assert.ok(goldPill.includes("<svg"), "Should output SVG root tag");
  assert.ok(goldPill.includes("👑 Gold Patron"), "Should include Gold Patron tier text");
  assert.ok(goldPill.includes("💖 DevShelf"), "Should include DevShelf branding");

  const silverPill = generatePillBadgeSvg({ tier: "silver" });
  assert.ok(silverPill.includes("🛡️ Silver Backer"), "Should include Silver Backer tier text");

  const bronzePill = generatePillBadgeSvg({ tier: "bronze" });
  assert.ok(bronzePill.includes("⚡ Supporter"), "Should include Supporter tier text");
});

test("Badge Generator - XML Sanitization", () => {
  const unsafeName = 'User <script>alert("xss")</script> & Co';
  const card = generateCardBadgeSvg({ name: unsafeName, tier: "gold" });
  assert.ok(!card.includes("<script>"), "Must not include unescaped script tags");
  assert.ok(card.includes("&lt;script&gt;"), "Must escape '<' character");
  assert.ok(card.includes("&amp;"), "Must escape '&' character");
  assert.ok(card.includes("&quot;"), "Must escape double quotes");
});

test("Badge Generator - Rich Card Badge Output", () => {
  const card = generateCardBadgeSvg({ name: "Alex K.", tier: "gold", handle: "alexk" });
  assert.ok(card.includes("<svg"), "Should output valid SVG");
  assert.ok(card.includes("Alex K."), "Should include user's name");
  assert.ok(card.includes("Gold Patron"), "Should include tier label");
  assert.ok(card.includes("devshelf.ritualdev.in/sponsors"), "Should include backlink text");
});

test("Badge Generator - Static Badges File Generation", async () => {
  await buildStaticBadges();
  const root = process.cwd();
  const badgesDir = path.join(root, "site", "api", "v1", "badges");

  const expectedFiles = [
    "gold.svg",
    "gold-card.svg",
    "silver.svg",
    "silver-card.svg",
    "bronze.svg",
    "default.svg",
    "verified.svg",
  ];
  for (const f of expectedFiles) {
    const stat = await fs.stat(path.join(badgesDir, f));
    assert.ok(stat.size > 200, `File ${f} should exist and have content`);
  }
});
