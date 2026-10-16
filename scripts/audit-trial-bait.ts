import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

export interface CatalogItem {
  name: string;
  url: string;
  repo?: string;
  description: string;
  category: string;
  tags?: string[];
  pricing?: string;
}

export interface SuspiciousMatch {
  rule: string;
  phrase: string;
  excerpt: string;
}

export interface PageAnalysisResult {
  isSuspicious: boolean;
  confidence: "high" | "medium" | "low" | "none";
  reasons: string[];
  matches: SuspiciousMatch[];
}

export interface ResourceAuditResult {
  name: string;
  category: string;
  url: string;
  status: number | "error" | "skipped";
  analysis: PageAnalysisResult;
  checkedAt: string;
}

export interface TrialBaitReport {
  generatedAt: string;
  totalScanned: number;
  suspiciousCount: number;
  findings: ResourceAuditResult[];
}

/**
 * Strips HTML tags and normalizes whitespace for text analysis
 */
export function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Analyzes page content for deceptive pricing models, upfront credit card requirements,
 * or discontinued free tiers.
 */
export function analyzePageContent(html: string): PageAnalysisResult {
  const text = extractTextFromHtml(html);
  const lowerText = text.toLowerCase();

  const matches: SuspiciousMatch[] = [];
  const reasons: string[] = [];

  // Positive signals indicating genuine permanent free tier
  const hasFreeForever =
    lowerText.includes("free forever") ||
    lowerText.includes("always free") ||
    lowerText.includes("free tier forever") ||
    lowerText.includes("forever free") ||
    lowerText.includes("$0/mo") ||
    lowerText.includes("$0 / month") ||
    lowerText.includes("free plan:") ||
    lowerText.includes("community edition") ||
    lowerText.includes("open source");

  // Rule 1: Mandatory Upfront Credit Card Requirement
  // Exclude "no credit card required" / "credit card not required" / "without credit card"
  const ccRegex =
    /(?<!no\s+|without\s+a\s+|without\s+|never\s+ask\s+for\s+a\s+)(credit\s*card\s+required|requires\s+(a\s+)?credit\s*card|credit\s*card\s+is\s+required|billing\s*info\s+required\s+to\s+start|payment\s*method\s+required\s+for\s+trial)/i;

  const ccMatch = text.match(ccRegex);
  if (ccMatch && ccMatch.index !== undefined) {
    const start = Math.max(0, ccMatch.index - 50);
    const end = Math.min(text.length, ccMatch.index + ccMatch[0].length + 50);
    const excerpt = text.slice(start, end).trim();

    // Verify it doesn't contain negation in the excerpt
    const lowerExcerpt = excerpt.toLowerCase();
    if (
      !lowerExcerpt.includes("no credit card") &&
      !lowerExcerpt.includes("not required") &&
      !lowerExcerpt.includes("without credit card") &&
      !lowerExcerpt.includes("no card")
    ) {
      matches.push({
        rule: "credit_card_upfront",
        phrase: ccMatch[0],
        excerpt,
      });
      reasons.push("Mandatory upfront credit card requirement detected");
    }
  }

  // Rule 2: Free Tier Discontinued or Sunset
  const sunsetRegex =
    /\b(free\s+tier\s+(is\s+)?(discontinued|deprecated|ended|sunset|removed)|no\s+longer\s+offer(s)?\s+(a\s+)?free\s+(tier|plan)|(sunsetting|discontinuing|ending|retiring|cancelling|removing)\s+(our\s+|the\s+)?free\s+(tier|plan))\b/i;

  const sunsetMatch = text.match(sunsetRegex);
  if (sunsetMatch && sunsetMatch.index !== undefined) {
    const start = Math.max(0, sunsetMatch.index - 50);
    const end = Math.min(text.length, sunsetMatch.index + sunsetMatch[0].length + 50);
    matches.push({
      rule: "free_tier_sunset",
      phrase: sunsetMatch[0],
      excerpt: text.slice(start, end).trim(),
    });
    reasons.push("Explicit free tier discontinuation notice detected");
  }

  // Rule 3: Trial-Only Traps (e.g. "14-day free trial" with zero permanent free tier)
  const trialOnlyRegex = /\b(14|30|7)\s*-?\s*day\s+(free\s+)?trial\b(?!\s*(period\s+optional))/i;
  const trialMatch = text.match(trialOnlyRegex);

  if (trialMatch && !hasFreeForever && trialMatch.index !== undefined) {
    // Check if the page also contains signs of a true free tier
    const mentionsFreePlan =
      lowerText.includes("free tier") ||
      lowerText.includes("free plan") ||
      lowerText.includes("free account");

    if (!mentionsFreePlan) {
      const start = Math.max(0, trialMatch.index - 50);
      const end = Math.min(text.length, trialMatch.index + trialMatch[0].length + 50);
      matches.push({
        rule: "trial_only_bait",
        phrase: trialMatch[0],
        excerpt: text.slice(start, end).trim(),
      });
      reasons.push("Time-limited trial detected without evidence of a permanent free plan");
    }
  }

  // Rule 4: No Free Tier / Paid Only
  const paidOnlyRegex = /\b(paid\s+plans?\s+only|no\s+free\s+(version|tier|plan)\s+available)\b/i;
  const paidMatch = text.match(paidOnlyRegex);
  if (paidMatch && paidMatch.index !== undefined) {
    const start = Math.max(0, paidMatch.index - 50);
    const end = Math.min(text.length, paidMatch.index + paidMatch[0].length + 50);
    matches.push({
      rule: "paid_only",
      phrase: paidMatch[0],
      excerpt: text.slice(start, end).trim(),
    });
    reasons.push("Explicitly declared as paid-only service");
  }

  let confidence: "high" | "medium" | "low" | "none" = "none";
  if (matches.length > 0) {
    if (
      matches.some(
        (m) =>
          m.rule === "credit_card_upfront" ||
          m.rule === "free_tier_sunset" ||
          m.rule === "paid_only",
      )
    ) {
      confidence = "high";
    } else if (matches.length >= 2) {
      confidence = "high";
    } else {
      confidence = "medium";
    }
  }

  return {
    isSuspicious: matches.length > 0,
    confidence,
    reasons,
    matches,
  };
}

