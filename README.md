<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,12,19,24,30&height=200&section=header&text=📚%20DevShelf&fontSize=60&fontAlignY=35&desc=The%20Crowdsourced%20Zero-Paywall%20Developer%20Directory&descAlignY=55&descSize=18&fontColor=fff&animation=twinkling">
  <source media="(prefers-color-scheme: light)" srcset="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,12,19,24,30&height=200&section=header&text=📚%20DevShelf&fontSize=60&fontAlignY=35&desc=The%20Crowdsourced%20Zero-Paywall%20Developer%20Directory&descAlignY=55&descSize=18&fontColor=fff">
  <img alt="DevShelf Banner" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,12,19,24,30&height=200&section=header&text=📚%20DevShelf&fontSize=60&fontAlignY=35&desc=The%20Crowdsourced%20Zero-Paywall%20Developer%20Directory&descAlignY=55&descSize=18&fontColor=fff" width="100%">
</picture>

<br>

### ⚡ The Zero-Paywall Developer Directory & MCP Knowledge Hub

**The only curated developer directory that never rots — verified by continuous CI health checks, accessible in your terminal (`npx devshelf`), powered by an open JSON REST API, and native MCP server for AI coding assistants.**

<br>

<p>
  <a href="https://devshelf.ritualdev.in"><b>🌐 Interactive Web App</b></a> •
  <a href="#-devshelf-cli--terminal-discovery"><b>⚡ Terminal CLI</b></a> •
  <a href="#-official-mcp-server-for-ai-agents"><b>🤖 Model Context Protocol (MCP)</b></a> •
  <a href="#-devshelf-public-rest-api-v1"><b>📡 Public REST API</b></a> •
  <a href="#-browse-catalog-by-category"><b>📂 Category Guides</b></a>
</p>

