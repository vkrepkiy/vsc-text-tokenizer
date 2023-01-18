import { TextEditor, window } from "vscode";
import { stringPlaceholder } from "../constants";
import { externalTokenStorage } from "../core/external-token-storage";
import { tokenizerConfiguration } from "../core/tokenizer-configuration";
import { TokenizerStorage } from "../core/tokenizer-storage";

export async function replaceWithToken() {
  const editor = window.activeTextEditor;

  if (!editor) {
    window.showErrorMessage("You should open document to work with");
    return;
  }

  const selectionsError = validateSelectionsAndGetError(editor);

  if (selectionsError) {
    window.showErrorMessage(selectionsError);
    return;
  }

  await replaceSelectionsWithToken(editor);
}

function validateSelectionsAndGetError(editor: TextEditor): string | null {
  /**
   * Check if all selections are empty
   */
  if (
    editor.selections.length === 0 ||
    editor.selections.every((selection) => selection.isEmpty)
  ) {
    return "Select a text to be replaced with a token";
  }

  /**
   * Check if all selections are equal
   */
  let referenceTextSelection = editor.document.getText(editor.selections[0]);
  for (let i = 0; i < editor.selections.length; i++) {
    const textSelection = editor.document.getText(editor.selections[i]);
    if (referenceTextSelection !== textSelection) {
      return `You have selected unequal text parts: ${referenceTextSelection} !== ${textSelection}`;
    }
  }

  return null;
}

async function replaceSelectionsWithToken(editor: TextEditor) {
  const selectedText = editor.document.getText(editor.selection);
  const token = await askForToken(selectedText);

  if (!token) {
    window.showInformationMessage("No token was provided");
    return;
  }

  await TokenizerStorage.setToken(
    token,
    editor.document.getText(editor.selection)
  );

  await editor.edit((editBuilder) => {
    editor.selections.forEach((selection) => {
      editBuilder.replace(
        selection,
        tokenizerConfiguration
          .get("tokenWrapper")
          .replace(stringPlaceholder, token)
      );
    });
  });
}

async function askForToken(
  selectedText: string,
  preDefinedToken?: string
): Promise<string> {
  const token = await window.showInputBox({
    prompt: "Enter localization token",
    value: preDefinedToken,
    validateInput: (value) => (!value ? "You need to provide a token" : null),
  });

  if (token === undefined) {
    return "";
  }

  const storedTokenValue =
    (await TokenizerStorage.getTokenValue(token)) ||
    (await externalTokenStorage.getTokenValue(token));

  switch (storedTokenValue) {
    case undefined:
    case selectedText:
      return token;
    default:
      const overwriteValue = Symbol("overwriteValue");
      const changeToken = Symbol("renameToken");
      const overwrite = await window.showWarningMessage(
        `The token already exists, would you like to overwrite the value?`,
        {
          modal: true,
          detail: `Token: ${token} \n
          Old value: ${storedTokenValue} \n
          New value: ${selectedText} \n`,
        },
        {
          title: "Overwrite",
          value: overwriteValue,
        },
        {
          title: "Change token",
          value: changeToken,
        }
      );

      switch (overwrite?.value) {
        case overwriteValue:
          return token;
        case changeToken:
          return askForToken(selectedText, token);
        default:
          return "";
      }
  }
}
