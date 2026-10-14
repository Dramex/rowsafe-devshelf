import fs from "node:fs/promises";
import path from "node:path";
import { getAlternativeTo, getDockerCompose } from "./catalog-enrichment.js";

async function buildSiteData() {
  const root = process.cwd();
  const shelfDir = path.join(root, "shelf");
  const siteDir = path.join(root, "site");

  const readJson = async (filename: string) => {
    const raw = await fs.readFile(path.join(shelfDir, filename), "utf8");
    return JSON.parse(raw.replace(/^\uFEFF/, ""));
  };

  const apis = (await readJson("apis.json")).map((item: any) => ({
    ...item,
    type: "api",
    section: "Free & Public APIs",
  }));
  const aiTools = (await readJson("ai-tools.json")).map((item: any) => ({
    ...item,
    type: "ai",
    section: "AI Agents & Local LLMs",
  }));
  const cliTools = (await readJson("cli-tools.json")).map((item: any) => ({
    ...item,
    type: "cli",
    section: "CLI & Productivity Tools",
  }));
  const testingQa = (await readJson("testing-qa.json")).map((item: any) => ({
    ...item,
    type: "testing",
    section: "Testing & QA Reliability",
  }));
  const freeCloud = (await readJson("free-cloud.json")).map((item: any) => ({
    ...item,
    type: "cloud",
    section: "Free Cloud & Developer Tiers",
  }));
  const contributors = (await readJson("contributors-wanted.json")).map((item: any) => ({
    ...item,
    type: "contributors",
    section: "Contributors Wanted",
  }));
  const perks = (await readJson("perks.json")).map((item: any) => ({
    ...item,
    type: "perks",
    section: "Developer Discounts & Startup Perks",
  }));
  const boilerplates = (await readJson("boilerplates.json")).map((item: any) => ({
    ...item,
    type: "boilerplate",
    section: "One-Click Deployment Boilerplates",
  }));

  // Primary curated list: Open source & developer tools first, then APIs, cloud, perks, boilerplates, contributors
  const rawResources = [
    ...aiTools,
    ...cliTools,
    ...testingQa,
    ...apis,
    ...freeCloud,
    ...perks,
    ...boilerplates,
    ...contributors,
  ];

  const allResources = rawResources.map((item) => {
    const alternativeTo = getAlternativeTo(item.name);
    const dockerCompose = getDockerCompose(item.name);
    return {
      ...item,
      ...(alternativeTo ? { alternativeTo } : {}),
      ...(dockerCompose ? { dockerCompose } : {}),
    };
  });

  const reposCount = allResources.filter((r) => Boolean(r.repo)).length;

  const payload = {
    updatedAt: new Date().toISOString(),
    totalCount: allResources.length,
    reposCount,
    facets: {
      repos: reposCount,
    },
    counts: {
      aiTools: aiTools.length,
      cliTools: cliTools.length,
      testingQa: testingQa.length,
      apis: apis.length,
      freeCloud: freeCloud.length,
      contributors: contributors.length,
      perks: perks.length,
      boilerplates: boilerplates.length,
    },
    resources: allResources,
  };

  // 1. Write data.json for fetch requests
  await fs.writeFile(
    path.join(siteDir, "data.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );

  // 2. Write data.js for instantaneous synchronous offline/local/zero-latency execution
  await fs.writeFile(
    path.join(siteDir, "data.js"),
    `window.DEVSHELF_DATA = ${JSON.stringify(payload, null, 2)};\n`,
    "utf8",
  );

  // 3. Official DevShelf Public API v1
  const apiV1Dir = path.join(siteDir, "api", "v1");
  const apiCategoriesDir = path.join(apiV1Dir, "categories");
  await fs.mkdir(apiCategoriesDir, { recursive: true });

  const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  const apiVersion = pkg.version || "1.1.2";

  // 3a. /api/v1/tools.json
  const apiToolsPayload = {
    version: apiVersion,
    docs: "https://devshelf.ritualdev.in/docs/api.html",
    license: "https://github.com/RitualDev-Lab/DevShelf/blob/main/LICENSE",
    updatedAt: payload.updatedAt,
    totalCount: allResources.length,
    tools: allResources,
  };
  await fs.writeFile(
    path.join(apiV1Dir, "tools.json"),
    `${JSON.stringify(apiToolsPayload, null, 2)}\n`,
    "utf8",
  );

  // 3b. /api/v1/stats.json
  const apiStatsPayload = {
    version: apiVersion,
    updatedAt: payload.updatedAt,
    totalCount: allResources.length,
    reposCount,
    categoryCounts: payload.counts,
  };
  await fs.writeFile(
    path.join(apiV1Dir, "stats.json"),
    `${JSON.stringify(apiStatsPayload, null, 2)}\n`,
    "utf8",
  );

  // 3c. /api/v1/categories.json
  const categoriesList = [
    {
      slug: "ai",
      name: "AI Agents & Local LLMs",
      count: aiTools.length,
      endpoint: "https://devshelf.ritualdev.in/api/v1/categories/ai.json",
      items: aiTools,
    },
    {
      slug: "cli",
      name: "CLI & Developer Productivity",
      count: cliTools.length,
      endpoint: "https://devshelf.ritualdev.in/api/v1/categories/cli.json",
      items: cliTools,
    },
    {
      slug: "apis",
      name: "Free Public APIs",
      count: apis.length,
      endpoint: "https://devshelf.ritualdev.in/api/v1/categories/apis.json",
      items: apis,
    },
    {
      slug: "cloud",
      name: "Free Cloud & Databases",
      count: freeCloud.length,
      endpoint: "https://devshelf.ritualdev.in/api/v1/categories/cloud.json",
      items: freeCloud,
    },
    {
      slug: "testing",
      name: "Testing & QA Automation",
      count: testingQa.length,
      endpoint: "https://devshelf.ritualdev.in/api/v1/categories/testing.json",
      items: testingQa,
    },
    {
      slug: "perks",
      name: "Developer Perks & Startup Credits",
      count: perks.length,
      endpoint: "https://devshelf.ritualdev.in/api/v1/categories/perks.json",
      items: perks,
    },
    {
      slug: "boilerplates",
      name: "1-Click Deploy Boilerplates",
      count: boilerplates.length,
      endpoint: "https://devshelf.ritualdev.in/api/v1/categories/boilerplates.json",
      items: boilerplates,
    },
    {
      slug: "contributors",
      name: "Contributors Wanted / Up for Grabs",
      count: contributors.length,
      endpoint: "https://devshelf.ritualdev.in/api/v1/categories/contributors.json",
      items: contributors,
    },
  ];

  const apiCategoriesOverview = {
    version: apiVersion,
    updatedAt: payload.updatedAt,
    totalCategories: categoriesList.length,
    categories: categoriesList.map(({ slug, name, count, endpoint }) => ({
      slug,
      name,
      count,
      endpoint,
    })),
  };
  await fs.writeFile(
    path.join(apiV1Dir, "categories.json"),
    `${JSON.stringify(apiCategoriesOverview, null, 2)}\n`,
    "utf8",
  );

  // 3d. Per-category endpoints: /api/v1/categories/[slug].json
  for (const cat of categoriesList) {
    const catPayload = {
      version: apiVersion,
      updatedAt: payload.updatedAt,
      slug: cat.slug,
      name: cat.name,
      count: cat.count,
      items: cat.items,
    };
    await fs.writeFile(
      path.join(apiCategoriesDir, `${cat.slug}.json`),
      `${JSON.stringify(catPayload, null, 2)}\n`,
      "utf8",
    );
  }

  // 4. Write CNAME for custom domain
  await fs.writeFile(path.join(siteDir, "CNAME"), "devshelf.ritualdev.in\n", "utf8");

  console.log(
    `✅ Built site/data.json & site/data.js with ${allResources.length} total resources (${reposCount} GitHub repos) and wrote CNAME.`,
  );
  console.log(
    `🌐 Built DevShelf Public API v1 endpoints under site/api/v1/ (${categoriesList.length} categories).`,
  );
}

buildSiteData().catch((err) => {
  console.error("Site data build failed:", err);
  process.exit(1);
});
