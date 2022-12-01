import { Hover, MarkdownString, Position, Range, TextDocument } from "vscode";
import { getFindTokenRegExp } from "./helpers";
import { TmpResultStore } from "./tmp-result-store";

export async function showTokenValue(
  document: TextDocument,
  cursorPosition: Position
) {
  const regex = getFindTokenRegExp();
  const textLine = document.lineAt(cursorPosition.line);
  let matches;

  while ((matches = regex.exec(textLine.text))) {
    const tokenStartPosition = new Position(textLine.lineNumber, matches.index);

    const tokenEndPosition = new Position(
      textLine.lineNumber,
      matches.index + matches[0].length
    );

    const matchRange = new Range(tokenStartPosition, tokenEndPosition);

    if (matchRange.contains(cursorPosition)) {
      const token = matches[1];
      const tokenValue = await TmpResultStore.getValue(token);

      if (tokenValue) {
        const mdText = `**${matches[1]}**  \n${tokenValue}`;
        return new Hover(new MarkdownString(mdText), matchRange);
      }
    }
  }
}
