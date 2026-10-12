import fs from "node:fs/promises";
import path from "node:path";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function escapeHtml(str: string | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function generateSeo() {
  const root = process.cwd();
  const siteDir = path.join(root, "site");
  const toolsDir = path.join(siteDir, "tools");
  const dataPath = path.join(siteDir, "data.json");

  await fs.mkdir(toolsDir, { recursive: true });

  const rawData = await fs.readFile(dataPath, "utf8");
  const data = JSON.parse(rawData);
  const resources: any[] = data.resources || [];

  const domain = "https://devshelf.ritualdev.in";
  const today = new Date().toISOString().split("T")[0];
  const sitemapUrls: string[] = [
    `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ];

  console.log(
    `🌐 [DevShelf SEO Engine] Generating static pages and sitemap for ${resources.length} resources...`,
  );

  for (const item of resources) {
    const slug = slugify(item.name);
    const pageUrl = `${domain}/tools/${slug}.html`;
    const targetUrl = item.url || item.repo || "";
    const name = escapeHtml(item.name);
    const desc = escapeHtml(item.description || "Zero-paywall developer tool curated on DevShelf.");
    const category = escapeHtml(item.category || "Developer Tools");
    const lang = escapeHtml(item.language || "");
    const license = escapeHtml(item.license || "");
    const auth = escapeHtml(item.auth || "");
    const pricing =
      item.freeTier || item.rateLimit || "See the official site for free access and limits.";
    const freeTier = escapeHtml(pricing);

    const alternativeTo = escapeHtml(item.alternativeTo || "");
    const dockerCompose = item.dockerCompose || "";

    const pageTitle = alternativeTo
      ? `${name} - Free Open Source Alternative to ${alternativeTo} | DevShelf`
      : `${name} - Free Developer Tool | DevShelf`;

    const metaKeywords = alternativeTo
      ? `${name}, free alternative to ${alternativeTo}, open source alternative to ${alternativeTo}, ${alternativeTo} alternative, ${category}, developer tools`
      : `${name}, free developer tool, ${category}, open source tools`;

    sitemapUrls.push(
      `  <url>\n    <loc>${pageUrl}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    );

    const faqs = [
      {
        question: `What free access does ${item.name} offer?`,
        answer: `${pricing}${item.license ? ` License: ${item.license}.` : ""}`,
      },
      ...(alternativeTo
        ? [
            {
              question: `What makes ${name} a free alternative to ${alternativeTo}?`,
              answer: `${name} provides core developer capabilities comparable to ${alternativeTo} while prioritizing free access, open-source transparency, and avoiding proprietary subscription paywalls.`,
            },
          ]
        : []),
      {
        question: `What are the authentication and access requirements for ${item.name}?`,
        answer: item.auth
          ? `Authentication requirement: ${item.auth}.`
          : "See the official site for authentication and access requirements.",
      },
    ];

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": item.type === "api" ? "WebAPI" : "SoftwareApplication",
          name: item.name,
          description: item.description,
          applicationCategory: item.category,
          operatingSystem: "All",
          isAccessibleForFree: true,
          url: targetUrl,
          mainEntityOfPage: pageUrl,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            description: pricing,
          },
          ...(item.license ? { license: item.license } : {}),
          ...(item.language ? { programmingLanguage: item.language } : {}),
          publisher: {
            "@type": "Organization",
            name: "DevShelf by RitualDev Lab",
            url: "https://devshelf.ritualdev.in",
          },
        },
        {
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        },
      ],
    };

    const dockerSectionHtml = dockerCompose
      ? `
      <div class="mt-8 p-6 rounded-xl bg-slate-950/90 border border-cyan-500/40">
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div class="flex items-center space-x-2">
            <span class="text-base">🐳</span>
            <h3 class="text-sm font-bold text-cyan-300 font-mono">Self-Host in 60 Seconds (docker-compose.yml)</h3>
          </div>
          <button onclick="navigator.clipboard.writeText(document.getElementById('compose-snippet').innerText); alert('Copied docker-compose.yml to clipboard!');" class="px-2.5 py-1 text-xs font-bold rounded bg-cyan-600 hover:bg-cyan-500 text-white transition">
            Copy Compose
          </button>
        </div>
        <pre id="compose-snippet" class="p-3 bg-slate-900 rounded-lg text-xs font-mono text-cyan-200 overflow-x-auto border border-slate-800 leading-relaxed">${escapeHtml(dockerCompose)}</pre>
      </div>`
      : "";

    const badgeSectionHtml = `
      <div class="mt-8 p-5 rounded-xl bg-slate-950/70 border border-slate-800">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-purple-300">🏷️ Official Maintainer Badge for README.md</span>
          </div>
          <button onclick="navigator.clipboard.writeText('[![Featured on DevShelf](https://img.shields.io/badge/DevShelf-Verified_Free-7928CA?style=flat-square&logo=googlechrome&logoColor=white)](https://devshelf.ritualdev.in/)'); alert('Copied badge Markdown to clipboard!');" class="px-2.5 py-1 text-xs font-bold rounded bg-purple-600 hover:bg-purple-500 text-white transition">
            Copy Markdown
          </button>
        </div>
        <div class="mb-2">
          <img src="https://img.shields.io/badge/DevShelf-Verified_Free-7928CA?style=flat-square&logo=googlechrome&logoColor=white" alt="Featured on DevShelf" class="h-5">
        </div>
        <input type="text" readonly value="[![Featured on DevShelf](https://img.shields.io/badge/DevShelf-Verified_Free-7928CA?style=flat-square&logo=googlechrome&logoColor=white)](https://devshelf.ritualdev.in/)" class="w-full text-xs font-mono bg-slate-900 px-3 py-1.5 rounded text-emerald-300 border border-slate-800 select-all">
      </div>`;

    const related = resources
      .filter(
        (r) =>
          r.name !== item.name &&
          (r.category === item.category || (item.language && r.language === item.language)),
      )
      .slice(0, 4);

    const relatedSectionHtml =
      related.length > 0
        ? `
      <div class="mt-8 pt-6 border-t border-slate-800">
        <h3 class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">🔗 Related Free Tools in ${category}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${related
            .map(
              (r) => `
            <a href="${slugify(r.name)}.html" class="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 transition flex items-center justify-between group">
              <div class="min-w-0 pr-2">
                <span class="text-xs font-bold text-white group-hover:text-purple-300 transition truncate block">${escapeHtml(r.name)}</span>
                <span class="text-[11px] text-slate-400 truncate block mt-0.5">${escapeHtml(r.description || "")}</span>
              </div>
              <span class="text-xs text-purple-400 group-hover:translate-x-0.5 transition font-mono shrink-0">→</span>
            </a>`,
            )
            .join("")}
        </div>
      </div>`
        : "";

    const faqSectionHtml = `
      <div class="mt-8 pt-6 border-t border-slate-800">
        <h3 class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">💬 Frequently Asked Questions (AI & Developer Summary)</h3>
        <div class="space-y-3">
          ${faqs
            .map(
              (f, i) => `
            <details class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 group" ${i === 0 ? "open" : ""}>
              <summary class="font-bold text-xs sm:text-sm text-slate-200 cursor-pointer flex items-center justify-between">
                <span>${escapeHtml(f.question)}</span>
                <span class="text-purple-400 text-xs font-mono group-open:rotate-180 transition">▼</span>
              </summary>
              <p class="mt-2 text-xs text-slate-400 leading-relaxed font-sans">
                ${escapeHtml(f.answer)}
              </p>
            </details>`,
            )
            .join("")}
        </div>
      </div>`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${desc}">
  <meta name="keywords" content="${metaKeywords}">
  <link rel="canonical" href="${pageUrl}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="alternate" type="text/plain" href="../llms.txt" title="DevShelf LLMs.txt Context for AI Agents">

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="../favicon.ico">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="alternate icon" href="../favicon.ico">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${desc}">
  <meta property="og:site_name" content="DevShelf">
  <meta property="og:image" content="https://devshelf.ritualdev.in/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@RitualDevLab">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="https://devshelf.ritualdev.in/og-image.jpg">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>

  <link rel="stylesheet" href="../tailwind.min.css">
