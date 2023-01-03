import { Hover, MarkdownString, Position, Range, TextDocument } from "vscode";
import { tokenizerSettings } from "./tokenizer-settings";
import {
  escapeRegExpSpecialChars,
  extName,
  stringPlaceholder,
} from "../utils/helpers";
import { TmpResultStore } from "./tmp-result-store";
import { externalTokens } from "./external-tokens";

export const tokenRegexpGroupName = `token`;
export const tokenRegexpPattern = `(?<${tokenRegexpGroupName}>[^'"\`]+?)`;

export function getTokenLookupRegExps(): RegExp[] {
  const regexps = tokenizerSettings.get("tokenLookupRegExps");

  // fall back to wrapper-based regexp if no regexps provided
  if (!regexps || !regexps.length) {
    return [getLegacyTokenRegExp()];
  }

  return regexps.map((regexp) => new RegExp(regexp, "g"));
}

/**
 * Calculate `tokenWrapper`-based regexp to search for token
 *
 * @deprecated
 */
export function getLegacyTokenRegExp() {
  const [before, after] = tokenizerSettings
    .get("tokenWrapper")
    .split(stringPlaceholder);

  return new RegExp(
    `${escapeRegExpSpecialChars(
      before
    )}${tokenRegexpPattern}${escapeRegExpSpecialChars(after)}`,
    "g"
  );
}

/**
 * TODO: investigate how to detect tokens with a language server
 */
export async function showTokenValue(
  document: TextDocument,
  cursorPosition: Position
) {
  /**
   * TODO: While I have too few tests, let this security counter protect the loop
   * Possible case we should not exceed: 20 regexps x 10 matches on the line, stop after 10 times
   */
  let _secCounter = 2000;
  const regexps = getTokenLookupRegExps();
  const textLine = document.lineAt(cursorPosition.line);

  for (let i = 0; i < regexps.length; i++) {
    let matches;
    const regexp = regexps[i];

    while ((matches = regexp.exec(textLine.text))) {
      if (!_secCounter--) {
        throw new Error("loop");
      }

      const tokenStartPosition = new Position(
        textLine.lineNumber,
        matches.index
      );

      const tokenEndPosition = new Position(
        textLine.lineNumber,
        matches.index + matches[0].length
      );

      const matchRange = new Range(tokenStartPosition, tokenEndPosition);

      if (matchRange.contains(cursorPosition)) {
        const groups = matches.groups;
        const token = groups && groups[tokenRegexpGroupName];

        if (!token) {
          return;
        }

        /**
         * Check first in-memory (if any token has changed) and then look up in external store
         */
        const tokenValue =
          (await TmpResultStore.getValue(token)) ||
          (await externalTokens.get(token));

        if (tokenValue) {
          const mdText = `**${token}**  \n${tokenValue}`;
          return new Hover(new MarkdownString(mdText), matchRange);
        }
      }
    }
  }
}
