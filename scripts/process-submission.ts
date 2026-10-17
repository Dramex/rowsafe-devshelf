import fs from "node:fs/promises";
import path from "node:path";

interface ProjectSubmission {
  name: string;
  repo: string;
  category: string;
  description: string;
  language: string;
  license: string;
  featured?: boolean;
}

interface ApiSubmission {
  name: string;
  url: string;
  category: string;
  description: string;
  auth: string;
  cors: string;
  rateLimit: string;
  https: boolean;
}

function parseFormBody(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = body.split("\n");
  let currentKey = "";
  let currentVal: string[] = [];

  for (const line of lines) {
    if (line.startsWith("### ")) {
      if (currentKey) {
        sections[currentKey.toLowerCase()] = currentVal.join("\n").trim();
      }
      currentKey = line.replace(/^###\s+/, "").trim();
      currentVal = [];
    } else {
      currentVal.push(line);
    }
  }
  if (currentKey) {
    sections[currentKey.toLowerCase()] = currentVal.join("\n").trim();
  }
  return sections;
}

async function verifyUrl(urlStr: string): Promise<boolean> {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:") return false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(urlStr, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": "DevShelf-Validator/1.0" },
    }).catch(async () => {
      // Fallback to GET if HEAD is disallowed
      return await fetch(urlStr, {
        method: "GET",
        signal: controller.signal,
        headers: { "User-Agent": "DevShelf-Validator/1.0" },
      });
    });
    clearTimeout(timeout);
    return res.status < 500;
  } catch {
    return false;
  }
}

async function run() {
  const issueBody = process.env.ISSUE_BODY;
  const issueLabels = (process.env.ISSUE_LABELS || "").split(",");

  if (!issueBody) {
    console.error("Missing ISSUE_BODY environment variable.");
    process.exit(1);
  }

  const data = parseFormBody(issueBody);
  const root = process.cwd();
  const shelfDir = path.join(root, "shelf");

  const isApi =
    issueLabels.includes("api") || data["api name"] || data["api website or documentation url"];

  if (isApi) {
    const name = data["api name"] || data.name;
    const rawUrl = data["api website or documentation url"] || data.url || data["api url"] || "";
    const url = rawUrl.trim().replace(/\/+$/, "");
    const category = data.category || "Development & Testing";
    let description = (
      data["short description"] ||
      data["short description (1-2 sentences)"] ||
      data.description ||
      ""
    ).trim();
    if (description.length > 300) {
      description = `${description.slice(0, 297).replace(/\s+\S*$/, "")}...`;
    }
    const auth = data["authentication required"] || data.auth || "No Key";
    const cors = data["cors support (usable from browser)"] || data.cors || "Yes";
    const rateLimit = data["free tier rate limit"] || data["rate limit"] || "Unlimited";

    if (!name || !url || !description) {
      throw new Error("Missing required API fields (name, url, or description).");
    }

    const isLive = await verifyUrl(url);
    if (!isLive) {
      throw new Error(`URL failed verification check or is not reachable: ${url}`);
    }

    const filePath = path.join(shelfDir, "apis.json");
    const raw = await fs.readFile(filePath, "utf8");
    const list: ApiSubmission[] = JSON.parse(raw.replace(/^\uFEFF/, ""));

    if (list.some((item) => item.url.toLowerCase() === url.toLowerCase())) {
      console.log(`API with URL ${url} is already listed.`);
      return;
    }

    list.push({
      name,
      url,
      category,
      description,
      auth,
      cors,
      rateLimit,
      https: url.startsWith("https://"),
    });

    await fs.writeFile(filePath, `${JSON.stringify(list, null, 2)}\n`, "utf8");
    console.log(`✅ Successfully added API: ${name}`);
  } else {
    // Project submission
    const name = (data["project name"] || data.name || data["tool name"] || "").trim();
    const rawRepo =
      data["github repository url"] ||
      data["repository url"] ||
      data["repo url"] ||
      data.repo ||
      data["github url"] ||
      "";
    const repo = rawRepo.trim().replace(/\/+$/, "");
    const category = data.category || "CLI & Developer Productivity";
    let description = (
      data["short description (1-2 sentences)"] ||
      data["short description"] ||
      data.description ||
      ""
    ).trim();
    if (description.length > 300) {
      description = `${description.slice(0, 297).replace(/\s+\S*$/, "")}...`;
    }
    const language =
      data["primary language / stack"] || data.language || data.stack || "TypeScript";
    const license = data["open source license"] || data.license || "MIT";

    if (!name || !repo || !description) {
      throw new Error("Missing required project fields (name, repo, or description).");
    }

    const isLive = await verifyUrl(repo);
    if (!isLive) {
      throw new Error(`Repository URL failed verification check: ${repo}`);
    }

    let targetFile = "cli-tools.json";
    if (category.toLowerCase().includes("ai")) {
      targetFile = "ai-tools.json";
    } else if (
      category.toLowerCase().includes("testing") ||
      category.toLowerCase().includes("qa")
    ) {
      targetFile = "testing-qa.json";
    }

    const filePath = path.join(shelfDir, targetFile);
    const raw = await fs.readFile(filePath, "utf8");
    const list: ProjectSubmission[] = JSON.parse(raw.replace(/^\uFEFF/, ""));

    if (list.some((item) => item.repo.toLowerCase() === repo.toLowerCase())) {
      console.log(`Project with repo ${repo} is already listed.`);
      return;
    }

    list.push({
      name,
      repo,
      category,
      description,
      language,
      license,
      featured: false,
    });

    await fs.writeFile(filePath, `${JSON.stringify(list, null, 2)}\n`, "utf8");
    console.log(`✅ Successfully added Project: ${name} to ${targetFile}`);
  }
}

run().catch((err) => {
  console.error("Submission processing failed:", err.message);
  process.exit(1);
});
