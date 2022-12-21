import { TextEditor, window } from "vscode";
import { tokenizerSettings } from "../services/tokenizer-settings";
import { TmpResultStore } from "../services/tmp-result-store";
import { stringPlaceholder } from "../utils/helpers";

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

  await TmpResultStore.set(token, editor.document.getText(editor.selection));

  await editor.edit((editBuilder) => {
    editor.selections.forEach((selection) => {
      editBuilder.replace(
        selection,
        tokenizerSettings.get("tokenWrapper").replace(stringPlaceholder, token)
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

  const storedText = await TmpResultStore.getValue(token);

  switch (storedText) {
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
          Old value: ${storedText} \n
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
