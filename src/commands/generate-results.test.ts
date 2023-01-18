import * as assert from "assert";
import { afterEach, beforeEach } from "mocha";
import {
  stub as sinonStub,
  restore as sinonRestore,
  match as sinonMatch,
  SinonStub,
} from "sinon";
import { window, workspace } from "vscode";
import { TokenizerStorage } from "../core/tokenizer-storage";
import {
  generateArrayDocument,
  generateJsonDocument,
} from "./generate-results";
import { toJsonDocument } from "../utils";
import { TokenStore, TokenToValueItem } from "../types";

suite("Generate results", () => {
  let vsOpenTextDocumentStub: SinonStub;
  let vsShowTextDocumentStub: SinonStub;

  beforeEach(async () => {
    vsOpenTextDocumentStub = sinonStub(
      workspace,
      "openTextDocument"
    ).callThrough();
    vsShowTextDocumentStub = sinonStub(
      window,
      "showTextDocument"
    ).callThrough();
  });

  afterEach(async () => {
    sinonRestore();
  });

  suite("generateJsonDocument()", () => {
    let storeDataAsJSON: TokenStore;
    let storeGetJsonStub: SinonStub;

    beforeEach(() => {
      storeDataAsJSON = {
        token: {
          value: "value",
        },
      };
      storeGetJsonStub = sinonStub(
        TokenizerStorage,
        "getTokenSubStoreAsJson"
      ).returns(Promise.resolve(storeDataAsJSON));
    });

    test("should get JSON results from the store", async () => {
      await generateJsonDocument();
      assert.ok(storeGetJsonStub.calledOnce);
    });

    test("should call openTextDocument with correct arguments", async () => {
      await generateJsonDocument();
      assert.ok(
        vsOpenTextDocumentStub.calledWith(
          sinonMatch({
            language: "json",
            content: toJsonDocument(storeDataAsJSON),
          })
        )
      );
    });

    test("should call showTextDocument", async () => {
      await generateJsonDocument();
      const document = await vsOpenTextDocumentStub.returnValues[0];

      assert.ok(vsShowTextDocumentStub.calledWith(document));
    });
  });

  suite("generateArrayDocument()", () => {
    let storeDataAsArray: TokenToValueItem[];
    let storeGetArrayStub: SinonStub;

    beforeEach(() => {
      storeDataAsArray = [{ token: "token", value: "value" }];
      storeGetArrayStub = sinonStub(
        TokenizerStorage,
        "getTokenSubStoreAsArray"
      ).returns(Promise.resolve(storeDataAsArray));
    });

    test("should get Array results from the store", async () => {
      await generateArrayDocument();
      assert.ok(storeGetArrayStub.calledOnce);
    });

    test("should call openTextDocument with correct arguments", async () => {
      await generateArrayDocument();
      assert.ok(
        vsOpenTextDocumentStub.calledWith(
          sinonMatch({
            language: "json",
            content: toJsonDocument(storeDataAsArray),
          })
        )
      );
    });

    test("should call showTextDocument", async () => {
      await generateArrayDocument();
      const document = await vsOpenTextDocumentStub.returnValues[0];

      assert.ok(vsShowTextDocumentStub.calledWith(document));
    });
  });
});
