#!/usr/bin/env node

/**
 * DevShelf CLI & Interactive TUI
 * Discover 500+ curated developer tools, free APIs, AI agents, and perks from your terminal.
 *
 * Usage:
 *   npx devshelf                     # Interactive TUI mode
 *   npx devshelf search <query>      # Instant search
 *   npx devshelf list [category]     # List tools in category
 *   npx devshelf random              # Pick a random resource
 *   npx devshelf stats               # Catalog telemetry & counts
 *   npx devshelf open <name>         # Open resource URL in default browser
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { getResourceUrl, loadCatalog, searchCatalog } from "./lib/catalog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color support
const useColor = process.stdout.isTTY && !process.env.NO_COLOR && process.env.TERM !== "dumb";

const c = {
  reset: useColor ? "\x1b[0m" : "",
  bold: useColor ? "\x1b[1m" : "",
  dim: useColor ? "\x1b[2m" : "",
  italic: useColor ? "\x1b[3m" : "",
  underline: useColor ? "\x1b[4m" : "",
  purple: useColor ? "\x1b[38;2;168;85;247m" : "",
  cyan: useColor ? "\x1b[38;2;6;182;212m" : "",
  blue: useColor ? "\x1b[38;2;59;130;246m" : "",
  green: useColor ? "\x1b[38;2;34;197;94m" : "",
  amber: useColor ? "\x1b[38;2;245;158;11m" : "",
  red: useColor ? "\x1b[38;2;239;68;68m" : "",
  gray: useColor ? "\x1b[38;2;148;163;184m" : "",
  white: useColor ? "\x1b[97m" : "",
};

// Open URL cross-platform — safely open web URLs without invoking shell interpreters
function openUrl(url) {
  if (!url || typeof url !== "string") return;

  // Strictly validate URL to only allow web protocols (prevents script/executable execution)
  let parsed;
  try {
    parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return;
    }
  } catch {
    return;
  }

  const safeUrl = parsed.href;

  if (process.platform === "win32") {
    // Avoid cmd.exe command-line parsing and comspec environment tampering entirely
    const child = spawn("rundll32.exe", ["url.dll,FileProtocolHandler", safeUrl], {
      detached: true,
      stdio: "ignore",
    });
    child.unref();
    return;
  }

  const opener = process.platform === "darwin" ? "open" : "xdg-open";
  const child = spawn(opener, [safeUrl], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

// Load resources from local file or fetch remotely using shared loader
async function loadData() {
  return loadCatalog();
}

async function loadMatchmakerData() {
  const localMatchmakerPath = path.join(__dirname, "..", "site", "matchmaker.json");
  if (fs.existsSync(localMatchmakerPath)) {
    try {
      const raw = fs.readFileSync(localMatchmakerPath, "utf8");
      return JSON.parse(raw);
    } catch {
      // Fall through
    }
  }

  try {
    const res = await fetch("https://devshelf.ritualdev.in/matchmaker.json", {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Remote failed
  }
  return null;
}

function printMatchmakerProject(proj, index = null) {
  const idxStr = index !== null ? `${c.purple}[${index + 1}]${c.reset} ` : "";
  const starsStr = typeof proj.stars === "number" ? ` ⭐ ${proj.stars.toLocaleString()}` : "";
  const activeStr = proj.lastActivityRelative ? ` 🕒 Active ${proj.lastActivityRelative}` : "";
  const langBadge = proj.language ? ` ${c.cyan}[${proj.language}]${c.reset}` : "";

  console.log(
    `  ${idxStr}${c.bold}${proj.name}${c.reset}${langBadge}${c.amber}${starsStr}${c.reset}${c.green}${activeStr}${c.reset}`,
  );
  if (proj.description) {
    console.log(`    ${c.gray}${proj.description}${c.reset}`);
  }
  if (proj.seeking) {
    console.log(`    ${c.amber}🎯 Seeking:${c.reset} ${proj.seeking}`);
  }
  if (Array.isArray(proj.issues) && proj.issues.length > 0) {
    console.log(`    ${c.green}Good First Issues:${c.reset}`);
    proj.issues.slice(0, 3).forEach((iss) => {
      const commentsStr = iss.comments ? ` (💬 ${iss.comments})` : "";
      console.log(`      • ${iss.title}${c.gray}${commentsStr}${c.reset}`);
      console.log(`        ${c.underline}${c.blue}${iss.url}${c.reset}`);
    });
  }
  console.log();
}

function getCliVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
    return pkg.version || "1.1.1";
  } catch {
    return "1.1.1";
  }
}

function printHeader() {
  const version = getCliVersion();
  console.log(`
${c.purple}${c.bold}  📚 DevShelf CLI & TUI${c.reset} ${c.gray}v${version}${c.reset}
${c.cyan}  The Crowdsourced Zero-Paywall Developer Directory${c.reset}
${c.gray}  ─────────────────────────────────────────────────────────────${c.reset}`);
}

function printHelp() {
  printHeader();
  console.log(`
${c.bold}USAGE:${c.reset}
  ${c.green}npx devshelf${c.reset}                     Launch interactive Terminal User Interface (TUI)
  ${c.green}npx devshelf daily [--quiet]${c.reset}     Print today's curated open-source discovery
  ${c.green}npx devshelf search <query>${c.reset}      Search tools, APIs, and AI agents
  ${c.green}npx devshelf contribute [query]${c.reset}  Find repos actively seeking help & starter tasks
  ${c.green}npx devshelf list [category]${c.reset}     List items by category
  ${c.green}npx devshelf random${c.reset}              Discover a random curated resource
  ${c.green}npx devshelf stats${c.reset}               Show catalog counts and metrics
  ${c.green}npx devshelf mcp${c.reset}                 Launch DevShelf as a Model Context Protocol (MCP) server
  ${c.green}npx devshelf open <name>${c.reset}          Open resource URL directly in browser

${c.bold}OPTIONS:${c.reset}
  ${c.cyan}-q, --quiet${c.reset}                      Ultra-compact output for .zshrc / .bashrc execution
  ${c.cyan}--json${c.reset}                           Output raw JSON results for piping
  ${c.cyan}--open${c.reset}                           Open first result in browser
  ${c.cyan}-h, --help${c.reset}                       Show this help message
  ${c.cyan}-v, --version${c.reset}                    Show version

${c.bold}EXAMPLES:${c.reset}
  ${c.gray}$${c.reset} npx devshelf daily --quiet
  ${c.gray}$${c.reset} npx devshelf search "postman"
  ${c.gray}$${c.reset} npx devshelf search "postgres"
  ${c.gray}$${c.reset} npx devshelf contribute "rust"
  ${c.gray}$${c.reset} npx devshelf list "ai"
  ${c.gray}$${c.reset} npx devshelf random
`);
}

function getDailyItem(resources) {
  if (!resources || resources.length === 0) return null;
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, "0");
  const day = String(today.getUTCDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) % 2147483647;
  }
  const index = Math.abs(hash) % resources.length;
  return { date: dateStr, item: resources[index] };
}

function searchItems(resources, query) {
  return searchCatalog(resources, query);
}

function printItemCard(item, index) {
  if (!item || typeof item !== "object") {
    console.log(`\n  ${c.red}No catalog resource found.${c.reset}`);
    return;
  }
  const prefix = index !== undefined ? `${c.purple}[${index + 1}]${c.reset} ` : "";
  const name = `${c.bold}${c.white}${item.name || "Unknown Tool"}${c.reset}`;
  const cat = `${c.dim}(${item.category || item.section || "Tool"})${c.reset}`;
  const url = getResourceUrl(item);

  console.log(`\n  ${prefix}${name} ${cat}`);
  if (item.alternativeTo) {
    console.log(
      `  ${c.purple}⚡ Alternative to:${c.reset} ${c.bold}${item.alternativeTo}${c.reset}`,
    );
  }
  if (item.description) {
    console.log(`  ${c.gray}${item.description}${c.reset}`);
  }

  const badges = [];
  if (item.language) badges.push(`${c.cyan}Lang: ${item.language}${c.reset}`);
  if (item.license) badges.push(`${c.blue}Lic: ${item.license}${c.reset}`);
  if (item.dockerCompose) badges.push(`${c.cyan}🐳 Self-Hostable${c.reset}`);
  if (item.auth) badges.push(`${c.green}Auth: ${item.auth}${c.reset}`);
  if (item.rateLimit) badges.push(`${c.amber}Rate: ${item.rateLimit}${c.reset}`);
  if (item.freeTier) badges.push(`${c.green}Free: ${item.freeTier}${c.reset}`);
  if (item.perkValue) badges.push(`${c.amber}Perk: ${item.perkValue}${c.reset}`);

  if (badges.length > 0) {
    console.log(`  ${badges.join("  ")}`);
  }

  if (url) {
    console.log(`  ${c.underline}${c.blue}${url}${c.reset}`);
  }
}

// Interactive TUI
async function runInteractiveTui(data) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  const resources = data.resources || [];

  while (true) {
    console.clear();
    printHeader();
    console.log(`
  ${c.bold}Main Menu:${c.reset}
    ${c.purple}[1]${c.reset} 🔍 Search 500+ Tools, APIs & AI Agents
    ${c.purple}[2]${c.reset} 📂 Browse Categories
    ${c.purple}[3]${c.reset} 🎲 Pick a Random Resource
    ${c.purple}[4]${c.reset} 🤝 Contributor Matchmaker (Live Good First Issues)
    ${c.purple}[5]${c.reset} 📊 Catalog Statistics
    ${c.purple}[6]${c.reset} 🌐 Open Live Web Directory
    ${c.purple}[0]${c.reset} 🚪 Exit
`);

    const choice = (await question(`  ${c.green}Select an option [0-6]:${c.reset} `)).trim();

    if (choice === "0" || choice.toLowerCase() === "exit" || choice.toLowerCase() === "q") {
      console.log(`\n  ${c.purple}Happy hacking with DevShelf! ⭐${c.reset}\n`);
      rl.close();
      process.exit(0);
    }

    if (choice === "1") {
      // Search mode
      const query = await question(
        `\n  ${c.cyan}Enter search term (e.g. postgres, auth, ai, llm, qa):${c.reset} `,
      );
      if (!query.trim()) continue;

      const matches = searchItems(resources, query);
      console.log(`\n  ${c.bold}Found ${matches.length} matching resources:${c.reset}`);

      const displayList = matches.slice(0, 15);
      displayList.forEach((item, idx) => printItemCard(item, idx));

      if (matches.length > 15) {
        console.log(
          `\n  ${c.dim}... and ${matches.length - 15} more results. Refine your search for more specific matches.${c.reset}`,
        );
      }

      if (displayList.length > 0) {
        const itemChoice = (
          await question(
            `\n  ${c.green}Enter number to open URL in browser (or press Enter to return):${c.reset} `,
          )
        ).trim();
        const selectedIndex = Number.parseInt(itemChoice, 10) - 1;
        if (!Number.isNaN(selectedIndex) && displayList[selectedIndex]) {
          const targetUrl = getResourceUrl(displayList[selectedIndex]);
          console.log(`  🚀 Opening ${targetUrl} in your default browser...`);
          openUrl(targetUrl);
          await question(`  ${c.gray}Press Enter to continue...${c.reset}`);
        }
      } else {
        await question(`\n  ${c.gray}Press Enter to continue...${c.reset}`);
      }
    } else if (choice === "2") {
      // Browse categories
      const categories = [
        { label: "🌐 Free Public APIs", filter: "apis" },
        { label: "🤖 AI Agents & Local LLMs", filter: "ai" },
        { label: "⚡ CLI Tools & Productivity", filter: "cli" },
        { label: "🧪 Testing & QA Automations", filter: "testing" },
        { label: "☁️ Free Cloud & Databases", filter: "cloud" },
        { label: "🤝 Up for Grabs / Contributors Wanted", filter: "contributors" },
        { label: "🎁 Developer Perks & Startup Credits", filter: "perk" },
        { label: "🚀 1-Click Deploy Boilerplates", filter: "boilerplate" },
      ];

      console.log(`\n  ${c.bold}Categories:${c.reset}`);
      categories.forEach((cat, idx) => {
        console.log(`    ${c.purple}[${idx + 1}]${c.reset} ${cat.label}`);
      });

      const catChoice = (
        await question(`\n  ${c.green}Select a category [1-8]:${c.reset} `)
      ).trim();
      const catIndex = Number.parseInt(catChoice, 10) - 1;

      if (!Number.isNaN(catIndex) && categories[catIndex]) {
        const cat = categories[catIndex];
        const filtered = resources.filter((item) => {
          const type = (item.type || "").toLowerCase();
          const sec = (item.section || "").toLowerCase();
          return type.includes(cat.filter) || sec.includes(cat.filter);
        });

        console.log(`\n  ${c.bold}${cat.label} (${filtered.length} resources):${c.reset}`);
        const displayList = filtered.slice(0, 10);
        displayList.forEach((item, idx) => printItemCard(item, idx));

        const itemChoice = (
          await question(
            `\n  ${c.green}Enter number to open URL (or press Enter to return):${c.reset} `,
          )
        ).trim();
        const selectedIndex = Number.parseInt(itemChoice, 10) - 1;
        if (!Number.isNaN(selectedIndex) && displayList[selectedIndex]) {
          const targetUrl = getResourceUrl(displayList[selectedIndex]);
          console.log(`  🚀 Opening ${targetUrl}...`);
          openUrl(targetUrl);
          await question(`  ${c.gray}Press Enter to continue...${c.reset}`);
        }
      }
    } else if (choice === "3") {
      // Random resource
      if (!resources || resources.length === 0) {
        console.log(`\n  ${c.red}No catalog items available.${c.reset}`);
        await question(`  ${c.gray}Press Enter to continue...${c.reset}`);
        continue;
      }
      const randomItem = resources[Math.floor(Math.random() * resources.length)];
      console.log(`\n  ${c.bold}🎲 Random Pick:${c.reset}`);
      printItemCard(randomItem);

      const openIt = (await question(`\n  ${c.green}Open in browser? [y/N]:${c.reset} `))
        .trim()
        .toLowerCase();
      if (openIt === "y" || openIt === "yes") {
        openUrl(getResourceUrl(randomItem));
      }
      await question(`  ${c.gray}Press Enter to continue...${c.reset}`);
    } else if (choice === "4") {
      // Contributor Matchmaker
      const mmData = await loadMatchmakerData();
      if (!mmData || !Array.isArray(mmData.projects)) {
        console.log(`\n  ${c.red}Could not load Matchmaker telemetry data.${c.reset}`);
      } else {
        const langChoice = (
          await question(
            `\n  ${c.cyan}Filter by language or query (e.g. rust, typescript, python, or press Enter for all):${c.reset} `,
          )
        )
          .trim()
          .toLowerCase();

        let filtered = mmData.projects;
        if (langChoice) {
          filtered = filtered.filter((p) => {
            const name = (p.name || "").toLowerCase();
            const lang = (p.language || "").toLowerCase();
            const seeking = (p.seeking || "").toLowerCase();
            const tech = Array.isArray(p.techStack) ? p.techStack.join(" ").toLowerCase() : "";
            return (
              name.includes(langChoice) ||
              lang.includes(langChoice) ||
              seeking.includes(langChoice) ||
              tech.includes(langChoice)
            );
          });
        }

        console.log(
          `\n  ${c.bold}🤝 Contributor Matchmaker (${filtered.length} projects found):${c.reset}\n`,
        );
        const displayList = filtered.slice(0, 8);
        displayList.forEach((p, idx) => printMatchmakerProject(p, idx));

        if (displayList.length > 0) {
          const itemChoice = (
            await question(
              `\n  ${c.green}Enter number to open repo in browser (or press Enter to return):${c.reset} `,
            )
          ).trim();
          const selectedIndex = Number.parseInt(itemChoice, 10) - 1;
          if (!Number.isNaN(selectedIndex) && displayList[selectedIndex]) {
            const targetUrl = displayList[selectedIndex].repo;
            console.log(`  🚀 Opening ${targetUrl}...`);
            openUrl(targetUrl);
            await question(`  ${c.gray}Press Enter to continue...${c.reset}`);
          }
        } else {
          await question(`  ${c.gray}Press Enter to continue...${c.reset}`);
        }
      }
    } else if (choice === "5") {
      // Stats
      console.log(`\n  ${c.bold}📊 DevShelf Catalog Telemetry:${c.reset}`);
      console.log(
        `  Total Resources:      ${c.purple}${c.bold}${data.totalCount || resources.length}${c.reset}`,
      );
      if (data.counts) {
        console.log(`  GitHub Repositories:  ${c.cyan}${data.counts.repos || "300+"}${c.reset}`);
        console.log(`  Public Free APIs:     ${c.green}${data.counts.apis || "90+"}${c.reset}`);
        console.log(`  AI & Local LLMs:      ${c.purple}${data.counts.aiTools || "80+"}${c.reset}`);
        console.log(`  CLI Utilities:        ${c.cyan}${data.counts.cliTools || "100+"}${c.reset}`);
        console.log(
          `  Testing & QA Tools:   ${c.amber}${data.counts.testingQa || "60+"}${c.reset}`,
        );
        console.log(`  Free Cloud Platforms: ${c.blue}${data.counts.freeCloud || "70+"}${c.reset}`);
        console.log(
          `  1-Click Boilerplates: ${c.green}${data.counts.boilerplates || "40+"}${c.reset}`,
        );
      }
      console.log(
        `  Audit Status:         ${c.green}🛡️ CI Health Audited (Zero Tracking Params)${c.reset}`,
      );
      await question(`\n  ${c.gray}Press Enter to continue...${c.reset}`);
    } else if (choice === "6") {
      // Open web app
      console.log("  🚀 Opening https://devshelf.ritualdev.in in your browser...");
      openUrl("https://devshelf.ritualdev.in");
      await question(`  ${c.gray}Press Enter to continue...${c.reset}`);
    }
  }
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    printHelp();
    return;
  }

  if (args.includes("-v") || args.includes("--version")) {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
    console.log(`devshelf v${pkg.version}`);
    return;
  }

  const isJson = args.includes("--json");
  const shouldOpen = args.includes("--open");

  const cleanArgs = args.filter((a) => !a.startsWith("-"));
  const command = cleanArgs[0];

  const data = await loadData();
  const resources = data.resources || [];

  if (!command) {
    if (!process.stdout.isTTY) {
      printHelp();
      return;
    }
    await runInteractiveTui(data);
    return;
  }

  if (command === "daily" || command === "today") {
    const isQuiet = args.includes("--quiet") || args.includes("-q");
    const daily = getDailyItem(resources);
    if (!daily || !daily.item) {
      console.error(`${c.red}Error:${c.reset} No catalog items available.`);
      process.exit(1);
    }
    const { date, item } = daily;

    if (isJson) {
      console.log(JSON.stringify({ date, item }, null, 2));
      return;
    }

    const url = getResourceUrl(item);
    const altStr = item.alternativeTo ? ` (⚡ Alt to ${item.alternativeTo})` : "";

    if (isQuiet) {
      console.log(
        `${c.purple}💡 DevShelf Daily:${c.reset} ${c.bold}${item.name}${c.reset}${c.cyan}${altStr}${c.reset} — ${item.description}`,
      );
      if (url) {
        console.log(`   ${c.underline}${c.blue}${url}${c.reset}`);
      }
      return;
    }

    printHeader();
    console.log(
      `  ${c.purple}${c.bold}📅 DevShelf Daily Discovery${c.reset} ${c.gray}— ${date}${c.reset}\n`,
    );
    printItemCard(item);

    console.log(`
  ${c.gray}💡 Add to your ${c.cyan}~/.zshrc${c.gray} or ${c.cyan}~/.bashrc${c.gray} for a new discovery on every tab:${c.reset}
  ${c.green}npx devshelf daily --quiet${c.reset}
`);

    if (shouldOpen) {
      openUrl(url);
    }
    return;
  }

  if (command === "search" || command === "find") {
    const query = cleanArgs.slice(1).join(" ");
    if (!query) {
      console.error(
        `${c.red}Error:${c.reset} Please specify a search term. Example: devshelf search postgres`,
      );
      process.exit(1);
    }

    const matches = searchItems(resources, query);

    if (isJson) {
      console.log(JSON.stringify(matches, null, 2));
      return;
    }

    printHeader();
    console.log(
      `  🔍 Search Results for "${c.bold}${query}${c.reset}" (${matches.length} found):\n`,
    );

    matches.slice(0, 20).forEach((item, idx) => printItemCard(item, idx));

    if (matches.length > 20) {
      console.log(`\n  ${c.dim}... and ${matches.length - 20} more results.${c.reset}`);
    }

    if (shouldOpen && matches.length > 0) {
      const url = getResourceUrl(matches[0]);
      console.log(`\n  🚀 Opening ${matches[0].name} (${url})...`);
      openUrl(url);
    }
    return;
  }

  if (command === "list") {
    const catQuery = (cleanArgs[1] || "").toLowerCase();
    const filtered = catQuery
      ? resources.filter(
          (r) =>
            (r.type || "").toLowerCase().includes(catQuery) ||
            (r.category || "").toLowerCase().includes(catQuery) ||
            (r.section || "").toLowerCase().includes(catQuery),
        )
      : resources;

    if (isJson) {
      console.log(JSON.stringify(filtered, null, 2));
      return;
    }

    printHeader();
    console.log(
      `  📂 Listing resources ${catQuery ? `matching "${catQuery}"` : "all"} (${filtered.length} items):\n`,
    );
    filtered.slice(0, 25).forEach((item, idx) => printItemCard(item, idx));
    return;
  }

  if (command === "random") {
    if (!resources || resources.length === 0) {
      console.error(`${c.red}Error:${c.reset} No catalog items available.`);
      process.exit(1);
    }
    const item = resources[Math.floor(Math.random() * resources.length)];
    if (isJson) {
      console.log(JSON.stringify(item, null, 2));
      return;
    }

    printHeader();
    console.log("  🎲 Random Pick:");
    printItemCard(item);

    if (shouldOpen) {
      openUrl(getResourceUrl(item));
    }
    return;
  }

  if (command === "stats") {
    const reposCount =
      data.reposCount ||
      data.facets?.repos ||
      data.counts?.repos ||
      resources.filter((r) => Boolean(r.repo)).length;
    const statsObj = {
      total: data.totalCount || resources.length,
      repos: reposCount,
      ...(data.counts || {}),
    };

    if (isJson) {
      console.log(JSON.stringify(statsObj, null, 2));
      return;
    }

    printHeader();
    console.log("  📊 DevShelf Catalog Telemetry:");
    console.log(
      `  Total Resources:      ${c.purple}${c.bold}${data.totalCount || resources.length}${c.reset}`,
    );
    console.log(`  GitHub Repositories:  ${c.cyan}${reposCount}${c.reset}`);
    if (data.counts) {
      console.log(`  Public Free APIs:     ${c.green}${data.counts.apis || "90+"}${c.reset}`);
      console.log(`  AI & Local LLMs:      ${c.purple}${data.counts.aiTools || "80+"}${c.reset}`);
      console.log(`  CLI Utilities:        ${c.cyan}${data.counts.cliTools || "100+"}${c.reset}`);
      console.log(`  Testing & QA Tools:   ${c.amber}${data.counts.testingQa || "60+"}${c.reset}`);
      console.log(`  Free Cloud Platforms: ${c.blue}${data.counts.freeCloud || "70+"}${c.reset}`);
      console.log(
        `  1-Click Boilerplates: ${c.green}${data.counts.boilerplates || "40+"}${c.reset}`,
      );
    }
    return;
  }

  if (command === "contribute" || command === "matchmaker") {
    const query = cleanArgs.slice(1).join(" ").toLowerCase();
    const mmData = await loadMatchmakerData();
    if (!mmData || !Array.isArray(mmData.projects)) {
      console.error(`${c.red}Error:${c.reset} Could not load Matchmaker telemetry data.`);
      process.exit(1);
    }

    let filtered = mmData.projects;
    if (query) {
      filtered = filtered.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const lang = (p.language || "").toLowerCase();
        const seeking = (p.seeking || "").toLowerCase();
        const tech = Array.isArray(p.techStack) ? p.techStack.join(" ").toLowerCase() : "";
        return (
          name.includes(query) ||
          lang.includes(query) ||
          seeking.includes(query) ||
          tech.includes(query)
        );
      });
    }

    if (isJson) {
      console.log(JSON.stringify(filtered, null, 2));
      return;
    }

    printHeader();
    console.log(`  🤝 Contributor Matchmaker (${filtered.length} active projects found):\n`);
    filtered.forEach((p, idx) => printMatchmakerProject(p, idx));

    if (shouldOpen && filtered.length > 0) {
      const firstIssue = filtered[0].issues?.[0]?.url || filtered[0].repo;
      openUrl(firstIssue);
    }
    return;
  }

  if (command === "open") {
    const targetName = cleanArgs.slice(1).join(" ").trim().toLowerCase();
    if (!targetName) {
      console.error(
        `${c.red}Error:${c.reset} Please specify a resource name to open. Example: devshelf open bruno`,
      );
      process.exit(1);
    }

    const item =
      resources.find((r) => r.name.toLowerCase() === targetName) ||
      resources.find((r) => r.name.toLowerCase().includes(targetName));

    if (!item) {
      console.error(`${c.red}Error:${c.reset} Could not find resource matching "${targetName}"`);
      process.exit(1);
    }

    const url = getResourceUrl(item);
    console.log(`  🚀 Opening ${item.name} (${url})...`);
    openUrl(url);
    return;
  }

  if (command === "mcp") {
    const { startMcpServer } = await import("./mcp.js");
    startMcpServer();
    return;
  }

  // Fallback: assume search
  const matches = searchItems(resources, command);
  printHeader();
  console.log(
    `  🔍 Search Results for "${c.bold}${command}${c.reset}" (${matches.length} found):\n`,
  );
  matches.slice(0, 15).forEach((item, idx) => printItemCard(item, idx));
}

main().catch((err) => {
  console.error(`${c.red}DevShelf CLI Error:${c.reset}`, err.message);
  process.exit(1);
});
