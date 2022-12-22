import { Hover, MarkdownString, Position, Range, TextDocument } from "vscode";
import { tokenizerSettings } from "./tokenizer-settings";
import { escapeRegExpSpecialChars, stringPlaceholder } from "../utils/helpers";
import { TmpResultStore } from "./tmp-result-store";
import { externalTokens } from "./external-tokens";

function getFindTokenRegExps(): RegExp[] {
  const regexps = tokenizerSettings.get("tokenRegExps");

  // fall back to wrapper-based regexp if no regexps provided
  if (!regexps || !regexps.length) {
    return [getFindTokenRegExp()];
  }

  // Not sure if it is correct to merge tokenWrapper-based regexp as a "fool-protection"
  return regexps
    .map((pattern) => {
      const [before, after] = pattern.split(stringPlaceholder);
      return new RegExp(`${before}(.*?)${after}`);
    })
    .concat(getFindTokenRegExp());
}

/**
 * Calculate `tokenWrapper`-based regexp to search for token
 */
function getFindTokenRegExp() {
  const [before, after] = tokenizerSettings
    .get("tokenWrapper")
    .split(stringPlaceholder);

  return new RegExp(
    `${escapeRegExpSpecialChars(before)}(.*?)${escapeRegExpSpecialChars(
      after
    )}`,
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
  const regexps = getFindTokenRegExps();
  const textLine = document.lineAt(cursorPosition.line);
  let matches;

  for (let i = 0; i < regexps.length; i++) {
    const regex = regexps[i];

    while ((matches = regex.exec(textLine.text))) {
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
        const token = matches[1];

        /**
         * Check first in-memory (if any token has changed) and then look up in external store
         */
        const tokenValue =
          (await TmpResultStore.getValue(token)) ||
          (await externalTokens.get(token));

        if (tokenValue) {
          const mdText = `**${matches[1]}**  \n${tokenValue}`;
          return new Hover(new MarkdownString(mdText), matchRange);
        }
      }
    }
  }
}
