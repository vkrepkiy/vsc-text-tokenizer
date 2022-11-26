import { commands, ExtensionContext } from "vscode";
import { generateArrayDocument } from "./commands/generate-results";
import { replaceWithToken } from "./commands/replace-with-token";
import { Command } from "./commands/types";
import { TmpResultStore } from "./utils/tmp-result-store";

export function activate(context: ExtensionContext) {
  TmpResultStore.initialize(context.workspaceState);

  let replaceWithI18nKeyCmd = commands.registerCommand(
    Command.replaceWithToken,
    () => {
      replaceWithToken();
    }
  );

  let generateResultsCmd = commands.registerCommand(
    Command.generateResults,
    () => {
      generateArrayDocument();
      TmpResultStore.setEmpty();
    }
  );

  context.subscriptions.push(replaceWithI18nKeyCmd, generateResultsCmd);
}

export function deactivate() {}
