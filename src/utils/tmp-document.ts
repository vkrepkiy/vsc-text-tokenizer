import { Range, TextDocument, window, workspace } from "vscode";
import { extName } from "./extension-config";

export class TmpDocument {
  private static document: TextDocument;

  private static readonly tmpDocumentHeader = `/**
  * ${extName}
  * Keep this temporary document open while you are working on localization.
  * Generated JSON data would appear below, just copy it to localization file when you are ready.
  */`;

  public static async use() {
    if (!this.document) {
      this.document = await workspace.openTextDocument({
        language: "typescript",
        content: "{}",
      });
    }

    return this.document;
  }

  public static async add(jsonEntry: Record<string, unknown>) {
    const document = await this.use();

    await this.setContent(
      JSON.stringify(Object.assign(JSON.parse(document.getText()), jsonEntry))
    );
  }

  private static async setContent(content: string) {
    const document = await this.use();
    const editor = await this.getEditor(document);
    await editor.edit((builder) => {
      builder.replace(
        new Range(
          document.lineAt(0).range.start,
          document.lineAt(document.lineCount - 1).range.end
        ),
        content
      );
    });
  }

  private static async getEditor(document: TextDocument) {
    return await window.showTextDocument(document);
  }
}
