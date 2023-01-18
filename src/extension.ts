import { commands, ExtensionContext, window, workspace } from "vscode";
import { generateArrayDocument } from "./commands/generate-results";
import { replaceWithToken } from "./commands/replace-with-token";
import { externalTokenStorage } from "./core/external-token-storage";
import { TokenizerStorage } from "./core/tokenizer-storage";
import { TokenizerCommand } from "./constants";
import { tokenizerDecorator } from "./core/tokenizer-decorator";

export function activate(context: ExtensionContext) {
  TokenizerStorage.initialize(context.workspaceState);

  let replaceWithI18nKeyCmd = commands.registerCommand(
    TokenizerCommand.replaceWithToken,
    async () => {
      await replaceWithToken();
    }
  );

  let generateResultsCmd = commands.registerCommand(
    TokenizerCommand.generateResults,
    async () => {
      await generateArrayDocument();
      TokenizerStorage.setTokenSubStoreEmpty();
    }
  );

  context.subscriptions.push(
    replaceWithI18nKeyCmd,
    generateResultsCmd,
    externalTokenStorage,
    tokenizerDecorator
  );
}

export function deactivate() {}
