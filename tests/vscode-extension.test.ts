import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  type ApiResponse,
  type ExtensionUiAdapter,
  executeRandomFlow,
  executeSearchFlow,
  fetchDevShelfTools,
} from "../extensions/vscode/src/client.js";

describe("VS Code Extension: DevShelf Error Boundary & Resilience Suite (D1)", () => {
  const validMockCatalog: ApiResponse = {
    totalCount: 2,
    tools: [
      {
        name: "DevShelf CLI",
        category: "CLI Tools",
        description: "Zero-paywall curated tools directory in your terminal.",
        url: "https://devshelf.ritualdev.in",
        repo: "https://github.com/RitualDev-Lab/DevShelf",
      },
      {
        name: "Hugging Face APIs",
        category: "Free APIs",
        description: "Free inference endpoints for open-weight machine learning models.",
        url: "https://huggingface.co",
      },
    ],
  };

  test("fetchDevShelfTools parses valid API response successfully", async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify(validMockCatalog), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    const result = await fetchDevShelfTools(
      "https://example.com/api.json",
      5000,
      mockFetch as unknown as typeof fetch
    );

    assert.strictEqual(result.totalCount, 2);
    assert.strictEqual(result.tools.length, 2);
    assert.strictEqual(result.tools[0].name, "DevShelf CLI");
  });

  test("fetchDevShelfTools fails with controlled error on non-200 HTTP response", async () => {
    const mockFetch = async () =>
      new Response("Gateway Timeout", {
        status: 504,
        statusText: "Gateway Timeout",
      });

    await assert.rejects(
      async () => {
        await fetchDevShelfTools(
          "https://example.com/api.json",
          5000,
          mockFetch as unknown as typeof fetch
        );
      },
      {
        name: "Error",
        message: /HTTP 504: Gateway Timeout/,
      }
    );
  });

  test("fetchDevShelfTools fails with controlled error on malformed JSON payload", async () => {
    const mockFetch = async () =>
      new Response("<html><body>502 Bad Gateway</body></html>", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    await assert.rejects(
      async () => {
        await fetchDevShelfTools(
          "https://example.com/api.json",
          5000,
          mockFetch as unknown as typeof fetch
        );
      },
      {
        name: "Error",
        message: /Failed to parse catalog JSON/,
      }
    );
  });

  test("fetchDevShelfTools validates that 'tools' is a valid array", async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify({ totalCount: 0, tools: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    await assert.rejects(
      async () => {
        await fetchDevShelfTools(
          "https://example.com/api.json",
          5000,
          mockFetch as unknown as typeof fetch
        );
      },
      {
        name: "Error",
        message: /'tools' must be an array/,
      }
    );
  });

  test("fetchDevShelfTools aborts and times out on stalled network request", async () => {
    const mockFetch = async (
      _url: string | URL | Request,
      init?: RequestInit
    ) => {
      return new Promise<Response>((_resolve, reject) => {
        if (init?.signal) {
          init.signal.addEventListener("abort", () => {
            const err = new Error("The operation was aborted");
            err.name = "AbortError";
            reject(err);
          });
        }
      });
    };

    await assert.rejects(
      async () => {
        await fetchDevShelfTools(
          "https://example.com/api.json",
          50, // 50ms timeout
          mockFetch as unknown as typeof fetch
        );
      },
      {
        name: "Error",
        message: /DevShelf API request timed out after 50ms/,
      }
    );
  });

  test("executeSearchFlow catches errors inside withProgress and displays controlled error notification", async () => {
    let errorNotificationShown = "";
    let withProgressExecuted = false;

    const mockFetch = async () => {
      return new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      });
    };

    const mockUi: ExtensionUiAdapter = {
      withProgress: async (_options, task) => {
        withProgressExecuted = true;
        return task({ report: () => {} });
      },
      showQuickPick: async () => undefined,
      showInformationMessage: async () => undefined,
      showErrorMessage: async (msg, ..._actions) => {
        errorNotificationShown = msg;
        return undefined; // Dismiss without retry
      },
      openExternal: async () => true,
      writeClipboard: async () => {},
    };

    await executeSearchFlow(mockUi, {
      apiUrl: "https://example.com/api.json",
      timeoutMs: 1000,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    assert.strictEqual(withProgressExecuted, true);
    assert.match(errorNotificationShown, /DevShelf Error: API responded with HTTP 500/);
  });

  test("executeSearchFlow supports user 'Retry' action upon network recovery", async () => {
    let attempts = 0;
    const errorNotifications: string[] = [];

    const mockFetch = async () => {
      attempts++;
      if (attempts === 1) {
        return new Response("Service Unavailable", { status: 503, statusText: "Service Unavailable" });
      }
      return new Response(JSON.stringify(validMockCatalog), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    let quickPickShown = false;

    const mockUi: ExtensionUiAdapter = {
      withProgress: async (_options, task) => {
        return task({ report: () => {} });
      },
      showQuickPick: async (items) => {
        quickPickShown = items.length === 2;
        return undefined; // Close quickpick
      },
      showInformationMessage: async () => undefined,
      showErrorMessage: async (msg, ..._actions) => {
        errorNotifications.push(msg);
        return "Retry"; // User clicks Retry
      },
      openExternal: async () => true,
      writeClipboard: async () => {},
    };

    await executeSearchFlow(mockUi, {
      apiUrl: "https://example.com/api.json",
      timeoutMs: 1000,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    assert.strictEqual(attempts, 2);
    assert.strictEqual(errorNotifications.length, 1);
    assert.match(errorNotifications[0], /HTTP 503/);
    assert.strictEqual(quickPickShown, true);
  });

  test("executeRandomFlow selects a random tool and executes successfully", async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify(validMockCatalog), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    let messageShown = "";
    let openedUrl = "";

    const mockUi: ExtensionUiAdapter = {
      withProgress: async (_options, task) => task({ report: () => {} }),
      showQuickPick: async () => undefined,
      showInformationMessage: async (msg, ..._items) => {
        messageShown = msg;
        return "Open URL";
      },
      showErrorMessage: async () => undefined,
      openExternal: async (url) => {
        openedUrl = url;
        return true;
      },
      writeClipboard: async () => {},
    };

    await executeRandomFlow(mockUi, {
      apiUrl: "https://example.com/api.json",
      timeoutMs: 1000,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    assert.match(messageShown, /🎲 Random Pick:/);
    assert.ok(
      openedUrl === "https://github.com/RitualDev-Lab/DevShelf" ||
        openedUrl === "https://huggingface.co"
    );
  });

  test("executeRandomFlow catches error on broken API response and allows website fallback", async () => {
    const mockFetch = async () =>
      new Response("Internal Server Error", { status: 500, statusText: "Internal Server Error" });

    let errorMessageShown = "";
    let externalOpened = "";

    const mockUi: ExtensionUiAdapter = {
      withProgress: async (_options, task) => task({ report: () => {} }),
      showQuickPick: async () => undefined,
      showInformationMessage: async () => undefined,
      showErrorMessage: async (msg, ..._items) => {
        errorMessageShown = msg;
        return "Open Website";
      },
      openExternal: async (url) => {
        externalOpened = url;
        return true;
      },
      writeClipboard: async () => {},
    };

    await executeRandomFlow(mockUi, {
      apiUrl: "https://example.com/api.json",
      timeoutMs: 1000,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    assert.match(errorMessageShown, /HTTP 500/);
    assert.strictEqual(externalOpened, "https://devshelf.ritualdev.in");
  });
});
