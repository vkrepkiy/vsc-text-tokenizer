import { commands, extensions, Selection, window, workspace } from "vscode";
import { Command } from "../commands/types";
import { extId } from "../utils/extension-config";

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
  const selection1 = (editor.selection = new Selection(
    line1.lineNumber,
    11,
    line1.lineNumber,
    21
  ));

  const line2 = editor.document.lineAt(11);
  const selection2 = (editor.selection = new Selection(
    line2.lineNumber,
    8,
    line2.lineNumber,
    14
  ));

  const line3 = editor.document.lineAt(12);
  const selection3 = (editor.selection = new Selection(
    line3.lineNumber,
    7,
    line3.lineNumber,
    16
  ));

  return {
    document,
    editor,
    selection1,
    selection2,
    selection3,
  };
}

export async function defaultAfterEach() {
  // Use side effect to clean storage cache
  await commands.executeCommand(Command.generateResults);
  // Close all editors
  await commands.executeCommand("workbench.action.closeAllEditors");
}
