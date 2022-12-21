import { Memento } from "vscode";
import { tokenStoreKey } from "../utils/helpers";
import { TokenStore, TokenToValueItem } from "../utils/types";

export class TmpResultStore {
  private static get emptyState() {
    return {};
  }

  private static _state?: Memento;

  private static get state(): Memento {
    if (!this._state) {
      throw new Error("call TmpResultStore.initialize() first");
    }
    return this._state;
  }

  public static initialize(state: Memento) {
    if (TmpResultStore._state) {
      throw new Error("Cannot be initialized twice");
    }

    TmpResultStore._state = state;
  }

  private static async getTmpResultObject(): Promise<TokenStore> {
    if (!TmpResultStore.state.keys().includes(tokenStoreKey)) {
      await TmpResultStore.setEmpty();
    }

    return TmpResultStore.state.get(tokenStoreKey) as TokenStore;
  }

  public static async getJson() {
    return JSON.parse(
      JSON.stringify(await TmpResultStore.getTmpResultObject())
    );
  }

  public static async getArray(): Promise<TokenToValueItem[]> {
    const tokenStore = await TmpResultStore.getTmpResultObject();
    return Object.keys(tokenStore).reduce((result, token) => {
      return [...result, { token, value: tokenStore[token].value }];
    }, [] as { token: string; value: string }[]);
  }

  public static async setEmpty() {
    TmpResultStore.state.update(tokenStoreKey, TmpResultStore.emptyState);
  }

  public static async set(token: string, value: string) {
    const tmpResultsStore = await TmpResultStore.getTmpResultObject();
    tmpResultsStore[token] = {
      value,
    };
  }

  public static async getValue(
    token: keyof TokenStore
  ): Promise<string | undefined> {
    const tmpResultsStore = await TmpResultStore.getTmpResultObject();
    return tmpResultsStore[token]?.value;
  }

  public static async remove(token: keyof TokenStore) {
    const tmpResultsStore = await TmpResultStore.getTmpResultObject();
    delete tmpResultsStore[token];
  }

  public static async has(token: keyof TokenStore) {
    const tmpResultStore = await TmpResultStore.getTmpResultObject();
    return token in tmpResultStore;
  }
}