[![npm version](https://img.shields.io/npm/v/devshelf.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/devshelf)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![CI Health Status](https://github.com/RitualDev-Lab/DevShelf/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/RitualDev-Lab/DevShelf/actions/workflows/ci.yml)
[![MCP Ready](https://img.shields.io/badge/MCP-Claude%20%7C%20Cursor%20%7C%20Zed-purple.svg?style=flat-square)](docs/mcp.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome_%26_Amplified-brightgreen.svg?style=flat-square)](#-how-to-submit-your-project-or-api)
[![Hacktoberfest](https://img.shields.io/badge/🎃_Hacktoberfest-2026_Ready-ff7800?style=flat-square)](HACKTOBERFEST.md)

<br>

<table>
<tr>
<td align="center"><b>🌐 Free APIs</b><br><code>101</code></td>
<td align="center"><b>🤖 AI & LLMs</b><br><code>90</code></td>
<td align="center"><b>⚡ CLI Tools</b><br><code>116</code></td>
<td align="center"><b>🧪 Testing & QA</b><br><code>62</code></td>
<td align="center"><b>☁️ Free Cloud</b><br><code>71</code></td>
<td align="center"><b>🤝 Up for Grabs</b><br><code>21</code></td>
<td align="center"><b>🎁 Dev Perks</b><br><code>30</code></td>
<td align="center"><b>🚀 1-Click Deploys</b><br><code>41</code></td>
</tr>
</table>

### 🎯 The Race to 1,000 Verified Tools (Hacktoberfest Milestone)

```text
[███████████░░░░░░░░░] 532 / 1,000 Tools Verified (53% • 468 to go!)
```

*Help us curate the definitive zero-paywall index! [Submit your favorite developer tool, API, or AI framework →](#-how-to-submit-your-project-or-api)*

</div>

<br>

---

## ⚡ 5-Second Interactive Visual Demo

DevShelf isn't a static markdown list. It runs directly inside your terminal, in your web browser, and as a native tool inside your AI assistant:

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│ $ npx devshelf search "postgres"                                                │
│                                                                                 │
│ 📚 DevShelf CLI v1.1.0 — 532 Curated Tools (Live CI Audited)                    │
│                                                                                 │
│ [1] Neon (Database / Serverless)                                                │
│     Serverless Postgres with autoscaling, branching, and generous free tier.    │
│     ⚡ Alt to AWS RDS  •  Free: 0.5 GB storage, 1 compute CU                     │
│     🔗 https://neon.tech                                                        │
│                                                                                 │
│ [2] Supabase (Database & BaaS)                                                  │
│     The open source Firebase alternative with Postgres, Auth, & Storage.        │
│     ⚡ Alt to Firebase  •  Free: 500 MB database, 50,000 MAUs                    │
│     🔗 https://supabase.com                                                     │
│                                                                                 │
│ 🤖 Plug into AI Assistants (Claude Desktop, Cursor, Windsurf, Zed):             │
│ $ npx devshelf-mcp                                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🥊 Why DevShelf Beats Legacy "Awesome Lists"

Most developer resource lists (*public-apis*, *free-for-dev*) suffer from link rot, abandoned projects, and sneaky "free 14-day trials". DevShelf solves this with **3 unfair advantages**:

| Dimension | 🧟 Static Awesome Lists & Repos | 🚀 DevShelf |
| :--- | :--- | :--- |
| **Endpoint Health** | 40%+ broken links & dead APIs sitting for years | 🛡️ **Automated CI Health Checks** ping every endpoint continuously |
| **Trial-Bait Protection** | Riddled with "14-day trials" & bait-and-switch pricing | 🚫 **Strict Zero-Paywall Audit** &mdash; 100% free forever tiers or MIT/Apache FOSS |
| **Developer Access** | Read-only markdown tables; constant browser tab flipping | ⚡ **Zero-Install CLI (`npx devshelf`)** & fuzzy TUI right in your terminal |
| **AI Agent Native** | None (manual copying and pasting into chat) | 🤖 **Official MCP Server (`npx devshelf-mcp`)** for Claude, Cursor, & Zed |
| **Data Programmability** | Static markdown formatting | 📡 **Free CORS JSON REST API (`/api/v1/tools.json`)** with no keys needed |
| **Creator Backing** | Submissions sit unreviewed for months with zero recognition | 📢 **Social Amplification Guarantee** &mdash; merged tools get featured on X & LinkedIn |

---

## 🤖 Official MCP Server for AI Agents

Turn your AI coding assistant into a free developer tool & API search engine! DevShelf implements the official **Model Context Protocol (MCP)** over stdio:

```bash
# Run stdio MCP server for Claude Desktop, Cursor, Zed, or Windsurf
npx devshelf-mcp
# or
npx devshelf mcp
```

### 1-Click Cursor Configuration (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "devshelf": {
      "command": "npx",
      "args": ["-y", "devshelf-mcp"]
    }
  }
}
```

👉 **[Read Full MCP Setup Guide for Claude Desktop, Cursor, Windsurf & Zed →](docs/mcp.md)**

---

## ⚡ DevShelf CLI & Terminal Discovery

Stay in flow without leaving your terminal. DevShelf includes an interactive fuzzy TUI and fast CLI utilities:

```bash
# Launch interactive Terminal UI (fuzzy search, category browsing, and 1-click open)
npx devshelf

# Instant search across all 520+ curated resources
npx devshelf search "postgres"
npx devshelf search "auth" --open

# Get your daily open-source discovery (add to ~/.zshrc or ~/.bashrc)
npx devshelf daily --quiet

# Find open-source projects actively seeking contributors & starter issues
npx devshelf contribute "rust"

# Discover a random resource for inspiration
npx devshelf random

# View live catalog telemetry and counts
npx devshelf stats
```

---

## 📂 Browse Catalog by Category

Explore our curated collections of **532+ zero-paywall developer tools**, categorized into dedicated guides with subcategory indexing:

| Category | Resources | Description & Subcategories | Guide |
| :--- | :---: | :--- | :---: |
| 🌐 **Free & Public APIs** | **101** | Weather, Finance, Mock/Dev APIs, Geocoding, AI/ML, Media, Entertainment | [**Browse APIs →**](docs/apis.md) |
| 🤖 **AI Agents & Local LLMs** | **90** | Local LLM Runtimes, Autonomous Agents, Coding Assistants, Orchestration | [**Browse AI Tools →**](docs/ai-tools.md) |
| ⚡ **CLI & Productivity Tools** | **116** | Terminal Utilities, Git Power Tools, Docker & DevOps, Benchmarking, DBs | [**Browse CLI Tools →**](docs/cli-tools.md) |
| 🧪 **Testing & QA Reliability** | **62** | E2E Testing, Mock Servers, Contract Testing, Security Auditing, Performance | [**Browse Testing Tools →**](docs/testing-qa.md) |
| ☁️ **Free Cloud & Developer Tiers** | **71** | Databases, Auth & Identity, Serverless Compute, Object Storage, Email, APM | [**Browse Cloud Tiers →**](docs/free-cloud.md) |
| 🤝 **Contributors Wanted** | **21** | Active open-source repos with curated Good First Issues and starter tasks | [**Browse Projects →**](docs/contributors-wanted.md) |
| 🎁 **Developer Discounts & Perks** | **30** | Cloud credits, free IDE licenses, student packs, open-source sponsorships | [**Browse Perks →**](docs/perks.md) |
| 🚀 **1-Click Deploys & Boilerplates** | **41** | Full-Stack templates, SaaS starters, BaaS, microservices deployable in 1 click | [**Browse Boilerplates →**](docs/boilerplates.md) |

---

## 🔥 Featured Spotlight & Tools of the Week

> Every week, we highlight outstanding open-source utilities, developer gems, and community submissions.

| Project | Category | Highlights | Links |
| :--- | :--- | :--- | :---: |
| **GitWhisper** | Git & Version Control | Local-first AI Git commit intelligence with Conventional Commits, AST secret redaction & atomic hunk splitting. | [GitHub](https://github.com/RitualDev-Lab/GitWhisper) |
| **FlashLane** | OS & Hardware Utilities | Universal high-speed bootable ISO/IMG USB writer with Rufus parity for Windows, macOS, & Linux. | [GitHub](https://github.com/RitualDev-Lab/FlashLane) |
| **AutoHeal-QA** | E2E Testing & Playwright | 100% Free & Local-first agentic self-healing E2E test runner for Playwright with zero cloud costs. | [GitHub](https://github.com/RitualDev-Lab/autoheal-qa) |
| **Ollama** | Local AI & Inference | Run Llama 3.3, Mistral, Qwen, and custom models locally with a simple CLI and REST API. | [GitHub](https://github.com/ollama/ollama) |
| **Bruno** | API Testing & Exploration | Fast, git-friendly open-source API client storing collections directly in your repo in plain text. | [GitHub](https://github.com/usebruno/bruno) |
| **PocketBase** | Databases & BaaS | Open-source backend in 1 single binary file with embedded SQLite, realtime subscriptions, and auth. | [Website](https://pocketbase.io) |

---

## 🚀 Social Amplification Guarantee

> [!IMPORTANT]
> ### 📢 We Promote Your Project When You Get Listed!
> Building great developer tools is hard. Getting discovered is even harder.  
> **When your tool, API, or project is accepted and merged into DevShelf:**
> 1. **🌟 Social Media Spotlight**: We publish a dedicated shoutout post about your project on **X (Twitter)** and **LinkedIn** via the RitualDev Lab channels.
> 2. **🌐 Permanent Web Directory Inclusion**: Your tool is permanently listed in our live search index at [devshelf.ritualdev.in](https://devshelf.ritualdev.in).
> 3. **🔗 High-Quality Backlink**: Guaranteed direct dofollow backlink to your GitHub repository or documentation.

---

## 🎖️ "Featured on DevShelf" Badges

Are you listed on DevShelf? Display an official badge on your project's `README.md` to show off your community verification:

### Style 1: Modern Purple (Recommended)
[![Featured on DevShelf](https://img.shields.io/badge/Featured%20on-DevShelf-7928CA?style=for-the-badge&logo=googlechrome&logoColor=white)](https://devshelf.ritualdev.in/)

```markdown
[![Featured on DevShelf](https://img.shields.io/badge/Featured%20on-DevShelf-7928CA?style=for-the-badge&logo=googlechrome&logoColor=white)](https://devshelf.ritualdev.in/)
```

### Style 2: Cyberpunk Neon Cyan
[![Featured on DevShelf](https://img.shields.io/badge/DevShelf-Curated%20Resource-00E5FF?style=for-the-badge&logo=github&logoColor=black)](https://devshelf.ritualdev.in/)

```markdown
[![Featured on DevShelf](https://img.shields.io/badge/DevShelf-Curated%20Resource-00E5FF?style=for-the-badge&logo=github&logoColor=black)](https://devshelf.ritualdev.in/)
```

### Style 3: Minimal Flat Square
[![Featured on DevShelf](https://img.shields.io/badge/Featured%20on-DevShelf-blueviolet?style=flat-square&logo=googlechrome&logoColor=white)](https://devshelf.ritualdev.in/)

```markdown
[![Featured on DevShelf](https://img.shields.io/badge/Featured%20on-DevShelf-blueviolet?style=flat-square&logo=googlechrome&logoColor=white)](https://devshelf.ritualdev.in/)
```

---

## ⚡ DevShelf Public REST API (v1)

DevShelf is backed by a 100% free, CORS-enabled, static public REST API with zero rate-limiting or registration requirements:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| **[`/api/v1/tools.json`](https://devshelf.ritualdev.in/api/v1/tools.json)** | `GET` | All 500+ curated developer tools, APIs, and AI models |
| **[`/api/v1/stats.json`](https://devshelf.ritualdev.in/api/v1/stats.json)** | `GET` | Catalog telemetry, repo counts, and category breakdowns |
| **[`/api/v1/categories.json`](https://devshelf.ritualdev.in/api/v1/categories.json)** | `GET` | Category listing and dedicated JSON endpoints |

👉 **Read the complete [API Documentation & Code Samples (TypeScript, Python, cURL) →](docs/api.md)**

---

## 🧩 IDE & Launcher Extensions

Query and explore 500+ free developer tools directly within your workflow:

- **[Raycast Extension](extensions/raycast/)** &mdash; Instant tool search & random gem picker from your desktop spotlight (`Cmd+Shift+B` to copy badges).
- **[VS Code Extension](extensions/vscode/)** &mdash; Command Palette integration (`Ctrl+Shift+P` -> `DevShelf: Search`).
- 👉 **[Read Extension Guides & Installation →](docs/extensions.md)**

---

## 🎃 Hacktoberfest 2026

DevShelf is proud to participate in **Hacktoberfest 2026**! We welcome beginner and experienced open-source contributors with automated PR validation and prompt reviews:

- 🍁 **[Read Hacktoberfest Guide & Standards →](HACKTOBERFEST.md)**
- 🚀 **[Claim a Starter Issue →](https://github.com/RitualDev-Lab/DevShelf/issues/new?template=08_hacktoberfest_task.yml)**

---

## 👥 Team & Contributors

DevShelf is initiated by the team at [RitualDev Lab](https://github.com/RitualDev-Lab) and expanded by the global open-source community.

### 🛡️ Core Team & Maintainers

<table align="center">
  <tr>
    <td align="center" width="180">
      <a href="https://github.com/divyanshujethi">
        <img src="https://github.com/divyanshujethi.png" width="80" style="border-radius: 50%;" alt="Divyanshu Jethi"/><br />
        <sub><b>Divyanshu Jethi</b></sub>
      </a><br />
      <sub>🚀 Founder & Lead</sub>
    </td>
    <td align="center" width="180">
      <a href="https://github.com/Sakshisharma1616">
        <img src="https://github.com/Sakshisharma1616.png" width="80" style="border-radius: 50%;" alt="Sakshi Sharma"/><br />
        <sub><b>Sakshi Sharma</b></sub>
      </a><br />
      <sub>🎨 Core Maintainer & Product</sub>
    </td>
    <td align="center" width="180">
      <a href="https://github.com/Ritual-Dev-Git">
        <img src="https://github.com/Ritual-Dev-Git.png" width="80" style="border-radius: 50%;" alt="RitualDev"/><br />
        <sub><b>RitualDev</b></sub>
      </a><br />
      <sub>⚙️ Core Maintainer & Infra</sub>
    </td>
    <td align="center" width="180">
      <a href="https://github.com/Divyanshu-hub-dotcom">
        <img src="https://github.com/Divyanshu-hub-dotcom.png" width="80" style="border-radius: 50%;" alt="Divyanshu-hub-dotcom"/><br />
        <sub><b>Divyanshu-hub-dotcom</b></sub>
      </a><br />
      <sub>🛠️ Core Member</sub>
    </td>
    <td align="center" width="180">
      <a href="https://github.com/ayushxx01">
        <img src="https://github.com/ayushxx01.png" width="80" style="border-radius: 50%;" alt="Ayush"/><br />
        <sub><b>Ayush</b></sub>
      </a><br />
      <sub>🛡️ Core Maintainer & Triage</sub>
    </td>
  </tr>
</table>

### 🌟 Community Contributors & Builders

<table align="center">
  <tr>
    <td align="center" width="160">
      <a href="https://github.com/Voyagerroc-Lab">
        <img src="https://github.com/Voyagerroc-Lab.png" width="70" style="border-radius: 50%;" alt="Voyagerroc-Lab"/><br />
        <sub><b>Voyagerroc-Lab</b></sub>
      </a><br />
      <sub>🔤 Coding Fonts (PR #35)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/ayushxx01">
        <img src="https://github.com/ayushxx01.png" width="70" style="border-radius: 50%;" alt="ayushxx01"/><br />
        <sub><b>ayushxx01</b></sub>
      </a><br />
      <sub>🐶 Dog API (PR #36)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/pranshuchittora">
        <img src="https://github.com/pranshuchittora.png" width="70" style="border-radius: 50%;" alt="pranshuchittora"/><br />
        <sub><b>pranshuchittora</b></sub>
      </a><br />
      <sub>🧪 Agent QA (PR #37)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/KRISHNAMMurarka">
        <img src="https://github.com/KRISHNAMMurarka.png" width="70" style="border-radius: 50%;" alt="KRISHNAMMurarka"/><br />
        <sub><b>KRISHNAMMurarka</b></sub>
      </a><br />
      <sub>⚡ Budget Gate (PR #41)</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="160">
      <a href="https://github.com/louis030195">
        <img src="https://github.com/louis030195.png" width="70" style="border-radius: 50%;" alt="louis030195"/><br />
        <sub><b>louis030195</b></sub>
      </a><br />
      <sub>🧠 Hyperconsciousness (PR #44)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/deiucanta">
        <img src="https://github.com/deiucanta.png" width="70" style="border-radius: 50%;" alt="deiucanta"/><br />
        <sub><b>deiucanta</b></sub>
      </a><br />
      <sub>🖥️ Easypanel (PR #56)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/mahdi-salmanzade">
        <img src="https://github.com/mahdi-salmanzade.png" width="70" style="border-radius: 50%;" alt="mahdi-salmanzade"/><br />
        <sub><b>mahdi-salmanzade</b></sub>
      </a><br />
      <sub>🇦🇪 MCP Dubai (PR #53)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/BlueSkyID666">
        <img src="https://github.com/BlueSkyID666.png" width="70" style="border-radius: 50%;" alt="BlueSkyID666"/><br />
        <sub><b>BlueSkyID666</b></sub>
      </a><br />
      <sub>🎬 OrkasVideoStudio (PR #55)</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="160">
      <a href="https://github.com/yannickmonney">
        <img src="https://github.com/yannickmonney.png" width="70" style="border-radius: 50%;" alt="yannickmonney"/><br />
        <sub><b>yannickmonney</b></sub>
      </a><br />
      <sub>📜 Tale (PR #59)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/Eigenwise">
        <img src="https://github.com/Eigenwise.png" width="70" style="border-radius: 50%;" alt="Eigenwise"/><br />
        <sub><b>Eigenwise</b></sub>
      </a><br />
      <sub>🛠️ Toolshed (PR #61)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/foklepoint">
        <img src="https://github.com/foklepoint.png" width="70" style="border-radius: 50%;" alt="foklepoint"/><br />
        <sub><b>foklepoint</b></sub>
      </a><br />
      <sub>⚖️ Court Rules (PR #63)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/stefanautomateed">
        <img src="https://github.com/stefanautomateed.png" width="70" style="border-radius: 50%;" alt="stefanautomateed"/><br />
        <sub><b>stefanautomateed</b></sub>
      </a><br />
      <sub>🚢 Shipvela (PR #65)</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="160">
      <a href="https://github.com/zealous1">
        <img src="https://github.com/zealous1.png" width="70" style="border-radius: 50%;" alt="zealous1"/><br />
        <sub><b>zealous1</b></sub>
      </a><br />
      <sub>🎬 Arcmira (PR #67)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/jeshuadomingo-byte">
        <img src="https://github.com/jeshuadomingo-byte.png" width="70" style="border-radius: 50%;" alt="jeshuadomingo-byte"/><br />
        <sub><b>jeshuadomingo-byte</b></sub>
      </a><br />
      <sub>💬 Caption-Pack (PR #68)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/Jamailar">
        <img src="https://github.com/Jamailar.png" width="70" style="border-radius: 50%;" alt="Jamailar"/><br />
        <sub><b>Jamailar</b></sub>
      </a><br />
      <sub>⚡ LeanFPS (#70)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/Shaisolaris">
        <img src="https://github.com/Shaisolaris.png" width="70" style="border-radius: 50%;" alt="Shaisolaris"/><br />
        <sub><b>Shaisolaris</b></sub>
      </a><br />
      <sub>☀️ Solaris Dev Shop (#71)</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="160">
      <a href="https://github.com/Alox1d">
        <img src="https://github.com/Alox1d.png" width="70" style="border-radius: 50%;" alt="Alox1d"/><br />
        <sub><b>Alox1d</b></sub>
      </a><br />
      <sub>📦 Community Tool (#76)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/Dramex">
        <img src="https://github.com/Dramex.png" width="70" style="border-radius: 50%;" alt="Dramex"/><br />
        <sub><b>Dramex</b></sub>
      </a><br />
      <sub>🛡️ RowSafe (PR #77)</sub>
    </td>
    <td align="center" width="160">
      <a href="https://github.com/SergiuPogor">
        <img src="https://github.com/SergiuPogor.png" width="70" style="border-radius: 50%;" alt="SergiuPogor"/><br />
        <sub><b>SergiuPogor</b></sub>
      </a><br />
      <sub>📸 CurlShot (PR #79)</sub>
    </td>
  </tr>
</table>

<div align="center">

[![DevShelf Contributors](https://contrib.rocks/image?repo=RitualDev-Lab/DevShelf)](https://github.com/RitualDev-Lab/DevShelf/graphs/contributors)

*Want your avatar here? Submit a pull request with your favorite developer tool or fix an open issue!*

</div>

---

## 🚀 Community Contributions & Issue Hub

DevShelf is powered by the open-source community! We provide tailored issue templates for every kind of contribution:

| Action / Goal | Issue Template | Description |
| :--- | :--- | :--- |
| **🎃 Hacktoberfest 2026** | [**View Guide →**](HACKTOBERFEST.md) • [**Starter Task →**](https://github.com/RitualDev-Lab/DevShelf/issues/new?template=08_hacktoberfest_task.yml) | Find qualifying starter tasks, curation guidelines, and earn Hacktoberfest recognition |
| **🚀 Submit Open Source Tool** | [**Open Project Form →**](https://github.com/RitualDev-Lab/DevShelf/issues/new?template=01_submit_tool.yml) | Submit your developer tool, CLI, or library for automated addition & social shoutout |
| **🌐 Submit Free Public API** | [**Open API Form →**](https://github.com/RitualDev-Lab/DevShelf/issues/new?template=02_submit_api.yml) | Add a free, no-key, or generous rate-limit public API |
| **💡 Propose a Feature** | [**Open Feature Request →**](https://github.com/RitualDev-Lab/DevShelf/issues/new?template=03_feature_request.yml) | Suggest new UI features, dark mode, filtering capabilities, or web app improvements |
| **🌱 Good First Issue** | [**Open Starter Task →**](https://github.com/RitualDev-Lab/DevShelf/issues/new?template=04_good_first_issue.yml) | Propose or claim bite-sized tasks for new open-source contributors |
| **📖 Docs & Guides** | [**Open Docs Issue →**](https://github.com/RitualDev-Lab/DevShelf/issues/new?template=05_docs_improvement.yml) | Suggest clarifications or guides for DevShelf or the Wiki |
| **🔗 Report Broken Link** | [**Open Health Report →**](https://github.com/RitualDev-Lab/DevShelf/issues/new?template=06_report_broken_link.yml) | Flag an unreachable URL or moved API endpoint |
| **🚨 Report Paywall / Spam** | [**Open Content Report →**](https://github.com/RitualDev-Lab/DevShelf/issues/new?template=07_content_report.yml) | Report deceptive paywalls or spam for immediate delisting |

---

## 🛠️ How to Contribute via Pull Request (PR)
1. Fork this repository and clone your fork.
2. Add your entry to the appropriate JSON file in the `shelf/` directory (`shelf/apis.json`, `shelf/cli-tools.json`, `shelf/ai-tools.json`, etc.).
3. Run `pnpm run validate` to test schema conformance.
4. Run `pnpm run build` to re-generate the web directory, category markdown documents, and README.
5. Submit your PR — our automated GitHub Actions will review and merge it!

---

## 🛡️ Quality Guidelines
- **No Paywalled "Free Trials"**: APIs and tools must have a permanent free tier or be 100% open-source.
- **Active Projects**: Repositories must have a README, an open-source license, and be publicly accessible.
- **Zero Spam**: Crypto schemes, affiliate spam, and deceptive links will be permanently rejected.

---

## 🏗️ Built With

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Biome](https://img.shields.io/badge/Biome-60A5FA?style=flat-square&logo=biome&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222?style=flat-square&logo=github&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white)

</div>

---

## 💖 Support DevShelf

DevShelf is a 100% free and open-source community directory. If DevShelf saved you cloud expenses or helped discover useful tools, consider supporting server uptime and automated healthcheck infrastructure:

<div align="center">

[![Sponsor on Dodo Payments](https://img.shields.io/badge/Sponsor-Dodo%20Payments-8b5cf6?style=for-the-badge&logo=shield&logoColor=white)](https://checkout.dodopayments.com/buy/pdt_0NpjONGugY5QkrFDUaPva)

[**💖 Sponsor via Dodo Payments**](https://checkout.dodopayments.com/buy/pdt_0NpjONGugY5QkrFDUaPva)

</div>

---

## 📜 License
Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,12,19,24,30&height=100&section=footer">
  <img alt="" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,12,19,24,30&height=100&section=footer" width="100%">
</picture>

<sub>Curated with ❤️ by <a href="https://github.com/RitualDev-Lab">RitualDev-Lab</a> and the global open-source community.</sub>

<sub>⭐ If DevShelf saved you time, consider giving this repo a star — it helps other developers discover these resources!</sub>

</div>
