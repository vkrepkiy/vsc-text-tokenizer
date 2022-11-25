import { commands, ExtensionContext } from "vscode";
import { generateArrayDocument } from "./commands/generate-results";
import { replaceWithToken } from "./commands/replace-with-token";
import { TmpResultStore } from "./utils/tmp-result-store";

export function activate(context: ExtensionContext) {
  TmpResultStore.initialize(context.workspaceState);

  let replaceWithI18nKeyCmd = commands.registerCommand(
    "text-tokenizer.replace-with-token",
    () => {
      replaceWithToken();
    }
  );

  let generateResultsCmd = commands.registerCommand(
    "text-tokenizer.generate-results",
    () => {
      generateArrayDocument();
      TmpResultStore.setEmpty();
    }
  );

  context.subscriptions.push(replaceWithI18nKeyCmd, generateResultsCmd);
}

export function deactivate() {}
