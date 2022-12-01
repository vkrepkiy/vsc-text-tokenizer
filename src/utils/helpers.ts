import { workspace } from "vscode";
import { Configuration, extName, stringPlaceholder } from "./extension-config";

export function getConfiguration<T extends keyof Configuration>(
  key: T
): Configuration[T] {
  return (
    (workspace.getConfiguration(extName).get(key) as Configuration[T]) ||
    new Configuration()[key]
  );
}

export function wrapToken(token: string) {
  return getConfiguration("tokenWrapper").replace(stringPlaceholder, token);
}

export function toJsonDocument(json: unknown) {
  return JSON.stringify(json, null, 2);
}

export function escapeRegExpSpecialChars(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getFindTokenRegExp() {
  const [before, after] =
    getConfiguration("tokenWrapper").split(stringPlaceholder);

  return new RegExp(
    `${escapeRegExpSpecialChars(before)}(.*?)${escapeRegExpSpecialChars(
      after
    )}`,
    "g"
  );
}
