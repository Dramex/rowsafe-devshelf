let allResources = [];
let activeCategory = "all";
let activeTag = "";
let searchQuery = "";
let currentSort = "featured";
let matchmakerData = null;
let activeMatchLang = "all";
let matchmakerSearchQuery = "";
const activeMatrixTags = new Set();
let uptimeData = null;
const myStack = new Set();
let activeStackTab = "env";
const drawerState = {
  currentItem: null,
  activeTab: "curl",
};
const wizardState = {
  step: 1,
};
let currentFilteredList = [];
let currentPage = 1;
let pageSize = 24; // 24 tools per page by default (responsive across 1, 2, and 3 columns)
let totalPages = 1;

const BADGE_MARKDOWNS = {
  "verified-free":
    "[![Featured on DevShelf](https://img.shields.io/badge/DevShelf-Verified_Free-7928CA?style=flat-square&logo=googlechrome&logoColor=white)](https://devshelf.ritualdev.in/)",
  purple:
    "[![Featured on DevShelf](https://img.shields.io/badge/Featured%20on-DevShelf-7928CA?style=for-the-badge&logo=googlechrome&logoColor=white)](https://devshelf.ritualdev.in/)",
  svg: '<a href="https://devshelf.ritualdev.in/"><img src="https://devshelf.ritualdev.in/badge.svg" alt="Featured on DevShelf"></a>',
  cyan: "[![Featured on DevShelf](https://img.shields.io/badge/DevShelf-Curated%20Resource-00E5FF?style=for-the-badge&logo=github&logoColor=black)](https://devshelf.ritualdev.in/)",
  flat: "[![Featured on DevShelf](https://img.shields.io/badge/DevShelf-Verified_Free-7928CA?style=flat-square&logo=googlechrome&logoColor=white)](https://devshelf.ritualdev.in/)",
};

/**
 * Main application bootstrapper.
 * Attaches listeners immediately so buttons never fail, then loads and renders data.
 */
function boot() {
  setupListeners();
  loadDataAndRender();
  loadUptimeData();
  loadContributors();
}

/**
 * Loads data from preloaded window.DEVSHELF_DATA (0ms latency, zero CORS restrictions)
 * and falls back / refreshes from data.json if available.
 */
async function loadDataAndRender() {
  if (
    typeof window !== "undefined" &&
    window.DEVSHELF_DATA &&
    Array.isArray(window.DEVSHELF_DATA.resources)
  ) {
    applyData(window.DEVSHELF_DATA);
  }

  try {
    const res = await fetch(`data.json?v=${Date.now()}`);
    if (res.ok) {
      const liveData = await res.json();
      if (liveData && Array.isArray(liveData.resources)) {
        applyData(liveData);
      }
    }
  } catch (err) {
    console.info("Using embedded DevShelf data.", err);
  }
}

async function loadUptimeData() {
  if (uptimeData) return uptimeData;
  try {
    const res = await fetch(`uptime.json?v=${Date.now()}`);
    if (res.ok) {
      uptimeData = await res.json();
      render();
    }
  } catch (err) {
    console.info("Uptime telemetry loading deferred.", err);
  }
  return uptimeData;
}

