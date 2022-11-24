import { Memento } from "vscode";
import { extTmpResultStorageKey } from "../config";

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

  private static async getTmpResultObject<
    T = Record<string, unknown>
  >(): Promise<T> {
    if (!TmpResultStore.state.keys().includes(extTmpResultStorageKey)) {
      await TmpResultStore.setEmpty();
    }

    return TmpResultStore.state.get(extTmpResultStorageKey) as T;
  }

  public static async toString() {
    return JSON.stringify(await TmpResultStore.getTmpResultObject(), null, 2);
  }

  public static async toJSON() {
    return JSON.parse(await TmpResultStore.toString());
  }

  public static async setEmpty() {
    TmpResultStore.state.update(
      extTmpResultStorageKey,
      TmpResultStore.emptyState
    );
  }

  public static async set(key: string, value: unknown) {
    const tmpResultsStore = await TmpResultStore.getTmpResultObject();
    tmpResultsStore[key] = value;
  }

  public static async remove(key: string) {
    const tmpResultsStore = await TmpResultStore.getTmpResultObject();
    delete tmpResultsStore[key];
  }

  public static async has(key: string) {
    const tmpResultStore = await TmpResultStore.getTmpResultObject();
    return key in tmpResultStore;
  }
}
