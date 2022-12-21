import { commands, ExtensionContext, languages } from "vscode";
import { generateArrayDocument } from "./commands/generate-results";
import { replaceWithToken } from "./commands/replace-with-token";
import { Command } from "./commands/types";
import { externalTokens } from "./services/external-tokens";
import { showTokenValue } from "./services/show-token-value";
import { TmpResultStore } from "./services/tmp-result-store";

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
    hoverProvider,
    externalTokens
  );
}

export function deactivate() {}
