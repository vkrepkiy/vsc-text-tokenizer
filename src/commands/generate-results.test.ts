import * as assert from "assert";
import { afterEach, beforeEach } from "mocha";
import {
  stub as sinonStub,
  restore as sinonRestore,
  match as sinonMatch,
  SinonStub,
} from "sinon";
import { window, workspace } from "vscode";
import { TmpResultStore } from "../utils/tmp-result-store";
import { generateJsonDocument } from "./generate-results";
import { toJsonDocument } from "../utils/helpers";

suite("Generate results", () => {
  let storeData: Record<string, unknown>;
  let storeGetJsonStub: SinonStub;
  let vsOpenTextDocumentStub: SinonStub;
  let vsShowTextDocumentStub: SinonStub;

  beforeEach(async () => {
    storeData = { testJSON: true };
    storeGetJsonStub = sinonStub(TmpResultStore, "getJson").returns(
      Promise.resolve(storeData)
    );
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
          content: toJsonDocument(storeData),
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