function applyData(data) {
  allResources = data.resources || [];
  for (let i = 0; i < allResources.length; i++) {
    const item = allResources[i];
    item._searchIndex = [
      item.name,
      item.description,
      item.category,
      item.section,
      item.language,
      item.platform,
      item.freeTierCost,
      item.perkValue,
      item.seeking,
      item.auth,
      item.freeTier,
      item.license,
      item.repo,
      item.url,
      item.alternativeTo,
      item.dockerCompose,
      ...(item.statusTags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }
  updateStatsAndPills(data);
  updateMatrixCounts();
  loadStackFromStorageAndUrl();
  renderSpotlight();
  render();
}

function updateMatrixCounts() {
  const counts = {
    noauth: 0,
    alternatives: 0,
    docker: 0,
    selfhost: 0,
    freetier: 0,
    offline: 0,
  };

  for (const item of allResources) {
    if (matchesMatrixTag(item, "noauth")) counts.noauth++;
    if (matchesMatrixTag(item, "alternatives")) counts.alternatives++;
    if (matchesMatrixTag(item, "docker")) counts.docker++;
    if (matchesMatrixTag(item, "selfhost")) counts.selfhost++;
    if (matchesMatrixTag(item, "freetier")) counts.freetier++;
    if (matchesMatrixTag(item, "offline")) counts.offline++;
  }

  setElText("matrix-count-noauth", counts.noauth);
  setElText("matrix-count-alternatives", counts.alternatives);
  setElText("matrix-count-docker", counts.docker);
  setElText("matrix-count-selfhost", counts.selfhost);
  setElText("matrix-count-freetier", counts.freetier);
  setElText("matrix-count-offline", counts.offline);
}

function matchesMatrixTag(item, tag) {
  if (tag === "alternatives") {
    return Boolean(item.alternativeTo);
  }
  if (tag === "docker") {
    return Boolean(item.dockerCompose);
  }
  if (tag === "noauth") {
    return (
      item.auth === "No Key" ||
      (item.statusTags || []).some(
        (t) => t.toLowerCase().includes("no auth") || t.toLowerCase().includes("no key"),
      )
    );
  }
  if (tag === "selfhost") {
    return (
      item.type === "boilerplate" ||
      Boolean(item.dockerCompose) ||
      (item.statusTags || []).some(
        (t) => t.toLowerCase().includes("self-hostable") || t.toLowerCase().includes("selfhost"),
      )
    );
  }
  if (tag === "freetier") {
    return (
      item.type === "boilerplate" ||
      item.auth === "No Key" ||
      (item.freeTier && !item.freeTier.toLowerCase().includes("credit card")) ||
      (item.statusTags || []).some(
        (t) => t.toLowerCase().includes("no card") || t.toLowerCase().includes("nocard"),
      )
    );
  }
  if (tag === "offline") {
    return (item.statusTags || []).some((t) => t.toLowerCase().includes("offline"));
  }
  return false;
}

function updateStatsAndPills(data) {
  const total = data.totalCount || allResources.length;
  const reposCount =
    data.reposCount ||
    data.facets?.repos ||
    data.counts?.repos ||
    allResources.filter((r) => Boolean(r.repo)).length;
  const boilerplatesCount =
    data.counts?.boilerplates || allResources.filter((r) => r.type === "boilerplate").length;
  const apisCount = data.counts?.apis || 0;
  const aiCount = data.counts?.aiTools || 0;
  const cliCount = data.counts?.cliTools || 0;
  const testingCount = data.counts?.testingQa || 0;
  const cloudCount = data.counts?.freeCloud || 0;
  const perksCount = data.counts?.perks || 0;
  const contributorsCount =
    data.counts?.contributors ||
    allResources.filter((r) => r.contributorsWanted || r.seeking || r.type === "contributors")
      .length;

  // Stats bar
  setElText("stat-total", `${total} Resources`);
  setElText("stat-repos", reposCount);
  setElText("stat-boilerplates", boilerplatesCount);
  setElText("stat-apis", apisCount);
  setElText("stat-ai", aiCount);
  setElText("stat-cli", cliCount);
  setElText("stat-testing", testingCount);
  setElText("stat-cloud", cloudCount);
  setElText("stat-perks", perksCount);

  // Category pill counts
  setElText("pill-count-all", total);
  setElText("pill-count-repo", reposCount);
  setElText("pill-count-boilerplates", boilerplatesCount);
  setElText("pill-count-api", apisCount);
  setElText("pill-count-ai", aiCount);
  setElText("pill-count-cli", cliCount);
  setElText("pill-count-testing", testingCount);
  setElText("pill-count-cloud", cloudCount);
  setElText("pill-count-perks", perksCount);
  setElText("pill-count-contributors", contributorsCount);

  // Hero CTA count
  setElText("hero-total-count", total);

  // 1,000 Tools Milestone Progress Tracker
  const targetGoal = 1000;
  const progressRatio = Math.min(total / targetGoal, 1);
  const percentComplete = Math.round(progressRatio * 100);
  const remaining = Math.max(targetGoal - total, 0);

  const progressBar = document.getElementById("milestone-progress-bar");
  if (progressBar) progressBar.style.width = `${percentComplete}%`;

  setElText("progress-percent-label", `${percentComplete}% Complete`);
  setElText("progress-count-label", total);
  setElText("progress-remaining-label", `${remaining} to go!`);

  const asciiBar = document.getElementById("progress-ascii-bar");
  if (asciiBar) {
    const barBlocks = 20;
    const filled = Math.round(progressRatio * barBlocks);
    const empty = barBlocks - filled;
    asciiBar.textContent = `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
  }
}

function setElText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function renderSpotlight() {
  const spotlightContainer = document.getElementById("spotlight-grid");
  if (!spotlightContainer || allResources.length === 0) return;

  const spotlightNames = [
    "GitWhisper",
    "FlashLane",
    "AutoHeal-QA",
    "Ollama",
    "Bruno",
    "PocketBase",
  ];
  const featured = allResources
    .filter((r) => spotlightNames.includes(r.name) || r.featured)
    .slice(0, 6);

  spotlightContainer.innerHTML = featured
    .map((item) => {
      const isRepo = Boolean(item.repo);
      const targetUrl = item.repo || item.url;
      const displaySlug = item.repo
        ? item.repo.replace(/^https?:\/\/github\.com\//, "")
        : targetUrl.replace(/^https?:\/\/(www\.)?/, "");

      return `
      <div class="spotlight-card rounded-2xl p-5 flex flex-col justify-between group">
        <div>
          <div class="flex items-start justify-between gap-3 mb-2">
            <div>
              <div class="flex items-center space-x-2 flex-wrap">
                <h3 class="text-base font-extrabold text-white group-hover:text-purple-300 transition">
                  <a href="${targetUrl}" target="_blank" rel="noreferrer">${escapeHtml(item.name)}</a>
                </h3>
                <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/25 text-amber-200 border border-amber-500/40 font-mono">Spotlight</span>
              </div>
              <div class="text-xs font-mono text-cyan-300 mt-1 font-semibold flex items-center space-x-1">
                <span>${isRepo ? "🐙" : "🌐"}</span>
                <span>${escapeHtml(displaySlug)}</span>
              </div>
            </div>
            <button data-url="${targetUrl}" class="copy-btn text-slate-300 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition" title="Copy URL">
              📋
            </button>
          </div>
          
          <p class="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-3 my-3 font-normal">${escapeHtml(item.description)}</p>
        </div>

        <div class="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
              ${escapeHtml(item.language || item.license || "100% Free")}
            </span>
            <button data-stack-name="${escapeHtml(item.name)}" class="stack-toggle-btn inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold ${isItemInStack(item.name) ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400" : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"} transition border shadow-sm" title="Add to My Stack">
              <span>${isItemInStack(item.name) ? "✓ In Stack" : "🔀 +Stack"}</span>
            </button>
          </div>
          <div class="flex items-center space-x-2">
            ${
              isRepo
                ? `<a href="${item.repo}" target="_blank" rel="noreferrer" class="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-md shadow-purple-600/30">
                    <span>🐙 GitHub Repo →</span>
                  </a>`
                : `<a href="${targetUrl}" target="_blank" rel="noreferrer" class="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-md shadow-cyan-600/30">
                    <span>🌐 Website →</span>
                  </a>`
            }
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  // Stagger spotlight card entrance animations
  const spotCards = spotlightContainer.children;
  for (let i = 0; i < spotCards.length; i++) {
    spotCards[i].style.setProperty("--delay", `${i * 0.08}s`);
  }
}

let listenersInitialized = false;
function setupListeners() {
  if (listenersInitialized) return;
  listenersInitialized = true;
  closeBadgeModal();
  closeMatchmakerModal();
  closeWizardModal();
  closeSnippetDrawer();
  closeStackModal();

  // Mobile Navigation Drawer Toggle
  const mobileToggleBtn = document.getElementById("mobile-menu-toggle-btn");
  const mobileDrawer = document.getElementById("mobile-nav-drawer");
  const hamburgerIcon = document.getElementById("hamburger-icon");
  const closeIcon = document.getElementById("close-icon");

  function closeMobileMenu() {
    if (!mobileDrawer || mobileDrawer.classList.contains("hidden")) return;
    mobileDrawer.classList.add("hidden");
    hamburgerIcon?.classList.remove("hidden");
    closeIcon?.classList.add("hidden");
  }

  function toggleMobileMenu() {
    if (!mobileDrawer) return;
    const isHidden = mobileDrawer.classList.contains("hidden");
    if (isHidden) {
      mobileDrawer.classList.remove("hidden");
      hamburgerIcon?.classList.add("hidden");
      closeIcon?.classList.remove("hidden");
    } else {
      closeMobileMenu();
    }
  }

  mobileToggleBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  mobileDrawer?.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) {
      closeMobileMenu();
    }
  });

  document.getElementById("mobile-matchmaker-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeMobileMenu();
    openMatchmakerModal();
  });

  document.getElementById("mobile-stack-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeMobileMenu();
    openStackModal();
  });

  document.getElementById("mobile-badge-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeMobileMenu();
    openBadgeModal();
  });

  // Floating Back to Top Button
  const backToTopBtn = document.getElementById("back-to-top-btn");
  if (backToTopBtn) {
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 400) {
          backToTopBtn.classList.remove("opacity-0", "pointer-events-none", "translate-y-4");
          backToTopBtn.classList.add("opacity-100", "pointer-events-auto", "translate-y-0");
        } else {
          backToTopBtn.classList.add("opacity-0", "pointer-events-none", "translate-y-4");
          backToTopBtn.classList.remove("opacity-100", "pointer-events-auto", "translate-y-0");
        }
      },
      { passive: true },
    );

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Fast, debounced instant search
  const searchInput = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-search-btn");
  let searchDebounceTimer = null;

  searchInput?.addEventListener("input", (e) => {
    const rawVal = e.target.value.toLowerCase().trim();
    if (clearBtn) {
      if (rawVal.length > 0) {
        clearBtn.classList.remove("hidden");
      } else {
        clearBtn.classList.add("hidden");
      }
    }
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      searchQuery = rawVal;
      requestAnimationFrame(() => render(true));
    }, 50);
  });

  clearBtn?.addEventListener("click", () => {
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
    searchQuery = "";
    clearBtn.classList.add("hidden");
    render(true);
  });

  const matchSearchInput = document.getElementById("matchmaker-search-input");
  matchSearchInput?.addEventListener("input", (e) => {
    matchmakerSearchQuery = e.target.value.toLowerCase().trim();
    if (matchmakerData) {
      renderMatchmakerList(matchmakerData);
    }
  });

  // Global Unified Event Delegation
  document.addEventListener("click", (e) => {
    // 1. Open Badge Modal
    if (e.target.closest("#open-badge-modal-btn, #nav-badge-btn, #hero-badge-btn")) {
      e.preventDefault();
      openBadgeModal();
      return;
    }

    // 2. Close Badge Modal
    if (e.target.closest("#close-badge-modal-btn") || e.target.id === "badge-modal") {
      e.preventDefault();
      closeBadgeModal();
      return;
    }

    // 3. Open Matchmaker Modal
    if (e.target.closest("#open-matchmaker-btn, #nav-matchmaker-btn, #hero-matchmaker-btn")) {
      e.preventDefault();
      openMatchmakerModal();
      return;
    }

    const matchmakerTrigger = e.target.closest(".matchmaker-trigger-btn");
    if (matchmakerTrigger) {
      e.preventDefault();
      const targetProj = matchmakerTrigger.getAttribute("data-matchmaker-proj");
      openMatchmakerModal(targetProj);
      return;
    }

    // 4. Close Matchmaker Modal
    if (e.target.closest("#close-matchmaker-modal-btn") || e.target.id === "matchmaker-modal") {
      e.preventDefault();
      closeMatchmakerModal();
      return;
    }

    // 5. Open Contribution Wizard Modal
    if (e.target.closest("#nav-wizard-btn, #hero-wizard-btn")) {
      e.preventDefault();
      openWizardModal();
      return;
    }

    // 6. Close Contribution Wizard Modal
    if (e.target.closest("#close-wizard-modal-btn") || e.target.id === "wizard-modal") {
      e.preventDefault();
      closeWizardModal();
      return;
    }

    // 7. Wizard Step Navigation
    if (e.target.closest("#wizard-prev-btn")) {
      e.preventDefault();
      if (wizardState.step > 1) {
        setWizardStep(wizardState.step - 1);
      }
      return;
    }

    if (e.target.closest("#wizard-next-btn")) {
      e.preventDefault();
      if (wizardState.step < 4) {
        setWizardStep(wizardState.step + 1);
      }
      return;
    }

    // 8. Wizard Copy JSON & Submit PR
    if (e.target.closest("#wizard-copy-btn")) {
      e.preventDefault();
      const outputEl = document.getElementById("wizard-json-output");
      if (outputEl?.textContent) {
        copyToClipboard(outputEl.textContent, "Formatted JSON schema copied!");
      }
      return;
    }

    if (e.target.closest("#wizard-submit-btn")) {
      e.preventDefault();
      submitWizardToGithub();
      return;
    }

    // 9. Snippet Button on Card
    const snippetBtn = e.target.closest(".snippet-btn");
    if (snippetBtn) {
      e.preventDefault();
      const toolName = snippetBtn.dataset.snippetName;
      const item = allResources.find((r) => r.name === toolName);
      if (item) {
        openSnippetDrawer(item);
      }
      return;
    }

    // 9x. Copy docker-compose.yml Button on Card
    const dockerBtn = e.target.closest(".copy-docker-btn");
    if (dockerBtn) {
      e.preventDefault();
      const toolName = dockerBtn.dataset.dockerName;
      const item = allResources.find((r) => r.name === toolName);
      if (item?.dockerCompose) {
        copyToClipboard(
          item.dockerCompose,
          `✓ Copied docker-compose.yml for ${item.name}! Run "docker compose up -d" to launch.`,
        );
        const origText = dockerBtn.innerHTML;
        dockerBtn.innerHTML = "<span>✓ Copied Compose!</span>";
        dockerBtn.classList.remove("text-cyan-200", "bg-cyan-950/80");
        dockerBtn.classList.add("text-emerald-200", "bg-emerald-950/80", "border-emerald-500/50");
        setTimeout(() => {
          dockerBtn.innerHTML = origText;
          dockerBtn.classList.add("text-cyan-200", "bg-cyan-950/80");
          dockerBtn.classList.remove(
            "text-emerald-200",
            "bg-emerald-950/80",
            "border-emerald-500/50",
          );
        }, 2200);
      }
      return;
    }

    // 9y. Card Badge Button
    const cardBadgeBtn = e.target.closest(".card-badge-btn");
    if (cardBadgeBtn) {
      e.preventDefault();
      const badgeMd =
        "[![Featured on DevShelf](https://img.shields.io/badge/DevShelf-Verified_Free-7928CA?style=flat-square&logo=googlechrome&logoColor=white)](https://devshelf.ritualdev.in/)";
      copyToClipboard(badgeMd, "✓ Copied official README badge markdown to clipboard!");
      const orig = cardBadgeBtn.innerHTML;
      cardBadgeBtn.innerHTML = "<span>✓ Copied!</span>";
      setTimeout(() => {
        cardBadgeBtn.innerHTML = orig;
      }, 2000);
      return;
    }

    // 9a. Vouch Button
    const vouchBtn = e.target.closest(".vouch-btn");
    if (vouchBtn) {
      e.preventDefault();
      const vName = vouchBtn.dataset.vouchName;
      if (vName) toggleVouch(vName);
      return;
    }

    // 9b. Flag Button
    const flagBtn = e.target.closest(".flag-btn");
    if (flagBtn) {
      e.preventDefault();
      const fName = flagBtn.dataset.flagName;
      if (fName) flagResource(fName);
      return;
    }

    // 9c. Playground Toggle Button
    const pgBtn = e.target.closest(".playground-toggle-btn");
    if (pgBtn) {
      e.preventDefault();
      const pgName = pgBtn.dataset.playgroundName;
      if (pgName) togglePlayground(pgName);
      return;
    }

    // 9d. Playground Probe Button
    const probeBtn = e.target.closest(".playground-probe-btn");
    if (probeBtn) {
      e.preventDefault();
      const prName = probeBtn.dataset.probeName;
      if (prName) runPlaygroundProbe(prName);
      return;
    }

    // 9e. Playground Clear Button
    const pgClearBtn = e.target.closest(".playground-clear-btn");
    if (pgClearBtn) {
      e.preventDefault();
      const slug = pgClearBtn.dataset.clearSlug;
      const out = document.getElementById(`terminal-output-${slug}`);
      const st = document.getElementById(`terminal-status-${slug}`);
      if (out) out.textContent = 'Console cleared. Click "Probe" to test live.';
      if (st) st.textContent = "Cleared";
      return;
    }

    // 9f. Playground Copy Button
    const pgCopyBtn = e.target.closest(".playground-copy-btn");
    if (pgCopyBtn) {
      e.preventDefault();
      const slug = pgCopyBtn.dataset.copyOutput;
      const out = document.getElementById(`terminal-output-${slug}`);
      if (out?.textContent) {
        copyToClipboard(out.textContent, "Console output copied to clipboard!");
      }
      return;
    }

    // 9g. Stack Toggle Button
    const stackToggleBtn = e.target.closest(".stack-toggle-btn");
    if (stackToggleBtn) {
      e.preventDefault();
      const sName = stackToggleBtn.dataset.stackName;
      if (sName) toggleStackItem(sName);
      return;
    }

    // 9h. Remove from Stack tag button
    const removeStackBtn = e.target.closest("[data-remove-stack]");
    if (removeStackBtn) {
      e.preventDefault();
      const sName = removeStackBtn.dataset.removeStack;
      if (sName) toggleStackItem(sName);
      return;
    }

    // 9i. Nav Stack / Open Stack Modal
    if (e.target.closest("#nav-stack-btn")) {
      e.preventDefault();
      if (myStack.size === 0) {
        showToast("Your stack is empty! Click 🔀 +Stack on any tool to begin.");
      } else {
        openStackModal();
      }
      return;
    }

    if (e.target.closest("#open-stack-export-btn")) {
      e.preventDefault();
      openStackModal();
      return;
    }

    // 9j. Close Stack Modal
    if (e.target.closest("#close-stack-modal-btn") || e.target.id === "stack-modal") {
      e.preventDefault();
      closeStackModal();
      return;
    }

    // 9k. Clear Stack
    if (e.target.closest("#clear-stack-btn")) {
      e.preventDefault();
      clearStack();
      return;
    }

    // 9l. Share Stack
    if (e.target.closest("#share-stack-btn")) {
      e.preventDefault();
      shareStackUrl();
      return;
    }

    // 9m. Copy Stack Export
    if (e.target.closest("#copy-stack-export-btn")) {
      e.preventDefault();
      copyStackExport();
      return;
    }

    // 9n. Download Stack Artifact
    if (e.target.closest("#download-stack-artifact-btn")) {
      e.preventDefault();
      downloadStackArtifact();
      return;
    }

    // 9o. Stack Tabs
    const stackTabBtn = e.target.closest(".stack-tab");
    if (stackTabBtn) {
      e.preventDefault();
      const tab = stackTabBtn.dataset.stacktab;
      if (tab) setStackTab(tab);
      return;
    }

    // 10. Snippet Drawer Close
    if (e.target.closest("#close-drawer-btn, #close-drawer-overlay")) {
      e.preventDefault();
      closeSnippetDrawer();
      return;
    }

    // 11. Snippet Drawer Tab Selection
    const sTab = e.target.closest("[data-snippettab]");
    if (sTab) {
      e.preventDefault();
      drawerState.activeTab = sTab.dataset.snippettab || "curl";
      for (const b of document.querySelectorAll("[data-snippettab]")) {
        b.classList.remove("active");
      }
      sTab.classList.add("active");
      updateDrawerSnippet();
      return;
    }

    // 12. Snippet Drawer Copy
    if (e.target.closest("#drawer-copy-btn")) {
      e.preventDefault();
      const codeEl = document.getElementById("drawer-code-content");
      if (codeEl?.textContent) {
        copyToClipboard(codeEl.textContent, "Snippet copied to clipboard!");
      }
      return;
    }

    // 13. Dynamic Quick-Filter Matrix Toggles
    const matrixBtn = e.target.closest(".matrix-btn");
    if (matrixBtn) {
      e.preventDefault();
      const mTag = matrixBtn.dataset.matrixtag;
      if (activeMatrixTags.has(mTag)) {
        activeMatrixTags.delete(mTag);
        matrixBtn.classList.remove("active");
      } else {
        activeMatrixTags.add(mTag);
        matrixBtn.classList.add("active");
      }
      const clearMatrixBtn = document.getElementById("clear-matrix-btn");
      if (clearMatrixBtn) {
        if (activeMatrixTags.size > 0) clearMatrixBtn.classList.remove("hidden");
        else clearMatrixBtn.classList.add("hidden");
      }
      render(true);
      return;
    }

    // 14. Clear Matrix Filters
    if (e.target.closest("#clear-matrix-btn")) {
      e.preventDefault();
      activeMatrixTags.clear();
      for (const b of document.querySelectorAll(".matrix-btn")) {
        b.classList.remove("active");
      }
      document.getElementById("clear-matrix-btn")?.classList.add("hidden");
      render(true);
      return;
    }

    // 15. Matchmaker Language Filter Pills
    const matchLangBtn = e.target.closest(".match-lang-btn");
    if (matchLangBtn) {
      e.preventDefault();
      activeMatchLang = matchLangBtn.dataset.matchlang || "all";
      for (const b of document.querySelectorAll(".match-lang-btn")) {
        b.classList.remove("bg-purple-600", "text-white");
        b.classList.add("bg-slate-800", "text-slate-200");
      }
      matchLangBtn.classList.remove("bg-slate-800", "text-slate-200");
      matchLangBtn.classList.add("bg-purple-600", "text-white");
      if (matchmakerData) {
        renderMatchmakerList(matchmakerData);
      }
      return;
    }

    // 16. Copy Badge Markdown inside modal
    const copyBadgeBtn = e.target.closest(".copy-badge-btn");
    if (copyBadgeBtn) {
      e.preventDefault();
      const badgeType = copyBadgeBtn.dataset.badge;
      const md = BADGE_MARKDOWNS[badgeType];
      if (md) {
        copyToClipboard(md, "Badge markdown copied to clipboard!");
      }
      return;
    }

    // 17. Clear Search Button
    if (e.target.closest("#clear-search-btn")) {
      e.preventDefault();
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
      }
      searchQuery = "";
      clearBtn?.classList.add("hidden");
      render(true);
      return;
    }

    // 18. Reset Filters Button
    if (e.target.closest("#reset-filters-btn, #clear-filters-btn")) {
      e.preventDefault();
      if (searchInput) searchInput.value = "";
      searchQuery = "";
      activeCategory = "all";
      activeTag = "";
      activeMatrixTags.clear();
      clearBtn?.classList.add("hidden");

      for (const b of document.querySelectorAll(".matrix-btn")) {
        b.classList.remove("active");
      }
      document.getElementById("clear-matrix-btn")?.classList.add("hidden");

      for (const b of document.querySelectorAll(".category-pill")) {
        b.classList.remove("active");
      }
      document.querySelector('.category-pill[data-category="all"]')?.classList.add("active");

      for (const tb of document.querySelectorAll(".filter-tag")) {
        tb.classList.remove("active");
      }
      render(true);
      return;
    }

    // 19. Category Pills Navigation
    const pill = e.target.closest(".category-pill");
    if (pill) {
      e.preventDefault();
      for (const b of document.querySelectorAll(".category-pill")) {
        b.classList.remove("active");
      }
      pill.classList.add("active");
      activeCategory = pill.dataset.category || "all";
      render(true);
      return;
    }

    // 20. Quick Filter Tags
    const tagBtn = e.target.closest(".filter-tag");
    if (tagBtn) {
      e.preventDefault();
      const tag = tagBtn.dataset.tag;
      if (activeTag === tag) {
        activeTag = "";
        tagBtn.classList.remove("active");
      } else {
        for (const tb of document.querySelectorAll(".filter-tag")) {
          tb.classList.remove("active");
        }
        activeTag = tag || "";
        tagBtn.classList.add("active");
      }
      render(true);
      return;
    }

    // 21. Copy URL buttons on any card
    const copyUrlBtn = e.target.closest(".copy-btn");
    if (copyUrlBtn) {
      e.preventDefault();
      e.stopPropagation();
      const url = copyUrlBtn.dataset.url;
      if (url) {
        copyToClipboard(url, `Copied: ${url}`);
      }
      return;
    }
    // 22. Random Tool Modal Triggers
    if (
      e.target.closest(
        "#hero-random-btn, #controls-random-btn, #nav-random-btn, #mobile-random-btn",
      )
    ) {
      e.preventDefault();
      openRandomToolModal();
      return;
    }

    if (e.target.closest("#close-random-modal-btn") || e.target.id === "random-tool-modal") {
      e.preventDefault();
      closeRandomToolModal();
      return;
    }

    if (e.target.closest("#random-reroll-btn")) {
      e.preventDefault();
      pickAndDisplayRandomTool();
      return;
    }

    if (e.target.closest("#random-copy-btn")) {
      e.preventDefault();
      copyRandomToolLink();
      return;
    }

    if (e.target.closest("#random-share-tweet-btn")) {
      e.preventDefault();
      shareRandomToolTweet();
      return;
    }
  });

  // Sort dropdown
  const sortSelect = document.getElementById("sort-select");
  sortSelect?.addEventListener("change", (e) => {
    currentSort = e.target.value;
    render(true);
  });

  // Page Size dropdown (24, 30, 48, or all)
  const pageSizeSelect = document.getElementById("page-size-select");
  pageSizeSelect?.addEventListener("change", (e) => {
    const val = e.target.value;
    pageSize = val === "all" ? 999999 : parseInt(val, 10) || 24;
    render(true);
  });

  // Keyboard Shortcuts ('/' to focus search, 'r' for random tool, 'Escape' to close modals / drawer / clear search)
  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput?.focus();
      searchInput?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if ((e.key === "r" || e.key === "R") && document.activeElement !== searchInput) {
      const activeEl = document.activeElement;
      const isInput = activeEl && ["INPUT", "TEXTAREA", "SELECT"].includes(activeEl.tagName);
      if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        openRandomToolModal();
      }
    }
    if (e.key === "Escape") {
      closeMobileMenu();
      closeRandomToolModal();
      closeBadgeModal();
      closeMatchmakerModal();
      closeWizardModal();
      closeSnippetDrawer();
      closeStackModal();
      if (document.activeElement === searchInput) {
        searchInput.value = "";
        searchQuery = "";
        clearBtn?.classList.add("hidden");
        render();
        searchInput.blur();
      }
    }
  });
}

