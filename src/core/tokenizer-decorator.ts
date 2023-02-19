import {
  DecorationInstanceRenderOptions,
  DecorationOptions,
  Disposable,
  MarkdownString,
  Range,
  TextEditor,
  ThemeColor,
  window,
  workspace,
} from "vscode";
import {
  extName,
  ThemeColorKeys,
  tokenInProgressIcon,
  tokenNotFondIcon,
  tokenRegexpGroupName,
} from "../constants";
import { externalTokenStorage } from "./external-token-storage";
import { TokenizerStorage } from "./tokenizer-storage";
import { tokenizerConfiguration } from "./tokenizer-configuration";

/**
 * Provides the following features:
 * - show inline hints (missing token / limited token value preview)
 * - show full-length token value on hover
 */
class TokenizerDecorator implements Disposable {
  public static instance?: TokenizerDecorator;

  private disposables: Disposable[] = [];

  public static defaultThrottleTimeMs = 500;

  private timer?: NodeJS.Timer;

  private decorationInstance = window.createTextEditorDecorationType({});

  private disabledForLangIds: string[] = [];

  constructor() {
    if (TokenizerDecorator.instance) {
      throw new Error("should be initialized once");
    }

    TokenizerDecorator.instance = this;

    this.initializeWatchers();
  }

  public initializeWatchers() {
    if (window.activeTextEditor) {
      this.requestUpdateDecorations(true);
    }

    window.onDidChangeActiveTextEditor(
      () => {
        this.requestUpdateDecorations(true);
      },
      this,
      this.disposables
    );

    workspace.onDidChangeTextDocument(
      () => {
        this.requestUpdateDecorations();
      },
      this,
      this.disposables
    );

    workspace.onDidChangeConfiguration(
      async (e) => {
        if (e.affectsConfiguration(extName)) {
          this.disabledForLangIds = await tokenizerConfiguration.get(
            "disableInlineHintsFor"
          );
          this.requestUpdateDecorations();
        }
      },
      this,
      this.disposables
    );
  }

  public dispose() {
    this.disposables.forEach((d) => d.dispose());
  }

  private getTokenLookupRegExps(): RegExp[] {
    const regexps = tokenizerConfiguration.get("tokenLookupRegExps");

    if (!regexps || !regexps.length) {
      return [];
    }

    return regexps.map((regexp) => new RegExp(regexp, "g"));
  }

  private getDecoratorRenderOptions(
    tokenValue?: string,
    isInProgress?: boolean
  ): DecorationInstanceRenderOptions {
    if (!tokenValue) {
      return {
        before: {
          contentText: tokenNotFondIcon,
          color: new ThemeColor(ThemeColorKeys.tokenNotFoundColor),
          textDecoration: tokenizerConfiguration.get("inlineValueNotFoundCSS"),
        },
      };
    }

    const prefix = isInProgress ? `${tokenInProgressIcon} ` : "";

    return {
      before: {
        contentText: `${prefix}${tokenValue}`,
        color: new ThemeColor(ThemeColorKeys.tokenFoundColor),
        textDecoration: tokenizerConfiguration.get("inlineValueCSS"),
      },
    };
  }

  private async updateDecorations(editor: TextEditor) {
    if (this.disabledForLangIds.includes(editor.document.languageId)) {
      return;
    }

    const text = editor.document.getText();
    const uniqueDecorations = new Map<string, DecorationOptions>();
    const regexps = this.getTokenLookupRegExps();
    const showInlineHints = !!tokenizerConfiguration.get("inlineHints");

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
          const tokenInProgressValue = await TokenizerStorage.getTokenValue(
            token
          );
          const tokenExternalValue = await externalTokenStorage.getTokenValue(
            token
          );
          const tokenValue = tokenInProgressValue || tokenExternalValue;

          const range = new Range(startPos, endPos);
          const foundText = editor.document.getText(range);

          const tokenRelativeIndex = foundText.indexOf(token);
          const tokenStartI = match.index + tokenRelativeIndex;
          const tokenEndI = match.index + tokenRelativeIndex + token.length;

          const decorationId = `${tokenStartI}:${tokenEndI}`;
          if (!uniqueDecorations.has(decorationId)) {
            const tokenStartPos = editor.document.positionAt(tokenStartI);
            const tokenEndPos = editor.document.positionAt(tokenEndI);

            uniqueDecorations.set(decorationId, {
              range: new Range(tokenStartPos, tokenEndPos),
              renderOptions: showInlineHints
                ? this.getDecoratorRenderOptions(
                    tokenValue,
                    !!tokenInProgressValue
                  )
                : undefined,
              hoverMessage: tokenValue
                ? new MarkdownString(`**Token value:** ${tokenValue}`)
                : undefined,
            });
          }
        }
      })
    );

    editor.setDecorations(
      this.decorationInstance,
      Array.from(uniqueDecorations.values())
    );
  }

  public requestUpdateDecorations(doNotThrottle = false) {
    const editor = window.activeTextEditor;

    if (!editor) {
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    if (doNotThrottle) {
      this.updateDecorations(editor);
    } else {
      this.timer = setTimeout(
        () => this.updateDecorations(editor),
        TokenizerDecorator.defaultThrottleTimeMs
      );
    }
  }
}

export function getTokenizerDecorator() {
  return TokenizerDecorator.instance || new TokenizerDecorator();
}
