import test from "node:test";
import assert from "node:assert/strict";

// Mirror and test the core algorithms used in site/sponsors.html for checkout return verification
const GITHUB_HANDLE_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

function calculateTier(amount: number, currency: string = "USD"): "gold" | "silver" | "bronze" {
  const isINR = currency.toUpperCase() === "INR";
  const usd = isINR ? (amount > 0 ? Math.round(amount / 84) : 15) : amount > 0 ? amount : 15;
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

test("Sponsors Return Handler - Tier Calculation", () => {
  assert.equal(calculateTier(100, "USD"), "gold", "USD >= 100 should be gold");
  assert.equal(calculateTier(250, "USD"), "gold", "USD 250 should be gold");
  assert.equal(calculateTier(50, "USD"), "silver", "USD 50 should be silver");
  assert.equal(calculateTier(99, "USD"), "silver", "USD 99 should be silver");
  assert.equal(calculateTier(15, "USD"), "bronze", "USD 15 should be bronze");
  assert.equal(calculateTier(5, "USD"), "bronze", "USD 5 should be bronze");

  // INR conversions (~84 INR per USD)
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
