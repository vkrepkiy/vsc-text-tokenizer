import {
  EventEmitter,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  Uri,
} from "vscode";
import { TokenizerStorage } from "../core/tokenizer-storage";

export class TokenizationProgressTreeDataProvider
  implements TreeDataProvider<TokenizerTreeItem>
{
  private _onDidChangeTreeData = new EventEmitter<TokenizerTreeItem | void>();

  public readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: TokenizerTreeItem): TreeItem {
    return element;
  }

  public async getChildren(
    element?: TokenizerTreeItem
  ): Promise<TokenizerTreeItem[]> {
    /**
     * Root children
     */
    if (!element) {
      return (await TokenizerStorage.getTokenSubStoreAsArray()).map(
        ({ token, value }) => new TokenizerTreeItem("token", token, value)
      );
    }

    /**
     * Token children
     */
    if (element.contextValue === "token") {
      return Promise.resolve([
        new TokenizerTreeItem("value", element.token, element.value),
      ]);
    }

    /**
     * Value children
     */
    return Promise.resolve([]);
  }
}

export class TokenizerTreeItem extends TreeItem {
  constructor(
    public readonly contextValue: "token" | "value",
    public readonly token: string,
    public readonly value: string
  ) {
    const renderValue = contextValue === "token" ? token : value;
    super(
      renderValue,
      contextValue === "token"
        ? TreeItemCollapsibleState.None
        : TreeItemCollapsibleState.None
    );
    this.tooltip = value;
    this.description = value;
  }
}
