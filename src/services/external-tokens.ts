import { Disposable, FileSystemWatcher, workspace } from "vscode";
import { extName, getAbsoluteFilePath } from "../utils/helpers";
import { tokenizerSettings } from "./tokenizer-settings";
import {
  ExtensionSettings,
  JsonArrayTokens,
  JsonMapTokens,
  TokenCollectionGetterFn,
  TokenStore,
} from "../utils/types";

class ExternalTokens implements Disposable {
  private disposables: Disposable[] = [];

  private tokenFileWatcher?: FileSystemWatcher;

  private settingsWatcher?: Disposable;

  private externalTokens: TokenStore = {};

  constructor() {
    this.watchSettings();
    this.updateTokens();
  }

  /**
   * Get token value from external (user-defined) store
   */
  public async get(token: string): Promise<string | undefined> {
    // it might become really async in the future, for now we keep the Promise wrapper
    return await Promise.resolve(this.externalTokens[token]?.value);
  }

  public dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.tokenFileWatcher?.dispose();
    this.settingsWatcher?.dispose();
  }

  public watchSettings() {
    const watchedSettings: (keyof ExtensionSettings)[] = [
      `tokenCollectionGetter`,
      `tokenCollectionPath`,
    ];

    this.settingsWatcher?.dispose();

    this.settingsWatcher = workspace.onDidChangeConfiguration((e) => {
      const updateIsRequired = watchedSettings.some((configKey) =>
        e.affectsConfiguration(`${extName}.${configKey}`)
      );

      if (updateIsRequired) {
        this.configureTokenGetterFileWatcher();
        this.updateTokens();
      }
    });
  }

  private configureTokenGetterFileWatcher() {
    this.tokenFileWatcher?.dispose();
    this.disposables.forEach((d) => d.dispose());

    const tokenCollectionPath = getAbsoluteFilePath(
      tokenizerSettings.get("tokenCollectionPath")
    );

    if (tokenCollectionPath) {
      this.tokenFileWatcher =
        workspace.createFileSystemWatcher(tokenCollectionPath);
      this.tokenFileWatcher.onDidChange(
        () => this.updateTokens(),
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
  public async updateTokens() {
    const tokenCollectionGetter = tokenizerSettings.get(
      "tokenCollectionGetter"
    );
    const tokenCollectionPath = getAbsoluteFilePath(
      tokenizerSettings.get("tokenCollectionPath")
    );

    if (!tokenCollectionGetter || !tokenCollectionPath) {
      this.externalTokens = {};
      return;
    }

    const tokenCollection = tokenCollectionPath
      ? await import(tokenCollectionPath)
      : [];

    switch (tokenCollectionGetter) {
      case "json-array":
        this.externalTokens = (tokenCollection as JsonArrayTokens).reduce(
          (result, data) => {
            result[data.token] = { value: data.value };

            return result;
          },
          {} as TokenStore
        );
        break;
      case "json-map":
        this.externalTokens = Object.entries(
          tokenCollection as JsonMapTokens
        ).reduce((result, tokenValue) => {
          result[tokenValue[0]] = { value: tokenValue[1] };

          return result;
        }, {} as TokenStore);

        break;
      default:
        const file = await import(tokenCollectionGetter);
        const getterFn: TokenCollectionGetterFn = file;
        const array = await getterFn(tokenCollectionPath);

        this.externalTokens = array.reduce((result, data) => {
          result[data.token] = { value: data.value };

          return result;
        }, {} as TokenStore);
        break;
    }
  }
}

export const externalTokens = new ExternalTokens();
