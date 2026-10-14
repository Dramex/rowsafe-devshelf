import fs from "node:fs/promises";
import path from "node:path";

interface ResourceItem {
  name: string;
  url?: string;
  repo?: string;
  category?: string;
  description?: string;
}

interface LinkCheckResult {
  file: string;
  name: string;
  url: string;
  status: number | string;
  ok: boolean;
  error?: string;
  latencyMs?: number;
  rotType?:
    | "soft_404"
    | "parked_domain"
    | "ssl_expired"
    | "hard_paywall"
    | "timeout_or_dns"
    | "http_error";
  consecutiveFailures: number;
  firstFailedAt?: string;
  eligibleForSunset: boolean;
  history: number[];
}

interface ExistingEndpointTelemetry {
  name: string;
  url: string;
  status: number | string;
  ok: boolean;
  latencyMs?: number;
  uptimePercent?: number;
  history?: number[];
  consecutiveFailures?: number;
  firstFailedAt?: string;
  rotType?: string;
}

const PARKED_DOMAIN_SIGNATURES = [
  /sedo(\.com|\.co\.uk)?/i,
  /dan\.com/i,
  /hugedomains\.com/i,
  /godaddy\.com\/(domainsearch|park)/i,
  /namecheap\.com\/domains\/parked/i,
  /bodis\.com/i,
  /this domain is for sale/i,
  /buy this domain/i,
  /domain parking/i,
  /is parked free, courtesy of/i,
];

const SOFT_404_SIGNATURES = [
  /<title>[^<]*(404|not found|page cannot be found|domain expired|suspended)[^<]*<\/title>/i,
  /<h1[^>]*>[^<]*(404|page not found|error 404|domain expired)[^<]*<\/h1>/i,
  /this page could not be found/i,
  /this account has been suspended/i,
];

const PAYWALL_REDIRECT_SIGNATURES = [
  /\/login\b/i,
  /\/signin\b/i,
  /\/auth\/login\b/i,
  /\/subscribe\b/i,
  /\/paywall\b/i,
];

async function pingUrl(urlStr: string): Promise<{
  ok: boolean;
  status: number | string;
  error?: string;
  latencyMs: number;
  rotType?:
    | "soft_404"
    | "parked_domain"
    | "ssl_expired"
    | "hard_paywall"
    | "timeout_or_dns"
    | "http_error";
}> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let res: Response | null = null;
    let bodyText = "";

    try {
      res = await fetch(urlStr, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 DevShelf-Healthcheck/2.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      // Read a maximum of 35KB of body text for soft-404 and parked domain inspection
      const rawText = await res.text();
      bodyText = rawText.slice(0, 35000);
    } catch (fetchErr: unknown) {
      clearTimeout(timeout);
      throw fetchErr;
    } finally {
      clearTimeout(timeout);
    }

    const latencyMs = Date.now() - start;
    if (!res) {
      return {
        ok: false,
        status: "NO_RESPONSE",
        error: "Empty HTTP response",
        latencyMs,
        rotType: "http_error",
      };
    }

    // 1. Check for Hard Login / Paywall Redirects
    const finalUrl = res.url || "";
    if (finalUrl && finalUrl !== urlStr) {
      try {
        const finalPath = new URL(finalUrl).pathname;
        if (PAYWALL_REDIRECT_SIGNATURES.some((sig) => sig.test(finalPath))) {
          return {
            ok: false,
            status: "HARD_PAYWALL",
            error: `Forced authentication/paywall redirect to ${finalPath}`,
            latencyMs,
            rotType: "hard_paywall",
          };
        }
      } catch {
        // Ignore URL parse error
      }
    }

    // 2. Check for Parked Domain signatures
    for (const sig of PARKED_DOMAIN_SIGNATURES) {
      if (sig.test(bodyText) || sig.test(finalUrl)) {
        return {
          ok: false,
          status: "PARKED_DOMAIN",
          error: "Domain is expired or parked with an ad service",
          latencyMs,
          rotType: "parked_domain",
        };
      }
    }

    // 3. Check for Soft 404 signatures
    for (const sig of SOFT_404_SIGNATURES) {
      if (sig.test(bodyText)) {
        return {
          ok: false,
          status: "SOFT_404",
          error: "Page rendered a soft 404 or page-not-found screen",
          latencyMs,
          rotType: "soft_404",
        };
      }
    }

    // Accept any 2xx, 3xx, and 403/429 (since bots might get rate-limited by CDNs but origin is active)
    const isUp = res.status < 400 || res.status === 403 || res.status === 429;
    return {
      ok: isUp,
      status: res.status,
      error: isUp ? undefined : `HTTP ${res.status}`,
      latencyMs,
      rotType: isUp ? undefined : "http_error",
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    const code = String((err as { code?: unknown })?.code || "");

    // Detect SSL / TLS Expiration
    if (
      code.includes("CERT_") ||
      code.includes("SSL_") ||
      code.includes("TLS_") ||
      msg.toLowerCase().includes("certificate") ||
      msg.toLowerCase().includes("ssl") ||
      msg.toLowerCase().includes("tls")
    ) {
      return {
        ok: false,
        status: "SSL_ERROR",
        error: `SSL/TLS Certificate Error: ${msg}`,
        latencyMs,
        rotType: "ssl_expired",
      };
    }

    const isTimeout = (err as { name?: string })?.name === "AbortError";
    return {
      ok: false,
      status: isTimeout ? "TIMEOUT" : "DNS_OR_NETWORK",
      error: isTimeout ? "Request Timeout (8s)" : msg,
      latencyMs,
      rotType: "timeout_or_dns",
    };
  }
}

