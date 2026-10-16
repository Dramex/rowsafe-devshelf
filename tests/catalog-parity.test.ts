import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test, { describe } from "node:test";
import { assembleCatalogFromShelf } from "../bin/lib/catalog-assembler.js";
import { loadCatalog } from "../bin/lib/catalog.js";

describe("DevShelf Unified Catalog Assembly & Fallback Parity Suite (D3)", () => {
  const root = process.cwd();
  const shelfDir = path.join(root, "shelf");
  const siteDataPath = path.join(root, "site", "data.json");

  test("assembleCatalogFromShelf produces output identical to built site/data.json (excluding timestamps)", () => {
    assert.strictEqual(fs.existsSync(siteDataPath), true, "site/data.json must exist");

    const built = JSON.parse(fs.readFileSync(siteDataPath, "utf8"));
    const assembled = assembleCatalogFromShelf(shelfDir);

    // 1. High-level metric parity
    assert.strictEqual(assembled.totalCount, built.totalCount);
    assert.strictEqual(assembled.reposCount, built.reposCount);
    assert.deepStrictEqual(assembled.facets, built.facets);
    assert.deepStrictEqual(assembled.counts, built.counts);

    // 2. Resource count parity
    assert.strictEqual(assembled.resources.length, built.resources.length);

    // 3. Exact resource-by-resource field parity
    for (let i = 0; i < assembled.resources.length; i++) {
      const a = assembled.resources[i];
      const b = built.resources[i];

      assert.strictEqual(a.name, b.name, `Resource ${i} name mismatch`);
      assert.strictEqual(a.type, b.type, `Resource ${a.name} type mismatch`);
      assert.strictEqual(a.section, b.section, `Resource ${a.name} section mismatch`);
      assert.strictEqual(a.description, b.description, `Resource ${a.name} description mismatch`);
      assert.strictEqual(
        a.alternativeTo,
        b.alternativeTo,
        `Resource ${a.name} alternativeTo mismatch`,
      );
      assert.strictEqual(
        a.dockerCompose,
        b.dockerCompose,
        `Resource ${a.name} dockerCompose mismatch`,
      );
      assert.strictEqual(a.repo, b.repo, `Resource ${a.name} repo mismatch`);
      assert.strictEqual(a.url, b.url, `Resource ${a.name} url mismatch`);
      assert.deepStrictEqual(a.statusTags, b.statusTags, `Resource ${a.name} statusTags mismatch`);
    }
  });

  test("fallback source assembly preserves type, section, and alternativeTo enrichments", async () => {
    const assembled = assembleCatalogFromShelf(shelfDir);

    // Verify type and section are attached across all resources
    const missingType = assembled.resources.filter((r: any) => !r.type);
    assert.strictEqual(missingType.length, 0, "All items must have 'type'");

    const missingSection = assembled.resources.filter((r: any) => !r.section);
    assert.strictEqual(missingSection.length, 0, "All items must have 'section'");

    // Verify high-intent alternativeTo mappings are preserved in fallback
    const bruno = assembled.resources.find((r: any) => r.name === "Bruno");
    assert.ok(bruno, "Bruno must exist in catalog");
    assert.strictEqual(bruno.alternativeTo, "Postman");
    assert.strictEqual(bruno.type, "testing");
    assert.strictEqual(bruno.section, "Testing & QA Reliability");

    const uptimeKuma = assembled.resources.find((r: any) => r.name === "Uptime Kuma");
    assert.ok(uptimeKuma, "Uptime Kuma must exist in catalog");
    assert.strictEqual(uptimeKuma.alternativeTo, "Datadog / Better Uptime");
    assert.ok(uptimeKuma.dockerCompose?.includes("uptime-kuma"));

    const supabase = assembled.resources.find((r: any) => r.name === "Supabase");
    assert.ok(supabase, "Supabase must exist in catalog");
    assert.strictEqual(supabase.alternativeTo, "Firebase / AWS RDS");
  });

  test("loadCatalog Tier 5 source fallback returns fully enriched catalog", async () => {
    // Calling assemble directly as Tier 5 does
    const catalog = assembleCatalogFromShelf(shelfDir);
    assert.ok(catalog.totalCount >= 530);
    assert.ok(catalog.counts.aiTools >= 80);
    assert.ok(catalog.counts.apis >= 90);
    assert.ok(catalog.counts.cliTools >= 100);
    assert.ok(catalog.counts.testingQa >= 60);
    assert.ok(catalog.counts.freeCloud >= 70);
    assert.ok(catalog.counts.boilerplates >= 40);
    assert.ok(catalog.counts.contributors >= 20);
    assert.ok(catalog.counts.perks >= 30);
  });
});
