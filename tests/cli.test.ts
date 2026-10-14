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
    assert.match(res.stdout, /npx devshelf mcp/);
  });

  test("returns valid JSON telemetry with stats --json", () => {
    const res = runCli("stats --json");
    assert.equal(res.status, 0);
    const parsed = JSON.parse(res.stdout);
    assert.ok(typeof parsed === "object" && parsed !== null);
    assert.ok(parsed.repos >= 300, "Should report at least 300 GitHub repos");
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
    assert.match(res.stdout, /DevShelf CLI & TUI.*v1\.1\.1/);
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
    assert.equal(payload.securityAudit?.status, "ZERO_LEAK_VERIFIED");
    assert.ok(payload.securityAudit?.signatureHash);
    assert.ok(payload.securityAudit?.verifyUrl.includes("hash="));
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
});
