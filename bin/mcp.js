#!/usr/bin/env node

/**
 * DevShelf Official Model Context Protocol (MCP) Server
 * Enables AI coding assistants (Claude Desktop, Cursor, Antigravity, Windsurf, Zed)
 * to discover, search, and recommend 520+ verified zero-paywall developer tools,
 * free public APIs, AI agents, and open-source infrastructure.
 *
 * Spec: Model Context Protocol (JSON-RPC 2.0 stdio transport)
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { loadCatalog } from "./lib/catalog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getCatalog() {
  return loadCatalog();
}

// Tool definitions for MCP clients
const TOOLS = [
  {
    name: "search_tools",
    description:
      "Search 520+ verified zero-paywall developer tools, open-source repositories, free public APIs, and AI agents. Returns name, description, URL, license, auth, and free tier details.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search keyword (e.g., 'postgres', 'weather', 'mock api', 'testing', 'llm')",
        },
        category: {
          type: "string",
          description:
            "Optional filter by category (e.g., 'apis', 'ai', 'cli', 'testing', 'cloud')",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (default: 8, max: 25)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_tool",
    description:
      "Get detailed information, documentation link, licensing, rate limit, and verification telemetry for a specific developer tool or API by name.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "The exact or partial name of the tool (e.g., 'Bruno', 'Ollama', 'PocketBase')",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "find_free_alternatives",
    description:
      "Find verified 100% free and open-source alternatives to paid commercial or proprietary software (e.g., Postman -> Bruno/Hoppscotch, Airtable -> NocoDB, Datadog -> Prometheus).",
    inputSchema: {
      type: "object",
      properties: {
        commercialTool: {
          type: "string",
          description:
            "Name of the proprietary or paid tool (e.g., 'Postman', 'Airtable', 'Firebase', 'Datadog')",
        },
      },
      required: ["commercialTool"],
    },
  },
  {
    name: "list_categories",
    description: "List all curated categories and live resource counts available in DevShelf.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_random_tool",
    description: "Discover a random verified developer tool or API from the DevShelf catalog.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional category filter",
        },
      },
    },
  },
];

async function handleToolCall(name, args) {
  const data = await getCatalog();
  const resources = data.resources || [];

  if (name === "search_tools") {
    const q = (args.query || "").toLowerCase().trim();
    if (!q) {
      return {
        error:
          "Query parameter cannot be empty. Please specify a search term (e.g. 'postgres', 'llm', 'mock api').",
      };
    }
    const cat = (args.category || "").toLowerCase().trim();
    const limit = Math.min(Math.max(Number(args.limit) || 8, 1), 25);

    const matches = resources.filter((item) => {
      if (
        cat &&
        (item.category || "").toLowerCase() !== cat &&
        (item.type || "").toLowerCase() !== cat
      ) {
        return false;
      }
      const searchTarget = [
        item.name,
        item.description,
        item.category,
        item.language,
        item.alternativeTo,
        item.auth,
        item.freeTier,
        ...(item.statusTags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchTarget.includes(q);
    });

    const results = matches.slice(0, limit).map((m) => ({
      name: m.name,
      url: m.url || m.repo,
      repo: m.repo || null,
      category: m.category,
      description: m.description,
      license: m.license || "Free",
      freeTier: m.freeTier || "Verified zero-paywall free tier",
      auth: m.auth || null,
      alternativeTo: m.alternativeTo || null,
    }));

    return {
      totalFound: matches.length,
      returned: results.length,
      results,
    };
  }

  if (name === "get_tool") {
    const targetName = (args.name || "").toLowerCase().trim();
    if (!targetName) {
      return {
        error:
          "Name parameter cannot be empty. Please specify a tool name (e.g. 'Bruno', 'Ollama').",
      };
    }
    const tool = resources.find(
      (r) => r.name.toLowerCase() === targetName || r.name.toLowerCase().includes(targetName),
    );

    if (!tool) {
      return { error: `No tool found matching '${args.name}'. Try using 'search_tools'.` };
    }

    return {
      name: tool.name,
      url: tool.url || tool.repo,
      repo: tool.repo || null,
      category: tool.category,
      description: tool.description,
      language: tool.language || null,
      license: tool.license || "Free",
      auth: tool.auth || "No Key",
      rateLimit: tool.rateLimit || null,
      freeTier: tool.freeTier || "Verified zero-paywall",
      alternativeTo: tool.alternativeTo || null,
      statusTags: tool.statusTags || ["Verified Free"],
    };
  }

  if (name === "find_free_alternatives") {
    const target = (args.commercialTool || "").toLowerCase().trim();
    const matches = resources.filter((r) => {
      const alt = (r.alternativeTo || "").toLowerCase();
      const desc = (r.description || "").toLowerCase();
      return alt.includes(target) || desc.includes(`alternative to ${target}`);
    });

    return {
      commercialTool: args.commercialTool,
      count: matches.length,
      alternatives: matches.map((m) => ({
        name: m.name,
        alternativeTo: m.alternativeTo,
        url: m.url || m.repo,
        repo: m.repo || null,
        description: m.description,
        license: m.license || "FOSS",
        freeTier: m.freeTier || "100% Free Tier",
      })),
    };
  }

  if (name === "list_categories") {
    const categoryCounts = {};
    for (const r of resources) {
      const cat = r.category || "General";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
    return {
      totalResources: resources.length,
      categories: categoryCounts,
    };
  }

  if (name === "get_random_tool") {
    const cat = (args?.category || "").toLowerCase().trim();
    const pool = cat
      ? resources.filter(
          (r) =>
            (r.category || "").toLowerCase().includes(cat) ||
            (r.type || "").toLowerCase().includes(cat),
        )
      : resources;

    if (pool.length === 0) return { error: `No tools found in category '${cat}'` };
    const picked = pool[Math.floor(Math.random() * pool.length)];

    return {
      name: picked.name,
      url: picked.url || picked.repo,
      repo: picked.repo || null,
      category: picked.category,
      description: picked.description,
      freeTier: picked.freeTier || "Free",
      license: picked.license || "Open Source",
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export function startMcpServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  const sendResponse = (msg) => {
    process.stdout.write(`${JSON.stringify(msg)}\n`);
  };

  rl.on("line", async (line) => {
    if (!line.trim()) return;

    let req;
    try {
      req = JSON.parse(line);
    } catch {
      sendResponse({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error" },
      });
      return;
    }

    const { id, method, params } = req;

    try {
      if (method === "initialize") {
        sendResponse({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            serverInfo: {
              name: "devshelf-mcp",
              version: JSON.parse(
                fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
              ).version,
            },
            capabilities: {
              tools: {},
            },
          },
        });
        return;
      }

      if (method === "notifications/initialized") {
        // Notification ack
        return;
      }

      if (method === "ping") {
        sendResponse({ jsonrpc: "2.0", id, result: {} });
        return;
      }

      if (method === "tools/list") {
        sendResponse({
          jsonrpc: "2.0",
          id,
          result: {
            tools: TOOLS,
          },
        });
        return;
      }

      if (method === "tools/call") {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};
        const output = await handleToolCall(toolName, toolArgs);

        sendResponse({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(output, null, 2),
              },
            ],
          },
        });
        return;
      }

      sendResponse({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      });
    } catch (err) {
      sendResponse({
        jsonrpc: "2.0",
        id,
        error: { code: -32603, message: err.message },
      });
    }
  });

  process.stderr.write(
    "🚀 [DevShelf MCP Server] Running on stdio transport (520+ verified tools ready).\n",
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startMcpServer();
}
