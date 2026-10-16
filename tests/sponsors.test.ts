import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

// Mirror and test the core algorithms used in site/sponsors.html for checkout return verification
const GITHUB_HANDLE_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

function calculateTier(
  amount: number,
  currency = "USD",
): "enterprise" | "gold" | "silver" | "bronze" {
  const isINR = currency.toUpperCase() === "INR";
  const usd = isINR ? (amount > 0 ? Math.round(amount / 84) : 15) : amount > 0 ? amount : 15;
  if (usd >= 250) return "enterprise";
  if (usd >= 100) return "gold";
  if (usd >= 50) return "silver";
  return "bronze";
}

function getSafeAvatarUrl(github: string): string {
  if (github && GITHUB_HANDLE_REGEX.test(github)) {
    return `https://github.com/${encodeURIComponent(github)}.png`;
  }
  return "https://api.dicebear.com/7.x/identicon/svg?seed=backer";
}

function getSafeUrl(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "";
  } catch {
    return "";
  }
}

interface InvoicePayload {
  patronId: string;
  name: string;
  amountUSD: number;
  billingCompany?: string;
  billingTaxId?: string;
  productType?: string;
  shippingRequired?: string;
}

function generateDigitalInvoice(payload: InvoicePayload) {
  const code = (payload.patronId || "TX001")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-6)
    .toUpperCase();
  return {
    invoiceNumber: `INV-DEVSHELF-2026-${code}`,
    isDigitalOnly: payload.productType === "digital" && payload.shippingRequired === "false",
    shippingCost: 0,
    billedTo: payload.billingCompany || payload.name || "Anonymous Patron",
    taxId: payload.billingTaxId || "Exempt (Digital Open-Source Grant)",
  };
}

test("Sponsors Return Handler - Tier Calculation with Enterprise Placement", () => {
  assert.equal(calculateTier(250, "USD"), "enterprise", "USD >= 250 should be enterprise");
  assert.equal(calculateTier(500, "USD"), "enterprise", "USD 500 should be enterprise");
  assert.equal(calculateTier(100, "USD"), "gold", "USD 100 should be gold");
  assert.equal(calculateTier(249, "USD"), "gold", "USD 249 should be gold");
  assert.equal(calculateTier(50, "USD"), "silver", "USD 50 should be silver");
  assert.equal(calculateTier(99, "USD"), "silver", "USD 99 should be silver");
  assert.equal(calculateTier(15, "USD"), "bronze", "USD 15 should be bronze");
  assert.equal(calculateTier(5, "USD"), "bronze", "USD 5 should be bronze");

  // INR conversions (~84 INR per USD)
  assert.equal(
    calculateTier(21000, "INR"),
    "enterprise",
    "INR 21,000 (~$250) should be enterprise",
  );
  assert.equal(calculateTier(8400, "INR"), "gold", "INR 8400 (~$100) should be gold");
  assert.equal(calculateTier(4200, "INR"), "silver", "INR 4200 (~$50) should be silver");
  assert.equal(calculateTier(1200, "INR"), "bronze", "INR 1200 (~$14) should be bronze");
});

test("Sponsors Return Handler - GitHub Handle Sanitization", () => {
  assert.ok(GITHUB_HANDLE_REGEX.test("RitualDev-Lab"), "Valid org handle");
  assert.ok(GITHUB_HANDLE_REGEX.test("torvalds"), "Valid username");
  assert.ok(!GITHUB_HANDLE_REGEX.test("<script>"), "Must reject script tags");
  assert.ok(!GITHUB_HANDLE_REGEX.test("-invalid-start"), "Must reject starting hyphen");
  assert.ok(!GITHUB_HANDLE_REGEX.test("invalid--double"), "Must reject double hyphens");
});

test("Sponsors Return Handler - Safe URL Enforcement", () => {
  assert.equal(
    getSafeUrl("https://example.com"),
    "https://example.com/",
    "Should allow valid HTTPS URL",
  );
  assert.equal(
    getSafeUrl("http://example.com"),
    "http://example.com/",
    "Should allow valid HTTP URL",
  );
  assert.equal(getSafeUrl("javascript:alert(1)"), "", "Must reject javascript protocol");
  assert.equal(getSafeUrl("data:text/html,test"), "", "Must reject data protocol");
  assert.equal(getSafeUrl("not a url"), "", "Must reject invalid strings");
});