</head>
<body class="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col justify-between selection:bg-purple-500 selection:text-white">
  <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="../" class="flex items-center space-x-2 text-white font-extrabold text-lg hover:text-purple-400 transition">
        <span>📚 DevShelf</span>
      </a>
      <div class="flex items-center space-x-3">
        <a href="https://donation.rolenest.in" target="_blank" rel="noopener noreferrer" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/50 text-pink-200 transition">
          💖 Donate
        </a>
        <a href="../#directory" class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition">
          ← Browse ${resources.length} Tools
        </a>
      </div>
    </div>
  </header>

  <main class="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
    <nav class="text-xs text-slate-400 mb-6 flex items-center space-x-2 font-mono">
      <a href="../" class="hover:text-purple-400">DevShelf</a>
      <span>/</span>
      <a href="../#directory" class="hover:text-purple-400">${category}</a>
      <span>/</span>
      <span class="text-purple-300 font-bold">${name}</span>
    </nav>

    <div class="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
      <div class="absolute -right-16 -top-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div class="flex items-center space-x-2 flex-wrap gap-2 mb-3">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/80 border border-purple-500/40 text-purple-300">
              ${category}
            </span>
            ${
              alternativeTo
                ? `<a href="../alternatives/${slugify(
                    alternativeTo.replace(/\s*\(\$.*?\)/g, "").trim(),
                  )}.html" class="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300 hover:bg-amber-900 hover:border-amber-400 transition" title="Explore free alternatives to ${escapeHtml(
                    alternativeTo,
                  )}">⚡ Alternative to ${escapeHtml(alternativeTo)} →</a>`
                : ""
            }
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">${name}</h1>
        </div>
        <a href="${escapeHtml(targetUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition transform hover:-translate-y-0.5">
          <span>Visit Official Page</span>
          <span>→</span>
        </a>
      </div>

      <p class="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
        ${desc}
      </p>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
        <div>
          <span class="text-slate-500 block mb-1">Pricing Model</span>
          <span class="text-emerald-400 font-semibold">Free access; limits may apply</span>
        </div>
        ${lang ? `<div><span class="text-slate-500 block mb-1">Language</span><span class="text-cyan-300 font-semibold">${lang}</span></div>` : ""}
        ${license ? `<div><span class="text-slate-500 block mb-1">License</span><span class="text-purple-300 font-semibold">${license}</span></div>` : ""}
        ${auth ? `<div><span class="text-slate-500 block mb-1">Auth Requirement</span><span class="text-amber-300 font-semibold">${auth}</span></div>` : ""}
        ${freeTier ? `<div class="col-span-2"><span class="text-slate-500 block mb-1">Free Tier Allowance</span><span class="text-slate-200">${freeTier}</span></div>` : ""}
      </div>

      ${dockerSectionHtml}
      ${badgeSectionHtml}
      ${relatedSectionHtml}
      ${faqSectionHtml}

      <div class="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <a href="../" class="text-xs text-purple-400 hover:text-purple-300 font-semibold transition">
          ← Back to DevShelf Directory
        </a>
        <a href="../directory.html" class="text-xs text-slate-400 hover:text-slate-200 transition font-mono">
          All Tools Index (520+) →
        </a>
        <span class="text-xs text-slate-500 font-mono">
          Verified Zero-Paywall Resource
        </span>
      </div>
    </div>
  </main>

  <footer class="border-t border-slate-800 bg-slate-900/40 py-6 text-center text-xs text-slate-400 space-y-2">
    <div class="flex items-center justify-center flex-wrap gap-3 font-mono text-[11px] text-slate-400 mb-2">
      <a href="../" class="hover:text-purple-300 transition">DevShelf Home</a>
      <span>•</span>
      <a href="../directory.html" class="hover:text-purple-300 transition">All Tools Index</a>
      <span>•</span>
      <a href="../collections/free-weather-apis.html" class="hover:text-purple-300 transition">Collections</a>
      <span>•</span>
      <a href="https://github.com/RitualDev-Lab/DevShelf" target="_blank" rel="noreferrer" class="hover:text-purple-300 transition">GitHub</a>
    </div>
    <p>Curated with ❤️ by <a href="https://github.com/RitualDev-Lab" class="text-purple-400 hover:underline">RitualDev-Lab</a> and the global open-source community.</p>
    <p><a href="https://donation.rolenest.in" target="_blank" rel="noopener noreferrer" class="text-pink-400 hover:text-pink-300 font-semibold transition">💖 Support DevShelf (donation.rolenest.in)</a></p>
  </footer>
