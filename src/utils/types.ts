export interface TokenStore {
  [token: string]: {
    value: string;
  };
}

export interface ExtensionSettings {
  /**
   * Wrapper for the token (possibly HTML tag or function cal)
   *
   * TODO: let user decide wrapper for each file type
   */
  tokenWrapper: string;

  /**
   * Regexps to detect tokens in files
   */
  tokenRegExps: string[];

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
