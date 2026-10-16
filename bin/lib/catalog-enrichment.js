/**
 * DevShelf Catalog Enrichment Data
 * High-intent "Alternative to [Paid Tool]" mappings and "Self-Host in 60s" Docker Compose recipes.
 */
export const ALTERNATIVES_MAP = {
    // APIs & Testing
    Bruno: "Postman",
    Hoppscotch: "Postman",
    Mockoon: "Postman Mock Server",
    Newman: "Postman CLI",
    k6: "LoadRunner / Gatling Enterprise",
    Locust: "LoadRunner / Artillery Pro",
    wrk: "LoadRunner",
    WireMock: "Postman Mock Server",
    Prism: "Stoplight / Postman Mocks",
    Schemathesis: "API Fuzzing Commercial Tools",
    "Karate Framework": "Postman / RestAssured",
    PactumJS: "Postman / Newman",
    RestAssured: "Commercial API Testers",
    "MSW (Mock Service Worker)": "Postman Mocks",
    // Monitoring & Observability
    "Uptime Kuma": "Datadog / Better Uptime",
    GlitchTip: "Datadog / Sentry SaaS",
    Prometheus: "Datadog Metrics",
    Loki: "Datadog Logs / Splunk",
    "Sentry for Open Source": "Datadog APM / Bugsnag",
    PostHog: "Mixpanel / Segment / Amplitude",
    Umami: "Google Analytics",
    "Plausible Analytics Self-Hosted": "Google Analytics",
    // Hosting, Cloud & Deployments
    Coolify: "Vercel / Heroku",
    Dokku: "Heroku / Vercel",
    "Portainer Community": "Docker Desktop GUI",
    lazydocker: "Docker Desktop",
    CasaOS: "Docker Desktop / Umbrel",
    "Nginx Proxy Manager": "Cloudflare Pro / Traefik Enterprise",
    "Traefik Community": "NGINX Plus / AWS ALB",
    Koyeb: "Heroku / Render Paid",
    Render: "Heroku",
    Railway: "Heroku",
    "Vercel for Open Source": "AWS Amplify",
    "Netlify for Open Source": "AWS Amplify",
    // Databases & Backend-as-a-Service
    Supabase: "Firebase / AWS RDS",
    PocketBase: "Firebase",
    "PocketBase 1-Click Backend": "Firebase",
    Appwrite: "Firebase",
    Keycloak: "Auth0 / Okta",
    SuperTokens: "Auth0 / Clerk",
    Zitadel: "Auth0 / Okta",
    Logto: "Auth0 / Clerk",
    Lucia: "Auth0",
    "Ory Kratos": "Auth0 / AWS Cognito",
    MinIO: "AWS S3",
    "Scaleway Stardust Object Storage": "AWS S3",
    Upstash: "Redis Enterprise / AWS DynamoDB",
    "Redis Cloud": "AWS ElastiCache",
    Neon: "AWS Aurora Serverless",
    Turso: "PlanetScale",
    "TiDB Serverless": "Google Cloud Spanner",
    "MongoDB Atlas": "AWS DocumentDB",
    Qdrant: "Pinecone",
    "Qdrant Cloud": "Pinecone",
    Milvus: "Pinecone",
    Weaviate: "Pinecone",
    LanceDB: "Pinecone",
    pgvector: "Pinecone / Weaviate Cloud",
    Meilisearch: "Algolia",
    Typesense: "Algolia",
    // AI & Local LLMs
    Ollama: "GitHub Copilot / OpenAI API",
    LocalAI: "OpenAI API",
    "Open WebUI": "ChatGPT Plus",
    LibreChat: "ChatGPT Plus / Claude Pro",
    OpenCodeInterpreter: "GitHub Copilot",
    Tabby: "GitHub Copilot",
    OpenHands: "Devin / Copilot Workspace",
    "SWE-agent": "Devin AI",
    MetaGPT: "Devin AI",
    SuperAGI: "AutoGPT Enterprise",
    AnythingLLM: "Chatbase / TypingMind",
    PrivateGPT: "ChatGPT Enterprise",
    Khoj: "Rewind AI / Notion AI",
    Mem0: "Zep Memory",
    Promptfoo: "LangSmith",
    Ragas: "Arize Phoenix",
    Unsloth: "Anyscale / RunPod",
    vLLM: "Triton Inference Server",
    SGLang: "vLLM / TensorRT-LLM",
    "TensorRT-LLM": "NVIDIA AI Enterprise",
    "TGI (Text Generation Inference)": "Triton Inference Server",
    "Piper TTS": "ElevenLabs",
    "Kokoro TTS": "ElevenLabs",
    "Whisper.cpp": "OpenAI Whisper API",
    PaddleOCR: "Google Cloud Vision OCR",
    RAGFlow: "Dify Enterprise",
    Langflow: "Flowise / Dify",
    LangChain: "LlamaIndex Enterprise",
    // Developer Productivity & Utilities
    "Stirling-PDF Ultimate Toolbox": "Adobe Acrobat DC ($20/mo)",
    Twenty: "Salesforce / HubSpot CRM",
    SearXNG: "Google Custom Search API",
    Zed: "Cursor / Sublime Text",
    Wezterm: "iTerm2 / Warp Pro",
    Starship: "Oh My Zsh",
    Superfile: "TotalFinder / Directory Opus",
    Yazi: "Mac Finder / TotalFinder",
    Ripgrep: "Grep",
    Bat: "Cat",
    Eza: "Ls",
    Zoxide: "Autojump",
    Fzf: "Command-T / QuickOpen",
    Btop: "Activity Monitor / Datadog Agent",
    Ncdu: "Disk Inventory X / DaisyDisk",
    Duf: "Df Command",
    Mcfly: "Shell History Pro",
    TheFuck: "Shell Error Corrector",
    Tokei: "CLOC Enterprise",
    Onefetch: "Neofetch Pro",
    Trippy: "Traceroute Pro",
    Xh: "HTTPie / Postman CLI",
    Ushell: "Zsh / Bash",
    Nushell: "PowerShell / Zsh",
    Volta: "NVM",
    Mise: "ASDF",
    Kind: "EKS / GKE Local",
    Minikube: "Docker Desktop Kubernetes",
    K9s: "Lens Kubernetes IDE",
    Stern: "Kubernetes Log Viewers",
    Kubectx: "Kubernetes Context Switchers",
    // Security & Code Quality
    Trivy: "Snyk Container",
    Semgrep: "Veracode / Checkmarx",
    "Sonarqube Community": "Snyk Code / Veracode",
    TruffleHog: "GitGuardian",
    "OSV-Scanner": "Snyk Open Source",
    "OWASP ZAP": "Burp Suite Professional",
    Mitmproxy: "Charles Proxy / Fiddler Everywhere",
    Nuclei: "Acunetix / Nessus Scanner",
    Vale: "Grammarly Business",
    Hadolint: "Docker Linter Pro",
    Checkov: "Bridgecrew / Prisma Cloud",
    // Full-Stack Templates & Boilerplates
    "Nextjs Enterprise Boilerplate": "ShipFast ($199)",
    "Next-Forge": "ShipFast ($199)",
    "SaaS Boilerplate by BoxyHQ": "ShipFast ($199)",
    "Shadcn Taxonomy": "Tailwind UI ($299)",
    Refine: "Retool Enterprise",
    Medusa: "Shopify Plus ($2000/mo)",
    "Payload CMS Starter": "Contentful / Sanity Pro",
    Strapi: "Contentful / Strapi Cloud",
    "FastAPI Full Stack Template": "SaaS Boilerplate Paid",
    "Full-Stack FastAPI Template": "SaaS Boilerplate Paid",
    "Tauri App Starter": "Electron Pro",
    Vitesse: "Vite Commercial Templates",
};
export const DOCKER_RECIPES = {
    PocketBase: `services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    container_name: pocketbase
    restart: unless-stopped
    ports:
      - "8090:8090"
    volumes:
      - ./pb_data:/pb/pb_data`,
    "PocketBase 1-Click Backend": `services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    container_name: pocketbase
    restart: unless-stopped
    ports:
      - "8090:8090"
    volumes:
      - ./pb_data:/pb/pb_data`,
    "Uptime Kuma": `services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    restart: always
    ports:
      - "3001:3001"
    volumes:
      - ./uptime-kuma-data:/app/data`,
    Meilisearch: `services:
  meilisearch:
    image: getmeili/meilisearch:latest
    container_name: meilisearch
    restart: unless-stopped
    ports:
      - "7700:7700"
    environment:
      - MEILI_MASTER_KEY=masterKey123
    volumes:
      - ./meili_data:/meili_data`,
    "Stirling-PDF Ultimate Toolbox": `services:
  stirling-pdf:
    image: frooodle/s-pdf:latest
    container_name: stirling-pdf
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./trainingData:/usr/share/tessdata
      - ./extraConfigs:/configs
    environment:
      - DOCKER_ENABLE_SECURITY=false`,
    MinIO: `services:
  minio:
    image: minio/minio:latest
    container_name: minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=admin
      - MINIO_ROOT_PASSWORD=password123
    volumes:
      - ./minio_data:/data`,
    SearXNG: `services:
  searxng:
    image: searxng/searxng:latest
    container_name: searxng
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./searxng:/etc/searxng`,
    PostHog: `services:
  posthog:
    image: posthog/posthog:latest
    container_name: posthog
    restart: unless-stopped
    ports:
      - "8000:8000"`,
    Umami: `services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    container_name: umami
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://umami:umami@db:5432/umami
      - DATABASE_TYPE=postgresql
      - APP_SECRET=devshelf-secret-replace-me`,
    "Plausible Analytics Self-Hosted": `services:
  plausible:
    image: ghcr.io/plausible/community-edition:latest
    container_name: plausible
    restart: unless-stopped
    ports:
      - "8000:8000"`,
    Ollama: `services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama:/root/.ollama

volumes:
  ollama:`,
    Typesense: `services:
  typesense:
    image: typesense/typesense:26.0
    container_name: typesense
    restart: unless-stopped
    ports:
      - "8108:8108"
    volumes:
      - ./typesense_data:/data
    command: '--data-dir /data --api-key=xyz --enable-cors'`,
    Keycloak: `services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: keycloak
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
    command: start-dev`,
    SuperTokens: `services:
  supertokens:
    image: registry.supertokens.io/supertokens/supertokens-postgresql:latest
    container_name: supertokens
    ports:
      - "3567:3567"`,
    "Open WebUI": `services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    restart: unless-stopped
    ports:
      - "3000:8080"
    volumes:
      - open-webui:/app/backend/data

volumes:
  open-webui:`,
    LibreChat: `services:
  librechat:
    image: ghcr.io/danny-avila/librechat:latest
    container_name: librechat
    restart: unless-stopped
    ports:
      - "3080:3080"`,
    LocalAI: `services:
  localai:
    image: localai/localai:latest
    container_name: localai
    restart: unless-stopped
    ports:
      - "8080:8080"`,
    "Portainer Community": `services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: always
    ports:
      - "9000:9000"
      - "9443:9443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data

volumes:
  portainer_data:`,
    "Nginx Proxy Manager": `services:
  app:
    image: jc21/nginx-proxy-manager:latest
    container_name: npm
    restart: unless-stopped
    ports:
      - '80:80'
      - '81:81'
      - '443:443'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt`,
    Twenty: `services:
  twenty:
    image: twentycrm/twenty:latest
    container_name: twenty
    restart: unless-stopped
    ports:
      - "3000:3000"`,
    Hoppscotch: `services:
  hoppscotch:
    image: hoppscotch/hoppscotch:latest
    container_name: hoppscotch
    restart: unless-stopped
    ports:
      - "3000:3000"`,
    GlitchTip: `services:
  glitchtip:
    image: glitchtip/glitchtip:latest
    container_name: glitchtip
    restart: unless-stopped
    ports:
      - "8000:8000"`,
    Prometheus: `services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"`,
    Qdrant: `services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: qdrant
    restart: unless-stopped
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_storage:/qdrant/storage`,
    "Qdrant Cloud": `services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: qdrant
    restart: unless-stopped
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_storage:/qdrant/storage`,
    Zitadel: `services:
  zitadel:
    image: ghcr.io/zitadel/zitadel:latest
    container_name: zitadel
    ports:
      - "8080:8080"
    command: 'start-from-init --masterkey "MasterkeyNeedsToHave32Characters" --tlsMode disabled'`,
    WireMock: `services:
  wiremock:
    image: wiremock/wiremock:latest
    container_name: wiremock
    restart: unless-stopped
    ports:
      - "8080:8080"`,
    Mockoon: `services:
  mockoon:
    image: mockoon/cli:latest
    container_name: mockoon
    ports:
      - "3000:3000"`,
    Supabase: `services:
  supabase-db:
    image: supabase/postgres:15.1.1.78
    container_name: supabase-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: postgres`,
    Coolify: `# 60-Second Coolify Quick-Install
# Run in bash:
# curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`,
    Dokku: `# 60-Second Dokku Quick-Install
# Run in bash:
# wget -NP . https://dokku.com/bootstrap.sh && sudo DOKKU_TAG=v0.34.8 bash bootstrap.sh`,
};
export function getAlternativeTo(name) {
    if (!name)
        return undefined;
    if (ALTERNATIVES_MAP[name])
        return ALTERNATIVES_MAP[name];
    const lower = name.toLowerCase().trim();
    for (const [key, val] of Object.entries(ALTERNATIVES_MAP)) {
        if (key.toLowerCase().trim() === lower)
            return val;
    }
    return undefined;
}
export function getDockerCompose(name) {
    if (!name)
        return undefined;
    if (DOCKER_RECIPES[name])
        return DOCKER_RECIPES[name];
    const lower = name.toLowerCase().trim();
    for (const [key, val] of Object.entries(DOCKER_RECIPES)) {
        if (key.toLowerCase().trim() === lower)
            return val;
    }
    return undefined;
}
