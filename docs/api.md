# ⚡ DevShelf Public API (v1)

The **DevShelf Public REST API** provides open, programmatic access to the entire curated catalog of 530+ verified developer tools, free APIs, AI frameworks, CLI utilities, and developer perks.

- **No API Key Required**: Instant access with zero registration.
- **100% CORS Enabled**: Query directly from client-side SPAs, browser extensions, or edge workers.
- **Edge-Cached & Fast**: Hosted on high-performance static CDN infrastructure.
- **Zero Paywalls**: Every listed item is verified free or open source.

---

## 📡 API Base URL

```text
https://devshelf.ritualdev.in/api/v1
```

---

## 🗃️ Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | [`/tools.json`](https://devshelf.ritualdev.in/api/v1/tools.json) | Retrieve all 530+ curated developer tools and APIs |
| `GET` | [`/stats.json`](https://devshelf.ritualdev.in/api/v1/stats.json) | Get real-time catalog telemetry and category counts |
| `GET` | [`/categories.json`](https://devshelf.ritualdev.in/api/v1/categories.json) | List all available categories and dedicated endpoints |
| `GET` | [`/categories/:slug.json`](https://devshelf.ritualdev.in/api/v1/categories/ai.json) | Query items for a specific category (`ai`, `cli`, `apis`, `cloud`, etc.) |

---

## 1. 📦 All Tools Endpoint

### Request
```bash
curl -s https://devshelf.ritualdev.in/api/v1/tools.json
```

### Response Schema (`200 OK`)
```json
{
  "version": "1.0.0",
  "docs": "https://devshelf.ritualdev.in/docs/api.html",
  "license": "https://github.com/RitualDev-Lab/DevShelf/blob/main/LICENSE",
  "updatedAt": "2026-10-02T19:46:00.000Z",
  "totalCount": 519,
  "tools": [
    {
      "name": "OrkasVideoStudio",
      "repo": "https://github.com/Orkas-AI/Orkas-VideoStudio",
      "category": "CLI & Developer Productivity",
      "description": "Local-first TypeScript CLI and MCP toolkit for coding agents to compose, edit, and assemble videos...",
      "language": "TypeScript",
      "license": "MIT",
      "featured": false,
      "type": "cli",
      "section": "CLI & Productivity Tools"
    }
  ]
}
```

---

## 2. 📊 Catalog Telemetry & Stats

### Request
```bash
curl -s https://devshelf.ritualdev.in/api/v1/stats.json
```

### Response Schema (`200 OK`)
```json
{
  "version": "1.0.0",
  "updatedAt": "2026-10-02T19:46:00.000Z",
  "totalCount": 519,
  "reposCount": 322,
  "categoryCounts": {
    "aiTools": 87,
    "cliTools": 111,
    "testingQa": 62,
    "apis": 96,
    "freeCloud": 71,
    "contributors": 21,
    "perks": 30,
    "boilerplates": 41
  }
}
```

---

## 3. 📂 Categories & Slugs

Available category slugs:
- `ai` &mdash; AI Agents & Local LLMs
- `cli` &mdash; CLI & Developer Productivity
- `apis` &mdash; Free Public APIs
- `cloud` &mdash; Free Cloud & Databases
- `testing` &mdash; Testing & QA Automation
- `perks` &mdash; Developer Perks & Startup Credits
- `boilerplates` &mdash; 1-Click Deploy Boilerplates
- `contributors` &mdash; Contributors Wanted / Up for Grabs

### Example: Fetch all AI Agents & Local LLMs
```bash
curl -s https://devshelf.ritualdev.in/api/v1/categories/ai.json
```

---

## 💻 Code Examples

### JavaScript / TypeScript (Fetch API)
```typescript
async function fetchDevTools() {
  const response = await fetch("https://devshelf.ritualdev.in/api/v1/tools.json");
  const data = await response.json();
  console.log(`Loaded ${data.totalCount} tools from DevShelf!`);
  
  // Filter for tools with docker compose templates
  const selfHostable = data.tools.filter((t: any) => t.dockerCompose);
  console.log(`Found ${selfHostable.length} 60-second self-hostable tools.`);
}

fetchDevTools();
```

### Python
```python
import requests

def search_devshelf(keyword: str):
    res = requests.get("https://devshelf.ritualdev.in/api/v1/tools.json").json()
    matches = [
        t for t in res["tools"]
        if keyword.lower() in t["name"].lower() or keyword.lower() in t["description"].lower()
    ]
    return matches

print(f"Results for 'docker': {len(search_devshelf('docker'))}")
```

---

## 📜 Terms of Use
- **100% Free**: Commercial and non-commercial use is fully permitted.
- **Attribution (Recommended)**: If you build an app, Raycast plugin, or IDE extension powered by DevShelf, please link back to [https://devshelf.ritualdev.in](https://devshelf.ritualdev.in) or display our verified badge.
