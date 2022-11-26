import { window } from "vscode";
import { wrapToken } from "../utils/helpers";
import { TmpResultStore } from "../utils/tmp-result-store";

export async function replaceWithToken() {
  const editor = window.activeTextEditor;

  if (!editor) {
    window.showErrorMessage("You should open document to work with");
    return;
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);

  const token = await askForToken(selectedText);

  if (!token) {
    window.showInformationMessage("No token was provided");
    return;
  }

  await TmpResultStore.set(token, selectedText);

  editor.edit((editBuilder) => {
    editBuilder.replace(selection, wrapToken(token));
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
