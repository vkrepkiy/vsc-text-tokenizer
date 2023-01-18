import { readFileSync } from "fs";
import { commands, extensions, Selection, window, workspace } from "vscode";
import { extId, extName, TokenizerCommand } from "../constants";
import { ExtensionConfiguration } from "../types";

export function getExtension() {
  const result = extensions.getExtension(extId);
  return result as NonNullable<typeof result>;
}

export const token1 = "token.page-title";
export const value1 = "Page Title";
export const token2 = "token.header";
export const value2 = "Header";
export const token3 = "token.paragraph";
export const value3 = "Paragraph";
export const exampleFileContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>${value1}</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel='stylesheet' type='text/css' media='screen' href='main.css'>
    <script src='main.js'></script>
</head>
<body>
    <h1>${value2}</h1>
    <p>${value3}</p>
    <p>${value3}</p>
</body>
</html>`;

export async function defaultBeforeEach() {
  await getExtension().activate();

  const document = await workspace.openTextDocument({
    language: "html",
    content: exampleFileContent,
  });

  const editor = await window.showTextDocument(document);

  const line1 = editor.document.lineAt(5);
  const selection1 = new Selection(line1.lineNumber, 11, line1.lineNumber, 21);

  const line2 = editor.document.lineAt(11);
  const selection2 = new Selection(line2.lineNumber, 8, line2.lineNumber, 14);

  const line3 = editor.document.lineAt(12);
  const selection3 = new Selection(line3.lineNumber, 7, line3.lineNumber, 16);

  /**
   * `line4` points to the line which contains similar content to `line3`
   */
  const line4 = editor.document.lineAt(13);

  /**
   * `selection4` points to the selection which contains similar content to `selection3` (defined by `value3`)
   */
  const selection4 = new Selection(line4.lineNumber, 7, line4.lineNumber, 16);

  return {
    document,
    editor,
    selection1,
    selection2,
    selection3,
    selection4,
  };
}

export async function defaultAfterEach() {
  // Use side effect to clean storage cache (unless there is a dedicated one)
  await commands.executeCommand(TokenizerCommand.generateResults);
  // Close all editors
  await commands.executeCommand("workbench.action.closeAllEditors");
}

export async function updateConfiguration<
  T extends keyof ExtensionConfiguration
>(key: T, value: ExtensionConfiguration[T]) {
  return await workspace.getConfiguration(extName).update(key, value);
}
