import fs from "node:fs/promises";
import path from "node:path";

async function generateCounts() {
  const root = process.cwd();
  const shelfDir = path.join(root, "shelf");
  const siteDir = path.join(root, "site");
  const dataDir = path.join(root, "data");
  const pkgPath = path.join(root, "package.json");
  const indexPath = path.join(siteDir, "index.html");
  const apiV1Dir = path.join(siteDir, "api", "v1");

  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(apiV1Dir, { recursive: true });

  const files = await fs.readdir(shelfDir);
  let totalCount = 0;
  const shelfCounts: Record<string, number> = {};

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const content = await fs.readFile(path.join(shelfDir, file), "utf8");
    const items = JSON.parse(content.replace(/^\uFEFF/, ""));
    shelfCounts[file] = items.length;
    totalCount += items.length;
  }

  const milestone = `${Math.floor(totalCount / 10) * 10}+`;

  // Load site/data.json if it exists to get exact reposCount
  let reposCount = 0;
  try {
    const rawData = await fs.readFile(path.join(siteDir, "data.json"), "utf8");
    const data = JSON.parse(rawData);
    reposCount = data.reposCount || 0;
  } catch {
    // If not yet built, will be populated on build
  }

  console.log(
    `📊 Total verified catalog items: ${totalCount} (${milestone}) across ${Object.keys(shelfCounts).length} shelf files`,
  );

  // 1. Write single source of truth data/counts.json and site/api/v1/counts.json
  const countsPayload = {
    totalCount,
    milestone,
    exactCount: totalCount,
    shelfCounts,
    reposCount,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(
    path.join(dataDir, "counts.json"),
    `${JSON.stringify(countsPayload, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(apiV1Dir, "counts.json"),
    `${JSON.stringify(countsPayload, null, 2)}\n`,
    "utf8",
  );
  console.log(`✅ Generated data/counts.json and site/api/v1/counts.json (${milestone})`);

  // 2. Sync package.json description
  if (await fileExists(pkgPath)) {
    const rawPkg = await fs.readFile(pkgPath, "utf8");
    const pkg = JSON.parse(rawPkg);
    const updatedDesc = pkg.description.replace(/\b\d+\+/, milestone);
    if (pkg.description !== updatedDesc) {
      pkg.description = updatedDesc;
      await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
      console.log(`✅ Synced package.json description to ${milestone}`);
    }
  }

  // 3. Update site/index.html fallback markup
  if (await fileExists(indexPath)) {
    let indexHtml = await fs.readFile(indexPath, "utf8");

    // Replace stat-total
    indexHtml = indexHtml.replace(
      /<span id="stat-total"[^>]*>[^<]+<\/span>/,
      `<span id="stat-total" class="font-bold text-white">${totalCount} Resources</span>`,
    );

    // Replace hero-total-count
    indexHtml = indexHtml.replace(
      /<span id="hero-total-count">\d+\+<\/span>/,
      `<span id="hero-total-count">${milestone}</span>`,
    );

    // Replace stat-repos if known
    if (reposCount > 0) {
      indexHtml = indexHtml.replace(
        /<span class="text-purple-300 font-bold" id="stat-repos">\d+<\/span>/,
        `<span class="text-purple-300 font-bold" id="stat-repos">${reposCount}</span>`,
      );
    }

    if (shelfCounts["boilerplates.json"]) {
      indexHtml = indexHtml.replace(
        /<span class="text-orange-300 font-bold" id="stat-boilerplates">\d+<\/span>/,
        `<span class="text-orange-300 font-bold" id="stat-boilerplates">${shelfCounts["boilerplates.json"]}</span>`,
      );
    }
    if (shelfCounts["apis.json"]) {
      indexHtml = indexHtml.replace(
        /<span class="text-cyan-300 font-bold" id="stat-apis">\d+<\/span>/,
        `<span class="text-cyan-300 font-bold" id="stat-apis">${shelfCounts["apis.json"]}</span>`,
      );
    }
    if (shelfCounts["ai-tools.json"]) {
      indexHtml = indexHtml.replace(
        /<span class="text-purple-300 font-bold" id="stat-ai">\d+<\/span>/,
        `<span class="text-purple-300 font-bold" id="stat-ai">${shelfCounts["ai-tools.json"]}</span>`,
      );
    }
    if (shelfCounts["cli-tools.json"]) {
      indexHtml = indexHtml.replace(
        /<span class="text-amber-300 font-bold" id="stat-cli">\d+<\/span>/,
        `<span class="text-amber-300 font-bold" id="stat-cli">${shelfCounts["cli-tools.json"]}</span>`,
      );
    }
    if (shelfCounts["testing-qa.json"]) {
      indexHtml = indexHtml.replace(
        /<span class="text-rose-300 font-bold" id="stat-testing">\d+<\/span>/,
        `<span class="text-rose-300 font-bold" id="stat-testing">${shelfCounts["testing-qa.json"]}</span>`,
      );
    }
    if (shelfCounts["free-cloud.json"]) {
      indexHtml = indexHtml.replace(
        /<span class="text-sky-300 font-bold" id="stat-cloud">\d+<\/span>/,
        `<span class="text-sky-300 font-bold" id="stat-cloud">${shelfCounts["free-cloud.json"]}</span>`,
      );
    }
    if (shelfCounts["perks.json"]) {
      indexHtml = indexHtml.replace(
        /<span class="text-pink-300 font-bold" id="stat-perks">\d+<\/span>/,
        `<span class="text-pink-300 font-bold" id="stat-perks">${shelfCounts["perks.json"]}</span>`,
      );
    }

    // Replace milestone progress
    const targetGoal = 1000;
    const progressRatio = Math.min(totalCount / targetGoal, 1);
    const percentComplete = Math.round(progressRatio * 100);
    const remaining = Math.max(targetGoal - totalCount, 0);
    const barBlocks = 20;
    const filled = Math.round(progressRatio * barBlocks);
    const empty = barBlocks - filled;
    const asciiBar = `[${"█".repeat(filled)}${"░".repeat(empty)}]`;

    indexHtml = indexHtml.replace(
      /<div class="text-xs font-mono font-bold text-purple-300" id="progress-percent-label">\d+% Complete<\/div>/,
      `<div class="text-xs font-mono font-bold text-purple-300" id="progress-percent-label">${percentComplete}% Complete</div>`,
    );
    indexHtml = indexHtml.replace(
      /id="milestone-progress-bar"[^>]*style="width:\s*\d+%;"/,
      `id="milestone-progress-bar" class="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 transition-all duration-1000 shadow-sm" style="width: ${percentComplete}%;"`,
    );
    indexHtml = indexHtml.replace(
      /<strong id="progress-count-label" class="text-emerald-300">\d+<\/strong>/,
      `<strong id="progress-count-label" class="text-emerald-300">${totalCount}</strong>`,
    );
    indexHtml = indexHtml.replace(
      /<span id="progress-remaining-label" class="text-amber-300">\d+ to go!<\/span>/,
      `<span id="progress-remaining-label" class="text-amber-300">${remaining} to go!</span>`,
    );
    indexHtml = indexHtml.replace(
      /<code id="progress-ascii-bar"[^>]*>\[[^\]]+\]<\/code>/,
      `<code id="progress-ascii-bar" class="text-purple-300 font-bold hidden sm:inline">${asciiBar}</code>`,
    );

    // Uniform replacement of legacy 500+ / 520+ text in hero/footer/metadata
    indexHtml = indexHtml.replace(
      /Curated from \d+\+ verified zero-paywall resources/g,
      `Curated from ${milestone} verified zero-paywall resources`,
    );
    indexHtml = indexHtml.replace(
      /verified index of \d+\+ developer utilities/g,
      `verified index of ${milestone} developer utilities`,
    );
    indexHtml = indexHtml.replace(/Browse \d+\+ Tools Index/g, `Browse ${milestone} Tools Index`);
    indexHtml = indexHtml.replace(
      /Directory Index \(\d+\+ Tools\)/g,
      `Directory Index (${milestone} Tools)`,
    );
    indexHtml = indexHtml.replace(
      /zero-paywall directory of \d+\+ verified developer tools/g,
      `zero-paywall directory of ${milestone} verified developer tools`,
    );
    indexHtml = indexHtml.replace(
      /indexing \d+\+ verified free developer tools/g,
      `indexing ${milestone} verified free developer tools`,
    );

    await fs.writeFile(indexPath, indexHtml, "utf8");
    console.log("✅ Updated site/index.html metrics & unified count claims.");
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

generateCounts().catch((err) => {
  console.error(err);
  process.exit(1);
});
