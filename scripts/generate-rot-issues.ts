import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

interface UptimeEndpoint {
  name: string;
  url: string;
  status: number | string;
  ok: boolean;
  consecutiveFailures?: number;
  rotType?: string;
  file?: string;
}

interface UptimeData {
  lastChecked: string;
  totalChecked: number;
  healthyCount: number;
  deadCount: number;
  endpoints: UptimeEndpoint[];
}

async function findItemFile(name: string): Promise<string> {
  const root = process.cwd();
  const shelfDir = path.join(root, "shelf");
  const files = await fs.readdir(shelfDir);

  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const raw = await fs.readFile(path.join(shelfDir, f), "utf8");
    const items = JSON.parse(raw.replace(/^\uFEFF/, ""));
    if (items.some((i: any) => i.name?.toLowerCase() === name.toLowerCase())) {
      return f;
    }
  }
  return "shelf/apis.json";
}

async function generateRotIssues() {
  const root = process.cwd();
  const uptimePath = path.join(root, "site", "uptime.json");

  console.log("🔍 [DevShelf Issue Inverter] Scanning telemetry for broken endpoints...");

  let uptime: UptimeData;
  try {
    const raw = await fs.readFile(uptimePath, "utf8");
    uptime = JSON.parse(raw);
  } catch (err) {
    console.log("No uptime.json found or file empty. Skipping issue generation.");
    return;
  }

  const failing = (uptime.endpoints || []).filter(
    (e) => !e.ok || e.status === 404 || (e.consecutiveFailures ?? 0) >= 2,
  );

  if (failing.length === 0) {
    console.log("✨ All audited endpoints are healthy. Zero broken link issues to create.");
    return;
  }

  console.log(`⚠️ Found ${failing.length} failing endpoint(s). Checking existing GitHub issues...`);

  // Query existing open broken-link issues via gh CLI
  let existingIssueTitles = "";
  try {
    existingIssueTitles = execFileSync(
      "gh",
      [
        "issue",
        "list",
        "--state",
        "open",
        "--label",
        "broken-link",
        "--json",
        "title",
        "--jq",
        ".[].title",
      ],
      {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      },
    );
  } catch {
    console.log("gh CLI not authenticated or unavailable. Printing issues to console instead.");
  }

  // Mark failing endpoints as "Needs Maintenance" in shelf JSON files
  let markedCount = 0;
  const shelfDir = path.join(root, "shelf");
  const shelfFiles = await fs.readdir(shelfDir);
  for (const sf of shelfFiles) {
    if (!sf.endsWith(".json")) continue;
    const sfPath = path.join(shelfDir, sf);
    const raw = await fs.readFile(sfPath, "utf8");
    const items = JSON.parse(raw.replace(/^\uFEFF/, ""));
    let modified = false;

    for (const item of items) {
      const isFailing = failing.some((f) => f.name.toLowerCase() === item.name.toLowerCase());
      if (isFailing) {
        if (!item.maintenance && item.status !== "Needs Maintenance") {
          item.status = "Needs Maintenance";
          modified = true;
          markedCount++;
        }
      }
    }

    if (modified) {
      await fs.writeFile(sfPath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
    }
  }

  console.log(`🏷️ Flagged ${markedCount} item(s) with 'Needs Maintenance' status.`);

  // Create Consolidated Weekly Digest Issue
  const digestTitle = `[Weekly Rotten Link Digest]: Community Cleanup Needed (${failing.length} dead URLs)`;
  if (existingIssueTitles.includes("[Weekly Rotten Link Digest]")) {
    console.log(
      "  ℹ️ Weekly digest issue already exists for this cycle. Skipping duplicate creation.",
    );
    return;
  }

  const tableRows = failing
    .map(
      (ep) =>
        `| **${ep.name}** | \`${ep.url}\` | \`${ep.status}\` | \`${ep.rotType || "dead"}\` | \`${ep.consecutiveFailures ?? 1}\` | \`shelf/${ep.file || "tools"}\` |`,
    )
    .join("\n");

  const digestBody = `### 🚨 DevShelf Weekly Automated Link Health & Rotten Link Digest

Our automated weekly link health audit evaluated all 530+ verified free tools and detected **${failing.length}** dead, unreachable, or rotting endpoints.

These items have been automatically tagged as **"Needs Maintenance"** in the catalog. We invite community contributors to verify and fix them!

---

### 📋 Affected Resources (${failing.length})

| Tool Name | Reported Endpoint | HTTP Status | Rot Classification | Failures | Shelf Source |
| :--- | :--- | :---: | :---: | :---: | :--- |
${tableRows}

---

### 🛠️ How You Can Help (Good First Issue / 5-Minute PR)
1. Pick any tool from the table above.
2. Check if the project has moved to a new official website, GitHub repo, or documentation URL:
   - **If moved**: Open the corresponding \`shelf/<file>.json\` and update the \`url\` or \`repo\` field, removing the \`status: "Needs Maintenance"\` tag.
   - **If permanently shut down**: Suggest a verified free zero-paywall alternative in a PR or comment below.
3. Verify your PR locally:
   \`\`\`bash
   pnpm test
   pnpm run validate
   \`\`\`
4. Submit your PR — our CI will automatically test and celebrate your merge!

*Automated by DevShelf Weekly Healthcheck & Sunset Auditor.*`;

  try {
    execFileSync(
      "gh",
      [
        "issue",
        "create",
        "--title",
        digestTitle,
        "--body",
        digestBody,
        "--label",
        "broken-link,good first issue,help wanted,needs maintenance",
      ],
      { stdio: "inherit" },
    );
    console.log(`  🎉 Created consolidated weekly digest issue: "${digestTitle}"`);
  } catch (err: any) {
    console.log(`  Could not run gh issue create: ${err.message}. Ready for CI environment.`);
  }
}

generateRotIssues().catch((err) => {
  console.error("Rot issue generator error:", err);
  process.exit(1);
});