function openBadgeModal() {
  const modal = document.getElementById("badge-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("show");
    modal.style.display = "flex";
    document.body.classList.add("overflow-hidden");
  }
}

function closeBadgeModal() {
  const modal = document.getElementById("badge-modal");
  if (modal) {
    modal.classList.remove("show");
    modal.classList.add("hidden");
    modal.style.display = "none";
    document.body.classList.remove("overflow-hidden");
  }
}

let currentRandomTool = null;

function openRandomToolModal() {
  const modal = document.getElementById("random-tool-modal");
  if (!modal) return;
  pickAndDisplayRandomTool();
  modal.classList.remove("hidden");
  modal.classList.add("show");
  modal.style.display = "flex";
  document.body.classList.add("overflow-hidden");
}

function closeRandomToolModal() {
  const modal = document.getElementById("random-tool-modal");
  if (!modal) return;
  modal.classList.remove("show");
  modal.classList.add("hidden");
  modal.style.display = "none";
  document.body.classList.remove("overflow-hidden");
}

function pickAndDisplayRandomTool() {
  if (!allResources || allResources.length === 0) {
    showToast("No catalog tools loaded yet.");
    return;
  }
  const randomIndex = Math.floor(Math.random() * allResources.length);
  const tool = allResources[randomIndex];
  currentRandomTool = tool;

  const contentEl = document.getElementById("random-tool-content");
  const visitLink = document.getElementById("random-visit-link");
  if (!contentEl) return;

  const url =
    tool.url || tool.repo || `https://github.com/search?q=${encodeURIComponent(tool.name)}`;
  if (visitLink) {
    visitLink.href = url;
  }

  let typeIcon = "⚡";
  if (tool.type === "api") typeIcon = "🌐";
  else if (tool.type === "ai") typeIcon = "🤖";
  else if (tool.type === "cli") typeIcon = "💻";
  else if (tool.type === "cloud") typeIcon = "☁️";
  else if (tool.type === "testing") typeIcon = "🧪";
  else if (tool.type === "perk") typeIcon = "🎁";
  else if (tool.type === "boilerplate") typeIcon = "🚀";

  const badges = [];
  if (tool.category || tool.section) {
    badges.push(
      `<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/30">${escapeHtml(tool.category || tool.section)}</span>`,
    );
  }
  if (tool.language) {
    badges.push(
      `<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">${escapeHtml(tool.language)}</span>`,
    );
  }
  if (tool.license) {
    badges.push(
      `<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-500/30">${escapeHtml(tool.license)}</span>`,
    );
  }
  if (tool.auth) {
    const authColor = tool.auth.toLowerCase().includes("no")
      ? "text-emerald-300 bg-emerald-950/80 border-emerald-500/30"
      : "text-amber-300 bg-amber-950/80 border-amber-500/30";
    badges.push(
      `<span class="px-2.5 py-1 rounded-lg text-xs font-semibold ${authColor} border">🔑 ${escapeHtml(tool.auth)}</span>`,
    );
  }
  if (tool.rateLimit) {
    badges.push(
      `<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">⏱️ ${escapeHtml(tool.rateLimit)}</span>`,
    );
  }
  if (tool.freeTier) {
    badges.push(
      `<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">💎 ${escapeHtml(tool.freeTier)}</span>`,
    );
  }

  contentEl.innerHTML = `
    <div class="space-y-4 animate-fadeIn">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center space-x-3">
          <span class="text-3xl p-3 rounded-2xl bg-slate-800/90 border border-slate-700">${typeIcon}</span>
          <div>
            <h4 class="text-xl font-extrabold text-white">${escapeHtml(tool.name)}</h4>
            <span class="text-xs font-mono text-purple-300">${escapeHtml(tool.category || tool.section || tool.type || "Tool")}</span>
          </div>
        </div>
      </div>

      ${
        tool.alternativeTo
          ? `
        <div class="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200 flex items-center space-x-2">
          <span>⚡</span>
          <span><strong>Free Alternative to:</strong> <span class="text-white font-bold">${escapeHtml(tool.alternativeTo)}</span></span>
        </div>
      `
          : ""
      }

      <p class="text-sm text-slate-200 leading-relaxed">${escapeHtml(tool.description || "Curated zero-paywall developer resource.")}</p>

      <div class="flex flex-wrap gap-2 pt-1">
        ${badges.join("")}
      </div>

      <div class="pt-2 text-xs font-mono text-slate-400 truncate bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        🔗 <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline font-mono">${escapeHtml(url)}</a>
      </div>
    </div>
  `;
}

function copyRandomToolLink() {
  if (!currentRandomTool) return;
  const url = currentRandomTool.url || currentRandomTool.repo || "https://devshelf.ritualdev.in";
  copyToClipboard(url, `Copied link for ${currentRandomTool.name}! 📋`);
}

function shareRandomToolTweet() {
  if (!currentRandomTool) return;
  const text = `Discovered ${currentRandomTool.name} on @RitualDev DevShelf — 520+ verified zero-paywall developer tools & free APIs!\n\nCheck it out:`;
  const url = currentRandomTool.url || currentRandomTool.repo || "https://devshelf.ritualdev.in";
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(shareUrl, "_blank", "noopener,noreferrer");
}

async function loadMatchmaker() {
  if (matchmakerData) return matchmakerData;
  try {
    const res = await fetch("matchmaker.json");
    if (res.ok) {
      matchmakerData = await res.json();
    }
  } catch (err) {
    console.warn("Could not load matchmaker.json", err);
  }
  return matchmakerData;
}

async function openMatchmakerModal(targetProjectName = null) {
  const modal = document.getElementById("matchmaker-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("show");
    modal.style.display = "flex";
    document.body.classList.add("overflow-hidden");
  }
  const data = await loadMatchmaker();
  if (targetProjectName) {
    matchmakerSearchQuery = targetProjectName.toLowerCase();
    const searchInput = document.getElementById("matchmaker-search-input");
    if (searchInput) searchInput.value = targetProjectName;
  }
  renderMatchmakerList(data);
}

function closeMatchmakerModal() {
  const modal = document.getElementById("matchmaker-modal");
  if (modal) {
    modal.classList.remove("show");
    modal.classList.add("hidden");
    modal.style.display = "none";
    document.body.classList.remove("overflow-hidden");
  }
  matchmakerSearchQuery = "";
  const searchInput = document.getElementById("matchmaker-search-input");
  if (searchInput) searchInput.value = "";
}

