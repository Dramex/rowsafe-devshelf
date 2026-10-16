import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test, { describe } from "node:test";

describe("DevShelf Site UI, A11y & Verification Architecture Suite", () => {
  const root = process.cwd();
  const indexPath = path.join(root, "site", "index.html");
  const statusPath = path.join(root, "site", "status.html");
  const appJsPath = path.join(root, "site", "app.js");

  test("site/index.html enforces responsive mobile viewport layout", () => {
    assert.strictEqual(fs.existsSync(indexPath), true);
    const html = fs.readFileSync(indexPath, "utf8");

    assert.match(
      html,
      /<meta\s+name=["']viewport["']\s+content=["'][^"']*width=device-width[^"']*initial-scale=1\.0[^"']*["']/i,
      "Mobile viewport meta tag must be present for responsive layouts"
    );
  });

  test("site/index.html provides accessible search input with keyboard shortcut hint", () => {
    const html = fs.readFileSync(indexPath, "utf8");

    // Search input id and placeholder
    assert.match(html, /id=["']search-input["']/i, "Search input must have id 'search-input'");
    assert.match(html, /placeholder=["'][^"']+["']/i, "Search input must provide placeholder");

    // Keyboard shortcut hint
    assert.match(html, /class=["'][^"']*kbd[^"']*["']|\/\s*to\s*search|\bkbd\b/i, "Must surface '/' shortcut indicator");
  });

  test("site/index.html provides category filters and links to status dashboard", () => {
    const html = fs.readFileSync(indexPath, "utf8");

    // Category filter tabs
    assert.match(html, /data-category=["']all["']/i);
    assert.match(html, /data-category=["']ai["']/i);
    assert.match(html, /data-category=["']cli["']/i);
    assert.match(html, /data-category=["']api["']/i);

    // Link to public health status dashboard
    assert.match(html, /href=["']status\.html["']/i, "Must link to public health dashboard");
  });

  test("site/app.js implements keyboard navigation and empty search states", () => {
    assert.strictEqual(fs.existsSync(appJsPath), true);
    const code = fs.readFileSync(appJsPath, "utf8");
    const html = fs.readFileSync(indexPath, "utf8");

    // Keyboard navigation shortcuts
    assert.match(code, /e\.key === ["']\/["']/, "Must support '/' key to focus search");
    assert.match(code, /e\.key === ["']Escape["']/, "Must support 'Escape' key to clear/dismiss");

    // Empty state container in index.html and control logic in app.js
    assert.match(html, /id=["']empty-state["']/i, "Must have #empty-state container");
    assert.match(html, /No matching resources found/i, "Must provide empty state message");
    assert.match(html, /id=["']reset-filters-btn["']/i, "Must have reset filters button");
    assert.match(code, /emptyState\.classList\.remove\(["']hidden["']\)/, "app.js must display empty state when 0 matches");
  });

  test("site/status.html documents the 3 distinct verification tiers", () => {
    assert.strictEqual(fs.existsSync(statusPath), true);
    const html = fs.readFileSync(statusPath, "utf8");

    // 1. Web Reachability
    assert.match(html, /Reachable Web Endpoint/i, "Must declare Reachable Web Endpoint tier");
    assert.match(html, /lastCheckedAt/i, "Must mention lastCheckedAt telemetry");

    // 2. Working API
    assert.match(html, /Working API \/ Service Health/i, "Must declare Working API tier");
    assert.match(html, /lastVerifiedAt/i, "Must mention lastVerifiedAt telemetry");

    // 3. Zero-Paywall Policy
    assert.match(html, /Zero-Paywall Policy Audit/i, "Must declare Zero-Paywall audit tier");
    assert.match(html, /pricingVerifiedAt/i, "Must mention pricingVerifiedAt telemetry");
  });

  test("site/status.html and CLI enforce transparent sponsor & editorial independence", () => {
    const html = fs.readFileSync(statusPath, "utf8");

    // Status page sponsor policy
    assert.match(
      html,
      /Sponsor &amp; Partner Policy|Sponsoring never bypasses health audits/i,
      "Status dashboard must disclose sponsor editorial independence"
    );

    // CLI sponsors command output
    const stdout = execSync('node bin/cli.js sponsors', { encoding: "utf8", cwd: root });
    assert.match(
      stdout,
      /Editorial Independence: Sponsoring does not bypass DevShelf zero-paywall audits/i,
      "CLI sponsors command must disclose editorial independence"
    );
  });
});
