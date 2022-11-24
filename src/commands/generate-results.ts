import { workspace } from "vscode";
import { TmpResultStore } from "../utils/tmp-result-store";

export async function generateResults() {
  await workspace.openTextDocument({
    language: "json",
    content: await TmpResultStore.toString(),
  });
}
