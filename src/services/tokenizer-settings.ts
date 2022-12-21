import { workspace } from "vscode";
import { extName, stringPlaceholder } from "../utils/helpers";
import { ExtensionSettings } from "../utils/types";

class TokenizerSettings implements ExtensionSettings {
  tokenWrapper = `{{ $translate("${stringPlaceholder}") }}`;

  tokenCollectionGetter = null;

  tokenCollectionPath = "";

  public get<T extends keyof ExtensionSettings>(key: T) {
    return (
      workspace.getConfiguration(extName).get<ExtensionSettings[T]>(key) ??
      this[key]
    );
  }
}

export const tokenizerSettings = new TokenizerSettings();