</body>
</html>
`;

    await fs.writeFile(path.join(toolsDir, `${slug}.html`), html, "utf8");
  }

  // =========================================================================
  // 2. Programmatic Alternatives Pages (e.g. site/alternatives/postman.html)
  // =========================================================================
  const alternativesDir = path.join(siteDir, "alternatives");
  await fs.mkdir(alternativesDir, { recursive: true });

  const altMap = new Map<string, any[]>();
  for (const item of resources) {
    if (item.alternativeTo) {
      const rawTargets = item.alternativeTo
        .split(/[\/,]/)
        .map((t: string) => t.trim())
        .filter(Boolean);
      for (const target of rawTargets) {
        const cleanTarget = target.replace(/\s*\(\$.*?\)/g, "").trim();
        if (cleanTarget.length < 2) continue;
        if (!altMap.has(cleanTarget)) {
          altMap.set(cleanTarget, []);
        }
        const list = altMap.get(cleanTarget);
        if (list && !list.some((existing) => existing.name === item.name)) {
          list.push(item);
        }
      }
    }
  }

  console.log(
    `🌐 [DevShelf SEO Engine] Generating alternative roundup pages for ${altMap.size} commercial targets...`,
  );

  for (const [targetName, altTools] of altMap) {
    const slug = slugify(targetName);
    const pageUrl = `${domain}/alternatives/${slug}.html`;
    const title = `Best Free & Open Source Alternatives to ${escapeHtml(targetName)} | DevShelf`;
    const desc = `Explore ${altTools.length} verified free and open-source alternatives to ${escapeHtml(targetName)}. Zero paywalls, honest pricing, and active community maintenance.`;

    sitemapUrls.push(
      `  <url>\n    <loc>${pageUrl}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    );

    const altFaqs = [
      {
        question: `What is the best free alternative to ${targetName}?`,
        answer: `The leading free and open-source alternative to ${targetName} is ${altTools[0].name}. ${altTools[0].description}`,
      },
      {
        question: `Are there open-source alternatives to ${targetName}?`,
        answer: `Yes, DevShelf indexes ${altTools.length} verified free and open-source alternatives to ${targetName}, including ${altTools
          .slice(0, 3)
          .map((t) => t.name)
          .join(", ")}.`,
      },
      {
        question: `Why switch from ${targetName} to an open-source tool?`,
        answer: `Switching to open-source alternatives to ${targetName} eliminates recurring subscription costs, vendor lock-in, and account limits while allowing full self-hosting and data privacy.`,
      },
    ];

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ItemList",
          name: `Free Alternatives to ${targetName}`,
          description: desc,
          numberOfItems: altTools.length,
          itemListElement: altTools.map((t, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            item: {
              "@type": "SoftwareApplication",
              name: t.name,
              description: t.description,
              url: t.url || t.repo,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
            },
          })),
        },
        {
          "@type": "FAQPage",
          mainEntity: altFaqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        },
      ],
    };

    const cardsHtml = altTools
      .map((tool) => {
        const toolUrl = tool.url || tool.repo || "";
        const toolSlug = slugify(tool.name);
        return `
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl hover:border-purple-500/50 transition">
          <div class="flex items-start justify-between flex-wrap gap-2 mb-3">
            <div>
              <h3 class="text-xl font-bold text-white">
                <a href="../tools/${toolSlug}.html" class="hover:text-purple-300 transition">${escapeHtml(tool.name)}</a>
              </h3>
              <span class="text-xs font-mono text-purple-400">${escapeHtml(tool.category || "Tool")}</span>
            </div>
            <a href="${escapeHtml(toolUrl)}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition">
              Visit Site →
            </a>
          </div>
          <p class="text-sm text-slate-300 leading-relaxed mb-4">${escapeHtml(tool.description)}</p>
          <div class="flex flex-wrap gap-2 text-xs font-mono">
            <span class="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">💎 Free: ${escapeHtml(tool.freeTier || tool.rateLimit || "See official site for free access and limits")}</span>
            ${tool.language ? `<span class="px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">${escapeHtml(tool.language)}</span>` : ""}
            ${tool.license ? `<span class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">${escapeHtml(tool.license)}</span>` : ""}
          </div>
        </div>`;
      })
      .join("\n");

    const matrixTableHtml = `
      <div class="mb-10 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th class="p-3.5">Alternative Tool</th>
              <th class="p-3.5">Category</th>
              <th class="p-3.5">Pricing Model</th>
              <th class="p-3.5">Language / Stack</th>
              <th class="p-3.5 text-right">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-slate-300">
            ${altTools
              .map(
                (t) => `
              <tr class="hover:bg-slate-800/40 transition">
                <td class="p-3.5 font-bold text-white">
                  <a href="../tools/${slugify(t.name)}.html" class="hover:text-purple-300 transition">${escapeHtml(t.name)}</a>
                </td>
                <td class="p-3.5 text-slate-400">${escapeHtml(t.category || "Tool")}</td>
                <td class="p-3.5 text-emerald-400">${escapeHtml(t.freeTier || t.rateLimit || "See official site for free access and limits")}</td>
                <td class="p-3.5 text-cyan-300">${escapeHtml(t.language || "Multi-platform")}</td>
                <td class="p-3.5 text-right font-sans">
                  <a href="../tools/${slugify(t.name)}.html" class="text-purple-400 hover:text-purple-300 font-bold">Specs →</a>
                </td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>`;

    const altFaqSectionHtml = `
      <div class="mt-12 pt-8 border-t border-slate-800">
        <h3 class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">💬 Frequently Asked Questions about ${escapeHtml(targetName)} Alternatives</h3>
        <div class="space-y-3">
          ${altFaqs
            .map(
              (f, i) => `
            <details class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 group" ${i === 0 ? "open" : ""}>
              <summary class="font-bold text-xs sm:text-sm text-slate-200 cursor-pointer flex items-center justify-between">
                <span>${escapeHtml(f.question)}</span>
                <span class="text-purple-400 text-xs font-mono group-open:rotate-180 transition">▼</span>
              </summary>
              <p class="mt-2 text-xs text-slate-400 leading-relaxed font-sans">
                ${escapeHtml(f.answer)}
              </p>
            </details>`,
            )
            .join("")}
        </div>
      </div>`;

    const otherAlternatives = Array.from(altMap.entries())
      .filter(([k]) => k !== targetName)
      .slice(0, 8);

    const otherAltsHtml = `
      <div class="mt-12 pt-8 border-t border-slate-800">
        <h3 class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">⚡ Explore More Free Alternatives</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${otherAlternatives
            .map(
              ([name, tools]) => `
            <a href="${slugify(name)}.html" class="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition flex items-center justify-between group">
              <span class="text-xs font-semibold text-slate-300 group-hover:text-purple-300 transition truncate">${escapeHtml(name)}</span>
              <span class="text-[11px] font-mono text-purple-400 shrink-0 ml-2 font-bold">${tools.length}</span>
            </a>`,
            )
            .join("")}
        </div>
      </div>
    `;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="${pageUrl}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="alternate" type="text/plain" href="../llms.txt" title="DevShelf LLMs.txt Context for AI Agents">

  <link rel="icon" type="image/x-icon" href="../favicon.ico">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">

  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="https://devshelf.ritualdev.in/og-image.jpg">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@RitualDevLab">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="https://devshelf.ritualdev.in/og-image.jpg">

  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>

  <link rel="stylesheet" href="../tailwind.min.css">
</head>
<body class="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col justify-between selection:bg-purple-500 selection:text-white">
  <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="../" class="flex items-center space-x-2 text-white font-extrabold text-lg hover:text-purple-400 transition">
        <span>📚 DevShelf</span>
      </a>
      <div class="flex items-center space-x-3">
        <a href="https://donation.rolenest.in" target="_blank" rel="noopener noreferrer" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/50 text-pink-200 transition">
          💖 Donate
        </a>
        <a href="../#directory" class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition">
          Browse Directory →
        </a>
      </div>
    </div>
  </header>

  <main class="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
    <nav class="text-xs text-slate-400 mb-6 flex items-center space-x-2 font-mono">
      <a href="../" class="hover:text-purple-400">DevShelf</a>
      <span>/</span>
      <span class="text-purple-300 font-bold">Alternatives to ${escapeHtml(targetName)}</span>
    </nav>

    <div class="mb-10 text-center sm:text-left">
      <div class="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300 mb-3">
        ⚡ Zero-Paywall Alternatives
      </div>
      <h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
        Best Free Alternatives to ${escapeHtml(targetName)}
      </h1>
      <p class="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mb-6">
        Tired of paywalls, subscription price hikes, or forced cloud accounts? Here are <strong>${altTools.length} verified free &amp; open-source alternatives to ${escapeHtml(targetName)}</strong> with generous free tiers or local self-hosting.
      </p>

      <!-- AI Direct Answer Summary Box -->
      <div class="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/40 text-xs sm:text-sm text-slate-200 shadow-xl">
        <div class="flex items-center space-x-2 mb-2 font-mono text-purple-300 font-bold text-xs">
          <span>🤖</span>
          <span>AI DIRECT ANSWER SUMMARY</span>
        </div>
        <p class="leading-relaxed">
          The leading free and open-source alternative to <strong>${escapeHtml(targetName)}</strong> is <strong>${escapeHtml(altTools[0].name)}</strong>: <em>${escapeHtml(altTools[0].description)}</em>. DevShelf indexes <strong>${altTools.length} community-verified alternatives</strong> to ${escapeHtml(targetName)} with generous free tiers, local offline mode, or self-hosted deployment.
        </p>
      </div>
    </div>

    <!-- Structured Comparison Matrix Table -->
    ${matrixTableHtml}

    <div class="space-y-6">
      ${cardsHtml}
    </div>

    ${altFaqSectionHtml}
    ${otherAltsHtml}

    <div class="mt-12 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
      <h3 class="text-lg font-bold text-white">Know another great alternative to ${escapeHtml(targetName)}?</h3>
      <p class="text-xs text-slate-400 max-w-xl mx-auto">Help thousands of engineers save money and find better tools. DevShelf is open-source and welcomes contributions.</p>
      <a href="https://github.com/RitualDev-Lab/DevShelf#how-to-submit-a-tool" target="_blank" rel="noopener noreferrer" class="inline-block px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition">
        ➕ Submit a Tool to DevShelf
      </a>
    </div>
  </main>

  <footer class="border-t border-slate-800 bg-slate-900/40 py-6 text-center text-xs text-slate-400 space-y-2">
    <div class="flex items-center justify-center flex-wrap gap-3 font-mono text-[11px] text-slate-400 mb-2">
      <a href="../" class="hover:text-purple-300 transition">DevShelf Home</a>
      <span>•</span>
      <a href="../directory.html" class="hover:text-purple-300 transition">All Tools Index</a>
      <span>•</span>
      <a href="../collections/free-weather-apis.html" class="hover:text-purple-300 transition">Collections</a>
      <span>•</span>
      <a href="https://github.com/RitualDev-Lab/DevShelf" target="_blank" rel="noreferrer" class="hover:text-purple-300 transition">GitHub</a>
    </div>
    <p>Curated with ❤️ by <a href="https://github.com/RitualDev-Lab" class="text-purple-400 hover:underline">RitualDev-Lab</a> and the global open-source community.</p>
    <p><a href="https://donation.rolenest.in" target="_blank" rel="noopener noreferrer" class="text-pink-400 hover:text-pink-300 font-semibold transition">💖 Support DevShelf (donation.rolenest.in)</a></p>
  </footer>
</body>
</html>`;

    await fs.writeFile(path.join(alternativesDir, `${slug}.html`), html, "utf8");
  }

  // =========================================================================
  // 3. Curated Topic Collections (e.g. site/collections/free-weather-apis.html)
  // =========================================================================
  const collectionsDir = path.join(siteDir, "collections");
  await fs.mkdir(collectionsDir, { recursive: true });

  const collections = [
    {
      slug: "free-weather-apis",
      title: "Best Free Weather APIs (No Credit Card & Generous Tiers) | DevShelf",
      heading: "Free Public Weather APIs for Developers",
      desc: "Curated collection of 100% free, reliable weather forecast and radar APIs with no credit card required.",
      filter: (r: any) =>
        r.type === "api" &&
        (r.category?.toLowerCase().includes("weather") ||
          r.name.toLowerCase().includes("weather") ||
          r.description?.toLowerCase().includes("weather")),
    },
    {
      slug: "ai-coding-agents",
      title: "Best Open-Source AI Coding Agents & Local LLMs | DevShelf",
      heading: "Free & Open Source AI Coding Agents",
      desc: "Run autonomous agents, local LLMs, and code assistants on your own hardware without paying cloud subscription fees.",
      filter: (r: any) =>
        r.type === "ai" ||
        r.category?.toLowerCase().includes("ai") ||
        r.category?.toLowerCase().includes("agent") ||
        r.description?.toLowerCase().includes("llm"),
    },
    {
      slug: "free-mock-apis",
      title: "Best Free Mock & Testing APIs for Prototyping | DevShelf",
      heading: "Free Mock APIs & Test Data Services",
      desc: "Realistic dummy data, REST endpoints, and mock servers for rapid frontend and mobile prototyping.",
      filter: (r: any) =>
        r.type === "api" &&
        (r.category?.toLowerCase().includes("mock") ||
          r.category?.toLowerCase().includes("dev") ||
          r.description?.toLowerCase().includes("mock")),
    },
    {
      slug: "self-hostable-docker-tools",
      title: "Best Self-Hostable Developer Tools (1-Click Docker Compose) | DevShelf",
      heading: "Self-Hostable Developer Utilities & BaaS",
      desc: "Own your data. Verified open-source developer platforms and tools that can be launched with a single docker-compose.yml file.",
      filter: (r: any) => Boolean(r.dockerCompose),
    },
    {
      slug: "free-serverless-databases",
      title: "Best Free Cloud & Serverless Databases (Postgres, SQLite, Redis) | DevShelf",
      heading: "Free Serverless & Cloud Databases",
      desc: "Databases with generous permanent free tiers for side projects, production apps, and prototypes.",
      filter: (r: any) =>
        (r.type === "cloud" || r.category?.toLowerCase().includes("database")) &&
        (r.description?.toLowerCase().includes("postgres") ||
          r.description?.toLowerCase().includes("database") ||
          r.description?.toLowerCase().includes("sql") ||
          r.description?.toLowerCase().includes("redis")),
    },
  ];

  console.log(
    `🌐 [DevShelf SEO Engine] Generating ${collections.length} curated topic collections...`,
  );

  for (const col of collections) {
    const colTools = resources.filter(col.filter);
    const pageUrl = `${domain}/collections/${col.slug}.html`;

    sitemapUrls.push(
      `  <url>\n    <loc>${pageUrl}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    );

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: col.heading,
      description: col.desc,
      numberOfItems: colTools.length,
      itemListElement: colTools.map((t, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "SoftwareApplication",
          name: t.name,
          description: t.description,
          url: t.url || t.repo,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        },
      })),
    };

    const cardsHtml = colTools
      .map((tool) => {
        const toolUrl = tool.url || tool.repo || "";
        const toolSlug = slugify(tool.name);
        return `
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl hover:border-purple-500/50 transition">
          <div class="flex items-start justify-between flex-wrap gap-2 mb-3">
            <div>
              <h3 class="text-xl font-bold text-white">
                <a href="../tools/${toolSlug}.html" class="hover:text-purple-300 transition">${escapeHtml(tool.name)}</a>
              </h3>
              <span class="text-xs font-mono text-purple-400">${escapeHtml(tool.category || "Tool")}</span>
            </div>
            <a href="${escapeHtml(toolUrl)}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition">
              Visit Tool →
            </a>
          </div>
          <p class="text-sm text-slate-300 leading-relaxed mb-4">${escapeHtml(tool.description)}</p>
          <div class="flex flex-wrap gap-2 text-xs font-mono">
            <span class="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">💎 Free: ${escapeHtml(tool.freeTier || tool.rateLimit || "See official site for free access and limits")}</span>
            ${tool.auth ? `<span class="px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-500/30">🔑 ${escapeHtml(tool.auth)}</span>` : ""}
            ${tool.language ? `<span class="px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">${escapeHtml(tool.language)}</span>` : ""}
          </div>
        </div>`;
      })
      .join("\n");

    const otherCollections = collections.filter((c) => c.slug !== col.slug);
    const otherCollectionsHtml = `
      <div class="mt-12 pt-8 border-t border-slate-800">
        <h3 class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">📂 Explore Other Curated Collections</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${otherCollections
            .map(
              (c) => `
            <a href="${c.slug}.html" class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between group">
              <span class="text-xs font-semibold text-slate-300 group-hover:text-cyan-300 transition truncate">${escapeHtml(c.heading)}</span>
              <span class="text-xs text-cyan-400 group-hover:translate-x-0.5 transition font-mono shrink-0">→</span>
            </a>`,
            )
            .join("")}
        </div>
      </div>
    `;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(col.title)}</title>
  <meta name="description" content="${escapeHtml(col.desc)}">
  <link rel="canonical" href="${pageUrl}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="alternate" type="text/plain" href="../llms.txt" title="DevShelf LLMs.txt Context for AI Agents">

  <link rel="icon" type="image/x-icon" href="../favicon.ico">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">

  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${escapeHtml(col.title)}">
  <meta property="og:description" content="${escapeHtml(col.desc)}">
  <meta property="og:image" content="https://devshelf.ritualdev.in/og-image.jpg">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@RitualDevLab">
  <meta name="twitter:title" content="${escapeHtml(col.title)}">
  <meta name="twitter:description" content="${escapeHtml(col.desc)}">
  <meta name="twitter:image" content="https://devshelf.ritualdev.in/og-image.jpg">

  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>

  <link rel="stylesheet" href="../tailwind.min.css">
