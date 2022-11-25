export const extName = "vkrepkiy-tokenizer";
export const tokenStoreKey = "tmpTokenStore";
export const stringPlaceholder = "%token%";

export class Configuration {
  tokenWrapper = `{{ $translate("${stringPlaceholder}") }}`;
}
