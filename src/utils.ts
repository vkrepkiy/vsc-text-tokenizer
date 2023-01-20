import { existsSync } from "fs";
import { isAbsolute, resolve } from "path";
import { Uri, Webview } from "vscode";

export function toJsonDocument(json: unknown) {
  return JSON.stringify(json, null, 2);
}

export function escapeRegExpSpecialChars(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getFilePathIfIsAbsolute(filePath: string) {
  try {
    filePath = resolve(filePath);
    if (isAbsolute(filePath)) {
      return existsSync(filePath) ? filePath : undefined;
    }
  } catch (e) {
    return undefined;
  }
}

export function getUri(
  webview: Webview,
  extensionUri: Uri,
  pathList: string[]
) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}
