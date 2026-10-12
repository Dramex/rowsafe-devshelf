import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

test("generated pages preserve API allowances without inventing licenses or ratings", async () => {
  const root = process.cwd();
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "devshelf-seo-"));
  try {
    const apis = JSON.parse(await fs.readFile(path.join(root, "shelf/apis.json"), "utf8"));
    const arcmira = apis.find(
      (item: { name: string }) => item.name === "Arcmira: YouTube Transcript Search",
    );
    assert.ok(arcmira, "Arcmira fixture must exist in the catalog");
    await fs.mkdir(path.join(directory, "site"));
    await fs.writeFile(
      path.join(directory, "site/data.json"),
      JSON.stringify({
        resources: [
          { ...arcmira, type: "api" },
          {
            name: "Example & tool",
            description: "A test tool",
            category: "Testing",
            url: "https://example.com",
            license: "MIT",
            freeTier: "10 requests & no charge",
          },
          {
            name: "Unspecified",
            description: "A test tool",
            category: "Testing",
            url: "https://example.com",
          },
        ],
      }),
    );
    execFileSync(
      process.execPath,
      [
        ...process.execArgv.filter((arg) => arg !== "--test"),
        path.join(root, "scripts/generate-seo.ts"),
      ],
      { cwd: directory },
    );
    const page = await fs.readFile(
      path.join(directory, "site/tools/arcmira-youtube-transcript-search.html"),
      "utf8",
    );
    assert.match(page, /1,000 included credits per month/);
    assert.match(page, /newest 30 days and later result pages/);
    assert.match(page, /Premium transcripts and sponsor research use paid plans/);
    assert.doesNotMatch(page, /100% Free|Free \/ FOSS|under the .* license/);
    const structured = JSON.parse(
      page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] || "{}",
    );
    assert.equal(structured["@graph"][0].license, undefined);
    assert.equal(structured["@graph"][0].aggregateRating, undefined);
    assert.match(structured["@graph"][0].offers.description, /1,000 included credits/);
    assert.match(structured["@graph"][1].mainEntity[0].acceptedAnswer.text, /newest 30 days/);
    const llms = await fs.readFile(path.join(directory, "site/llms-full.txt"), "utf8");
    assert.match(llms, /Pricing Model\*\*: 60 requests per minute/);
    const licensed = await fs.readFile(
      path.join(directory, "site/tools/example-tool.html"),
      "utf8",
    );
    assert.match(licensed, /10 requests &amp; no charge/);
    assert.match(licensed, /License: MIT/);
    assert.doesNotMatch(licensed, /&amp;amp;/);
    const unknown = await fs.readFile(path.join(directory, "site/tools/unspecified.html"), "utf8");
    assert.match(unknown, /See the official site for free access and limits/);
    assert.doesNotMatch(unknown, /100% Free|Free \/ FOSS/);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
