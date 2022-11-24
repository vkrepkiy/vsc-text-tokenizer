import { window } from "vscode";
import { TmpResultStore } from "../utils/tmp-result-store";

export async function replaceWithToken() {
  const editor = window.activeTextEditor;

  if (!editor) {
    window.showErrorMessage("You should open document to work with");
    return;
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection);

  const localizationToken = await askForToken();

  if (!localizationToken) {
    window.showInformationMessage(
      "No localization token was provided. Abort execution."
    );
    return;
  }

  const localizationNote = await window.showInputBox({
    title: "Enter localization note (or leave input empty)",
  });

  const newEntry: Record<string, string> = {
    translation: text,
  };

  if (localizationNote) {
    newEntry.notes = localizationNote;
  }

  await TmpResultStore.set(localizationToken, newEntry);

  editor.edit((editBuilder) => {
    editBuilder.replace(selection, localizationToken);
  });
}

async function askForToken(token = "", maxTry = 2): Promise<string> {
  const localizationToken = await window.showInputBox({
    title: "Enter localization token (unique)",
    value: token,
  });

  // Exit if user press ESC
  if (localizationToken === undefined) {
    return "";
  }

  // Try to ask again a few times if user provides empty string
  if (!localizationToken) {
    window.showErrorMessage("You need to provide localization token");
    return --maxTry > 0 ? askForToken("", maxTry) : "";
  }

  if (await TmpResultStore.has(localizationToken)) {
    window.showErrorMessage(`This token "${localizationToken}" already exists`);
    return askForToken(localizationToken);
  }

  return localizationToken;
}
