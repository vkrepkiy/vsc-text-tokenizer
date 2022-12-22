import { existsSync } from "fs";
import { resolve } from "path";

export const extName = "text-tokenizer";
export const extPublisher = "vkrepkiy";
export const extId = `${extPublisher}.${extName}`;
export const tokenStoreKey = "tmpTokenStore";
export const stringPlaceholder = "%token%";

export function toJsonDocument(json: unknown) {
  return JSON.stringify(json, null, 2);
}

export function escapeRegExpSpecialChars(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getAbsoluteFilePath(filePath: string) {
  try {
    const absolutePath = resolve(filePath);
    const exists = existsSync(absolutePath);

    return exists ? absolutePath : undefined;
  } catch (e) {
    return undefined;
  }
}