/**
 * Probes and audits a single resource URL for potential paywall or trial bait.
 */
export async function auditResource(
  item: CatalogItem,
  options: { timeoutMs?: number } = {},
): Promise<ResourceAuditResult> {
  const timeoutMs = options.timeoutMs || 7000;
  const targetUrl = item.url || item.repo;

  if (!targetUrl || !targetUrl.startsWith("http")) {
    return {
      name: item.name,
      category: item.category,
      url: targetUrl || "",
      status: "skipped",
      analysis: { isSuspicious: false, confidence: "none", reasons: [], matches: [] },
      checkedAt: new Date().toISOString(),
    };
  }

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "DevShelf-TrialBait-Auditor/1.0 (+https://devshelf.ritualdev.in)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : undefined,
    });

    if (!res.ok) {
      return {
        name: item.name,
        category: item.category,
        url: targetUrl,
        status: res.status,
        analysis: { isSuspicious: false, confidence: "none", reasons: [], matches: [] },
        checkedAt: new Date().toISOString(),
      };
    }

    const html = await res.text();
    const analysis = analyzePageContent(html);

    return {
      name: item.name,
      category: item.category,
      url: targetUrl,
      status: res.status,
      analysis,
      checkedAt: new Date().toISOString(),
    };
  } catch (_err) {
    return {
      name: item.name,
      category: item.category,
      url: targetUrl,
      status: "error",
      analysis: { isSuspicious: false, confidence: "none", reasons: [], matches: [] },
      checkedAt: new Date().toISOString(),
    };
  }
}

/**
 * Loads all items from shelf directory.
 */
export async function loadAllShelfItems(): Promise<{ item: CatalogItem; file: string }[]> {
  const shelfDir = path.join(process.cwd(), "shelf");
  const files = await fs.readdir(shelfDir);
  const results: { item: CatalogItem; file: string }[] = [];

  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const raw = await fs.readFile(path.join(shelfDir, f), "utf8");
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, ""));
    for (const item of parsed) {
      results.push({ item, file: f });
    }
  }

  return results;
}

