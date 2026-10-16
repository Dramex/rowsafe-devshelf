import * as vscode from "vscode";
import {
  type ExtensionUiAdapter,
  executeRandomFlow,
  executeSearchFlow,
} from "./client.js";

export * from "./client.js";

/**
 * Creates the production VS Code UI adapter delegating to the vscode API
 */
export function createVsCodeAdapter(): ExtensionUiAdapter {
  return {
    withProgress: (options, task) =>
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: options.title,
          cancellable: options.cancellable ?? false,
        },
        task
      ),
    showQuickPick: (items, options) => vscode.window.showQuickPick(items, options),
    showInformationMessage: (message, ...items) =>
      vscode.window.showInformationMessage(message, ...items),
    showErrorMessage: (message, ...items) =>
      vscode.window.showErrorMessage(message, ...items),
    openExternal: async (target) => {
      return await vscode.env.openExternal(vscode.Uri.parse(target));
    },
    writeClipboard: (text) => vscode.env.clipboard.writeText(text),
  };
}

export function activate(context: vscode.ExtensionContext) {
  const ui = createVsCodeAdapter();

  const searchCommand = vscode.commands.registerCommand("devshelf.search", async () => {
    await executeSearchFlow(ui);
  });

  const randomCommand = vscode.commands.registerCommand("devshelf.random", async () => {
    await executeRandomFlow(ui);
  });

  context.subscriptions.push(searchCommand, randomCommand);
}

export function deactivate() {}
