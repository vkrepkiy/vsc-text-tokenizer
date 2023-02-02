export interface TokenStore {
  [token: string]: {
    value: string;
  };
}

export interface ExtensionConfiguration {
  /**
   * Default wrapper for the token. Use %token% to indicate the place for token insertion.
   *
   * @example
   * "text-tokenizer.tokenWrapper": "{{ $translate(\"%token%\") }}"
   */
  tokenWrapper: string;

  /**
   * Token wrappers defined by the Language ID (see https://code.visualstudio.com/docs/getstarted/tips-and-tricks#_change-language-mode).
   * Use %token% to indicate the place for token insertion.
   *
   * @example
   * "text-tokenizer.tokenWrappersByLanguageId": {
   *   "html": "{{ $translate(\"%token%\") }}",
   *   "ts": "translate(\"%token%\")",
   * }
   */
  tokenWrappersByLanguageId: Record<string, string>;

  /**
   * Regexps to detect tokens in files. Should expose a capturing group named "token"
   *
   * * @example
   * [
   *   "(['\"`])(?<token>.+?)\\1"
   * ]
   */
  tokenLookupRegExps: string[];

  /**
   * Getter type. It is possible to provide path to the file containing default export of function which returns TokenToValueItem[].
   *
   * - `json-map` would handle JSON file in `{ "your.token": "Text value" }` format
   * - `json-array` would handle JSON file in `{ token: "your.token", value: "Text value" }[]` format
   */
  tokenCollectionGetter: "json-map" | "json-array" | string | null;

  /**
   * File under this path would be watched and `tokenCollectionGetter` function would be triggered on changes.
   * Required when `tokenCollectionGetter` is defined.
   */
  tokenCollectionPath: string;

  /**
   * Activate inline hints (missing token value and value preview)
   */
  inlineHints: boolean;

  /**
   * Removes equal leading and trailing quotation marks ( ' \" ` ) from a selected value
   */
  trimQuotes: boolean;

  /**
   * Removes the leading and trailing white space and line terminator characters from a selected value
   */
  trimWhitespace: boolean;

  /**
   * CSS to be applied to inline hints
   */
  inlineValueNotFoundCSS: string;

  /**
   * CSS to be applied to inline hints
   */
  inlineValueCSS: string;
}

export interface TokenToValueItem {
  token: string;
  value: string;
}

export type JsonMapTokens = Record<string, string>;

export type JsonArrayTokens = TokenToValueItem[];

export type TokenCollectionGetterFn = (
  tokenCollectionPath: string
) => Promise<TokenToValueItem[]>;