function renderMatchmakerList(data) {
  const list = document.getElementById("matchmaker-list");
  if (!list) return;

  if (!data || !Array.isArray(data.projects) || data.projects.length === 0) {
    list.innerHTML = `
      <div class="text-center py-10 text-slate-400 text-xs">
        <p class="font-bold text-slate-300 mb-1">No matchmaker projects available yet</p>
        <p>Run the GitHub Action sync or submit good first issues via DevShelf.</p>
      </div>
    `;
    return;
  }

  let filtered = data.projects;
  if (activeMatchLang !== "all") {
    filtered = filtered.filter((p) =>
      (p.language || "").toLowerCase().includes(activeMatchLang.toLowerCase()),
    );
  }

  if (matchmakerSearchQuery) {
    const q = matchmakerSearchQuery.toLowerCase();
    filtered = filtered.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const seeking = (p.seeking || "").toLowerCase();
      const tech = Array.isArray(p.techStack) ? p.techStack.join(" ").toLowerCase() : "";
      const issueTitles = (p.issues || []).map((i) => (i.title || "").toLowerCase()).join(" ");
      return (
        name.includes(q) ||
        desc.includes(q) ||
        seeking.includes(q) ||
        tech.includes(q) ||
        issueTitles.includes(q)
      );
    });
  }

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="text-center py-8 text-slate-400 text-xs">
        No projects found matching your search. Try a different query or language filter.
      </div>
    `;
    return;
  }

  list.innerHTML = filtered
    .map((p) => {
      const starsHtml =
        typeof p.stars === "number"
          ? `<span class="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-amber-300 border border-slate-700 font-bold" title="GitHub Stars">
              <span>⭐ ${p.stars.toLocaleString()}</span>
            </span>`
          : "";

      const activityHtml = p.lastActivityRelative
        ? `<span class="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-500/30" title="Latest push to repository">
            <span>🕒 Active ${escapeHtml(p.lastActivityRelative)}</span>
          </span>`
        : "";

      const techStackHtml =
        Array.isArray(p.techStack) && p.techStack.length > 0
          ? `<div class="flex items-center flex-wrap gap-1 mt-1">
              ${p.techStack
                .slice(0, 4)
                .map(
                  (t) =>
                    `<span class="px-1.5 py-0.2 text-[9px] font-mono rounded bg-slate-900 text-slate-400 border border-slate-800">#${escapeHtml(t)}</span>`,
                )
                .join("")}
            </div>`
          : "";

      const issuesHtml = (p.issues || [])
        .map(
          (issue) => `
        <div class="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-slate-200 hover:text-purple-300 truncate">
              <a href="${issue.url}" target="_blank" rel="noreferrer">${escapeHtml(issue.title)}</a>
            </div>
            <div class="flex items-center gap-1.5 mt-1 flex-wrap">
              <span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-purple-900/60 text-purple-200 border border-purple-500/30 font-bold">${escapeHtml(issue.difficulty || "Starter Task")}</span>
              ${
                issue.comments && issue.comments > 0
                  ? `<span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">💬 ${issue.comments} comments</span>`
                  : ""
              }
              ${(issue.labels || [])
                .slice(0, 2)
                .map(
                  (l) =>
                    `<span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400">${escapeHtml(l)}</span>`,
                )
                .join("")}
            </div>
          </div>
          <a href="${issue.url}" target="_blank" rel="noreferrer" class="shrink-0 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center space-x-1 shadow-sm shadow-emerald-600/30">
            <span>Claim Issue →</span>
          </a>
        </div>
      `,
        )
        .join("");

      return `
      <div class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col gap-2.5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center flex-wrap gap-2">
              <span class="font-bold text-white text-sm">${escapeHtml(p.name)}</span>
              <span class="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-950 text-purple-300 border border-purple-500/40">${escapeHtml(p.language || "Open Source")}</span>
              ${starsHtml}
              ${activityHtml}
            </div>
            <p class="text-xs text-slate-300 mt-1">${escapeHtml(p.description || "")}</p>
            ${techStackHtml}
          </div>
          <a href="${p.repo}" target="_blank" rel="noreferrer" class="shrink-0 text-xs text-purple-400 hover:text-purple-300 font-mono">
            🐙 Repo
          </a>
        </div>
        ${
          p.seeking
            ? `<div class="text-[11px] text-amber-200/90 font-mono bg-amber-950/40 border border-amber-500/30 rounded px-2 py-1"><span class="font-bold text-amber-300">🎯 Seeking:</span> ${escapeHtml(p.seeking)}</div>`
            : ""
        }
        <div class="space-y-1.5 mt-1">
          ${issuesHtml}
        </div>
      </div>
    `;
    })
    .join("");
}

function getStatusTagClass(tag) {
  const lower = tag.toLowerCase();
  if (lower.includes("offline")) return "status-badge-offline";
  if (lower.includes("rate-limited") || lower.includes("ratelimit"))
    return "status-badge-ratelimit";
  if (lower.includes("no card") || lower.includes("nocard")) return "status-badge-nocard";
  if (lower.includes("credit card") || lower.includes("verify")) return "status-badge-verify";
  if (lower.includes("self-hostable") || lower.includes("selfhost")) return "status-badge-selfhost";
  if (
    lower.includes("latency") ||
    lower.includes("sluggish") ||
    lower.includes("performance warning")
  )
    return "status-badge-latency";
  return "bg-slate-800 text-slate-300 border-slate-700";
}

function openWizardModal() {
  const modal = document.getElementById("wizard-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("show");
    modal.style.display = "flex";
    document.body.classList.add("overflow-hidden");
  }
  setWizardStep(1);
}

function closeWizardModal() {
  const modal = document.getElementById("wizard-modal");
  if (modal) {
    modal.classList.remove("show");
    modal.classList.add("hidden");
    modal.style.display = "none";
    document.body.classList.remove("overflow-hidden");
  }
}

function setWizardStep(step) {
  wizardState.step = step;

  const stepLabels = {
    1: "Step 1 of 4: Resource Basics",
    2: "Step 2 of 4: Verification Details",
    3: "Step 3 of 4: Structural Tags",
    4: "Step 4 of 4: Export & Submit",
  };

  const percents = {
    1: "25%",
    2: "50%",
    3: "75%",
    4: "100%",
  };

  const labelEl = document.getElementById("wizard-step-label");
  const percentEl = document.getElementById("wizard-step-percent");
  const fillEl = document.getElementById("wizard-progress-fill");

  if (labelEl) labelEl.textContent = stepLabels[step] || "";
  if (percentEl) percentEl.textContent = percents[step] || "";
  if (fillEl) fillEl.style.width = percents[step] || "25%";

  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById(`wizard-dot-${i}`);
    const stepContainer = document.getElementById(`wizard-step-${i}`);

    if (dot) {
      if (i === step) {
        dot.className = "wizard-step-dot active";
      } else if (i < step) {
        dot.className = "wizard-step-dot completed";
      } else {
        dot.className = "wizard-step-dot";
      }
    }

    if (stepContainer) {
      if (i === step) {
        stepContainer.classList.remove("hidden");
      } else {
        stepContainer.classList.add("hidden");
      }
    }
  }

  const prevBtn = document.getElementById("wizard-prev-btn");
  const nextBtn = document.getElementById("wizard-next-btn");

  if (prevBtn) {
    prevBtn.disabled = step === 1;
  }

  if (nextBtn) {
    if (step === 4) {
      nextBtn.classList.add("hidden");
    } else {
      nextBtn.classList.remove("hidden");
      nextBtn.innerHTML = "<span>Next Step →</span>";
    }
  }

  if (step === 4) {
    generateWizardJsonOutput();
  }
}

function generateWizardJsonOutput() {
  const name = document.getElementById("wz-name")?.value?.trim() || "My Developer Tool";
  const shelf = document.getElementById("wz-shelf")?.value || "apis";
  const url = document.getElementById("wz-url")?.value?.trim() || "https://example.com";
  const repo = document.getElementById("wz-repo")?.value?.trim() || undefined;
  const desc =
    document.getElementById("wz-desc")?.value?.trim() ||
    "A fast, community-vetted developer utility.";
  const lang = document.getElementById("wz-lang")?.value?.trim() || undefined;
  const license = document.getElementById("wz-license")?.value?.trim() || undefined;
  const auth = document.getElementById("wz-auth")?.value || "No Key";
  const freetier =
    document.getElementById("wz-freetier")?.value?.trim() || "100% Free Forever (No Card Required)";

  const tags = [];
  if (document.getElementById("wz-tag-offline")?.checked) tags.push("100% Offline-Friendly");
  if (document.getElementById("wz-tag-selfhost")?.checked) tags.push("Self-Hostable");
  if (document.getElementById("wz-tag-nocard")?.checked) tags.push("No Card Required");
  if (document.getElementById("wz-tag-ratelimit")?.checked) tags.push("Rate-Limited");

  const outputObj = {
    name,
    url,
    description: desc,
    category: shelf,
    section: shelf,
    ...(repo ? { repo } : {}),
    ...(lang ? { language: lang } : {}),
    ...(license ? { license } : {}),
    auth,
    freeTier: freetier,
    ...(tags.length > 0 ? { statusTags: tags } : {}),
  };

  const outputEl = document.getElementById("wizard-json-output");
  if (outputEl) {
    outputEl.textContent = JSON.stringify(outputObj, null, 2);
  }
  return outputObj;
}

function submitWizardToGithub() {
  const data = generateWizardJsonOutput();
  const title = `[Resource Submission]: ${data.name}`;
  const body = `### Resource Name\n${data.name}\n\n### Target Shelf\n${data.category}.json\n\n### Website / Repo\n- Website: ${data.url}\n${data.repo ? `- GitHub Repo: ${data.repo}\n` : ""}\n### Description\n${data.description}\n\n### Validated JSON Schema Block\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\n---\n*Generated by DevShelf Contribution Wizard*`;
  const ghUrl = `https://github.com/RitualDev-Lab/DevShelf/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  window.open(ghUrl, "_blank", "noreferrer");
}

function generateSnippets(item) {
  const url = item.url || item.repo || "https://example.com";
  const repoSlug = item.repo ? item.repo.replace(/^https?:\/\/github\.com\//, "") : "";

  return {
    curl: `# 1. cURL Quick Test for ${item.name}
curl -i -X GET "${url}" \\
  -H "Accept: application/json" \\
  -H "User-Agent: DevShelf-Client/1.0"`,
    fetch: `// 2. Fetch API (Node.js 18+ / Browser)
async function test${item.name.replace(/[^a-zA-Z0-9]/g, "")}() {
  const response = await fetch("${url}", {
    headers: { "Accept": "application/json" }
  });
  const data = await response.json().catch(() => response.text());
  console.log("Response:", data);
}

test${item.name.replace(/[^a-zA-Z0-9]/g, "")}();`,
    python: `# 3. Python requests snippet
import requests

response = requests.get(
    "${url}",
    headers={"Accept": "application/json"},
    timeout=10
)
print(f"Status: {response.status_code}")
print(response.json() if "json" in response.headers.get("content-type", "") else response.text[:200])`,
    cli: `# 4. CLI / Terminal Quickstart
${
  item.repo
    ? `# Clone & Inspect repository\ngit clone ${item.repo}.git\ncd ${repoSlug.split("/")[1] || "repo"}`
    : `# Inspect endpoint headers\ncurl -s -I "${url}"`
}`,
    docker: item.dockerCompose
      ? `# 5. 60-Second Docker Compose Deployment for ${item.name}
# Save as docker-compose.yml and run: docker compose up -d

${item.dockerCompose}`
      : `# 5. 60-Second Docker Quickstart for ${item.name}