test("Sponsors Return Handler - Safe Avatar URL Generation", () => {
  assert.equal(
    getSafeAvatarUrl("octocat"),
    "https://github.com/octocat.png",
    "Should generate valid GitHub avatar URL",
  );
  assert.equal(
    getSafeAvatarUrl("evil<script>"),
    "https://api.dicebear.com/7.x/identicon/svg?seed=backer",
    "Should fallback to identicon for invalid handle",
  );
});

test("Digital Invoice & Receipt Setup - Zero Physical Shipping Verification", () => {
  const invoice = generateDigitalInvoice({
    patronId: "patron-1729081234567",
    name: "Acme Corp",
    amountUSD: 250,
    billingCompany: "Acme Inc.",
    billingTaxId: "US-EIN-12345678",
    productType: "digital",
    shippingRequired: "false",
  });

  assert.match(invoice.invoiceNumber, /^INV-DEVSHELF-2026-[A-Z0-9]{6}$/);
  assert.equal(invoice.isDigitalOnly, true, "Product must be digital-only with zero shipping");
  assert.equal(invoice.shippingCost, 0, "Physical shipping cost must be exactly 0");
  assert.equal(invoice.billedTo, "Acme Inc.");
  assert.equal(invoice.taxId, "US-EIN-12345678");
});

test("Sponsors Ledger Data Integrity - Schema and Values", async () => {
  const sponsorsPath = path.resolve("data/sponsors.json");
  const rawData = await fs.readFile(sponsorsPath, "utf8");
  const data = JSON.parse(rawData);

  assert.ok(data.version, "Should have a version string");
  assert.ok(data.stats, "Should have stats object");
  assert.equal(typeof data.stats.totalPatrons, "number", "totalPatrons should be number");
  assert.equal(Array.isArray(data.patrons), true, "patrons should be an array");
  assert.equal(
    data.stats.totalPatrons,
    data.patrons.length,
    "totalPatrons should match patrons count",
  );

  for (const patron of data.patrons) {
    assert.ok(patron.id, `Patron must have id: ${JSON.stringify(patron)}`);
    assert.equal(typeof patron.rank, "number", `Patron rank must be number: ${patron.id}`);
    assert.ok(patron.name, `Patron must have name: ${patron.id}`);
    assert.ok(patron.github, `Patron must have github handle: ${patron.id}`);
    assert.ok(
      GITHUB_HANDLE_REGEX.test(patron.github),
      `Patron handle must be valid: ${patron.github}`,
    );
    assert.ok(
      ["enterprise", "gold", "silver", "bronze"].includes(patron.tier),
      `Valid tier: ${patron.tier}`,
    );
    assert.ok(patron.amountUSD > 0, `Patron amountUSD must be > 0: ${patron.id}`);
    assert.ok(patron.avatar.startsWith("https://"), `Avatar must use HTTPS: ${patron.avatar}`);
    assert.ok(
      patron.badgeUrl.startsWith("https://"),
      `Badge URL must use HTTPS: ${patron.badgeUrl}`,
    );
  }
});

test("Sponsors Static Badges Artifacts Verification", async () => {
  const badgesDir = path.resolve("site/api/v1/badges");
  const requiredBadges = [
    "enterprise.svg",
    "enterprise-card.svg",
    "gold.svg",
    "gold-card.svg",
    "silver.svg",
    "silver-card.svg",
    "bronze.svg",
    "bronze-card.svg",
    "supporter.svg",
    "supporter-card.svg",
    "default.svg",
    "verified.svg",
  ];

  for (const badgeFile of requiredBadges) {
    const filePath = path.join(badgesDir, badgeFile);
    const content = await fs.readFile(filePath, "utf8");
    assert.ok(content.startsWith("<svg"), `${badgeFile} must start with <svg`);
    assert.ok(content.endsWith("</svg>"), `${badgeFile} must end with </svg>`);
    assert.ok(!content.includes("<script"), `${badgeFile} must not contain script tags`);
  }
});
