import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import path from "node:path";
import test, { describe } from "node:test";

const ROOT = process.cwd();
const CLI_PATH = path.join(ROOT, "bin", "cli.js");

function runCli(args: string): { stdout: string; stderr: string; status: number } {
  try {
    const stdout = execSync(`node "${CLI_PATH}" ${args}`, {
      encoding: "utf8",
      cwd: ROOT,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout, stderr: "", status: 0 };
  } catch (err: any) {
    return {
      stdout: err.stdout?.toString() || "",
      stderr: err.stderr?.toString() || "",
      status: err.status ?? 1,
    };
  }
}

describe("DevShelf CLI & TUI Suite", () => {
  test("prints version with --version flag", () => {
    const res = runCli("--version");
    assert.equal(res.status, 0);
    assert.match(res.stdout, /devshelf v\d+\.\d+\.\d+/);
  });

  test("prints help message with --help flag", () => {
    const res = runCli("--help");
    assert.equal(res.status, 0);
    assert.match(res.stdout, /USAGE:/);
    assert.match(res.stdout, /npx devshelf search/);
    assert.match(res.stdout, /npx devshelf random/);
    assert.match(res.stdout, /npx devshelf update/);
    assert.match(res.stdout, /npx devshelf mcp/);
  });

  test("returns valid JSON telemetry with stats --json", () => {
    const res = runCli("stats --json");
    assert.equal(res.status, 0);
    const parsed = JSON.parse(res.stdout);
    assert.ok(typeof parsed === "object" && parsed !== null);
    assert.ok(parsed.repos >= 300, "Should report at least 300 GitHub repos");
    assert.ok(typeof parsed.catalogSource === "string", "Must declare catalogSource");
    assert.ok(parsed.catalogTimestamp !== null, "Must declare catalogTimestamp");
    assert.ok(typeof parsed.cachePath === "string", "Must report local cachePath");
  });

  test("refreshes live catalog with update --json", () => {
    const res = runCli("update --json");
    assert.equal(res.status, 0);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.success, true);
    assert.strictEqual(parsed.catalogSource, "live");
    assert.ok(parsed.totalCount >= 500);
    assert.ok(typeof parsed.cachePath === "string");
  });

  test("searches items by keyword and returns matching results in JSON", () => {
    const res = runCli('search "postgres" --json');
    assert.equal(res.status, 0);
    const results = JSON.parse(res.stdout);
    assert.ok(Array.isArray(results), "Search results should be an array");
    assert.ok(results.length > 0, "Should find matches for postgres");
    assert.ok(
      results.some(
        (r: any) =>
          (r.name || "").toLowerCase().includes("neon") ||
          (r.description || "").toLowerCase().includes("postgres"),
      ),
      "Results should contain relevant postgres tools",
    );
  });

  test("picks a random resource with random --json", () => {
    const res = runCli("random --json");
    assert.equal(res.status, 0);
    const item = JSON.parse(res.stdout);
    assert.ok(typeof item === "object" && item !== null);
    assert.ok(item.name && item.name.length > 0, "Random item must have a name");
  });

  test("returns active projects with contribute --json", () => {
    const res = runCli("contribute --json");
    assert.equal(res.status, 0);
    const results = JSON.parse(res.stdout);
    assert.ok(Array.isArray(results), "Contribute results should be an array");
    assert.ok(results.length > 0, "Should list matchmaker projects");
    assert.ok(
      results.some((r: any) => Array.isArray(r.issues) && r.issues.length > 0),
      "Projects should contain starter issues",
    );
  });

  test("returns daily discovery in JSON with daily --json", () => {
    const res = runCli("daily --json");
    assert.equal(res.status, 0);
    const parsed = JSON.parse(res.stdout);
    assert.ok(parsed.date && typeof parsed.date === "string");
    assert.ok(parsed.item && typeof parsed.item.name === "string");
  });

  test("runs daily --quiet with ultra-compact single line format", () => {
    const res = runCli("daily --quiet");
    assert.equal(res.status, 0);
    assert.match(res.stdout, /DevShelf Daily:/);
  });

  test("finds free alternatives when searching for paid tools", () => {
    const res = runCli('search "postman" --json');
    assert.equal(res.status, 0);
    const results = JSON.parse(res.stdout);
    assert.ok(Array.isArray(results));
    assert.ok(
      results.some((r: any) => (r.name || "").toLowerCase() === "bruno"),
      "Should match Bruno as an alternative to Postman",
    );
  });

  test("runs MCP server and answers initialize & tools/list via stdio", () => {
    const initReq = `${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} })}\n`;
    const toolsReq = `${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })}\n`;
    const stdout = execSync("node bin/mcp.js", {
      input: initReq + toolsReq,
      cwd: ROOT,
      encoding: "utf8",
    });

    const lines = stdout.trim().split("\n").filter(Boolean);
    assert.ok(lines.length >= 2, "Expected at least 2 JSON-RPC responses");
    const initRes = JSON.parse(lines[0]);
    assert.equal(initRes.id, 1);
    assert.equal(initRes.result?.serverInfo?.name, "devshelf-mcp");

    const toolsRes = JSON.parse(lines[1]);
    assert.equal(toolsRes.id, 2);
    assert.ok(Array.isArray(toolsRes.result?.tools));
    const toolNames = toolsRes.result.tools.map((t: any) => t.name);
    assert.ok(toolNames.includes("search_tools"));
    assert.ok(toolNames.includes("get_tool"));
    assert.ok(toolNames.includes("find_free_alternatives"));
  });

  test("CLI header in help displays current version from package.json", () => {
    const res = runCli("--help");
    assert.equal(res.status, 0);
    assert.match(res.stdout, /DevShelf CLI & TUI.*v\d+\.\d+\.\d+/);
  });

  test("devshelf open with no arguments exits with error rather than launching first item", () => {
    const res = runCli("open");
    assert.notEqual(res.status, 0);
    const combined = res.stdout + res.stderr;
    assert.match(combined, /Please specify a resource name to open/);
  });

  test("MCP search_tools with empty query returns validation error", () => {
    const searchReq = `${JSON.stringify({ jsonrpc: "2.0", id: 10, method: "tools/call", params: { name: "search_tools", arguments: { query: "" } } })}\n`;
    const stdout = execSync("node bin/mcp.js", {
      input: searchReq,
      cwd: ROOT,
      encoding: "utf8",
    });
    const lines = stdout.trim().split("\n").filter(Boolean);
    const parsed = JSON.parse(lines[0]);
    assert.ok(parsed.result?.content?.[0]?.text, "Expected content in MCP result");
    const payload = JSON.parse(parsed.result.content[0].text);
    assert.match(payload.error, /Query parameter cannot be empty/);
  });

  test("MCP get_tool with empty name returns validation error", () => {
    const getReq = `${JSON.stringify({ jsonrpc: "2.0", id: 11, method: "tools/call", params: { name: "get_tool", arguments: { name: "" } } })}\n`;
    const stdout = execSync("node bin/mcp.js", {
      input: getReq,
      cwd: ROOT,
      encoding: "utf8",
    });
    const lines = stdout.trim().split("\n").filter(Boolean);
    const parsed = JSON.parse(lines[0]);
    assert.ok(parsed.result?.content?.[0]?.text, "Expected content in MCP result");
    const payload = JSON.parse(parsed.result.content[0].text);
    assert.match(payload.error, /Name parameter cannot be empty/);
  });

  test("MCP get_security_audit returns cryptographic audit status and HMAC signature", () => {
    const auditReq = `${JSON.stringify({ jsonrpc: "2.0", id: 12, method: "tools/call", params: { name: "get_security_audit", arguments: { toolName: "AgentShield" } } })}\n`;
    const stdout = execSync("node bin/mcp.js", {
      input: auditReq,
      cwd: ROOT,
      encoding: "utf8",
    });
    const lines = stdout.trim().split("\n").filter(Boolean);
    const parsed = JSON.parse(lines[0]);
    assert.ok(parsed.result?.content?.[0]?.text);
    const payload = JSON.parse(parsed.result.content[0].text);
    assert.equal(payload.toolName, "AgentShield");
    assert.ok(payload.identity?.catalogDigest);
    assert.equal(payload.securityAudit?.status, "ZERO_LEAK_VERIFIED");
    assert.ok(payload.securityAudit?.signatureHash);
    assert.ok(payload.securityAudit?.verifyUrl.includes("hash="));

    // Verify un-audited tool returns NOT_AUDITED
    const unAuditedReq = `${JSON.stringify({ jsonrpc: "2.0", id: 122, method: "tools/call", params: { name: "get_security_audit", arguments: { toolName: "Ollama" } } })}\n`;
    const unAuditedStdout = execSync("node bin/mcp.js", {
      input: unAuditedReq,
      cwd: ROOT,
      encoding: "utf8",
    });
    const unAuditedLines = unAuditedStdout.trim().split("\n").filter(Boolean);
    const unAuditedPayload = JSON.parse(JSON.parse(unAuditedLines[0]).result.content[0].text);
    assert.equal(unAuditedPayload.securityAudit?.status, "NOT_AUDITED");
    assert.equal(unAuditedPayload.securityAudit?.verified, false);
    assert.ok(unAuditedPayload.identity?.catalogDigest);
  });

  test("MCP list_verified_sponsor_tools returns featured tools with sponsor tier metadata", () => {
    const listReq = `${JSON.stringify({ jsonrpc: "2.0", id: 13, method: "tools/call", params: { name: "list_verified_sponsor_tools", arguments: { category: "ai" } } })}\n`;
    const stdout = execSync("node bin/mcp.js", {
      input: listReq,
      cwd: ROOT,
      encoding: "utf8",
    });
    const lines = stdout.trim().split("\n").filter(Boolean);
    const parsed = JSON.parse(lines[0]);
    assert.ok(parsed.result?.content?.[0]?.text);
    const payload = JSON.parse(parsed.result.content[0].text);
    assert.ok(payload.totalFeatured >= 1);
    assert.ok(payload.tools.some((t: any) => t.name === "AgentShield"));
  });

  test("returns valid sponsors ledger with sponsors --json", () => {
    const res = runCli("sponsors --json");
    assert.equal(res.status, 0);
    const parsed = JSON.parse(res.stdout);
    assert.ok(Array.isArray(parsed.patrons), "Should contain patrons array");
    assert.ok(parsed.patrons.length >= 6, "Should contain at least 6 verified patrons");
    assert.ok(parsed.stats?.totalContributedUSD >= 500, "Should report ledger pool >= $500");
  });

  test("prints formatted patron table with sponsors command", () => {
    const res = runCli("sponsors");
    assert.equal(res.status, 0);
    assert.match(res.stdout, /DevShelf Wall of Patrons/);
    assert.match(res.stdout, /RitualDev Core Team/);
    assert.match(res.stdout, /Gold Patron/);
    assert.match(res.stdout, /https:\/\/devshelf\.ritualdev\.in\/sponsors\.html/);
  });

  test("MCP list_sponsors returns verified patrons ledger", () => {
    const sponsorsReq = `${JSON.stringify({ jsonrpc: "2.0", id: 14, method: "tools/call", params: { name: "list_sponsors", arguments: { tier: "gold" } } })}\n`;
    const stdout = execSync("node bin/mcp.js", {
      input: sponsorsReq,
      cwd: ROOT,
      encoding: "utf8",
    });
    const lines = stdout.trim().split("\n").filter(Boolean);
    const parsed = JSON.parse(lines[0]);
    assert.ok(parsed.result?.content?.[0]?.text);
    const payload = JSON.parse(parsed.result.content[0].text);
    assert.ok(Array.isArray(payload.patrons), "Should return patrons array");
    assert.ok(
      payload.patrons.every((p: any) => p.tier === "gold"),
      "All patrons should be gold tier",
    );
    assert.ok(payload.becomeSponsorUrl.includes("sponsors.html"));
  });

  test("MCP get_sponsor_badge returns markdown and image URLs", () => {
    const badgeReq = `${JSON.stringify({ jsonrpc: "2.0", id: 15, method: "tools/call", params: { name: "get_sponsor_badge", arguments: { handle: "RitualDev-Lab", tier: "gold", style: "card" } } })}\n`;
    const stdout = execSync("node bin/mcp.js", {
      input: badgeReq,
      cwd: ROOT,
      encoding: "utf8",
    });
    const lines = stdout.trim().split("\n").filter(Boolean);
    const parsed = JSON.parse(lines[0]);
    assert.ok(parsed.result?.content?.[0]?.text);
    const payload = JSON.parse(parsed.result.content[0].text);
    assert.equal(payload.handle, "RitualDev-Lab");
    assert.equal(payload.tier, "gold");
    assert.equal(payload.style, "card");
    assert.ok(payload.badgeUrl.includes("RitualDev-Lab-card.svg"));
    assert.ok(payload.markdown.startsWith("[![DevShelf Sponsor]"));
  });
});
