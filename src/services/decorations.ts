import {
  DecorationInstanceRenderOptions,
  DecorationOptions,
  ExtensionContext,
  Range,
  TextEditor,
  ThemeColor,
  window,
} from "vscode";
import { externalTokens } from "./external-tokens";
import {
  getTokenLookupRegExps,
  tokenRegexpGroupName,
} from "./show-token-value";
import { TmpResultStore } from "./tmp-result-store";
import { tokenizerSettings } from "./tokenizer-settings";

export class Decorator {
  public static defaultThrottleTimeMs = 500;

  private timer?: NodeJS.Timer;

  private decorationInstance = window.createTextEditorDecorationType({});

  constructor(private context: ExtensionContext) {}

  private getDecoratorRenderOptions(
    tokenValue?: string
  ): DecorationInstanceRenderOptions {
    if (!tokenValue) {
      return {
        before: {
          contentText: "🔴",
          color: new ThemeColor(`editorCodeLens.foreground`),
          textDecoration: tokenizerSettings.get("inlineValueNotFoundCSS"),
        },
      };
    }

    return {
      before: {
        contentText: tokenValue,
        color: new ThemeColor(`editorCodeLens.foreground`),
        textDecoration: tokenizerSettings.get("inlineValueCSS"),
      },
    };
  }

  private async updateDecorations(editor: TextEditor) {
    if (!editor) {
      return;
    }

    const text = editor.document.getText();
    const decoratedTokens: DecorationOptions[] = [];
    const regexps = getTokenLookupRegExps();

    await Promise.all(
      regexps.map(async (regexp) => {
        let match;
        while ((match = regexp.exec(text))) {
          const startPos = editor.document.positionAt(match.index);
          const endPos = editor.document.positionAt(
            match.index + match[0].length
          );

          const groups = match.groups;
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

          const range = new Range(startPos, endPos);
          const foundText = editor.document.getText(range);

          const tokenRelativeIndex = foundText.indexOf(token);
          const tokenStartPos = editor.document.positionAt(
            match.index + tokenRelativeIndex
          );
          const tokenEndPos = editor.document.positionAt(
            match.index + tokenRelativeIndex + token.length
          );

          decoratedTokens.push({
            range: new Range(tokenStartPos, tokenEndPos),
            renderOptions: this.getDecoratorRenderOptions(tokenValue),
          });
        }
      })
    );

    editor.setDecorations(this.decorationInstance, decoratedTokens);
  }

  public requestUpdateDecorations(throttle = false) {
    const editor = window.activeTextEditor;

    if (!editor) {
      return;
    }

    /**
     * Check if user decided to deactivate inline hints
     */
    if (!tokenizerSettings.get("inlineHints")) {
      editor.setDecorations(this.decorationInstance, []);

      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    if (throttle) {
      this.timer = setTimeout(
        () => this.updateDecorations(editor),
        Decorator.defaultThrottleTimeMs
      );
    } else {
      this.updateDecorations(editor);
    }
  }
}

let instance: Decorator;

export function getDecorator(context?: ExtensionContext) {
  if (context) {
    return (instance = new Decorator(context));
  }

  if (!instance) {
    throw new Error("initialize decorator first with context!");
  }

  return instance;
}