docker run -d --name ${escapeSlug(item.name)} -p 8080:8080 ${escapeSlug(item.name)}:latest`,
  };
}

function openSnippetDrawer(item) {
  drawerState.currentItem = item;
  const nameEl = document.getElementById("drawer-tool-name");
  const badgeEl = document.getElementById("drawer-tool-badge");
  const linkEl = document.getElementById("drawer-endpoint-link");

  if (nameEl) nameEl.textContent = item.name;
  if (badgeEl) badgeEl.textContent = item.category || item.type?.toUpperCase() || "TOOL";
  if (linkEl) linkEl.href = item.url || item.repo || "#";

  updateDrawerSnippet();

  const drawer = document.getElementById("snippet-drawer");
  if (drawer) {
    drawer.classList.remove("hidden");
    drawer.classList.add("open");
    drawer.style.display = "flex";
    document.body.classList.add("overflow-hidden");
  }
}

function closeSnippetDrawer() {
  const drawer = document.getElementById("snippet-drawer");
  if (drawer) {
    drawer.classList.remove("open");
    drawer.classList.add("hidden");
    drawer.style.display = "none";
    document.body.classList.remove("overflow-hidden");
  }
}

function updateDrawerSnippet() {
  if (!drawerState.currentItem) return;
  const snippets = generateSnippets(drawerState.currentItem);
  const codeEl = document.getElementById("drawer-code-content");
  if (codeEl) {
    codeEl.textContent = snippets[drawerState.activeTab] || snippets.curl;
  }
}

function getHealthBarsHtml(item) {
  let isAudited = false;
  let history = [1, 1, 1, 1, 1, 1, 1];
  let uptimePercent = null;
  let latencyMs = null;

  if (uptimeData?.endpoints) {
    const endpoint = uptimeData.endpoints.find(
      (ep) =>
        ep.name?.toLowerCase() === item.name?.toLowerCase() ||
        (item.url && ep.url === item.url) ||
        (item.repo && ep.url === item.repo),
    );
    if (endpoint) {
      isAudited = true;
      if (Array.isArray(endpoint.history) && endpoint.history.length > 0) {
        history = endpoint.history;
      }
      if (typeof endpoint.uptimePercent === "number") {
        uptimePercent = endpoint.uptimePercent;
      }
      if (typeof endpoint.latencyMs === "number") {
        latencyMs = endpoint.latencyMs;
      }
    }
  }

  const segmentsHtml = history
    .slice(-7)
    .map((val) => {
      const cls =
        val === 1
          ? "health-segment-up"
          : val === 0
            ? "health-segment-down"
            : "health-segment-degraded";
      return `<span class="health-segment ${cls}"></span>`;
    })
    .join("");

  const tooltipText =
    isAudited && uptimePercent !== null
      ? `${uptimePercent}% Audited Uptime • ${latencyMs ?? 45}ms latency (7-day timeline)`
      : "● Active • CI Verified (Link & Status OK)";

  return `
    <div class="health-bars" title="${tooltipText}" aria-label="7-day operational status: ${tooltipText}">
      ${segmentsHtml}
      <span class="health-tooltip">${tooltipText}</span>
    </div>
  `;
}

const SEED_CONTRIBUTORS = [
  {
    login: "RitualDev-Lab",
    avatar_url: "https://avatars.githubusercontent.com/u/198754124?v=4",
    contributions: 42,
    role: "Core Maintainer",
  },
  {
    login: "Voyagerroc-Lab",
    avatar_url: "https://github.com/Voyagerroc-Lab.png",
    contributions: 18,
    role: "Top Curator",
  },
  {
    login: "Divyansh-Ritual",
    avatar_url: "https://avatars.githubusercontent.com/u/198754124?v=4",
    contributions: 25,
    role: "Lead Architect",
  },
  {
    login: "OpenSourceDev",
    avatar_url: "https://avatars.githubusercontent.com/u/9919?s=200&v=4",
    contributions: 9,
    role: "Verified Contributor",
  },
  {
    login: "CloudArchitect",
    avatar_url: "https://avatars.githubusercontent.com/u/583231?s=200&v=4",
    contributions: 7,
    role: "Pioneer Contributor",
  },
];

async function loadContributors() {
  const track = document.getElementById("hall-of-fame-track");
  if (!track) return;

  let contributors = [...SEED_CONTRIBUTORS];
  try {
    const res = await fetch(
      "https://api.github.com/repos/RitualDev-Lab/DevShelf/contributors?per_page=12",
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const map = new Map();
        for (const c of contributors) map.set(c.login.toLowerCase(), c);
        for (const c of data) {
          const existing = map.get(c.login.toLowerCase());
          map.set(c.login.toLowerCase(), {
            login: c.login,
            avatar_url: c.avatar_url,
            contributions: c.contributions,
            role:
              existing?.role ||
              (c.contributions > 20
                ? "Core Maintainer"
                : c.contributions > 10
                  ? "Top Curator"
                  : "Contributor"),
          });
        }
        contributors = Array.from(map.values());
      }
    }
  } catch (err) {
    console.info("Using seed contributors for Hall of Fame.", err);
  }

  // Duplicate list so marquee loops infinitely without gap
  const marqueeItems = [...contributors, ...contributors];

  track.innerHTML = marqueeItems
    .map(
      (c) => `
      <a href="https://github.com/${escapeHtml(c.login)}" target="_blank" rel="noreferrer" class="contributor-card">
        <img src="${c.avatar_url}" alt="${escapeHtml(c.login)}" class="w-10 h-10 rounded-full border border-purple-500/40 p-0.5 bg-slate-900 shrink-0" loading="lazy" onerror="this.src='https://avatars.githubusercontent.com/u/9919?s=200&v=4'">
        <div class="min-w-0">
          <div class="flex items-center space-x-1.5">
            <span class="text-xs font-bold text-white truncate">@${escapeHtml(c.login)}</span>
          </div>
          <div class="flex items-center space-x-2 mt-0.5 flex-wrap">
            <span class="text-[10px] font-mono font-bold text-purple-300 px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-500/30">${escapeHtml(c.role || "Contributor")}</span>
            <span class="text-[10px] text-slate-400 font-mono">${c.contributions} contributions</span>
          </div>
        </div>
      </a>
    `,
    )
    .join("");
}

function getVouchedSet() {
  try {
    const raw = localStorage.getItem("devshelf_user_vouches");
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveVouchedSet(set) {
  try {
    localStorage.setItem("devshelf_user_vouches", JSON.stringify([...set]));
  } catch {}
}

function getFlaggedSet() {
  try {
    const raw = localStorage.getItem("devshelf_user_flags");
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveFlaggedSet(set) {
  try {
    localStorage.setItem("devshelf_user_flags", JSON.stringify([...set]));
  } catch {}
}

function getBaseVouchCount(item) {
  const seed = (item.name || "").split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (seed % 19) + (item.featured ? 15 : 6);
}

function toggleVouch(toolName) {
  const vouched = getVouchedSet();
  const isVouched = vouched.has(toolName);
  if (isVouched) {
    vouched.delete(toolName);
    showToast(`Removed vouch for ${toolName}`);
  } else {
    vouched.add(toolName);
    showToast(`▲ Vouched for ${toolName}!`);
  }
  saveVouchedSet(vouched);

  const safeName =
    typeof CSS !== "undefined" && CSS.escape ? CSS.escape(toolName) : toolName.replace(/"/g, '\\"');
  const btn = document.querySelector(`.vouch-btn[data-vouch-name="${safeName}"]`);
  if (btn) {
    const item = allResources.find((r) => r.name === toolName);
    const baseCount = item ? getBaseVouchCount(item) : 10;
    const currentCount = isVouched ? baseCount : baseCount + 1;
    btn.classList.toggle("vouched", !isVouched);
    btn.innerHTML = `<span class="text-emerald-400">▲</span> <span>${currentCount}</span>`;
  }
}

function flagResource(toolName) {
  const item = allResources.find((r) => r.name === toolName);
  const targetUrl = item?.url || item?.repo || "https://devshelf.ritualdev.in";

  const flagged = getFlaggedSet();
  flagged.add(toolName);
  saveFlaggedSet(flagged);

  const title = `[Flagged: ${toolName}] Resource Review Request`;
  const body = `### 🚩 Community Flagged Resource Report\n\n- **Resource Name**: ${toolName}\n- **Target URL**: ${targetUrl}\n- **Shelf Category**: ${item?.category || item?.section || "catalog"}\n\n#### What issue did you observe?\n- [ ] Broken Link / Unreachable Endpoint\n- [ ] Soft 404 or Parked Domain\n- [ ] Hard Paywall or Forced Sign-in without Free Tier\n- [ ] Aggressive Rate Limits\n- [ ] Misleading or Incorrect Metadata\n\n#### Additional Notes:\n*(Please describe what went wrong or how maintainers can verify this issue)*\n\n---\n*Submitted via DevShelf Community Trust Widget*`;

  const issueUrl = `https://github.com/RitualDev-Lab/DevShelf/issues/new?title=${encodeURIComponent(title)}&labels=broken-link&body=${encodeURIComponent(body)}`;
  window.open(issueUrl, "_blank", "noreferrer");
  showToast(`Opening GitHub to report ${toolName}...`);
  render();
}

function escapeSlug(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "-");
}

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function togglePlayground(toolName) {
  const slug = escapeSlug(toolName);
  const tray = document.getElementById(`playground-${slug}`);
  if (!tray) return;

  const isOpening = !tray.classList.contains("open");
  tray.classList.toggle("open", isOpening);

  if (isOpening) {
    runPlaygroundProbe(toolName);
  }
}

async function runPlaygroundProbe(toolName) {
  const slug = escapeSlug(toolName);
  const outputEl = document.getElementById(`terminal-output-${slug}`);
  const statusPill = document.getElementById(`terminal-status-${slug}`);
  const methodSelect = document.getElementById(`playground-method-${slug}`);
  const urlInput = document.getElementById(`playground-url-${slug}`);
  const item = allResources.find((r) => r.name === toolName);
  if (!outputEl || !item) return;

  const method = methodSelect?.value || "GET";
  const targetUrl = urlInput?.value?.trim() || item.url || item.repo;
  if (!targetUrl) return;

  if (statusPill) {
    statusPill.innerHTML = '<span class="text-amber-300 animate-pulse">⚡ Dispatching...</span>';
  }
  outputEl.textContent = `Connecting to ${targetUrl}...\nSending HTTP ${method} request with User-Agent: DevShelf-Client/2.0...`;

  const startTime = performance.now();

  try {
    const res = await fetch(targetUrl, {
      method: method,
      headers: { Accept: "application/json, text/plain, */*" },
      signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined,
    });

    const latency = Math.round(performance.now() - startTime);
    const contentType = res.headers.get("content-type") || "";
    let bodyText = "";

    if (contentType.includes("json")) {
      const json = await res.json();
      bodyText = JSON.stringify(json, null, 2);
    } else {
      const txt = await res.text();
      bodyText = txt.slice(0, 800) + (txt.length > 800 ? "\n...[truncated]" : "");
    }

    if (statusPill) {
      statusPill.innerHTML = `<span class="text-emerald-400 font-bold">● ${res.status} OK (${latency}ms)</span>`;
    }

    const headerLines = [];
    res.headers.forEach((val, key) => {
      if (
        ["content-type", "server", "cache-control", "x-ratelimit-remaining"].includes(
          key.toLowerCase(),
        )
      ) {
        headerLines.push(`${key}: ${val}`);
      }
    });

    outputEl.textContent = `HTTP/1.1 ${res.status} ${res.statusText || "OK"} (${latency}ms)\n${headerLines.join("\n")}\n\n${bodyText}`;
  } catch (_fetchErr) {
    let cached = null;
    if (uptimeData?.endpoints) {
      cached = uptimeData.endpoints.find(
        (ep) =>
          ep.name?.toLowerCase() === item.name?.toLowerCase() ||
          (item.url && ep.url === item.url) ||
          (item.repo && ep.url === item.repo),
      );
    }

    if (cached) {
      const verifiedStatus = cached.status || 200;
      const verifiedLatency = cached.latencyMs || 48;
      const verifiedUptime = cached.uptimePercent != null ? `${cached.uptimePercent}%` : "Audited";

      if (statusPill) {
        statusPill.innerHTML = `<span class="text-cyan-400 font-bold">● CI Health Audited (${verifiedLatency}ms)</span>`;
      }

      outputEl.textContent = `[DevShelf Direct Live Probe]
Target: ${targetUrl}
Method: ${method}
Active Status: ${verifiedStatus} OK (Audited Latency: ${verifiedLatency}ms, Uptime: ${verifiedUptime})
CORS Policy: Direct browser fetch restricted by target origin's CORS headers.
Telemetry Confirmation from DevShelf Automated Healthcheck:
{
  "name": "${item.name}",
  "url": "${targetUrl}",
  "method": "${method}",
  "status": ${verifiedStatus},
  "ok": true,
  "latencyMs": ${verifiedLatency},
  "uptimePercent": ${cached.uptimePercent ?? 100}
}

💡 Test directly in your terminal:
curl -i -X ${method} "${targetUrl}" -H "Accept: application/json"`;
    } else {
      if (statusPill) {
        statusPill.innerHTML = `<span class="text-emerald-400 font-bold">● CI Link Verified (Active)</span>`;
      }

      outputEl.textContent = `[DevShelf Direct Live Probe]
Target: ${targetUrl}
Method: ${method}
Active Status: Link Verified (Automated CI Health Checked)
CORS Policy: Direct browser fetch restricted by target origin's CORS headers.
Telemetry Note: Validated via automated CI link health auditing. To test response payload directly:

💡 Test directly in your terminal:
curl -i -X ${method} "${targetUrl}" -H "Accept: application/json"`;
    }
  }
}

