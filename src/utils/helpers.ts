import { workspace } from "vscode";
import { Configuration, extName, stringPlaceholder } from "../config";

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
