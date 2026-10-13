import fs from "node:fs/promises";
import path from "node:path";

async function validate() {
  const root = process.cwd();
  const shelfDir = path.join(root, "shelf");
  const files = await fs.readdir(shelfDir);

  let total = 0;
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const content = await fs.readFile(path.join(shelfDir, file), "utf8");
    const data = JSON.parse(content.replace(/^\uFEFF/, ""));
    if (!Array.isArray(data)) {
      throw new Error(`File ${file} must contain a JSON array.`);
    }
    for (const item of data) {
      if (!item.name || (!item.url && !item.repo) || !item.description) {
        throw new Error(`Invalid item in ${file}: ${JSON.stringify(item)}`);
      }
      total++;
    }
    console.log(`✓ ${file}: ${data.length} items valid.`);
  }

  const jsonFileCount = files.filter((f) => f.endsWith(".json")).length;
  console.log(`\n🎉 All ${total} items across ${jsonFileCount} shelf files verified successfully!`);
}

validate().catch((err) => {
  console.error(err);
  process.exit(1);
});
