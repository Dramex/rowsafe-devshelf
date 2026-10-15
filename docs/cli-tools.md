# ⚡ CLI & Productivity Tools

> High-speed terminal utilities, Git workflow boosters, container managers, and developer productivity enhancers.

[← Back to Main Directory](../README.md) • [🌐 Live Search App](https://devshelf.ritualdev.in) • [➕ Submit New Resource](../README.md#-how-to-submit-your-project-or-api)

[![Total CLI Tools](https://img.shields.io/badge/CLI_Tools-116_Curated-blueviolet?style=for-the-badge)](https://devshelf.ritualdev.in)

**Jump to Subcategory:**
[Benchmarking & Performance](#benchmarking-performance) • [CLI & Developer Productivity](#cli-developer-productivity) • [Database & SQL](#database-sql) • [Dev Utilities & Libraries](#dev-utilities-libraries) • [Developer Tools](#developer-tools) • [DevOps & Containers](#devops-containers) • [Disk & Storage](#disk-storage) • [Git & Version Control](#git-version-control) • [GitHub Workflow & TUI](#github-workflow-tui) • [HTTP & Network](#http-network) • [OS & Hardware Utilities](#os-hardware-utilities) • [System & Process Monitoring](#system-process-monitoring) • [Terminal & Search](#terminal-search) • [Terminal & Shell](#terminal-shell) • [Terminal Navigation](#terminal-navigation)

---

### <a id="benchmarking-performance"></a>Benchmarking & Performance (1)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**hyperfine**](https://github.com/sharkdp/hyperfine) | `Rust` | `MIT / Apache-2.0` | Command-line benchmarking tool with statistical analysis, warmup runs, and parametric sweeps. | [GitHub](https://github.com/sharkdp/hyperfine) |

### <a id="cli-developer-productivity"></a>CLI & Developer Productivity (7)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**Web Performance Budget Gate**](https://github.com/edilec/web-performance-budget-gate) | `JavaScript (Node.js 22+)` | `MIT` | Offline Node.js CLI that checks captured Lighthouse JSON against declared route-level performance budgets and reports a completed budget failure. It does not run Lighthouse or measure a live page. | [GitHub](https://github.com/edilec/web-performance-budget-gate) |
| [**Hyperconsciousness**](https://github.com/louis030195/hyperconsciousness) | `Rust` | `MIT` | Developer-alpha encrypted, append-only knowledge store with a Rust CLI and MCP server. Developers can sync signed records across devices and give agents scoped, expiring access to notes. | [GitHub](https://github.com/louis030195/hyperconsciousness) |
| [**Image Format Readiness**](https://github.com/edilec/image-format-readiness) | `JavaScript (Node.js 22+)` | `MIT` | Offline Node.js CLI that checks exported HTML and local image files for declared dimensions, aspect ratio, alternative text, loading declarations, pinned format policy, and byte budgets. It reports pass, fail, or incomplete evidence; it does not optimize images or test live browser compatibility. | [GitHub](https://github.com/edilec/image-format-readiness) |
| [**Docs Link Integrity Checker**](https://github.com/edilec/docs-link-integrity-checker) | `JavaScript (Node.js 22+)` | `MIT` | Offline Node.js CLI that checks Markdown and HTML links, local targets and anchors inside a bounded documentation root. It never fetches external URLs; without an imported status for them, the report stays incomplete rather than passing silently. | [GitHub](https://github.com/edilec/docs-link-integrity-checker) |
| [**OpenAPI Example Validator**](https://github.com/edilec/openapi-example-validator) | `JavaScript (Node.js 22+)` | `MIT` | Offline Node.js CLI that checks examples in local JSON OpenAPI 3.0 and 3.1 descriptions against the schema for their operation and media type. It reports unsupported checks as incomplete instead of treating them as a pass. | [GitHub](https://github.com/edilec/openapi-example-validator) |
| [**OrkasVideoStudio**](https://github.com/Orkas-AI/Orkas-VideoStudio) | `TypeScript` | `MIT` | Local-first TypeScript CLI and MCP toolkit for coding agents to compose, edit, and assemble videos from editable plan.json timelines. Core editing and transcription need no API keys; optional generation features use your own provider keys. | [GitHub](https://github.com/Orkas-AI/Orkas-VideoStudio) |
| [**Shipvela publishing plugin and skills**](https://github.com/stefanautomateed/shipvela-codex) | `Markdown, JSON, CLI` | `MIT` | MIT-licensed publishing skills and MCP client configuration for coding agents to stage website files, review deployments, and track status. Enables direct website publishing from agent workflows without requiring code generation or a self-hosted server. | [GitHub](https://github.com/stefanautomateed/shipvela-codex) |

### <a id="database-sql"></a>Database & SQL (7)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**lazysql**](https://github.com/jorgerojas26/lazysql) | `Go` | `MIT` | Cross-platform terminal UI database management tool for PostgreSQL, MySQL, and SQLite. | [GitHub](https://github.com/jorgerojas26/lazysql) |
| [**usql**](https://github.com/xo/usql) | `Go` | `MIT` | Universal command-line interface for PostgreSQL, MySQL, SQLite, Oracle, ClickHouse, and 20+ database systems. | [GitHub](https://github.com/xo/usql) |
| [**RowSafe**](https://github.com/rowsafe/rowsafe) | `Go` | `Apache-2.0` | Apache-2.0 agent and CLI for RowSafe database protection and management, with an MCP server for coding agents. Requires a RowSafe account and its separate hosted service. | [GitHub](https://github.com/rowsafe/rowsafe) |
| [**pgcli**](https://github.com/dbcli/pgcli) | `Python` | `BSD-3-Clause` | Postgres CLI with auto-completion and syntax highlighting, table formatting, and smart completions. | [GitHub](https://github.com/dbcli/pgcli) |
| [**mycli**](https://github.com/dbcli/mycli) | `Python` | `BSD-3-Clause` | A terminal client for MySQL, MariaDB, and Percona with auto-completion and syntax highlighting. | [GitHub](https://github.com/dbcli/mycli) |
| [**iredis**](https://github.com/laixintao/iredis) | `Python` | `BSD-3-Clause` | A terminal client for Redis with auto-completion and syntax highlighting, command suggestions, and hints. | [GitHub](https://github.com/laixintao/iredis) |
| [**litecli**](https://github.com/dbcli/litecli) | `Python` | `BSD-3-Clause` | CLI for SQLite databases with auto-completion and syntax highlighting. | [GitHub](https://github.com/dbcli/litecli) |

### <a id="dev-utilities-libraries"></a>Dev Utilities & Libraries (3)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**Codex Quota Overlay**](https://github.com/cpys/codex-quota-overlay) | `JavaScript / Electron, with C# and Swift native helpers` | `MIT` | An independent, open-source Codex Desktop companion for Windows and macOS. It displays quota limits, reset times, and reset credits, with a local Quota Center for pace and history. I am a maintainer of this independent project; it is not affiliated with or endorsed by OpenAI. | [GitHub](https://github.com/cpys/codex-quota-overlay) |
| [**Solaris Dev Shop**](https://github.com/Shaisolaris/solaris-dev-shop) | `Python` | `MIT` | Free MIT skill library and toolkit. A deterministic intake router assigns one specialist skill for agentic workflows. | [GitHub](https://github.com/Shaisolaris/solaris-dev-shop) |
| [**DateParser Kotlin**](https://github.com/Alox1d/dateparser-kotlin) | `Kotlin Multiplatform, kotlinx-datetime` | `MIT` | MIT Kotlin Multiplatform library for offline natural-language date and time parsing in Russian and English. Published Android (API 26+), JVM and iOS variants resolve supported phrases against an explicit reference time and timezone for use in task/reminder forms. | [GitHub](https://github.com/Alox1d/dateparser-kotlin) |

### <a id="developer-tools"></a>Developer Tools (12)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**agent-browser**](https://github.com/vercel-labs/agent-browser) | `Rust / TypeScript` | `Apache-2.0` | Open-source browser automation CLI for AI agents, with a fast Rust core and Node.js fallback for navigation, forms, screenshots, and structured page interaction. | [GitHub](https://github.com/vercel-labs/agent-browser) |
| [**tldr**](https://github.com/tldr-pages/tldr) | `Markdown` | `MIT` | Collaborative, simplified community man pages focusing on practical, real-world command examples. | [GitHub](https://github.com/tldr-pages/tldr) |
| [**helix**](https://github.com/helix-editor/helix) | `Rust` | `MPL-2.0` | Post-modern modal text editor built in Rust with built-in Language Server Protocol (LSP) and Tree-sitter syntax highlighting. | [GitHub](https://github.com/helix-editor/helix) |
| [**mise**](https://github.com/jdx/mise) | `Rust` | `MIT` | Front-end to your dev environment: polyglot runtime executor, environment variable manager, and task runner. | [GitHub](https://github.com/jdx/mise) |
| [**asdf-vm**](https://github.com/asdf-vm/asdf) | `Shell` | `MIT` | Multiple runtime version manager with a single CLI and unified configuration for Node.js, Python, Ruby, and more. | [GitHub](https://github.com/asdf-vm/asdf) |
| [**pnpm**](https://github.com/pnpm/pnpm) | `TypeScript` | `MIT` | Fast, disk space efficient package manager using hard links and content-addressable storage. | [GitHub](https://github.com/pnpm/pnpm) |
| [**⭐ bun**](https://github.com/oven-sh/bun) | `Zig / C++` | `MIT` | Incredibly fast JavaScript and TypeScript runtime, bundler, test runner, and package manager written in Zig. | [GitHub](https://github.com/oven-sh/bun) |
| [**deno**](https://github.com/denoland/deno) | `Rust` | `MIT` | Secure runtime for JavaScript and TypeScript with built-in web standards and package management. | [GitHub](https://github.com/denoland/deno) |
| [**pandoc**](https://github.com/jgm/pandoc) | `Haskell` | `GPL-2.0` | Universal markup converter that translates between Markdown, LaTeX, HTML, PDF, Docx, and 40+ formats. | [GitHub](https://github.com/jgm/pandoc) |
| [**typos-cli**](https://github.com/crate-ci/typos) | `Rust` | `Apache-2.0 / MIT` | Source code spell checker that finds and corrects typos in source code with low false positives. | [GitHub](https://github.com/crate-ci/typos) |
| [**vale**](https://github.com/errata-ai/vale) | `Go` | `MIT` | Syntax-aware linter for prose and documentation supporting Google, Microsoft, and custom style guides. | [GitHub](https://github.com/errata-ai/vale) |
| [**volta**](https://github.com/volta-cli/volta) | `Rust` | `BSD-2-Clause` | The hassle-free JavaScript tool manager that automatically switches Node.js and package manager versions per project. | [GitHub](https://github.com/volta-cli/volta) |

### <a id="devops-containers"></a>DevOps & Containers (12)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**k9s**](https://github.com/derailed/k9s) | `Go` | `Apache-2.0` | Kubernetes CLI to manage your clusters in style, observe real-time events, and troubleshoot workloads. | [GitHub](https://github.com/derailed/k9s) |
| [**act**](https://github.com/nektos/act) | `Go` | `MIT` | Run your GitHub Actions locally inside Docker containers for fast, offline CI/CD pipeline iteration. | [GitHub](https://github.com/nektos/act) |
| [**dive**](https://github.com/wagoodman/dive) | `Go` | `MIT` | Tool for exploring a Docker image, layer contents, and discovering ways to shrink your image size. | [GitHub](https://github.com/wagoodman/dive) |
| [**lazydocker**](https://github.com/jesseduffield/lazydocker) | `Go` | `MIT` | A simple terminal UI for both Docker and docker-compose, written in Go with the gocui library. | [GitHub](https://github.com/jesseduffield/lazydocker) |
| [**osv-scanner**](https://github.com/google/osv-scanner) | `Go` | `Apache-2.0` | Vulnerability scanner written in Go that checks your dependencies against the Open Source Vulnerability database. | [GitHub](https://github.com/google/osv-scanner) |
| [**stern**](https://github.com/stern/stern) | `Go` | `Apache-2.0` | Multi pod and container log tailing for Kubernetes with regex filtering and color-coded stream output. | [GitHub](https://github.com/stern/stern) |
| [**kubectx**](https://github.com/ahmetb/kubectx) | `Go` | `Apache-2.0` | Faster way to switch between clusters and namespaces in kubectl with fuzzy search integration. | [GitHub](https://github.com/ahmetb/kubectx) |
| [**helm**](https://github.com/helm/helm) | `Go` | `Apache-2.0` | The package manager for Kubernetes: define, install, and upgrade complex Kubernetes applications. | [GitHub](https://github.com/helm/helm) |
| [**kustomize**](https://github.com/kubernetes-sigs/kustomize) | `Go` | `Apache-2.0` | Customization of Kubernetes YAML configurations without templates, using patch layers and overlays. | [GitHub](https://github.com/kubernetes-sigs/kustomize) |
| [**minikube**](https://github.com/kubernetes/minikube) | `Go` | `Apache-2.0` | Run Kubernetes locally on Windows, macOS, and Linux with automated cluster provisioning. | [GitHub](https://github.com/kubernetes/minikube) |
| [**kind**](https://github.com/kubernetes-sigs/kind) | `Go` | `Apache-2.0` | Kubernetes IN Docker: tool for running local Kubernetes clusters using Docker container nodes. | [GitHub](https://github.com/kubernetes-sigs/kind) |
| [**ctop**](https://github.com/bcicen/ctop) | `Go` | `MIT` | Top-like interface for container metrics, real-time memory and CPU consumption for Docker and Kubernetes. | [GitHub](https://github.com/bcicen/ctop) |

### <a id="disk-storage"></a>Disk & Storage (1)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**dust**](https://github.com/bootandy/dust) | `Rust` | `Apache-2.0` | A more intuitive version of du in Rust providing instant visual disk usage breakdown in terminal. | [GitHub](https://github.com/bootandy/dust) |

### <a id="git-version-control"></a>Git & Version Control (11)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**⭐ GitWhisper**](https://github.com/RitualDev-Lab/GitWhisper) | `TypeScript` | `MIT` | Local-first & privacy-hardened AI Git commit intelligence with Conventional Commits, AST secret redaction, atomic hunk splitting, and 1-click VS Code extension. | [GitHub](https://github.com/RitualDev-Lab/GitWhisper) |
| [**lazygit**](https://github.com/jesseduffield/lazygit) | `Go` | `MIT` | Simple, fast terminal UI for git commands with interactive rebasing and visual diff navigation. | [GitHub](https://github.com/jesseduffield/lazygit) |
| [**delta**](https://github.com/dandavison/delta) | `Rust` | `MIT` | A syntax-highlighting pager for git, diff, and grep output with side-by-side views and line numbers. | [GitHub](https://github.com/dandavison/delta) |
| [**⭐ gh**](https://github.com/cli/cli) | `Go` | `MIT` | GitHub's official command line tool to manage pull requests, issues, releases, and repository workflows. | [GitHub](https://github.com/cli/cli) |
| [**glab**](https://gitlab.com/gitlab-org/cli) | `Go` | `MIT` | GitLab's official open source CLI tool bringing GitLab features directly to your terminal. | [GitHub](https://gitlab.com/gitlab-org/cli) |
| [**git-cliff**](https://github.com/orhun/git-cliff) | `Rust` | `Apache-2.0 / MIT` | Highly customizable changelog generator based on conventional commits and Git history. | [GitHub](https://github.com/orhun/git-cliff) |
| [**onefetch**](https://github.com/o2sh/onefetch) | `Rust` | `MIT` | Git repository summary information tool written in Rust that displays project stats directly in terminal. | [GitHub](https://github.com/o2sh/onefetch) |
| [**gitleaks**](https://github.com/gitleaks/gitleaks) | `Go` | `MIT` | Protect and discover secrets & sensitive data like passwords, API keys, and tokens in git repositories. | [GitHub](https://github.com/gitleaks/gitleaks) |
| [**trufflehog**](https://github.com/trufflesecurity/trufflehog) | `Go` | `AGPL-3.0` | Find leaked credentials and secrets across git commit history, filesystems, and S3 buckets. | [GitHub](https://github.com/trufflesecurity/trufflehog) |
| [**git-sizer**](https://github.com/github/git-sizer) | `Go` | `MIT` | Compute various size metrics for a Git repository to detect large files, bloated commits, or excessive branches. | [GitHub](https://github.com/github/git-sizer) |
| [**cz-cli**](https://github.com/commitizen/cz-cli) | `JavaScript` | `MIT` | The commitizen command line utility that prompts developers for conventional commit messages. | [GitHub](https://github.com/commitizen/cz-cli) |

### <a id="github-workflow-tui"></a>GitHub Workflow & TUI (1)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**gh-dash**](https://github.com/dlvhdr/gh-dash) | `Go` | `MIT` | Beautiful terminal user interface dashboard extension for GitHub CLI to manage pull requests and issues effortlessly. | [GitHub](https://github.com/dlvhdr/gh-dash) |

### <a id="http-network"></a>HTTP & Network (14)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**curlie**](https://github.com/rs/curlie) | `Go` | `MIT` | The power of curl with the ease of use and human-friendly terminal output of HTTPie. | [GitHub](https://github.com/rs/curlie) |
| [**HTTPie**](https://github.com/httpie/cli) | `Python` | `BSD-3-Clause` | Modern, user-friendly command-line HTTP client for API debugging with clean JSON formatting, colorized output, and sessions. | [GitHub](https://github.com/httpie/cli) |
| [**xh**](https://github.com/ducaale/xh) | `Rust` | `MIT` | Friendly and fast tool for sending HTTP requests with intuitive syntax, colorized output, and native curl translation. | [GitHub](https://github.com/ducaale/xh) |
| [**doggo**](https://github.com/mr-karan/doggo) | `Go` | `GPL-3.0` | Modern command-line DNS client with colorful output, support for DoH, DoT, and DNSCrypt protocols. | [GitHub](https://github.com/mr-karan/doggo) |
| [**gping**](https://github.com/orf/gping) | `Rust` | `MIT` | Ping, but with a live line graph rendering network latency trends right inside your terminal. | [GitHub](https://github.com/orf/gping) |
| [**bandwhich**](https://github.com/imsnif/bandwhich) | `Rust` | `MIT` | Terminal bandwidth utilization tool that sniffs network packets to determine process bandwidth usage. | [GitHub](https://github.com/imsnif/bandwhich) |
| [**aria2**](https://github.com/aria2/aria2) | `C++` | `GPL-2.0` | Ultra-fast multi-protocol and multi-source command-line download utility (HTTP, HTTPS, FTP, BitTorrent). | [GitHub](https://github.com/aria2/aria2) |
| [**croc**](https://github.com/schollz/croc) | `Go` | `MIT` | Easily and securely send files or folders between any two computers using relay and end-to-end encryption. | [GitHub](https://github.com/schollz/croc) |
| [**magic-wormhole**](https://github.com/magic-wormhole/magic-wormhole) | `Python` | `MIT` | Securely get things from one computer to another using short, human-pronounceable one-time codes. | [GitHub](https://github.com/magic-wormhole/magic-wormhole) |
| [**trippy**](https://github.com/fujiapple852/trippy) | `Rust` | `Apache-2.0` | A network diagnostic tool combining the functionality of traceroute and ping with interactive TUI. | [GitHub](https://github.com/fujiapple852/trippy) |
| [**mitmproxy**](https://github.com/mitmproxy/mitmproxy) | `Python` | `MIT` | An interactive, SSL-capable intercepting HTTP proxy for penetration testers and software developers. | [GitHub](https://github.com/mitmproxy/mitmproxy) |
| [**websocat**](https://github.com/vi/websocat) | `Rust` | `MIT` | Command-line client for WebSockets, like netcat or curl for ws:// and wss:// endpoints. | [GitHub](https://github.com/vi/websocat) |
| [**grpcurl**](https://github.com/fullstorydev/grpcurl) | `Go` | `MIT` | Like cURL, but for gRPC: command-line tool that lets you interact with gRPC servers via reflection. | [GitHub](https://github.com/fullstorydev/grpcurl) |
| [**speedtest-cli**](https://github.com/sivel/speedtest-cli) | `Python` | `Apache-2.0` | Command line interface for testing internet bandwidth using speedtest.net servers without flash/browser. | [GitHub](https://github.com/sivel/speedtest-cli) |

### <a id="os-hardware-utilities"></a>OS & Hardware Utilities (12)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**⭐ FlashLane**](https://github.com/RitualDev-Lab/FlashLane) | `TypeScript / Electron` | `MIT` | Universal, high-speed bootable ISO/IMG USB writer with Rufus parity for Windows, macOS, and Linux. Streaming 4MB chunks, MBR/GPT, BIOS/UEFI, and simulation mode. | [GitHub](https://github.com/RitualDev-Lab/FlashLane) |
| [**btop**](https://github.com/aristocratos/btop) | `C++` | `Apache-2.0` | Resource monitor that shows usage and stats for processor, memory, disks, network, and processes with responsive graphs. | [GitHub](https://github.com/aristocratos/btop) |
| [**duf**](https://github.com/muesli/duf) | `Go` | `MIT` | Disk Usage/Free utility, a colorful and user-friendly modern replacement for df. | [GitHub](https://github.com/muesli/duf) |
| [**htop**](https://github.com/htop-dev/htop) | `C` | `GPL-2.0` | Interactive cross-platform process viewer with colorful meters and process tree view. | [GitHub](https://github.com/htop-dev/htop) |
| [**glances**](https://github.com/nicolargo/glances) | `Python` | `LGPL-3.0` | Cross-platform system monitoring tool with web interface and REST API export. | [GitHub](https://github.com/nicolargo/glances) |
| [**fastfetch**](https://github.com/fastfetch-cli/fastfetch) | `C` | `MIT` | Neofetch-like tool for fetching system information and displaying it prettily, written in pure C. | [GitHub](https://github.com/fastfetch-cli/fastfetch) |
| [**ncdu**](https://code.blicky.net/yorhel/ncdu) | `C` | `MIT` | Disk usage analyzer with an ncurses interface, designed to find space hogs on remote servers. | [GitHub](https://code.blicky.net/yorhel/ncdu) |
| [**gdu**](https://github.com/dundee/gdu) | `Go` | `MIT` | Fast console disk usage analyzer with console GUI written in Go, specifically optimized for SSDs. | [GitHub](https://github.com/dundee/gdu) |
| [**zenith**](https://github.com/bvaisvil/zenith) | `Rust` | `MIT` | Terminal system monitor with zooming, historical graphs, process trees, and disk/network I/O tracking. | [GitHub](https://github.com/bvaisvil/zenith) |
| [**diskonaut**](https://github.com/imsnif/diskonaut) | `Rust` | `MIT` | Terminal visual disk space navigator that visually maps out filesystems to locate large directories. | [GitHub](https://github.com/imsnif/diskonaut) |
| [**inxi**](https://github.com/smxi/inxi) | `Perl` | `GPL-3.0` | Full featured CLI system information tool designed for troubleshooting hardware and system configurations. | [GitHub](https://github.com/smxi/inxi) |
| [**LeanFPS**](https://github.com/Jamailar/leanfps) | `Rust` | `MIT` | Open-source Windows performance utility built in Rust and egui. Features game detection, ETW FPS recording, safe tweak undo, and crash recovery without modifying game files. | [GitHub](https://github.com/Jamailar/leanfps) |

### <a id="system-process-monitoring"></a>System & Process Monitoring (2)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**procs**](https://github.com/dalance/procs) | `Rust` | `MIT` | A modern replacement for ps with color highlighting, multi-column search, and process tree view. | [GitHub](https://github.com/dalance/procs) |
| [**bottom**](https://github.com/ClementTsang/bottom) | `Rust` | `MIT` | Cross-platform graphical process and system monitor with customizable terminal charts and widgets. | [GitHub](https://github.com/ClementTsang/bottom) |

### <a id="terminal-search"></a>Terminal & Search (9)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**ripgrep**](https://github.com/BurntSushi/ripgrep) | `Rust` | `MIT / UNLICENSE` | Ultra-fast line-oriented search tool that recursively searches directories for a regex pattern while respecting gitignore. | [GitHub](https://github.com/BurntSushi/ripgrep) |
| [**fd**](https://github.com/sharkdp/fd) | `Rust` | `Apache-2.0 / MIT` | A simple, fast, and user-friendly alternative to find with intuitive syntax and colorized terminal output. | [GitHub](https://github.com/sharkdp/fd) |
| [**sd**](https://github.com/chmln/sd) | `Rust` | `MIT` | Intuitive find & replace CLI, modern replacement for sed with regex and smart case support. | [GitHub](https://github.com/chmln/sd) |
| [**jq**](https://github.com/jqlang/jq) | `C` | `MIT` | Command-line JSON processor: flexible, lightweight, and powerful slice, filter, and map utility. | [GitHub](https://github.com/jqlang/jq) |
| [**yq**](https://github.com/mikefarah/yq) | `Go` | `MIT` | Portable command-line YAML, JSON, XML, CSV, and properties processor written in Go. | [GitHub](https://github.com/mikefarah/yq) |
| [**miller**](https://github.com/johnkerl/miller) | `Go` | `BSD-2-Clause` | Miller is like awk, sed, cut, join, and sort for name-indexed data such as CSV, TSV, and JSON. | [GitHub](https://github.com/johnkerl/miller) |
| [**csvkit**](https://github.com/wireservice/csvkit) | `Python` | `MIT` | A suite of command-line tools for converting to and working with CSV, the king of tabular formats. | [GitHub](https://github.com/wireservice/csvkit) |
| [**dasel**](https://github.com/TomWright/dasel) | `Go` | `MIT` | Query and update data structures using selectors from the command line across JSON, YAML, TOML, and XML. | [GitHub](https://github.com/TomWright/dasel) |
| [**q**](https://github.com/harelba/q) | `Python` | `GPL-3.0` | Execute SQL-like queries directly on CSV, TSV, and tabular text files without loading into a database. | [GitHub](https://github.com/harelba/q) |

### <a id="terminal-shell"></a>Terminal & Shell (23)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**eza**](https://github.com/eza-community/eza) | `Rust` | `EUPL-1.2` | A modern, maintained replacement for ls with colors, git status integration, icons, and tree views. | [GitHub](https://github.com/eza-community/eza) |
| [**fzf**](https://github.com/junegunn/fzf) | `Go` | `MIT` | General-purpose command-line fuzzy finder with blazing speed and interactive shell bindings. | [GitHub](https://github.com/junegunn/fzf) |
| [**bat**](https://github.com/sharkdp/bat) | `Rust` | `MIT / Apache-2.0` | Cat clone with syntax highlighting and Git integration for dozens of programming languages. | [GitHub](https://github.com/sharkdp/bat) |
| [**Starship**](https://github.com/starship/starship) | `Rust` | `ISC` | The minimal, blazing-fast, and infinitely customizable cross-shell prompt for any shell (Bash, Zsh, Fish, PowerShell). | [GitHub](https://github.com/starship/starship) |
| [**tokei**](https://github.com/XAMPPRocky/tokei) | `Rust` | `MIT / Apache-2.0` | Blazingly fast CLI utility that counts code, lines, comments, and blank spaces across hundreds of programming languages. | [GitHub](https://github.com/XAMPPRocky/tokei) |
| [**fx**](https://github.com/antonmedv/fx) | `Go` | `MIT` | Terminal JSON viewer and interactive streaming processor supporting JavaScript, Python, and Ruby one-liners. | [GitHub](https://github.com/antonmedv/fx) |
| [**jless**](https://github.com/PaulJuliusMartinez/jless) | `Rust` | `MIT` | Command-line JSON viewer designed for reading, exploring, and querying JSON objects with Vim-style navigation. | [GitHub](https://github.com/PaulJuliusMartinez/jless) |
| [**gum**](https://github.com/charmbracelet/gum) | `Go` | `MIT` | A tool for glamorous shell scripts with interactive prompts, file pickers, filters, and spin animations. | [GitHub](https://github.com/charmbracelet/gum) |
| [**vhs**](https://github.com/charmbracelet/vhs) | `Go` | `MIT` | Write terminal GIFs as code, automatically testing and generating high-resolution recordings for documentation. | [GitHub](https://github.com/charmbracelet/vhs) |
| [**glow**](https://github.com/charmbracelet/glow) | `Go` | `MIT` | Terminal-based markdown reader designed for reading documentation directly in the shell with beautiful formatting. | [GitHub](https://github.com/charmbracelet/glow) |
| [**choose**](https://github.com/theryangeary/choose) | `Rust` | `GPL-3.0` | Human-friendly, fast alternative to cut and awk with intuitive zero-indexed field selection. | [GitHub](https://github.com/theryangeary/choose) |
| [**mcfly**](https://github.com/cantino/mcfly) | `Rust` | `MIT` | Neural network-powered shell history search that prioritizes commands by directory context and exit status. | [GitHub](https://github.com/cantino/mcfly) |
| [**yazi**](https://github.com/sxyazi/yazi) | `Rust` | `MIT` | Blazingly fast terminal file manager written in Rust, based on async I/O with image preview support. | [GitHub](https://github.com/sxyazi/yazi) |
| [**zellij**](https://github.com/zellij-org/zellij) | `Rust` | `MIT` | A terminal workspace and multiplexer with batteries included, floating panes, and WebAssembly plugin system. | [GitHub](https://github.com/zellij-org/zellij) |
| [**nnn**](https://github.com/jarun/nnn) | `C` | `BSD-2-Clause` | Tiny, lightning-fast terminal file manager with disk usage analyzer, batch renamer, and app launcher. | [GitHub](https://github.com/jarun/nnn) |
| [**ranger**](https://github.com/ranger/ranger) | `Python` | `GPL-3.0` | VIM-inspired console file manager with multi-column display and automatic file preview. | [GitHub](https://github.com/ranger/ranger) |
| [**broot**](https://github.com/Canop/broot) | `Rust` | `MIT` | A new way to see and navigate directory trees, find files, and launch commands quickly. | [GitHub](https://github.com/Canop/broot) |
| [**superfile**](https://github.com/yorukot/superfile) | `Go` | `MIT` | Fancy and modern terminal file manager with sleek UI, file previews, and keyboard navigation. | [GitHub](https://github.com/yorukot/superfile) |
| [**tmux**](https://github.com/tmux/tmux) | `C` | `ISC` | Terminal multiplexer that lets you switch easily between several programs in one terminal and detach sessions. | [GitHub](https://github.com/tmux/tmux) |
| [**atuin**](https://github.com/atuinsh/atuin) | `Rust` | `MIT` | Magical shell history sync and search tool with SQLite database backing and end-to-end encryption. | [GitHub](https://github.com/atuinsh/atuin) |
| [**thefuck**](https://github.com/nvbn/thefuck) | `Python` | `MIT` | Magnificent app that corrects errors in your previous console commands automatically. | [GitHub](https://github.com/nvbn/thefuck) |
| [**direnv**](https://github.com/direnv/direnv) | `Go` | `MIT` | Unclutter your .profile by loading and unloading environment variables depending on the current directory. | [GitHub](https://github.com/direnv/direnv) |
| [**lf**](https://github.com/gokcehan/lf) | `Go` | `MIT` | Terminal file manager written in Go, heavily inspired by ranger with faster startup and server/client architecture. | [GitHub](https://github.com/gokcehan/lf) |

### <a id="terminal-navigation"></a>Terminal Navigation (1)

| Tool | Language | License | Description | Links |
| :--- | :---: | :---: | :--- | :---: |
| [**zoxide**](https://github.com/ajeetdsouza/zoxide) | `Rust` | `MIT` | Smarter cd command inspired by z and autojump: learns your navigation habits to jump to directories in fewer keystrokes. | [GitHub](https://github.com/ajeetdsouza/zoxide) |

