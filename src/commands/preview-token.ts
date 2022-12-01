import { window } from "vscode";
import { TmpResultStore } from "../utils/tmp-result-store";

export async function previewToken() {
  const editor = window.activeTextEditor;

  if (!editor) {
    window.showErrorMessage("You should open document to work with");
    return;
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);

  if (!selectedText) {
    window.showInformationMessage("Please, select a token to preview");
    return;
  }

  const tokenValue = await TmpResultStore.getValue(selectedText);

  if (!tokenValue) {
    window.showInformationMessage(`No value found for "${selectedText}"`);
    return;
  }

  window.showInformationMessage(tokenValue);
}