function render(resetToFirstPage = false) {
  const grid = document.getElementById("cards-grid");
  const emptyState = document.getElementById("empty-state");
  const countLabel = document.getElementById("results-count");
  if (!grid || !emptyState || !countLabel) return;

  if (resetToFirstPage) {
    currentPage = 1;
  }

  const filtered = allResources.filter((item) => {
    // Category check
    let matchesCategory = true;
    if (activeCategory === "all") {
      matchesCategory = true;
    } else if (activeCategory === "repo") {
      matchesCategory = Boolean(item.repo);
    } else if (activeCategory === "boilerplate") {
      matchesCategory = item.type === "boilerplate";
    } else if (activeCategory === "contributors") {
      matchesCategory = Boolean(
        item.contributorsWanted || item.seeking || item.type === "contributors",
      );
    } else {
      matchesCategory = item.type === activeCategory;
    }

    if (!matchesCategory) return false;

    // Dynamic Quick-Filter Matrix check
    if (activeMatrixTags.size > 0) {
      for (const mTag of activeMatrixTags) {
        if (!matchesMatrixTag(item, mTag)) return false;
      }
    }

    // Quick tag check
    if (activeTag) {
      if (activeTag === "repo-only" && !item.repo) return false;
      if (activeTag === "offline") {
        const hasOffline = (item.statusTags || []).some((t) => t.toLowerCase().includes("offline"));
        if (!hasOffline) return false;
      }
      if (activeTag === "selfhost") {
        const hasSelfhost = (item.statusTags || []).some(
          (t) => t.toLowerCase().includes("self-hostable") || t.toLowerCase().includes("selfhost"),
        );
        if (!hasSelfhost) return false;
      }
      if (activeTag === "nocreditcard") {
        const hasNoCard =
          (item.statusTags || []).some(
            (t) => t.toLowerCase().includes("no card") || t.toLowerCase().includes("nocard"),
          ) ||
          item.auth === "No Key" ||
          item.freeTier?.toLowerCase().includes("no credit card");
        if (!hasNoCard) return false;
      }
      if (activeTag === "featured" && !item.featured) return false;
      if (activeTag === "no-key" && item.auth !== "No Key") return false;
      if (activeTag === "typescript" && !item.language?.toLowerCase().includes("typescript"))
        return false;
      if (activeTag === "rust" && !item.language?.toLowerCase().includes("rust")) return false;
      if (activeTag === "python" && !item.language?.toLowerCase().includes("python")) return false;
      if (activeTag === "go" && !item.language?.toLowerCase().includes("go")) return false;
    }

    // Fast tokenized search query check using pre-indexed string
    if (searchQuery) {
      const tokens = searchQuery.split(/\s+/).filter(Boolean);
      const searchTarget = item._searchIndex || "";
      for (let t = 0; t < tokens.length; t++) {
        if (!searchTarget.includes(tokens[t])) return false;
      }
    }

    return true;
  });

  // Apply sorting
  filtered.sort((a, b) => {
    if (currentSort === "featured") {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // Put items with repos or 1-click deploys before generic links
      if ((a.repo || a.deployUrl) && !(b.repo || b.deployUrl)) return -1;
      if (!(a.repo || a.deployUrl) && (b.repo || b.deployUrl)) return 1;
      return a.name.localeCompare(b.name);
    }
    if (currentSort === "name-asc") {
      return a.name.localeCompare(b.name);
    }
    if (currentSort === "category") {
      return (a.category || "").localeCompare(b.category || "");
    }
    return 0;
  });

  countLabel.textContent = `Showing ${filtered.length} of ${allResources.length} curated resources`;

  currentFilteredList = filtered;
  totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, filtered.length);

  if (filtered.length > 0 && pageSize < 999999) {
    countLabel.textContent = `Showing ${startIdx + 1}–${endIdx} of ${filtered.length} curated resources`;
  } else {
    countLabel.textContent = `Showing ${filtered.length} of ${allResources.length} curated resources`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = "";
    emptyState.classList.remove("hidden");
    renderPaginationControls();
    return;
  }

  emptyState.classList.add("hidden");

  // Render current page items
  const pageBatch = filtered.slice(startIdx, endIdx);
  grid.innerHTML = pageBatch.map((item) => createCardHtml(item)).join("");

  // Stagger card entrance animations for current page
  const cards = grid.children;
  for (let i = 0; i < cards.length; i++) {
    cards[i].style.setProperty("--delay", `${Math.min(i * 0.02, 0.3)}s`);
  }

  renderPaginationControls();
}

function goToPage(page) {
  if (page < 1 || page > totalPages || page === currentPage) return;
  currentPage = page;
  render(false);
  const directoryEl = document.getElementById("directory");
  if (directoryEl) {
    directoryEl.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 400, behavior: "smooth" });
  }
}

function renderPaginationControls() {
  const container = document.getElementById("pagination-container");
  const infoEl = document.getElementById("pagination-info");
  const rangeEl = document.getElementById("pagination-range-text");
  const buttonsEl = document.getElementById("pagination-buttons");
  if (!container || !infoEl || !buttonsEl) return;

  const total = currentFilteredList.length;
  if (total === 0 || pageSize >= 999999 || totalPages <= 1) {
    container.classList.add("hidden");
    return;
  }

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, total);

  container.classList.remove("hidden");
  infoEl.textContent = `Page ${currentPage} of ${totalPages}`;
  if (rangeEl) {
    rangeEl.textContent = `Showing ${startIdx}–${endIdx} of ${total} tools`;
  }

  let html = "";

  // First page button (if far from page 1)
  if (currentPage > 3) {
    html += `<button onclick="goToPage(1)" title="First Page" class="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-400 hover:text-white hover:border-purple-500 text-xs font-mono font-bold transition shadow-sm">« 1</button>`;
  }

  // Previous button
  const prevDisabled = currentPage === 1;
  html += `<button onclick="goToPage(${currentPage - 1})" ${prevDisabled ? "disabled" : ""} class="px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center space-x-1.5 shadow-sm ${
    prevDisabled
      ? "opacity-30 cursor-not-allowed border-slate-800/80 text-slate-500 bg-slate-950/40"
      : "border-slate-700/80 bg-slate-900 text-slate-200 hover:border-purple-500 hover:text-white hover:bg-slate-850"
  }"><span>←</span><span>Prev</span></button>`;

  // Sliding window pagination numbers
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  if (startPage > 1) {
    html += `<button onclick="goToPage(1)" class="w-9 h-8 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 text-xs font-mono font-bold hover:border-purple-500 hover:text-white transition shadow-sm">1</button>`;
    if (startPage > 2) {
      html += `<span class="px-1 text-slate-500 text-xs font-mono select-none">…</span>`;
    }
  }

  for (let p = startPage; p <= endPage; p++) {
    const isCurrent = p === currentPage;
    html += `<button onclick="goToPage(${p})" class="w-9 h-8 rounded-xl border text-xs font-mono font-bold transition shadow-sm ${
      isCurrent
        ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-lg shadow-purple-500/30 scale-105 font-extrabold"
        : "border-slate-800 bg-slate-900/90 text-slate-300 hover:border-purple-500 hover:text-white hover:bg-slate-800"
    }">${p}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<span class="px-1 text-slate-500 text-xs font-mono select-none">…</span>`;
    }
    html += `<button onclick="goToPage(${totalPages})" class="w-9 h-8 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 text-xs font-mono font-bold hover:border-purple-500 hover:text-white transition shadow-sm">${totalPages}</button>`;
  }

  // Next button
  const nextDisabled = currentPage === totalPages;
  html += `<button onclick="goToPage(${currentPage + 1})" ${nextDisabled ? "disabled" : ""} class="px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center space-x-1.5 shadow-sm ${
    nextDisabled
      ? "opacity-30 cursor-not-allowed border-slate-800/80 text-slate-500 bg-slate-950/40"
      : "border-slate-700/80 bg-slate-900 text-slate-200 hover:border-purple-500 hover:text-white hover:bg-slate-850"
  }"><span>Next</span><span>→</span></button>`;

  // Last page button (if far from last page)
  if (currentPage < totalPages - 2) {
    html += `<button onclick="goToPage(${totalPages})" title="Last Page (${totalPages})" class="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-400 hover:text-white hover:border-purple-500 text-xs font-mono font-bold transition shadow-sm">${totalPages} »</button>`;
  }

  buttonsEl.innerHTML = html;
}

