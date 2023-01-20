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

/**
 * TODO: think of validating all these fields this on the configuration level
 */
function getTokenWrapperByLanguageId(languageId: string) {
  return (
    tokenizerConfiguration.get("tokenWrappersByLanguageId")[languageId] ||
    tokenizerConfiguration.get("tokenWrapper")
  );
}

async function findTokenForValue(text: string) {
  return (
    (await TokenizerStorage.getTokenSubStoreAsArray()).find(
      (x) => x.value === text
    )?.token ||
    (await externalTokenStorage.getTokenSubStoreAsArray()).find(
      (x) => x.value === text
    )?.token
  );
}

async function replaceSelectionsWithToken(editor: TextEditor) {
  const selectedText = editor.document.getText(editor.selection);
  const proposedToken = await findTokenForValue(selectedText);
  const { token, isExternal } = await askForToken(selectedText, proposedToken);

  if (!token) {
    window.showInformationMessage("No token was provided");
    return;
  }

  /**
   * TODO: I'm not sure about this logic... need to use for a bit
   */
  if (!isExternal) {
    await TokenizerStorage.setToken(
      token,
      editor.document.getText(editor.selection)
    );
  }

  await editor.edit((editBuilder) => {
    editor.selections.forEach((selection) => {
      editBuilder.replace(
        selection,
        getTokenWrapperByLanguageId(editor.document.languageId).replace(
          stringPlaceholder,
          token
        )
      );
    });
  });
}

async function askForToken(
  selectedText: string,
  preDefinedToken?: string
): Promise<{ token: string; isExternal?: boolean }> {
  const token = await window.showInputBox({
    prompt: "Enter localization token",
    value: preDefinedToken,
    validateInput: (value) => (!value ? "You need to provide a token" : null),
  });

  if (token === undefined) {
    return { token: "" };
  }

  const localValue = await TokenizerStorage.getTokenValue(token);
  const externalValue = await externalTokenStorage.getTokenValue(token);
  const storedTokenValue = localValue || externalValue;

  switch (storedTokenValue) {
    case undefined:
    case selectedText:
      return { token, isExternal: !!externalValue };
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
          // the value is changing so consider it local
          return { token, isExternal: false };
        case changeToken:
          return askForToken(selectedText, token);
        default:
          return { token: "" };
      }
  }
}