</head>
<body class="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col justify-between selection:bg-purple-500 selection:text-white">
  <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="../" class="flex items-center space-x-2 text-white font-extrabold text-lg hover:text-purple-400 transition">
        <span>📚 DevShelf</span>
      </a>
      <div class="flex items-center space-x-3">
        <a href="https://donation.rolenest.in" target="_blank" rel="noopener noreferrer" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/50 text-pink-200 transition">
          💖 Donate
        </a>
        <a href="../#directory" class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition">
          Browse Directory →
        </a>
      </div>
    </div>
  </header>

  <main class="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
    <nav class="text-xs text-slate-400 mb-6 flex items-center space-x-2 font-mono">
      <a href="../" class="hover:text-purple-400">DevShelf</a>
      <span>/</span>
      <span class="text-purple-300 font-bold">${escapeHtml(col.heading)}</span>
    </nav>

    <div class="mb-10 text-center sm:text-left">
      <div class="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 mb-3">
        📂 Curated DevShelf Collection (${colTools.length} Tools)
      </div>
      <h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
        ${escapeHtml(col.heading)}
      </h1>
      <p class="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
        ${escapeHtml(col.desc)}
      </p>
    </div>

    <div class="space-y-6">
      ${cardsHtml}
    </div>

    ${otherCollectionsHtml}

    <div class="mt-12 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
      <h3 class="text-lg font-bold text-white">Have a tool to add to this collection?</h3>
      <p class="text-xs text-slate-400 max-w-xl mx-auto">DevShelf is 100% community-driven. Add your project or suggest another zero-paywall gem.</p>
      <a href="https://github.com/RitualDev-Lab/DevShelf#how-to-submit-a-tool" target="_blank" rel="noopener noreferrer" class="inline-block px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition">
        ➕ Submit a Tool to DevShelf
      </a>
    </div>
  </main>

  <footer class="border-t border-slate-800 bg-slate-900/40 py-6 text-center text-xs text-slate-400 space-y-2">
    <div class="flex items-center justify-center flex-wrap gap-3 font-mono text-[11px] text-slate-400 mb-2">
      <a href="../" class="hover:text-purple-300 transition">DevShelf Home</a>
      <span>•</span>
      <a href="../directory.html" class="hover:text-purple-300 transition">All Tools Index</a>
      <span>•</span>
      <a href="../collections/free-weather-apis.html" class="hover:text-purple-300 transition">Collections</a>
      <span>•</span>
      <a href="https://github.com/RitualDev-Lab/DevShelf" target="_blank" rel="noreferrer" class="hover:text-purple-300 transition">GitHub</a>
    </div>
    <p>Curated with ❤️ by <a href="https://github.com/RitualDev-Lab" class="text-purple-400 hover:underline">RitualDev-Lab</a> and the global open-source community.</p>
    <p><a href="https://donation.rolenest.in" target="_blank" rel="noopener noreferrer" class="text-pink-400 hover:text-pink-300 font-semibold transition">💖 Support DevShelf (donation.rolenest.in)</a></p>
  </footer>
