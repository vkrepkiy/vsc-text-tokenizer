export const extName = "text-tokenizer";
export const extPublisher = "vkrepkiy";
export const extId = `${extPublisher}.${extName}`;
export const tokenStoreKey = "tmpTokenStore";
export const stringPlaceholder = "%token%";
export const tokenNotFondIcon = "🔴";
export const tokenInProgressIcon = "🔹";

export const tokenizationProgressUI = `${extName}.tokenizationProgressUI`;

export enum TokenizerCommand {
  replaceWithToken = "text-tokenizer.replace-with-token",
  generateResults = "text-tokenizer.generate-results",
  generateResultsAndDrop = "text-tokenizer.generate-results-and-drop",
  refreshExternalTokenStorage = "text-tokenizer.fetch-external-token-storage",
  tokenizationProgressCopyToken = "text-tokenizer.tokenization-progress.copy-token",
  tokenizationProgressCopyValue = "text-tokenizer.tokenization-progress.copy-value",
  tokenizationProgressRemoveToken = "text-tokenizer.tokenization-progress.remove-token",
}

/**
 * Group name for token look up RegExps
 */
export const tokenRegexpGroupName = `token`;

/**
 * Available values enlisted here: https://code.visualstudio.com/api/references/theme-color
 */
export const enum ThemeColorKeys {
  tokenNotFoundColor = "editorCodeLens.foreground",
  tokenFoundColor = "editorCodeLens.foreground",
}

export const defaultTokeWrapper = `{{ $translate("${stringPlaceholder}") }}`;
export const defaultTokenLookupRegexps = [
  "translate\\((['\"`])(?<token>.+?)\\1\\)",
  "useTranslator\\((['\"`])(?<token>.+?)\\1\\)",
];
export const defaultInlineValueNotFoundCSS = `;
  position: relative;
  display: inline-block;
  vertical-align: middle;
  margin: 0 5px 0 5px;
  opacity: 0.6;
`;
export const defaultInlineValueCSS = `;
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
