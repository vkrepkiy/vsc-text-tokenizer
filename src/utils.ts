import { existsSync } from "fs";
import { isAbsolute, resolve } from "path";

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
