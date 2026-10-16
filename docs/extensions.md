# 🧩 DevShelf Extensions (Raycast & VS Code)

DevShelf brings 530+ curated developer tools and verified free APIs directly into your workflow via native launcher and IDE extensions.

---

## ⚡ 1. Raycast Extension

Search and roll random developer tools right from the Raycast spotlight bar.

- **Directory**: [`extensions/raycast/`](../extensions/raycast/)
- **Commands**:
  - `Search Developer Tools & APIs`: Filter across 530+ free resources with instant copy actions.
  - `Random Free Developer Gem`: Roll a random verified open-source tool.
  - Hotkey `Cmd+Shift+B` to instantly copy your project's "Featured on DevShelf" README badge.

### Getting Started with Raycast
```bash
cd extensions/raycast
npm install
npm run dev
```

---

## 💻 2. Visual Studio Code Extension

Find tools, mock APIs, and terminal utilities without leaving your editor.

- **Directory**: [`extensions/vscode/`](../extensions/vscode/)
- **Commands**:
  - `DevShelf: Search Free Developer Tools & APIs` (`Ctrl+Shift+P` / `Cmd+Shift+P`)
  - `DevShelf: Pick a Random Free Tool`

### Getting Started with VS Code
```bash
cd extensions/vscode
npm install
npm run compile
```

---

## 🌐 Powered by DevShelf Public API v1
Both extensions are built entirely on top of the open, zero-authentication [DevShelf Public REST API v1](api.md). Anyone can build their own Alfred, Raycast, Neovim, or browser extensions using our endpoints!
