import { workspace } from "vscode";
import { extName, stringPlaceholder } from "../utils/helpers";
import { ExtensionSettings } from "../utils/types";

class TokenizerSettings implements ExtensionSettings {
  tokenWrapper = `{{ $translate("${stringPlaceholder}") }}`;

  tokenLookupRegExps = [
    "translate\\((['\"`])(?<token>.+?)\\1\\)",
    "useTranslator\\((['\"`])(?<token>.+?)\\1\\)",
  ];

  tokenCollectionGetter = null;

  tokenCollectionPath = "";

  inlineHints = true;

  inlineValueNotFoundCSS = `;
    position: relative;
    display: inline-block;
    vertical-align: middle;
    margin: 0 5px 0 5px;
    opacity: 0.6;
  `;

  inlineValueCSS = `;
    position: relative;
    display: inline-block;
    margin: 0 5px 0 5px;
    padding: 0 5px 0 5px;
    border-radius: 5px;
    vertical-align: middle;
    opacity: 0.6;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
  `;

  public get<T extends keyof ExtensionSettings>(key: T) {
    return (
      workspace.getConfiguration(extName).get<ExtensionSettings[T]>(key) ??
      this[key]
    );
  }
}

export const tokenizerSettings = new TokenizerSettings();