async function checkDeadLinks() {
  const root = process.cwd();
  const shelfDir = path.join(root, "shelf");
  const siteDir = path.join(root, "site");
  const files = await fs.readdir(shelfDir);

  // Load prior telemetry history if present
  const priorHistory = new Map<string, ExistingEndpointTelemetry>();
  try {
    const priorRaw = await fs.readFile(path.join(siteDir, "uptime.json"), "utf8");
    const priorJson = JSON.parse(priorRaw);
    if (Array.isArray(priorJson.endpoints)) {
      for (const ep of priorJson.endpoints) {
        priorHistory.set(ep.name.toLowerCase(), ep);
      }
    }
  } catch {
    // Fresh run if no prior telemetry
  }

  const results: LinkCheckResult[] = [];
  const itemsToCheck: { file: string; name: string; url: string }[] = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const content = await fs.readFile(path.join(shelfDir, file), "utf8");
    const items: ResourceItem[] = JSON.parse(content.replace(/^\uFEFF/, ""));

    for (const item of items) {
      const targetUrl = item.url || item.repo;
      if (targetUrl) {
        itemsToCheck.push({ file, name: item.name, url: targetUrl });
      }
    }
  }

  console.log(
    `🔍 [DevShelf Healthcheck] Auditing ${itemsToCheck.length} endpoints with intelligent link rottenness detection...\n`,
  );

  // Run in concurrent chunks of 5
  const concurrency = 5;
  for (let i = 0; i < itemsToCheck.length; i += concurrency) {
    const batch = itemsToCheck.slice(i, i + concurrency);
    const batchPromises = batch.map(async (item) => {
      const ping = await pingUrl(item.url);
      const prior = priorHistory.get(item.name.toLowerCase());

      const consecutiveFailures = ping.ok ? 0 : (prior?.consecutiveFailures || 0) + 1;
      const firstFailedAt = ping.ok ? undefined : prior?.firstFailedAt || new Date().toISOString();

      // Check if eligible for sunset: consecutive failures >= 3 OR down for >= 14 days
      let eligibleForSunset = false;
      if (!ping.ok) {
        const daysDown = firstFailedAt
          ? (Date.now() - Date.parse(firstFailedAt)) / (1000 * 60 * 60 * 24)
          : 0;
        if (consecutiveFailures >= 3 || daysDown >= 14) {
          eligibleForSunset = true;
        }
      }

      // Maintain 7-day visual history timeline
      const prevHistory =
        Array.isArray(prior?.history) && prior.history.length > 0
          ? prior.history
          : [1, 1, 1, 1, 1, 1];
      const newHistory = [...prevHistory.slice(-6), ping.ok ? 1 : 0];

      const result: LinkCheckResult = {
        file: item.file,
        name: item.name,
        url: item.url,
        status: ping.status,
        ok: ping.ok,
        error: ping.error,
        latencyMs: ping.latencyMs,
        rotType: ping.rotType,
        consecutiveFailures,
        firstFailedAt,
        eligibleForSunset,
        history: newHistory,
      };

      if (result.ok) {
        console.log(`  ✓ [${result.status}] ${result.name} (${result.latencyMs}ms)`);
      } else {
        console.error(
          `  ❌ [${result.status}] ${result.name} (${result.url}) [${result.rotType || "dead"}] - ${result.error}`,
        );
      }
      return result;
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  const deadLinks = results.filter((r) => !r.ok);
  const sunsetReady = results.filter((r) => r.eligibleForSunset);
  const total = results.length;
  const alive = total - deadLinks.length;
  const healthPercent = ((alive / total) * 100).toFixed(1);

  console.log("\n========================================");
  console.log("📊 DevShelf Intelligent Healthcheck Summary:");
  console.log(`   Total Endpoints Checked:   ${total}`);
  console.log(`   Active & Reachable:       ${alive} (${healthPercent}%)`);
  console.log(`   Dead / Rotting:           ${deadLinks.length}`);
  console.log(`   Eligible for Sunset PR:   ${sunsetReady.length}`);
  console.log("========================================\n");

  const uptimeReport = {
    lastChecked: new Date().toISOString(),
    totalChecked: total,
    activeReachable: alive,
    deadUnreachable: deadLinks.length,
    healthPercent: Number(healthPercent),
    status: deadLinks.length === 0 ? "100% Operational" : "Degraded",
    endpoints: results.map((r) => ({
      name: r.name,
      file: r.file,
      url: r.url,
      status: r.status,
      ok: r.ok,
      latencyMs: r.latencyMs || 95,
      uptimePercent: r.ok
        ? 100
        : Math.round((r.history.filter((h) => h === 1).length / r.history.length) * 100),
      history: r.history,
      consecutiveFailures: r.consecutiveFailures,
      firstFailedAt: r.firstFailedAt,
      rotType: r.rotType,
      eligibleForSunset: r.eligibleForSunset,
    })),
  };

  await fs.writeFile(
    path.join(siteDir, "uptime.json"),
    `${JSON.stringify(uptimeReport, null, 2)}\n`,
    "utf8",
  );
  console.log("📁 Exported uptime history telemetry to site/uptime.json");

  if (deadLinks.length > 0) {
    console.warn(`⚠️ Warning: ${deadLinks.length} dead link(s) identified.`);
  } else {
    console.log("🎉 100% of curated DevShelf resources are active and healthy!");
  }
}

checkDeadLinks().catch((err) => {
  console.error("Link check execution error:", err);
  process.exit(1);
});
