export const extName = "text-tokenizer";
export const extPublisher = "vkrepkiy";
export const extId = `${extPublisher}.${extName}`;
export const tokenStoreKey = "tmpTokenStore";
export const stringPlaceholder = "%token%";

export class Configuration {
  tokenWrapper = `{{ $translate("${stringPlaceholder}") }}`;
}
