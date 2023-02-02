import { commands, env, ExtensionContext, window } from "vscode";
import { generateResults } from "./commands/generate-results";
import { replaceWithToken } from "./commands/replace-with-token";
import { externalTokenStorage } from "./core/external-token-storage";
import { TokenizerStorage } from "./core/tokenizer-storage";
import { TokenizerCommand, tokenizationProgressUI } from "./constants";
import { getTokenizerDecorator } from "./core/tokenizer-decorator";
import {
  TokenizationProgressTreeDataProvider,
  TokenizerTreeItem,
} from "./ui/tokenization-progress-tree-data-provider";

export function activate(context: ExtensionContext) {
  /**
   * Initialize vital parts
   */
  TokenizerStorage.initialize(context.workspaceState);
  const tokenizerDecorator = getTokenizerDecorator();
  const tokenizationProgressUIData = new TokenizationProgressTreeDataProvider();

  /**
   * Initialize UI
   */
  const tokenizationProgressTreeView = window.createTreeView(
    tokenizationProgressUI,
    { treeDataProvider: tokenizationProgressUIData }
  );

  /**
   * If external token storage changes
   * - update file decorations
   */
  externalTokenStorage.onChange(
    async () => {
      tokenizerDecorator.requestUpdateDecorations();
    },
    null,
    context.subscriptions
  );

  /**
   * If internal token storage changes
   * - update file decorations
   * - update tree view
   */
  TokenizerStorage.onChange(
    async () => {
      tokenizerDecorator.requestUpdateDecorations();
      tokenizationProgressUIData.refresh();
    },
    null,
    context.subscriptions
  );

  /**
   * Setup commands below
   */
  let replaceWithTokenCmd = commands.registerCommand(
    TokenizerCommand.replaceWithToken,
    async () => {
      await replaceWithToken();
    }
  );

  let generateResultsCmd = commands.registerCommand(
    TokenizerCommand.generateResults,
    async () => {
      await generateResults();
    }
  );

  let generateResultsAndDropCmd = commands.registerCommand(
    TokenizerCommand.generateResultsAndDrop,
    async () => {
      await generateResults();
      await TokenizerStorage.setTokenSubStoreEmpty();
    }
  );

  let refreshExternalTokenStorageCmd = commands.registerCommand(
    TokenizerCommand.refreshExternalTokenStorage,
    async () => {
      await externalTokenStorage.refresh();
    }
  );

  let copyTokenCmd = commands.registerCommand(
    TokenizerCommand.tokenizationProgressCopyToken,
    async (event: TokenizerTreeItem) => {
      env.clipboard.writeText(event.token);
    }
  );

  let copyValueCmd = commands.registerCommand(
    TokenizerCommand.tokenizationProgressCopyValue,
    async (event: TokenizerTreeItem) => {
      env.clipboard.writeText(event.value);
    }
  );

  let removeTokenCmd = commands.registerCommand(
    TokenizerCommand.tokenizationProgressRemoveToken,
    async (event: TokenizerTreeItem) => {
      TokenizerStorage.removeToken(event.token);
    }
  );

  context.subscriptions.push(
    replaceWithTokenCmd,
    generateResultsCmd,
    generateResultsAndDropCmd,
    refreshExternalTokenStorageCmd,
    copyTokenCmd,
    copyValueCmd,
    removeTokenCmd,
    externalTokenStorage,
    tokenizationProgressTreeView,
    tokenizerDecorator
  );
}

export function deactivate() {}
