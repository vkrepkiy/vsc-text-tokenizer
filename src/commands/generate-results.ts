import { window, workspace } from "vscode";
import { toJsonDocument } from "../utils/helpers";
import { TmpResultStore } from "../services/tmp-result-store";

export async function generateJsonDocument() {
  const document = await workspace.openTextDocument({
    language: "json",
    content: toJsonDocument(await TmpResultStore.getJson()),
  });

  await window.showTextDocument(document);
}

export async function generateArrayDocument() {
  const document = await workspace.openTextDocument({
    language: "json",
    content: toJsonDocument(await TmpResultStore.getArray()),
  });

  await window.showTextDocument(document);
}
