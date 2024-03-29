import { EventEmitter, Memento } from "vscode";
import { tokenStoreKey } from "../constants";
import { TokenStore, TokenToValueItem } from "../types";

/**
 * Provides the following features:
 * - typed store to keep tokenization progress with the help of the official Memento utility
 *
 * TODO: I don't know why I made it static. Should make it normal later. For now it works
 */
export class TokenizerStorage {
  private static _storeChanged = new EventEmitter<void>();
  public static onChange = this._storeChanged.event;

  private static get emptyTokenSubStoreState() {
    return {};
  }

  private static _vscodeStorage?: Memento;

  private static get storage(): Memento {
    if (!this._vscodeStorage) {
      throw new Error("call TmpResultStore.initialize() first");
    }
    return this._vscodeStorage;
  }

  public static initialize(vscodeStorage: Memento) {
    if (TokenizerStorage._vscodeStorage) {
      throw new Error("Cannot be initialized twice");
    }

    TokenizerStorage._vscodeStorage = vscodeStorage;
  }

  /**
   * HACK:
   * Due to VS Code Memento realization we cannot just modify the store object,
   * consider it as immutable (it won't persist between states).
   * Update state and call the ._mementoUpdate()
   */
  private static async getTokenSubStore(): Promise<TokenStore> {
    if (!TokenizerStorage.storage.keys().includes(tokenStoreKey)) {
      await TokenizerStorage.setTokenSubStoreEmpty();
    }

    return TokenizerStorage.storage.get(tokenStoreKey) as TokenStore;
  }

  /**
   * Apply store update to Memento after change
   */
  private static async _mementoUpdate() {
    const tokenStore = await TokenizerStorage.getTokenSubStore();
    TokenizerStorage.storage.update(tokenStoreKey, tokenStore);
  }

  public static async getTokenSubStoreAsJson() {
    return JSON.parse(
      JSON.stringify(await TokenizerStorage.getTokenSubStore())
    );
  }

  public static async getTokenSubStoreAsArray(): Promise<TokenToValueItem[]> {
    const tokenStore = await TokenizerStorage.getTokenSubStore();
    return Object.keys(tokenStore).reduce((result, token) => {
      return [...result, { token, value: tokenStore[token].value }];
    }, [] as { token: string; value: string }[]);
  }

  public static async setTokenSubStoreEmpty() {
    TokenizerStorage.storage.update(
      tokenStoreKey,
      TokenizerStorage.emptyTokenSubStoreState
    );
    TokenizerStorage._storeChanged.fire();

    await TokenizerStorage._mementoUpdate();
  }

  public static async hasToken(token: keyof TokenStore) {
    const tmpResultStore = await TokenizerStorage.getTokenSubStore();
    return token in tmpResultStore;
  }

  public static async setToken(token: string, value: string) {
    const tmpResultsStore = await TokenizerStorage.getTokenSubStore();
    tmpResultsStore[token] = {
      value,
    };
    TokenizerStorage._storeChanged.fire();

    await TokenizerStorage._mementoUpdate();
  }

  public static async removeToken(token: keyof TokenStore) {
    const tmpResultsStore = await TokenizerStorage.getTokenSubStore();
    delete tmpResultsStore[token];
    TokenizerStorage._storeChanged.fire();

    await TokenizerStorage._mementoUpdate();
  }

  public static async getTokenValue(
    token: keyof TokenStore
  ): Promise<string | undefined> {
    const tmpResultsStore = await TokenizerStorage.getTokenSubStore();
    return tmpResultsStore[token]?.value;
  }
}