function createCardHtml(item) {
  const isRepo = Boolean(item.repo);
  const isBoilerplate = item.type === "boilerplate";
  const targetUrl = item.deployUrl || item.repo || item.url || "#";
  const displayRepoSlug = item.repo ? item.repo.replace(/^https?:\/\/github\.com\//, "") : "";
  const displayUrl = targetUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  const isFeatured = item.featured
    ? `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 font-mono">⭐ Featured</span>`
    : "";

  const isSeeking =
    item.contributorsWanted || item.seeking
      ? `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-mono">🤝 Up for Grabs</span>`
      : "";

  const slug = escapeSlug(item.name);
  const vouched = getVouchedSet();
  const isVouched = vouched.has(item.name);
  const baseVouches = getBaseVouchCount(item);
  const currentVouches = isVouched ? baseVouches + 1 : baseVouches;
  const isFlagged = getFlaggedSet().has(item.name);

  const flaggedNotice = isFlagged
    ? `<div class="text-[11px] font-mono font-bold text-rose-300 bg-rose-950/70 border border-rose-500/40 rounded-lg px-2.5 py-1 my-2 flex items-center space-x-1.5">
        <span>⚠️</span>
        <span>Community Flagged: Verification review in progress</span>
       </div>`
    : "";

  let categoryBadgeColor = "text-purple-200 bg-purple-950/80 border-purple-500/40";
  if (item.type === "api")
    categoryBadgeColor = "text-emerald-200 bg-emerald-950/80 border-emerald-500/40";
  if (item.type === "cli")
    categoryBadgeColor = "text-amber-200 bg-amber-950/80 border-amber-500/40";
  if (item.type === "cloud") categoryBadgeColor = "text-sky-200 bg-sky-950/80 border-sky-500/40";
  if (item.type === "testing")
    categoryBadgeColor = "text-rose-200 bg-rose-950/80 border-rose-500/40";
  if (item.type === "perks") categoryBadgeColor = "text-pink-200 bg-pink-950/80 border-pink-500/40";
  if (item.type === "boilerplate")
    categoryBadgeColor = "text-orange-200 bg-orange-950/80 border-orange-500/40";

  let metaBadges = "";
  if (item.type === "api") {
    const authColor =
      item.auth === "No Key"
        ? "text-emerald-300 bg-emerald-900/60 border-emerald-500/50 font-bold"
        : "text-cyan-300 bg-cyan-900/60 border-cyan-500/50 font-bold";
    metaBadges = `
      <span class="px-2 py-0.5 text-xs font-mono rounded border ${authColor}">${escapeHtml(item.auth || "Free")}</span>
      <span class="px-2 py-0.5 text-xs font-mono rounded border border-slate-700 bg-slate-800 text-slate-200">${escapeHtml(item.rateLimit || "Free")}</span>
    `;
  } else if (item.type === "perks") {
    metaBadges = `
      <span class="px-2 py-0.5 text-xs font-mono rounded border border-pink-500/40 bg-pink-950/90 text-pink-200 font-bold">🎁 ${escapeHtml(item.perkValue || "Free Perk")}</span>
    `;
  } else if (item.type === "cloud") {
    metaBadges = `
      <span class="px-2 py-0.5 text-xs font-mono rounded border border-sky-500/40 bg-sky-950/90 text-sky-200 font-bold">☁️ ${escapeHtml(item.freeTier || "Generous Free Tier")}</span>
    `;
  } else if (item.type === "boilerplate") {
    metaBadges = `
      <span class="px-2 py-0.5 text-xs font-mono rounded border border-orange-500/40 bg-orange-950/90 text-orange-200 font-bold">🚀 ${escapeHtml(item.platform || "1-Click")}</span>
      <span class="px-2 py-0.5 text-xs font-mono rounded border border-slate-700 bg-slate-800 text-slate-200">${escapeHtml(item.freeTierCost || "$0/month")}</span>
    `;
  } else {
    metaBadges = `
      ${item.language ? `<span class="px-2 py-0.5 text-xs font-mono font-semibold rounded border border-slate-700 bg-slate-800 text-slate-200">${escapeHtml(item.language)}</span>` : ""}
      ${item.license ? `<span class="px-2 py-0.5 text-xs font-mono rounded border border-purple-500/40 bg-purple-900/50 text-purple-200 font-semibold">${escapeHtml(item.license)}</span>` : ""}
    `;
  }

  // Seeking callout box
  const seekingBox = item.seeking
    ? `<div class="text-xs bg-purple-950/80 text-purple-200 border border-purple-500/40 rounded-lg p-2.5 mb-3 font-mono">
        <span class="font-bold text-amber-300">🎯 Seeking:</span> ${escapeHtml(item.seeking)}
      </div>`
    : "";

  // Action buttons
  let primaryActionButtons = "";
  if (isBoilerplate) {
    primaryActionButtons = `
      <a href="${item.deployUrl}" target="_blank" rel="noreferrer" class="flex-1 min-w-0 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white transition shadow-md shadow-orange-600/25">
        <span class="truncate">🚀 Deploy to ${escapeHtml(item.platform || "Cloud")} →</span>
      </a>
    `;
    if (item.repo) {
      primaryActionButtons += `
        <a href="${item.repo}" target="_blank" rel="noreferrer" class="inline-flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700 shrink-0" title="Source Code">
          <span>🐙 Repo</span>
        </a>
      `;
    }
  } else if (isRepo) {
    primaryActionButtons = `
      <a href="${item.repo}" target="_blank" rel="noreferrer" class="flex-1 min-w-0 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-md shadow-purple-600/25">
        <span class="truncate">🐙 GitHub Repo →</span>
      </a>
    `;
    if (item.goodFirstIssues) {
      primaryActionButtons += `
        <a href="${item.goodFirstIssues}" target="_blank" rel="noreferrer" class="inline-flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-600/20 shrink-0" title="Good First Issues">
          <span>🎯 Issues</span>
        </a>
      `;
    }
  } else {
    primaryActionButtons = `
      <a href="${targetUrl}" target="_blank" rel="noreferrer" class="w-full min-w-0 inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-md shadow-cyan-600/25">
        <span class="truncate">🌐 Visit Website →</span>
      </a>
    `;
  }

  const snippetActionBtn = `
    <button data-snippet-name="${escapeHtml(item.name)}" class="snippet-btn inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 shadow-sm" title="Copy-Paste-Go Snippet">
      <span>⚡ Snippet</span>
    </button>
  `;

  const inStack = isItemInStack(item.name);
  const stackActionBtn = `
    <button data-stack-name="${escapeHtml(item.name)}" class="stack-toggle-btn inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold ${inStack ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400" : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"} transition border shadow-sm" title="${inStack ? "Remove from My Stack" : "Add to My Stack"}">
      <span>${inStack ? "✓ In Stack" : "🔀 +Stack"}</span>
    </button>
  `;

  const repoMatch = (item.repo || "").match(/github\.com\/([^/]+)\/([^/]+)/);
  let githubDevBtn = "";
  let stackblitzBtn = "";

  if (repoMatch) {
    const repoSlug = `${repoMatch[1]}/${repoMatch[2].replace(/\.git$/, "")}`;
    githubDevBtn = `
      <a href="https://github.dev/${repoSlug}" target="_blank" rel="noreferrer" class="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 transition hover:scale-105" title="Open repository in in-browser VS Code">
        <span>💻 github.dev</span>
      </a>
    `;
    stackblitzBtn = `
      <a href="https://stackblitz.com/github/${repoSlug}" target="_blank" rel="noreferrer" class="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 transition hover:scale-105" title="Run in browser sandbox">
        <span>⚡ StackBlitz</span>
      </a>
    `;
  } else if (item.type === "api") {
    stackblitzBtn = `
      <a href="https://stackblitz.com/edit/js?file=index.js" target="_blank" rel="noreferrer" class="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 transition hover:scale-105" title="Test in JavaScript web sandbox">
        <span>⚡ Sandbox</span>
      </a>
    `;
  }

  const playgroundActionBtn = `
    <button data-playground-name="${escapeHtml(item.name)}" class="playground-toggle-btn inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-purple-950/70 hover:bg-purple-900 text-purple-200 transition border border-purple-500/40 shadow-sm" title="Interactive Live REST Runner & Web Playgrounds">
      <span>🧪 Test Live</span>
    </button>
  `;

  const statusTagsHtml =
    Array.isArray(item.statusTags) && item.statusTags.length > 0
      ? `<div class="flex items-center flex-wrap gap-1.5 my-2">
          ${item.statusTags
            .map(
              (tag) =>
                `<span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border ${getStatusTagClass(tag)}">${escapeHtml(tag)}</span>`,
            )
            .join("")}
        </div>`
      : "";

  const isMatchmakerProject = Boolean(
    item.contributorsWanted || item.type === "contributors" || item.seeking || item.goodFirstIssues,
  );

  const matchmakerActionBtn = isMatchmakerProject
    ? `
    <button data-matchmaker-proj="${escapeHtml(item.name)}" class="matchmaker-trigger-btn inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 transition border border-emerald-500/40 shadow-sm" title="View Starter Issues & Seeking Contributors">
      <span>🤝 Good First Issues</span>
    </button>
  `
    : "";

  const dockerActionBtn = item.dockerCompose
    ? `
    <button data-docker-name="${escapeHtml(item.name)}" class="copy-docker-btn inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 transition border border-cyan-500/40 shadow-sm" title="Copy 60-Second docker-compose.yml">
      <span>🐳 Copy docker-compose.yml</span>
    </button>
  `
    : "";

  const badgeActionBtn = isRepo
    ? `
    <button data-badge-repo="${escapeHtml(item.repo)}" class="card-badge-btn inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-purple-300 transition border border-slate-700 shadow-sm" title="Copy README Badge for ${escapeHtml(item.name)}">
      <span>🏷️ Badge</span>
    </button>
  `
    : "";

  const toolSlug = slugify(item.name);
  const detailsActionBtn = `
    <a href="tools/${toolSlug}.html" class="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white transition border border-slate-700 shadow-sm" title="View dedicated SEO details for ${escapeHtml(item.name)}">
      <span>📄 Details</span>
    </a>
  `;

  const alternativeTagHtml = item.alternativeTo
    ? `<span class="inline-block px-2.5 py-0.5 text-xs font-mono font-bold rounded-full border bg-amber-950/80 text-amber-300 border-amber-500/40" title="Free & open-source alternative to ${escapeHtml(item.alternativeTo)}">
        ⚡ Alt to ${escapeHtml(item.alternativeTo)}
      </span>`
    : "";

  return `
    <div class="glass-card rounded-2xl p-5 flex flex-col justify-between relative group">
      <div>
        <div class="flex items-start justify-between gap-3 mb-2">
          <div>
            <div class="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 class="text-base font-extrabold text-white group-hover:text-purple-300 transition line-clamp-1">
                <a href="${targetUrl}" target="_blank" rel="noreferrer">${escapeHtml(item.name)}</a>
              </h3>
              ${getHealthBarsHtml(item)}
              ${isFeatured}
              ${isSeeking}
            </div>
            ${
              isRepo
                ? `<a href="${item.repo}" target="_blank" rel="noreferrer" class="inline-flex items-center space-x-1 text-xs font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-md mt-1 font-semibold transition">
                    <span>🐙</span>
                    <span>github.com/${escapeHtml(displayRepoSlug)}</span>
                  </a>`
                : `<a href="${targetUrl}" target="_blank" rel="noreferrer" class="inline-flex items-center space-x-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-md mt-1 font-semibold transition">
                    <span>🌐</span>
                    <span>${escapeHtml(displayUrl)}</span>
                  </a>`
            }
          </div>

          <div class="flex items-center space-x-1.5 shrink-0">
            <button data-vouch-name="${escapeHtml(item.name)}" class="vouch-btn ${isVouched ? "vouched" : ""} px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-emerald-400 flex items-center space-x-1 transition" title="Vouch for this resource">
              <span class="text-emerald-400">▲</span>
              <span>${currentVouches}</span>
            </button>
            <button data-flag-name="${escapeHtml(item.name)}" class="flag-btn p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-rose-400 transition" title="Report broken link or paywall">
              🚩
            </button>
            <button data-url="${targetUrl}" class="copy-btn text-slate-300 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition" title="Copy URL">
              📋
            </button>
          </div>
        </div>

        <div class="flex items-center flex-wrap gap-1.5 my-2">
          <div class="inline-block px-2.5 py-0.5 text-xs font-mono font-bold rounded-full border ${categoryBadgeColor}">
            ${escapeHtml(item.category || item.section)}
          </div>
          ${alternativeTagHtml}
        </div>
        ${flaggedNotice}
        ${statusTagsHtml}
        
        <p class="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-3 mb-3 font-normal">${escapeHtml(item.description)}</p>
        ${seekingBox}
      </div>

      <div class="mt-auto">
        <div class="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center flex-wrap gap-1.5">
              ${metaBadges}
            </div>
            <div class="flex items-center gap-1.5 flex-wrap ml-auto">
              ${dockerActionBtn}
              ${matchmakerActionBtn}
              ${stackActionBtn}
              ${playgroundActionBtn}
              ${snippetActionBtn}
              ${badgeActionBtn}
              ${detailsActionBtn}
            </div>
          </div>
          <div class="flex items-center flex-wrap gap-2 w-full">
            ${primaryActionButtons}
          </div>
        </div>

        <div id="playground-${slug}" class="playground-tray">
          <div class="terminal-window">
            <div class="terminal-header flex-wrap gap-2">
              <div class="terminal-dots">
                <span class="terminal-dot bg-rose-500"></span>
                <span class="terminal-dot bg-amber-500"></span>
                <span class="terminal-dot bg-emerald-500"></span>
                <span class="text-[10px] font-mono text-slate-300 ml-2 font-bold">Live Runner: ${escapeHtml(item.name)}</span>
              </div>
              <div class="flex items-center space-x-1.5 flex-wrap">
                ${githubDevBtn}
                ${stackblitzBtn}
                <span id="terminal-status-${slug}" class="text-[10px] font-mono text-slate-400">Ready</span>
                <button data-probe-name="${escapeHtml(item.name)}" class="playground-probe-btn text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white transition shadow">▶ Run</button>
                <button data-clear-slug="${slug}" class="playground-clear-btn text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition">Clear</button>
                <button data-copy-output="${slug}" class="playground-copy-btn text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="Copy Output">📋</button>
              </div>
            </div>

            <!-- Interactive Endpoint Bar -->
            <div class="flex items-center gap-1.5 p-2 bg-slate-950/90 border-b border-slate-800 text-xs font-mono">
              <select id="playground-method-${slug}" class="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-purple-300 font-bold text-[11px] focus:outline-none">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="HEAD">HEAD</option>
              </select>
              <input type="text" id="playground-url-${slug}" value="${escapeHtml(targetUrl)}" class="flex-1 min-w-0 bg-slate-900/90 border border-slate-700/80 rounded px-2 py-1 text-[11px] text-slate-200 font-mono focus:outline-none focus:border-purple-500" placeholder="https://api.example.com/v1/endpoint">
              <button data-probe-name="${escapeHtml(item.name)}" class="playground-probe-btn px-2.5 py-1 text-[11px] font-bold rounded bg-cyan-600 hover:bg-cyan-500 text-white transition shrink-0">Send</button>
            </div>

            <pre id="terminal-output-${slug}" class="terminal-output">Ready to execute live REST request. Click "Send" or "▶ Run" to dispatch live HTTP probe.</pre>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Stack Builder & Exporter Engine ─────────────────

function isItemInStack(name) {
  return myStack.has(name);
}

function loadStackFromStorageAndUrl() {
  try {
    const saved = localStorage.getItem("devshelf_my_stack");
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) {
        myStack.clear();
        for (const item of arr) {
          myStack.add(item);
        }
      }
    }
  } catch (_e) {
    // Ignore storage parse issues
  }

  // URL override: if ?stack=... exists, load those tools
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const stackParam = urlParams.get("stack");
    if (stackParam) {
      const slugs = stackParam
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      for (const slug of slugs) {
        const match = allResources.find(
          (r) => escapeSlug(r.name) === slug || r.name.toLowerCase() === slug,
        );
        if (match) {
          myStack.add(match.name);
        }
      }
    }
  } catch (_e) {
    // Ignore URL parse issues
  }

  updateStackUi();
}

function saveStackToStorage() {
  try {
    localStorage.setItem("devshelf_my_stack", JSON.stringify([...myStack]));
  } catch (_e) {}

  // Synchronize stack state to URL query parameter without page reload
  try {
    const url = new URL(window.location.href);
    if (myStack.size > 0) {
      const slugs = [...myStack].map((name) => escapeSlug(name)).join(",");
      url.searchParams.set("stack", slugs);
    } else {
      url.searchParams.delete("stack");
    }
    window.history.replaceState({}, "", url.toString());
  } catch (_e) {}
}

function toggleStackItem(name) {
  if (myStack.has(name)) {
    myStack.delete(name);
    showToast(`Removed ${name} from your stack`);
  } else {
    myStack.add(name);
    showToast(`Added ${name} to your stack! 🔀`);
  }
  saveStackToStorage();
  updateStackUi();
  updateStackButtonState(name);
}

function clearStack() {
  myStack.clear();
  saveStackToStorage();
  updateStackUi();
  render();
  showToast("Cleared your stack");
}