</body>
</html>`;

    await fs.writeFile(path.join(collectionsDir, `${col.slug}.html`), html, "utf8");
  }

  // =========================================================================
  // 4. Static Directory Index (site/directory.html) - Zero-Orphan Master Index
  // =========================================================================
  const directoryUrl = `${domain}/directory.html`;
  sitemapUrls.push(
    `  <url>\n    <loc>${directoryUrl}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.95</priority>\n  </url>`,
  );

  const categoriesMap = new Map<string, any[]>();
  for (const item of resources) {
    const cat = item.category || item.section || "General";
    if (!categoriesMap.has(cat)) {
      categoriesMap.set(cat, []);
    }
    categoriesMap.get(cat)?.push(item);
  }

  let directoryCategoriesHtml = "";
  for (const [catName, catItems] of categoriesMap.entries()) {
    directoryCategoriesHtml += `
      <section class="mb-12">
        <div class="flex items-center space-x-3 pb-3 border-b border-slate-800 mb-6">
          <span class="text-xl">📁</span>
          <h2 class="text-xl font-bold text-white tracking-tight">${escapeHtml(catName)}</h2>
          <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700">${catItems.length} tools</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${catItems
            .map(
              (item) => `
            <div class="p-4 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-purple-500/40 transition flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <a href="tools/${slugify(item.name)}.html" class="text-sm font-bold text-white hover:text-purple-300 transition">
                    ${escapeHtml(item.name)}
                  </a>
                  ${item.language ? `<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">${escapeHtml(item.language)}</span>` : ""}
                </div>
                <p class="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">${escapeHtml(item.description || "")}</p>
              </div>
              <div class="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                <span class="text-emerald-400 truncate max-w-[150px]">💎 ${escapeHtml(item.freeTier || item.rateLimit || "See official site for free access and limits")}</span>
                <a href="tools/${slugify(item.name)}.html" class="text-purple-400 hover:text-purple-300 font-bold">Details →</a>
              </div>
            </div>`,
            )
            .join("")}
        </div>
      </section>
    `;
  }

  const altLinksHtml = Array.from(altMap.entries())
    .map(
      ([altName, items]) => `
      <a href="alternatives/${slugify(altName)}.html" class="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition text-xs font-medium text-slate-300 hover:text-white flex items-center justify-between">
        <span>⚡ Alternatives to <strong class="text-amber-300">${escapeHtml(altName)}</strong></span>
        <span class="text-slate-500 font-mono text-[11px]">${items.length} tools</span>
      </a>
    `,
    )
    .join("");

  const colLinksHtml = collections
    .map(
      (c) => `
      <a href="collections/${c.slug}.html" class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between">
        <span class="text-xs font-bold text-cyan-300">${escapeHtml(c.heading)}</span>
        <span class="text-xs text-cyan-400 font-mono">→</span>
      </a>
    `,
    )
    .join("");

  const directoryHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Free Developer Tools Directory Index | DevShelf</title>
  <meta name="description" content="Explore the full directory index of ${resources.length} verified free developer tools, APIs, AI agents, and open-source software. Zero paywalls, no trial bait.">
  <link rel="canonical" href="${directoryUrl}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="alternate" type="text/plain" href="llms.txt" title="DevShelf LLMs.txt Context for AI Agents">

  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">

  <meta property="og:type" content="website">
  <meta property="og:url" content="${directoryUrl}">
  <meta property="og:title" content="Complete Free Developer Tools Directory Index | DevShelf">
  <meta property="og:description" content="Explore all ${resources.length} free and open-source developer resources across ${categoriesMap.size} categories.">
  <meta property="og:image" content="https://devshelf.ritualdev.in/og-image.jpg">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@RitualDevLab">
  <meta name="twitter:title" content="Complete Free Developer Tools Directory Index | DevShelf">
  <meta name="twitter:description" content="Explore all ${resources.length} free and open-source developer resources across ${categoriesMap.size} categories.">
  <meta name="twitter:image" content="https://devshelf.ritualdev.in/og-image.jpg">

  <link rel="stylesheet" href="tailwind.min.css">
