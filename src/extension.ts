import { commands, ExtensionContext } from "vscode";
import { generateResults } from "./commands/generate-results";
import { replaceWithToken } from "./commands/replace-with-token";
import { TmpResultStore } from "./utils/tmp-result-store";

export function activate(context: ExtensionContext) {
  TmpResultStore.initialize(context.workspaceState);

  let replaceWithI18nKeyCmd = commands.registerCommand(
    "glovo-admin-fe-localization-tools.replace-with-token",
    () => {
      replaceWithToken();
    }
  );

  let generateResultsCmd = commands.registerCommand(
    "glovo-admin-fe-localization-tools.generate-results",
    () => {
      generateResults();
      TmpResultStore.setEmpty();
    }
  );

  context.subscriptions.push(replaceWithI18nKeyCmd, generateResultsCmd);
}

export function deactivate() {}
