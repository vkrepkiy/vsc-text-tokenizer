import { window, workspace } from "vscode";
import { toJsonDocument } from "../utils";
import { TokenizerStorage } from "../core/tokenizer-storage";
import { tokenizerConfiguration } from "../core/tokenizer-configuration";
import { ResultGeneratorFn } from "../types";

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

/**
 * Try to generate document with custom resultGenerator function
 * @returns execution state (true = done, false = not done)
 */
export async function generateCustomDocument(): Promise<boolean> {
  const resultGeneratorPath = await tokenizerConfiguration.get(
    "resultGeneratorPath"
  );

  if (resultGeneratorPath) {
    try {
      const file = await import(resultGeneratorPath);
      const resultGeneratorFn: ResultGeneratorFn = file;
      const result = await resultGeneratorFn(
        await TokenizerStorage.getTokenSubStoreAsArray()
      );
      const document = await workspace.openTextDocument({
        language: "json",
        content: toJsonDocument(result),
      });
      await window.showTextDocument(document);
      return true;
    } catch (e) {
      return false;
    }
  }

  return false;
}

export async function generateResults() {
  (await generateCustomDocument()) || (await generateArrayDocument());
}