</head>
<body class="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col justify-between selection:bg-purple-500 selection:text-white">
  <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="./" class="flex items-center space-x-2 text-white font-extrabold text-lg hover:text-purple-400 transition">
        <span>📚 DevShelf</span>
      </a>
      <div class="flex items-center space-x-3">
        <a href="https://donation.rolenest.in" target="_blank" rel="noopener noreferrer" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/50 text-pink-200 transition">
          💖 Donate
        </a>
        <a href="./#directory" class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition">
          ← Interactive App
        </a>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
    <div class="mb-12 text-center max-w-3xl mx-auto">
      <div class="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-950/80 border border-purple-500/40 text-purple-300 mb-3">
        🗂️ Complete Master Directory (${resources.length} Verified Tools)
      </div>
      <h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
        Browse All Free Developer Tools
      </h1>
      <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
        Every tool listed below is manually verified to have a permanent free tier, open-source license, or generous zero-paywall allowance. No credit card required.
      </p>
    </div>

    <!-- Curated Hubs -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
      <div>
        <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center space-x-2">
          <span>📂</span>
          <span>Curated Topic Collections</span>
        </h3>
        <div class="grid grid-cols-1 gap-2.5">
          ${colLinksHtml}
        </div>
      </div>
      <div>
        <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center space-x-2">
          <span>⚡</span>
          <span>Popular Commercial Alternatives</span>
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-2">
          ${altLinksHtml}
        </div>
      </div>
    </div>

    <!-- Category Sections -->
    ${directoryCategoriesHtml}
  </main>

  <footer class="border-t border-slate-800 bg-slate-900/40 py-8 text-center text-xs text-slate-400 space-y-3">
    <div class="flex items-center justify-center flex-wrap gap-4 font-mono text-[11px] text-slate-400">
      <a href="./" class="hover:text-purple-300 transition">Interactive App</a>
      <span>•</span>
      <a href="directory.html" class="hover:text-purple-300 transition">Directory Index</a>
      <span>•</span>
      <a href="https://github.com/RitualDev-Lab/DevShelf" target="_blank" rel="noreferrer" class="hover:text-purple-300 transition">GitHub Repo</a>
      <span>•</span>
      <a href="api/v1/tools.json" target="_blank" rel="noreferrer" class="hover:text-cyan-300 transition">REST API</a>
    </div>
    <p>Curated with ❤️ by <a href="https://github.com/RitualDev-Lab" class="text-purple-400 hover:underline">RitualDev-Lab</a> and the global open-source community.</p>
    <p><a href="https://donation.rolenest.in" target="_blank" rel="noopener noreferrer" class="text-pink-400 hover:text-pink-300 font-semibold transition">💖 Support DevShelf (donation.rolenest.in)</a></p>
  </footer>
