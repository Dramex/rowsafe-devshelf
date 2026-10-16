export interface ToolItem {
  name: string;
  url?: string;
  repo?: string;
  category?: string;
  description: string;
  freeTier?: string;
  language?: string;
}

export interface ApiResponse {
  totalCount: number;
  tools: ToolItem[];
}

export const DEFAULT_API_URL = "https://devshelf.ritualdev.in/api/v1/tools.json";
export const DEFAULT_TIMEOUT_MS = 8000;

export interface QuickPickOptionItem {
  label: string;
  description?: string;
  detail?: string;
  rawTool: ToolItem;
}

export interface ExtensionUiAdapter {
  withProgress<R>(
    options: { location?: number; title: string; cancellable?: boolean },
    task: (
      progress: { report: (value: { message?: string; increment?: number }) => void }
    ) => Promise<R>
  ): Promise<R>;
  showQuickPick(
    items: QuickPickOptionItem[],
    options?: {
      placeHolder?: string;
      matchOnDescription?: boolean;
      matchOnDetail?: boolean;
    }
  ): Promise<QuickPickOptionItem | undefined>;
  showInformationMessage(
    message: string,
    ...items: string[]
  ): Promise<string | undefined>;
  showErrorMessage(
    message: string,
    ...items: string[]
  ): Promise<string | undefined>;
  openExternal(target: string): Promise<boolean>;
  writeClipboard(text: string): Promise<void>;
}

/**
 * Robust HTTP client for DevShelf API catalog retrieval
 */
export async function fetchDevShelfTools(
  apiUrl: string = DEFAULT_API_URL,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  fetchFn: typeof fetch = fetch
): Promise<ApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Connection timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  try {
    const res = await fetchFn(apiUrl, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`API responded with HTTP ${res.status}: ${res.statusText || "Request failed"}`);
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new Error("Invalid response format: Failed to parse catalog JSON.");
    }

    if (!data || typeof data !== "object") {
      throw new Error("Malformed API response: Expected JSON object.");
    }

    const payload = data as Record<string, unknown>;
    if (!Array.isArray(payload.tools)) {
      throw new Error("Malformed API response: 'tools' must be an array.");
    }

    return payload as unknown as ApiResponse;
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    if (error?.name === "AbortError") {
      throw new Error(`DevShelf API request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Executes the interactive search flow with error boundary and retry capabilities
 */
export async function executeSearchFlow(
  ui: ExtensionUiAdapter,
  options?: {
    apiUrl?: string;
    timeoutMs?: number;
    fetchFn?: typeof fetch;
  }
): Promise<void> {
  const apiUrl = options?.apiUrl || DEFAULT_API_URL;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchFn = options?.fetchFn || fetch;

  let shouldRetry = true;

  while (shouldRetry) {
    shouldRetry = false;
    try {
      // Must await withProgress to ensure errors are captured by try/catch
      await ui.withProgress(
        {
          title: "DevShelf: Fetching 500+ curated developer tools...",
          cancellable: false,
        },
        async () => {
          const data = await fetchDevShelfTools(apiUrl, timeoutMs, fetchFn);

          if (!data.tools || data.tools.length === 0) {
            await ui.showInformationMessage("DevShelf: No tools found in catalog.");
            return;
          }

          const quickPickItems: QuickPickOptionItem[] = data.tools.map((tool) => ({
            label: `$(symbol-keyword) ${tool.name}`,
            description: tool.category || "Developer Tool",
            detail: tool.description,
            rawTool: tool,
          }));

          const selected = await ui.showQuickPick(quickPickItems, {
            placeHolder: "Type to search free APIs, AI agents, CLI tools, testing suites...",
            matchOnDescription: true,
            matchOnDetail: true,
          });

          if (selected) {
            const tool = selected.rawTool;
            const targetUrl = tool.repo || tool.url || "https://devshelf.ritualdev.in";
            const action = await ui.showInformationMessage(
              `${tool.name}: ${tool.description}`,
              "Open URL",
              "Copy URL",
              "Copy README Badge"
            );

            if (action === "Open URL") {
              await ui.openExternal(targetUrl);
            } else if (action === "Copy URL") {
              await ui.writeClipboard(targetUrl);
              await ui.showInformationMessage(`Copied ${targetUrl} to clipboard!`);
            } else if (action === "Copy README Badge") {
              const badge = `[![Featured on DevShelf](https://img.shields.io/badge/Featured%20on-DevShelf-7928CA?style=for-the-badge&logo=googlechrome&logoColor=white)](https://devshelf.ritualdev.in/)`;
              await ui.writeClipboard(badge);
              await ui.showInformationMessage("Copied DevShelf Markdown badge to clipboard!");
            }
          }
        }
      );
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error?.message || "Unknown error occurred while contacting DevShelf API.";
      const action = await ui.showErrorMessage(
        `DevShelf Error: ${errorMessage}`,
        "Retry",
        "Open Website"
      );

      if (action === "Retry") {
        shouldRetry = true;
      } else if (action === "Open Website") {
        await ui.openExternal("https://devshelf.ritualdev.in");
      }
    }
  }
}

/**
 * Executes the random tool selection flow with error handling
 */
export async function executeRandomFlow(
  ui: ExtensionUiAdapter,
  options?: {
    apiUrl?: string;
    timeoutMs?: number;
    fetchFn?: typeof fetch;
  }
): Promise<void> {
  const apiUrl = options?.apiUrl || DEFAULT_API_URL;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchFn = options?.fetchFn || fetch;

  let shouldRetry = true;

  while (shouldRetry) {
    shouldRetry = false;
    try {
      const data = await fetchDevShelfTools(apiUrl, timeoutMs, fetchFn);

      if (!data.tools || data.tools.length === 0) {
        await ui.showInformationMessage("DevShelf: No tools available in catalog.");
        return;
      }

      const tool = data.tools[Math.floor(Math.random() * data.tools.length)];
      if (tool) {
        const targetUrl = tool.repo || tool.url || "https://devshelf.ritualdev.in";
        const action = await ui.showInformationMessage(
          `🎲 Random Pick: ${tool.name} (${tool.category || "Tool"})\n${tool.description}`,
          "Open URL",
          "Copy URL"
        );

        if (action === "Open URL") {
          await ui.openExternal(targetUrl);
        } else if (action === "Copy URL") {
          await ui.writeClipboard(targetUrl);
        }
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage = error?.message || "Failed to retrieve random tool.";
      const action = await ui.showErrorMessage(
        `DevShelf Error: ${errorMessage}`,
        "Retry",
        "Open Website"
      );

      if (action === "Retry") {
        shouldRetry = true;
      } else if (action === "Open Website") {
        await ui.openExternal("https://devshelf.ritualdev.in");
      }
    }
  }
}
