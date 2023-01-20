import { Disposable, EventEmitter, FileSystemWatcher, workspace } from "vscode";
import { tokenizerConfiguration } from "./tokenizer-configuration";
import {
  JsonArrayTokens,
  JsonMapTokens,
  TokenCollectionGetterFn,
  TokenStore,
  TokenToValueItem,
} from "../types";
import { extName } from "../constants";
import { getFilePathIfIsAbsolute } from "../utils";
import { readFileSync } from "fs";

/**
 * Provides the following features:
 * - typed configuration getter
 * - fallback to defaults if no user-defined configuration is found
 */
class ExternalTokenStorage implements Disposable {
  private storeChanged = new EventEmitter<void>();
  public onChange = this.storeChanged.event;

  private disposables: Disposable[] = [];

  /**
   * Watch extension's config to update this.externalTokenStore
   */
  private configurationWatcher?: Disposable;

  /**
   * Watch external store (file path) to update this.externalTokenStore
   */
  private externalTokenStoreWatcher?: FileSystemWatcher;

  /**
   * Token store (fetched, parsed and cached data)
   */
  private set externalTokenCache(data: TokenStore) {
    this._externalTokenCache = data;
    this.storeChanged.fire();
  }

  private get externalTokenCache(): TokenStore {
    return this._externalTokenCache;
  }

  private _externalTokenCache: TokenStore = {};

  constructor() {
    this.initializeConfigurationWatcher();
    this.initializeExternalTokenStoreWatcher();
    this.fetchExternalTokens();
  }

  public async getTokenValue(token: string): Promise<string | undefined> {
    // it might become really async in the future, for now we keep the Promise wrapper
    return await Promise.resolve(this.externalTokenCache[token]?.value);
  }

  public async getTokenSubStoreAsArray(): Promise<TokenToValueItem[]> {
    return Object.keys(this.externalTokenCache).reduce((result, token) => {
      return [
        ...result,
        { token, value: this.externalTokenCache[token].value },
      ];
    }, [] as { token: string; value: string }[]);
  }

  public dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.externalTokenStoreWatcher?.dispose();
    this.configurationWatcher?.dispose();
  }

  private initializeConfigurationWatcher() {
    this.configurationWatcher?.dispose();

    this.configurationWatcher = workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(extName)) {
        this.initializeExternalTokenStoreWatcher();
        this.fetchExternalTokens();
      }
    });
  }

  private initializeExternalTokenStoreWatcher() {
    this.externalTokenStoreWatcher?.dispose();
    this.disposables.forEach((d) => d.dispose());

    const tokenCollectionPath = getFilePathIfIsAbsolute(
      tokenizerConfiguration.get("tokenCollectionPath")
    );

    if (tokenCollectionPath) {
      this.externalTokenStoreWatcher =
        workspace.createFileSystemWatcher(tokenCollectionPath);

      this.externalTokenStoreWatcher.onDidChange(
        () => this.fetchExternalTokens(),
        this,
        this.disposables
      );
    }
  }

  public async refresh() {
    return await this.fetchExternalTokens();
  }

  /**
   * We do not want to trigger i/o on each value request, so read tokens before they are required
   *
   * TODO: decompose on smaller functions
   */
  private async fetchExternalTokens() {
    const tokenCollectionGetter = tokenizerConfiguration.get(
      "tokenCollectionGetter"
    );
    const tokenCollectionPath = tokenizerConfiguration.get(
      "tokenCollectionPath"
    );

    /**
     * Empty external tokens if no valid configuration provided
     */
    if (!tokenCollectionGetter || !tokenCollectionPath) {
      this.externalTokenCache = {};
      return;
    }

    const tokenCollectionAbsolutePath =
      getFilePathIfIsAbsolute(tokenCollectionPath);

    if (!tokenCollectionAbsolutePath) {
      this.externalTokenCache = {};
      return;
    }

    const tokenCollection = tokenCollectionAbsolutePath
      ? JSON.parse(readFileSync(tokenCollectionAbsolutePath).toString("utf-8"))
      : [];

    switch (tokenCollectionGetter) {
      case "json-array":
        this.externalTokenCache = (tokenCollection as JsonArrayTokens).reduce(
          (result, data) => {
            result[data.token] = { value: data.value };

            return result;
          },
          {} as TokenStore
        );
        break;
      case "json-map":
        this.externalTokenCache = Object.entries(
          tokenCollection as JsonMapTokens
        ).reduce((result, tokenValue) => {
          result[tokenValue[0]] = { value: tokenValue[1] };

          return result;
        }, {} as TokenStore);

        break;
      default:
        const file = await import(tokenCollectionGetter);
        const getterFn: TokenCollectionGetterFn = file;
        const array = await getterFn(tokenCollectionAbsolutePath);

        this.externalTokenCache = array.reduce((result, data) => {
          result[data.token] = { value: data.value };

          return result;
        }, {} as TokenStore);
        break;
    }
  }
}

export const externalTokenStorage = new ExternalTokenStorage();
