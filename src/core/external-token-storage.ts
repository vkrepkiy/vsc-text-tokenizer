import { Disposable, FileSystemWatcher, workspace } from "vscode";
import { tokenizerConfiguration } from "./tokenizer-configuration";
import {
  JsonArrayTokens,
  JsonMapTokens,
  TokenCollectionGetterFn,
  TokenStore,
} from "../types";
import { extName } from "../constants";
import { getFilePathIfIsAbsolute } from "../utils";

/**
 * Provides the following features:
 * - typed configuration getter
 * - fallback to defaults if no user-defined configuration is found
 */
class ExternalTokenStorage implements Disposable {
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
  private externalTokenStore: TokenStore = {};

  constructor() {
    this.initializeConfigurationWatcher();
    this.fetchExternalTokens();
  }

  public async getTokenValue(token: string): Promise<string | undefined> {
    // it might become really async in the future, for now we keep the Promise wrapper
    return await Promise.resolve(this.externalTokenStore[token]?.value);
  }

  public dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.externalTokenStoreWatcher?.dispose();
    this.configurationWatcher?.dispose();
  }

  public initializeConfigurationWatcher() {
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

  /**
   * We do not want to trigger i/o on each value request, so read tokens before they are required
   *
   * TODO: decompose on smaller functions
   */
  public async fetchExternalTokens() {
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
      this.externalTokenStore = {};
      return;
    }

    const tokenCollectionAbsolutePath =
      getFilePathIfIsAbsolute(tokenCollectionPath);

    if (!tokenCollectionAbsolutePath) {
      this.externalTokenStore = {};
      return;
    }

    const tokenCollection = tokenCollectionAbsolutePath
      ? await import(tokenCollectionAbsolutePath)
      : [];

    switch (tokenCollectionGetter) {
      case "json-array":
        this.externalTokenStore = (tokenCollection as JsonArrayTokens).reduce(
          (result, data) => {
            result[data.token] = { value: data.value };

            return result;
          },
          {} as TokenStore
        );
        break;
      case "json-map":
        this.externalTokenStore = Object.entries(
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

        this.externalTokenStore = array.reduce((result, data) => {
          result[data.token] = { value: data.value };

          return result;
        }, {} as TokenStore);
        break;
    }
  }
}

export const externalTokenStorage = new ExternalTokenStorage();
