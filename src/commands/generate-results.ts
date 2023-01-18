import { window, workspace } from "vscode";
import { toJsonDocument } from "../utils";
import { TokenizerStorage } from "../core/tokenizer-storage";

export async function generateJsonDocument() {
  const document = await workspace.openTextDocument({
    language: "json",
    content: toJsonDocument(await TokenizerStorage.getTokenSubStoreAsJson()),
  });

  await window.showTextDocument(document);
}

export async function generateArrayDocument() {
  const document = await workspace.openTextDocument({
    language: "json",
    content: toJsonDocument(await TokenizerStorage.getTokenSubStoreAsArray()),
  });

  await window.showTextDocument(document);
}
