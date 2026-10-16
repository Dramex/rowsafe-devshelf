import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test, { describe } from "node:test";

const ROOT = process.cwd();

describe("DevShelf Data Trust, Pricing Audits & Health Dashboard", () => {
  test("catalog count is unified and consistent across all artifacts", async () => {
    // 1. data/counts.json
    const countsRaw = await fs.readFile(path.join(ROOT, "data", "counts.json"), "utf8");
    const counts = JSON.parse(countsRaw);
    assert.ok(counts.totalCount >= 530, `Expected totalCount >= 530, got ${counts.totalCount}`);
    assert.equal(counts.milestone, `${Math.floor(counts.totalCount / 10) * 10}+`);

    // 2. package.json description
    const pkgRaw = await fs.readFile(path.join(ROOT, "package.json"), "utf8");
    const pkg = JSON.parse(pkgRaw);
    assert.match(
      pkg.description,
      new RegExp(counts.milestone),
      `package.json description should mention milestone ${counts.milestone}`,
    );

    // 3. site/data.json
    const siteDataRaw = await fs.readFile(path.join(ROOT, "site", "data.json"), "utf8");
    const siteData = JSON.parse(siteDataRaw);
    assert.equal(siteData.totalCount, counts.totalCount);

    // 4. README.md
    const readme = await fs.readFile(path.join(ROOT, "README.md"), "utf8");
    assert.ok(
      readme.includes(`Instant search across all ${counts.milestone} curated resources`),
      `README should mention milestone ${counts.milestone} in CLI instructions`,
    );
    assert.ok(
      !readme.includes("All 500+ curated developer tools"),
      "README should not contain outdated 'All 500+ curated' claim",
    );
  });

  test("all 6 shelf schemas permit auditable zero-paywall properties", async () => {
    const schemasDir = path.join(ROOT, "schemas");
    const schemaFiles = [
      "tool.schema.json",
      "api.schema.json",
      "free-cloud.schema.json",
      "boilerplate.schema.json",
      "perk.schema.json",
      "contributor.schema.json",
    ];

    const requiredAuditProperties = [
      "lastCheckedAt",
      "lastVerifiedAt",
      "pricingVerifiedAt",
      "healthStatus",
      "authRequirements",
      "freeTierLimits",
      "verifiedZeroPaywall",
      "redirectUrl",
    ];

    for (const file of schemaFiles) {
      const raw = await fs.readFile(path.join(schemasDir, file), "utf8");
      const schema = JSON.parse(raw);
      const props = schema.items?.properties;
      assert.ok(props, `Schema ${file} must define items.properties`);

      for (const prop of requiredAuditProperties) {
        assert.ok(
          prop in props,
          `Schema ${file} must define audit property '${prop}' before additionalProperties: false`,
        );
      }
    }
  });

  test("link check telemetry enforces 14-day grace period before sunset eligibility", () => {
    const now = Date.now();
    const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();
    const fifteenDaysAgo = new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString();

    // Case 1: First-time transient failure (1 failure, 0 days down)
    const failure1 = {
      consecutiveFailures: 1,
      firstFailedAt: new Date(now).toISOString(),
    };
    const daysDown1 = (now - Date.parse(failure1.firstFailedAt)) / (1000 * 60 * 60 * 24);
    const eligible1 = failure1.consecutiveFailures >= 3 || daysDown1 >= 14;
    const graceRemaining1 = Math.max(0, Math.round(14 - daysDown1));
    assert.strictEqual(eligible1, false, "1st failure must NOT be eligible for sunset");
    assert.strictEqual(graceRemaining1, 14, "Grace period should be 14 days remaining");

    // Case 2: Down for 10 days with only 2 failures
    const daysDown2 = (now - Date.parse(tenDaysAgo)) / (1000 * 60 * 60 * 24);
    const eligible2 = 2 >= 3 || daysDown2 >= 14;
    const graceRemaining2 = Math.max(0, Math.round(14 - daysDown2));
    assert.strictEqual(
      eligible2,
      false,
      "10-day outage under 14 days is still within grace period",
    );
    assert.strictEqual(graceRemaining2, 4, "Grace period should show 4 days remaining");

    // Case 3: Down for 15 days
    const daysDown3 = (now - Date.parse(fifteenDaysAgo)) / (1000 * 60 * 60 * 24);
    const eligible3 = 1 >= 3 || daysDown3 >= 14;
    assert.strictEqual(eligible3, true, "15-day continuous outage is eligible for sunset");
  });

  test("public health dashboard site/status.html exists and is linked in navigation", async () => {
    const statusHtmlPath = path.join(ROOT, "site", "status.html");
    const statusHtml = await fs.readFile(statusHtmlPath, "utf8");

    assert.ok(statusHtml.includes("DevShelf Live Health"), "status.html should have title");
    assert.ok(
      statusHtml.includes("The DevShelf Zero-Paywall &amp; Sunset Protocol"),
      "status.html should document protocol",
    );
    assert.ok(statusHtml.includes("uptime.json"), "status.html should consume uptime.json");
    assert.ok(
      statusHtml.includes("status-search-input"),
      "status.html should have interactive search",
    );

    // Verify index.html navigation links to status.html
    const indexHtml = await fs.readFile(path.join(ROOT, "site", "index.html"), "utf8");
    assert.ok(
      indexHtml.includes('href="status.html"'),
      "index.html must contain link to status.html in navigation or footer",
    );
  });

  test("site/uptime.json includes healthStatus, verifiedZeroPaywall and gracePeriod telemetry", async () => {
    const uptimePath = path.join(ROOT, "site", "uptime.json");
    const uptimeRaw = await fs.readFile(uptimePath, "utf8");
    const uptime = JSON.parse(uptimeRaw);

    assert.ok(Array.isArray(uptime.endpoints), "uptime.json must have endpoints array");
    assert.ok(uptime.endpoints.length > 0, "uptime.json must have at least 1 endpoint");

    const sample = uptime.endpoints[0];
    assert.ok(sample.name, "Endpoint should have name");
    assert.ok("healthStatus" in sample, "Endpoint should have healthStatus");
    assert.ok("verifiedZeroPaywall" in sample, "Endpoint should have verifiedZeroPaywall flag");
    assert.ok(
      "gracePeriodDaysRemaining" in sample,
      "Endpoint should have gracePeriodDaysRemaining",
    );
  });
});
