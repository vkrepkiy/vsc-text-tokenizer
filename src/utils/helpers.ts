import { Memento, workspace } from "vscode";
import { extName, extTmpResultStorageKey } from "../config";
import { Configuration } from "../types";

export function getConfiguration<T extends keyof Configuration>(
  key: T
): Configuration[T] {
  return workspace.getConfiguration(extName).get(key) as Configuration[T];
}
