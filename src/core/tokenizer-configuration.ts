import { workspace } from "vscode";
import {
  defaultInlineValueCSS,
  defaultInlineValueNotFoundCSS,
  defaultTokenLookupRegexps,
  defaultTokeWrapper,
  extName,
} from "../constants";
import { ExtensionConfiguration } from "../types";

/**
 * Provides the following features:
 * - typed configuration getter
 * - fallback to defaults if no user-defined configuration is found
 */
class TokenizerConfiguration implements ExtensionConfiguration {
  tokenWrapper = defaultTokeWrapper;

  tokenWrappersByLanguageId: Record<string, string> = {};

  tokenLookupRegExps = defaultTokenLookupRegexps;

  inlineValueNotFoundCSS = defaultInlineValueNotFoundCSS;

  inlineValueCSS = defaultInlineValueCSS;

  tokenCollectionGetter = null;

  tokenCollectionPath = "";

  resultGeneratorPath = "";

  inlineHints = true;

  trimQuotes = true;

  trimWhitespace = true;

  public get<T extends keyof ExtensionConfiguration>(key: T) {
    return (
      workspace.getConfiguration(extName).get<ExtensionConfiguration[T]>(key) ??
      this[key]
    );
  }
}

export const tokenizerConfiguration = new TokenizerConfiguration();