/**
 * CLI Runner & Automated Issue Creator
 */
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number.parseInt(limitArg.split("=")[1], 10) : undefined;
  const singleUrl = args.find((a) => a.startsWith("--url="))?.split("=")[1];

  console.log("🕵️  [DevShelf Trial Bait & Paywall Trap Auditor]");
  console.log("Scanning catalog for credit card traps and silent free-tier degradations...\n");

  if (singleUrl) {
    console.log(`Auditing target URL: ${singleUrl}`);
    const res = await auditResource({
      name: "Target URL",
      url: singleUrl,
      description: "",
      category: "test",
    });
    console.log(JSON.stringify(res, null, 2));
    return;
  }

  const allItems = await loadAllShelfItems();

  // Focus primarily on cloud services, APIs, AI platforms, and QA tools where paywall transitions occur
  const candidates = allItems.filter(({ file }) =>
    ["free-cloud.json", "apis.json", "ai-tools.json", "testing-qa.json"].includes(file),
  );

  const scanItems = limit ? candidates.slice(0, limit) : candidates;
  console.log(`Auditing ${scanItems.length} candidate cloud/API resources...`);

  const findings: ResourceAuditResult[] = [];
  let scannedCount = 0;

  // Process in small batches of 5 to avoid network congestion
  const batchSize = 5;
  for (let i = 0; i < scanItems.length; i += batchSize) {
    const batch = scanItems.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(({ item }) => auditResource(item, { timeoutMs: 6000 })),
    );

    for (const r of results) {
      scannedCount++;
      if (r.analysis.isSuspicious) {
        findings.push(r);
        console.log(
          `  ⚠️ [${r.analysis.confidence.toUpperCase()}] ${r.name} - ${r.analysis.reasons.join(", ")}`,
        );
      }
    }
    process.stdout.write(`  Progress: ${scannedCount}/${scanItems.length} checked...\r`);
  }

  console.log(`\n\nAudit Complete! Checked: ${scannedCount} | Suspicious: ${findings.length}`);

  const report: TrialBaitReport = {
    generatedAt: new Date().toISOString(),
    totalScanned: scannedCount,
    suspiciousCount: findings.length,
    findings,
  };

  const reportPath = path.join(process.cwd(), "site", "trial-bait-report.json");
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`Saved report to ${reportPath}`);

  if (findings.length === 0) {
    console.log("🎉 Zero suspected trial bait or paywall traps detected!");
    return;
  }

  if (isDryRun) {
    console.log("ℹ️ Dry-run active. Skipping GitHub Issue creation.");
    return;
  }

  // Check existing GitHub issues to avoid duplication
  let existingIssues = "";
  try {
    existingIssues = execFileSync(
      "gh",
      [
        "issue",
        "list",
        "--state",
        "open",
        "--label",
        "trial-bait",
        "--json",
        "title",
        "--jq",
        ".[].title",
      ],
      { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] },
    );
  } catch {
    console.log("gh CLI unavailable or unauthenticated. Skipping automated issue creation.");
    return;
  }

  for (const f of findings) {
    if (f.analysis.confidence === "low") continue; // only file for medium or high confidence
    const issueTitle = `⚠️ Suspected Free Tier Degradation: ${f.name}`;
    if (existingIssues.includes(f.name)) {
      console.log(`  ℹ️ Issue already exists for ${f.name}. Skipping.`);
      continue;
    }

    const itemEntry = allItems.find((i) => i.item.name === f.name);
    const fileName = itemEntry ? itemEntry.file : "shelf/apis.json";

    const body = `### 🚨 Suspected Free Tier Degradation or Trial Bait Detected

Our automated **DevShelf Trial Bait & Paywall Trap Auditor** scanned the target endpoint and flagged a potential change in free tier accessibility:

- **Resource**: \`${f.name}\`
- **Catalog File**: \`shelf/${fileName}\`
- **Target URL**: ${f.url}
- **Confidence Level**: \`${f.analysis.confidence.toUpperCase()}\`
- **Flagged Reasons**:
${f.analysis.reasons.map((r) => `  - ${r}`).join("\n")}

#### 🔍 Detected Evidence:
\`\`\`
${f.analysis.matches.map((m) => `[${m.rule}]: "${m.phrase}"\nExcerpt: ...${m.excerpt}...`).join("\n\n")}
\`\`\`

---

### 🛠️ How to Verify and Fix (5-Minute Contributor Task)

1. Open the [official website / pricing page](${f.url}) in your browser.
2. Verify if the tool still provides a **permanent, functional free tier** (without forced trial expiration or mandatory credit card upfront).
3. **If the tool is still free**:
   - Comment on this issue explaining the current pricing model so we can adjust our heuristic patterns and close this issue.
4. **If the tool has turned paid-only or requires credit card upfront**:
   - Open \`shelf/${fileName}\` and either remove the tool or adjust its tags.
   - Run tests: \`pnpm test && pnpm run validate\`.
   - Submit your pull request to keep DevShelf clean and transparent!

*Automated by DevShelf Trial Bait & Paywall Trap Auditor.*
`;

    try {
      execFileSync(
        "gh",
        [
          "issue",
          "create",
          "--title",
          issueTitle,
          "--body",
          body,
          "--label",
          "trial-bait,audit,help wanted,good first issue",
        ],
        { stdio: "inherit" },
      );
      console.log(`  🎉 Created issue for ${f.name}`);
    } catch (err: any) {
      console.log(`  Could not run gh issue create: ${err.message}`);
    }
  }
}

// Run CLI directly if executed
if (process.argv[1]?.endsWith("audit-trial-bait.ts")) {
  main().catch((err) => {
    console.error("Auditor failed:", err);
    process.exit(1);
  });
}