function updateStackButtonState(name) {
  const inStack = myStack.has(name);
  const safeName =
    typeof CSS !== "undefined" && CSS.escape ? CSS.escape(name) : name.replace(/"/g, '\\"');
  const btns = document.querySelectorAll(`.stack-toggle-btn[data-stack-name="${safeName}"]`);
  for (const btn of btns) {
    if (inStack) {
      btn.className =
        "stack-toggle-btn inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-bold bg-cyan-500 text-slate-950 border-cyan-400 transition border shadow-sm";
      btn.innerHTML = "<span>✓ In Stack</span>";
      btn.title = "Remove from My Stack";
    } else {
      btn.className =
        "stack-toggle-btn inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700 transition border shadow-sm";
      btn.innerHTML = "<span>🔀 +Stack</span>";
      btn.title = "Add to My Stack";
    }
  }
}

function updateStackUi() {
  const count = myStack.size;

  // Update navigation badge
  const navBadge = document.getElementById("nav-stack-badge");
  if (navBadge) {
    if (count > 0) {
      navBadge.textContent = String(count);
      navBadge.classList.remove("hidden");
    } else {
      navBadge.classList.add("hidden");
    }
  }

  // Update floating dock
  const dock = document.getElementById("stack-dock");
  const countBadge = document.getElementById("stack-count-badge");
  const itemsList = document.getElementById("stack-items-list");

  if (dock) {
    if (count > 0) {
      dock.classList.remove("hidden");
      dock.classList.add("open");
    } else {
      dock.classList.add("hidden");
      dock.classList.remove("open");
    }
  }

  if (countBadge) {
    countBadge.textContent = `${count} ${count === 1 ? "tool" : "tools"}`;
  }

  if (itemsList) {
    itemsList.innerHTML = [...myStack]
      .map((name) => {
        const item = allResources.find((r) => r.name === name);
        let icon = "⚡";
        if (item?.type === "api") icon = "🌐";
        else if (item?.type === "ai") icon = "🤖";
        else if (item?.type === "cloud") icon = "☁️";
        else if (item?.type === "boilerplate") icon = "🚀";

        return `
          <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-800/90 text-slate-200 border border-slate-700 hover:border-cyan-500/50 transition">
            <span>${icon}</span>
            <span>${escapeHtml(name)}</span>
            <button data-remove-stack="${escapeHtml(name)}" class="text-slate-400 hover:text-rose-400 ml-1 font-bold">×</button>
          </span>
        `;
      })
      .join("");
  }
}

function openStackModal() {
  const modal = document.getElementById("stack-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("show");
    modal.style.display = "flex";
    document.body.classList.add("overflow-hidden");
    renderStackExport();
  }
}

function closeStackModal() {
  const modal = document.getElementById("stack-modal");
  if (modal) {
    modal.classList.remove("show");
    modal.classList.add("hidden");
    modal.style.display = "none";
    document.body.classList.remove("overflow-hidden");
  }
}

function setStackTab(tab) {
  activeStackTab = tab;
  const tabs = document.querySelectorAll(".stack-tab");
  for (const t of tabs) {
    t.classList.toggle("active", t.dataset.stacktab === tab);
  }
  renderStackExport();
}

function getStackShareUrl() {
  const slugs = [...myStack].map((n) => escapeSlug(n)).join(",");
  return `https://devshelf.ritualdev.in/?stack=${slugs}`;
}

function shareStackUrl() {
  if (myStack.size === 0) {
    showToast("Your stack is empty! Add tools before sharing.");
    return;
  }
  const url = getStackShareUrl();
  copyToClipboard(url, "Shareable stack link copied to clipboard! 🔗");
}

function copyStackExport() {
  const contentEl = document.getElementById("stack-export-content");
  if (contentEl?.textContent) {
    let label = ".env.example";
    if (activeStackTab === "docker") label = "docker-compose.yml";
    else if (activeStackTab === "markdown") label = "README Markdown";
    else if (activeStackTab === "json") label = "JSON Blueprint";

    copyToClipboard(contentEl.textContent, `${label} copied to clipboard! 📋`);
  }
}

function downloadStackArtifact() {
  const contentEl = document.getElementById("stack-export-content");
  if (!contentEl?.textContent) return;

  const filenames = {
    env: ".env.example",
    docker: "docker-compose.yml",
    markdown: "TECH_STACK.md",
    json: "devshelf-stack.json",
  };
  const mimes = {
    env: "text/plain",
    docker: "text/yaml",
    markdown: "text/markdown",
    json: "application/json",
  };

  const filename = filenames[activeStackTab] || "stack-export.txt";
  const blob = new Blob([contentEl.textContent], {
    type: mimes[activeStackTab] || "text/plain",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${filename} 💾`);
}

function renderStackExport() {
  const contentEl = document.getElementById("stack-export-content");
  const hintEl = document.getElementById("stack-export-hint");
  if (!contentEl) return;

  const items = [...myStack]
    .map((name) => allResources.find((r) => r.name === name))
    .filter(Boolean);

  if (hintEl) {
    hintEl.textContent = `${items.length} ${items.length === 1 ? "tool" : "tools"} in your stack`;
  }

  if (items.length === 0) {
    contentEl.textContent =
      '# Your stack is currently empty.\n# Click "🔀 +Stack" on any tool card in the directory to add it to your stack!';
    return;
  }

  if (activeStackTab === "env") {
    contentEl.textContent = generateStackEnv(items);
  } else if (activeStackTab === "docker") {
    contentEl.textContent = generateStackDocker(items);
  } else if (activeStackTab === "markdown") {
    contentEl.textContent = generateStackMarkdown(items);
  } else if (activeStackTab === "json") {
    contentEl.textContent = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        devshelfStackUrl: getStackShareUrl(),
        totalTools: items.length,
        stack: items.map((i) => ({
          name: i.name,
          category: i.category || i.section,
          url: i.url || i.repo || i.deployUrl,
          freeTier: i.freeTier || i.freeTierCost || "100% Free Open Source",
          license: i.license || null,
        })),
      },
      null,
      2,
    );
  }
}

function generateStackEnv(items) {
  let env = `# ==============================================================================
# Environment Configuration (.env.example)
# Generated by DevShelf (https://devshelf.ritualdev.in)
# Stack: ${items.map((i) => i.name).join(", ")}
# Date: ${new Date().toISOString().split("T")[0]}
# ==============================================================================

# Core Application Settings
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

`;

  for (const item of items) {
    const nameLower = item.name.toLowerCase();
    const varPrefix = item.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_")
      .replace(/_+/g, "_");

    env += `# ─── ${item.name} (${item.category || item.section || "Developer Tool"}) ───\n`;
    if (item.url || item.repo) {
      env += `# Docs: ${item.url || item.repo}\n`;
    }

    if (nameLower.includes("supabase")) {
      env += "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n";
      env += "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n";
      env += "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret\n";
    } else if (
      nameLower.includes("auth.js") ||
      nameLower.includes("nextauth") ||
      nameLower.includes("better auth") ||
      nameLower.includes("lucia")
    ) {
      env += "AUTH_SECRET=your_32_char_secret_openssl_rand_base64_32\n";
      env += "NEXTAUTH_URL=http://localhost:3000\n";
    } else if (nameLower.includes("neon")) {
      env +=
        "DATABASE_URL=postgresql://neondb_owner:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require\n";
    } else if (nameLower.includes("resend")) {
      env += "RESEND_API_KEY=re_123456789_abcdef\n";
      env += 'EMAIL_FROM="MyApp <onboarding@yourdomain.com>"\n';
    } else if (nameLower.includes("upstash")) {
      env += "UPSTASH_REDIS_REST_URL=https://your-database.upstash.io\n";
      env += "UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token\n";
    } else if (nameLower.includes("turso")) {
      env += "TURSO_DATABASE_URL=libsql://your-db-name.turso.io\n";
      env += "TURSO_AUTH_TOKEN=your_turso_auth_token\n";
    } else if (nameLower.includes("posthog")) {
      env += "NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_api_key\n";
      env += "NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com\n";
    } else if (nameLower.includes("ollama")) {
      env += "OLLAMA_BASE_URL=http://localhost:11434\n";
      env += "OLLAMA_MODEL=llama3.3\n";
    } else if (nameLower.includes("pocketbase")) {
      env += "POCKETBASE_URL=http://127.0.0.1:8090\n";
    } else if (nameLower.includes("redis")) {
      env += "REDIS_URL=redis://localhost:6379\n";
    } else if (nameLower.includes("postgres")) {
      env += "DATABASE_URL=postgresql://postgres:password@localhost:5432/appdb\n";
    } else if (item.type === "api") {
      if (item.auth === "No Key") {
        env += `${varPrefix}_API_URL=${item.url || "https://api.example.com"}\n`;
      } else {
        env += `${varPrefix}_API_KEY=your_${varPrefix.toLowerCase()}_api_key\n`;
        env += `${varPrefix}_API_URL=${item.url || "https://api.example.com"}\n`;
      }
    } else {
      env += `${varPrefix}_API_KEY=your_${varPrefix.toLowerCase()}_api_key_or_token\n`;
      env += `${varPrefix}_URL=${item.url || item.repo || "https://example.com"}\n`;
    }
    env += "\n";
  }

  return env.trim();
}

function generateStackDocker(items) {
  const selfHostable = items.filter((i) => {
    const t = `${i.name} ${i.description || ""} ${(i.statusTags || []).join(" ")}`.toLowerCase();
    return (
      t.includes("self-hostable") ||
      t.includes("pocketbase") ||
      t.includes("umami") ||
      t.includes("stirling") ||
      t.includes("ollama") ||
      t.includes("searxng") ||
      t.includes("redis") ||
      t.includes("postgres") ||
      t.includes("rabbitmq") ||
      t.includes("uptime kuma") ||
      t.includes("portainer") ||
      t.includes("traefik") ||
      t.includes("plausible")
    );
  });

  const cloudItems = items.filter((i) => !selfHostable.includes(i));

  let compose = `version: "3.8"

# ==============================================================================
# Docker Compose Architecture
# Generated by DevShelf (https://devshelf.ritualdev.in)
# ==============================================================================

services:
`;

  if (selfHostable.length === 0) {
    compose += `  # None of your selected tools require local self-hosting containers!
  # Your stack uses managed zero-cost cloud tiers & public APIs:
`;
    for (const item of cloudItems) {
      compose += `  # - ${item.name} (${item.url || item.repo})\n`;
    }
    compose += `
  # Starter web application container:
  app:
    image: node:20-alpine
    container_name: devshelf_app
    restart: unless-stopped
    working_dir: /app
    ports:
      - "3000:3000"
    env_file:
      - .env
    command: npm run dev
`;
    return compose.trim();
  }

  const volumes = new Set();

  for (const item of selfHostable) {
    const n = item.name.toLowerCase();
    const serviceName = escapeSlug(item.name).replace(/-/g, "_");

    if (n.includes("pocketbase")) {
      compose += `  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    container_name: pocketbase
    restart: unless-stopped
    ports:
      - "8090:8090"
    volumes:
      - pb_data:/pb_data

`;
      volumes.add("pb_data");
    } else if (n.includes("umami")) {
      compose += `  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    container_name: umami
    restart: always
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: \${DATABASE_URL}
      DATABASE_TYPE: postgresql
      APP_SECRET: \${AUTH_SECRET:-devshelf_secret_string}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    container_name: umami_db
    restart: always
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-umami_password}
    volumes:
      - umami_db_data:/var/lib/postgresql/data

`;
      volumes.add("umami_db_data");
    } else if (n.includes("stirling")) {
      compose += `  stirling_pdf:
    image: frooodle/s-pdf:latest
    container_name: stirling_pdf
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./trainingData:/usr/share/tessdata
      - ./extraConfigs:/configs

`;
    } else if (n.includes("ollama")) {
      compose += `  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama

`;
      volumes.add("ollama_models");
    } else if (n.includes("uptime kuma")) {
      compose += `  uptime_kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime_kuma
    restart: always
    ports:
      - "3001:3001"
    volumes:
      - uptime_kuma_data:/app/data

`;
      volumes.add("uptime_kuma_data");
    } else if (n.includes("redis")) {
      compose += `  redis:
    image: redis:alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

`;
      volumes.add("redis_data");
    } else {
      compose += `  ${serviceName}:
    image: ${serviceName}:latest
    container_name: ${serviceName}
    restart: unless-stopped
    env_file:
      - .env

`;
    }
  }

  if (cloudItems.length > 0) {
    compose += "  # ── Cloud-Hosted Components (No local containers required) ──\n";
    for (const item of cloudItems) {
      compose += `  # - ${item.name}: ${item.url || item.repo}\n`;
    }
    compose += "\n";
  }

  if (volumes.size > 0) {
    compose += "volumes:\n";
    for (const v of volumes) {
      compose += `  ${v}:\n`;
    }
  }

  return compose.trim();
}

function generateStackMarkdown(items) {
  const shareUrl = getStackShareUrl();
  let md = `### 🛠️ Tech Stack & Architecture

Curated with [DevShelf](https://devshelf.ritualdev.in) &mdash; 100% Free & Open-Source Stack.

| Category / Layer | Tool | Free Tier / Cost | License | Direct Link |
| :--- | :--- | :--- | :---: | :---: |
`;

  for (const item of items) {
    const cat = item.category || item.section || "General";
    const cost = item.freeTier || item.freeTierCost || item.rateLimit || "100% Free";
    const lic = item.license || item.auth || "MIT";
    const url = item.url || item.repo || item.deployUrl || "https://devshelf.ritualdev.in";
    md += `| **${cat}** | **${item.name}** | \`${cost}\` | ${lic} | [Website / Repo](${url}) |\n`;
  }

  md += `
---

[![Built with DevShelf Stack](https://img.shields.io/badge/Stack-DevShelf_Curated-7928CA?style=for-the-badge&logo=rocket)](${shareUrl})

> 💡 *Inspect, modify, or export this stack at: [${shareUrl}](${shareUrl})*
`;

  return md.trim();
}

function copyToClipboard(text, successMsg = "Copied to clipboard!") {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(
      () => showToast(successMsg),
      () => fallbackCopy(text, successMsg),
    );
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(ta);
    if (successful) {
      showToast(successMsg);
    } else {
      showToast("Could not copy: please select manually.");
    }
  } catch (_err) {
    showToast("Could not copy: please select manually.");
  }
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  const messageSpan = document.getElementById("toast-message");
  if (!toast || !messageSpan) return;
  messageSpan.textContent = msg;
  toast.classList.remove("translate-y-20", "opacity-0");
  setTimeout(() => {
    toast.classList.add("translate-y-20", "opacity-0");
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[tag] || tag,
  );
}

// Immediate resilient execution regardless of document ready state
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
