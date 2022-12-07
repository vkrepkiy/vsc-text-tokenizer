import { commands, ExtensionContext, languages, window } from "vscode";
import { generateArrayDocument } from "./commands/generate-results";
import { replaceWithToken } from "./commands/replace-with-token";
import { Command } from "./commands/types";
import { showTokenValue } from "./utils/show-token-value";
import { TmpResultStore } from "./utils/tmp-result-store";

export function activate(context: ExtensionContext) {
  TmpResultStore.initialize(context.workspaceState);

  let replaceWithI18nKeyCmd = commands.registerCommand(
    Command.replaceWithToken,
    async () => {
      await replaceWithToken();
    }
  );

  let generateResultsCmd = commands.registerCommand(
    Command.generateResults,
    async () => {
      await generateArrayDocument();
      TmpResultStore.setEmpty();
    }
  );

  let hoverProvider = languages.registerHoverProvider(
    {
      pattern: "**/*",
    },
    { provideHover: showTokenValue }
  );

  context.subscriptions.push(
    replaceWithI18nKeyCmd,
    generateResultsCmd,
    hoverProvider
  );

  /**
   * Register hover provider
   */
}

export function deactivate() {}