</body>
</html>`;

  await fs.writeFile(path.join(siteDir, "directory.html"), directoryHtml, "utf8");
  console.log("✅ Generated site/directory.html master index.");

  // =========================================================================
  // 5. Emerging LLM Standard: site/llms.txt & site/llms-full.txt
  // =========================================================================
  const topAltsMarkdown = Array.from(altMap.entries())
    .slice(0, 30)
    .map(
      ([target, tools]) =>
        `- [Alternatives to ${target}](${domain}/alternatives/${slugify(target)}.html): ${tools
          .slice(0, 3)
          .map((t) => t.name)
          .join(", ")} (${tools.length} total options)`,
    )
    .join("\n");

  const llmsTxt = `# DevShelf: Free Developer Tools & Public APIs Directory

> Curated catalog of ${resources.length} verified free developer tools, public APIs, AI coding agents, and open-source alternatives with zero paywalls.

DevShelf is an open-source, community-driven developer resource ecosystem curated by RitualDev-Lab and developers worldwide. Every resource is manually verified to ensure a permanent free tier, open-source license, or generous allowance with no mandatory credit card or 14-day trial traps.

## Machine & AI Agent Integration
- **Model Context Protocol (MCP) Server**: Run \`npx devshelf-mcp\` in Claude Desktop, Cursor, Windsurf, or LangChain agents.
- **REST API**: ${domain}/api/v1/tools.json
- **Full Catalog Raw Knowledge Base**: ${domain}/llms-full.txt
- **Master HTML Directory**: ${domain}/directory.html
- **Sitemap**: ${domain}/sitemap.xml

## Curated Collections
- [Free Weather APIs](${domain}/collections/free-weather-apis.html): Reliable forecast and radar APIs with no credit card requirement.
- [AI Coding Agents & Local LLMs](${domain}/collections/ai-coding-agents.html): Autonomous software engineering agents, local LLM runners, and prompt debuggers.
- [Free Mock & Testing APIs](${domain}/collections/free-mock-apis.html): Realistic dummy data, REST endpoints, and mock servers for rapid prototyping.
- [Self-Hostable Docker Tools](${domain}/collections/self-hostable-docker-tools.html): 1-click self-hosted platforms via docker-compose.yml.
- [Free Serverless Databases](${domain}/collections/free-serverless-databases.html): Cloud PostgreSQL, SQLite, and Redis with permanent free tiers.

## Popular Commercial Software Alternatives
${topAltsMarkdown}

## Catalog Categories
- **AI & ML**: Local models, vector databases, and LLM tooling.
- **APIs**: Public, free endpoints for sports, finance, weather, geocoding, and dev utilities.
- **CLI Tools**: Terminal productivity boosters and developer command-line utilities.
- **Cloud & BaaS**: Free hosting, databases, and serverless compute.
- **Testing & QA**: E2E testing, API probing, and browser automation.
- **Dev Perks**: Student packs, startup credits, and open-source licenses.
- **Boilerplates**: Production-ready starters for Next.js, FastAPI, Astro, and more.
`;
  await fs.writeFile(path.join(siteDir, "llms.txt"), llmsTxt, "utf8");
  console.log("✅ Generated site/llms.txt for AI agents and LLM search.");

  const llmsFullLines = [
    "# DevShelf - Complete Free Developer Tools Knowledge Base (Full Catalog)",
    "",
    `> Complete metadata dump of all ${resources.length} free and open-source developer tools indexed on DevShelf.`,
    `> Authoritative Source: ${domain}`,
    "> License: MIT",
    "",
  ];

  for (const item of resources) {
    llmsFullLines.push(`### ${item.name}`);
    llmsFullLines.push(`- **Category**: ${item.category || item.section || "Tool"}`);
    llmsFullLines.push(
      `- **Pricing Model**: ${item.freeTier || item.rateLimit || "See official site for free access and limits"}`,
    );
    if (item.alternativeTo) llmsFullLines.push(`- **Alternative To**: ${item.alternativeTo}`);
    if (item.license) llmsFullLines.push(`- **License**: ${item.license}`);
    if (item.language) llmsFullLines.push(`- **Language**: ${item.language}`);
    if (item.auth) llmsFullLines.push(`- **Auth**: ${item.auth}`);
    llmsFullLines.push(`- **URL**: ${item.url || item.repo || ""}`);
    llmsFullLines.push(`- **DevShelf Dossier**: ${domain}/tools/${slugify(item.name)}.html`);
    llmsFullLines.push(`- **Description**: ${item.description || ""}`);
    llmsFullLines.push("");
  }

  await fs.writeFile(path.join(siteDir, "llms-full.txt"), llmsFullLines.join("\n"), "utf8");
  console.log("✅ Generated site/llms-full.txt complete AI knowledge base.");

  // Generate site/sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join("\n")}
</urlset>
`;
  await fs.writeFile(path.join(siteDir, "sitemap.xml"), sitemapXml, "utf8");
  console.log(`✅ Generated site/sitemap.xml with ${sitemapUrls.length} indexed URLs.`);

  // Generate site/robots.txt welcoming AI & search engines
  const robotsTxt = `User-agent: *
Allow: /

# Dedicated Directives for AI Crawlers and Generative Search
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: OAI-SearchBot
Allow: /

Sitemap: https://devshelf.ritualdev.in/sitemap.xml
`;
  await fs.writeFile(path.join(siteDir, "robots.txt"), robotsTxt, "utf8");
  console.log("✅ Generated site/robots.txt welcoming AI crawlers and pointing to live sitemap.");
}

generateSeo().catch((err) => {
  console.error("SEO generation failed:", err);
  process.exit(1);
});
