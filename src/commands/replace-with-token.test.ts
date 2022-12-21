import * as assert from "assert";
import { afterEach, beforeEach } from "mocha";
import { stub as sinonStub, restore as sinonRestore } from "sinon";
import {
  commands,
  Selection,
  TextDocument,
  TextEditor,
  window,
  workspace,
} from "vscode";
import { Command } from "./types";
import {
  defaultAfterEach,
  defaultBeforeEach,
  token1,
  value1,
} from "../test/helpers";
import { TmpResultStore } from "../services/tmp-result-store";

suite("Replace with token", () => {
  let document: TextDocument;
  let editor: TextEditor;
  let selection1: Selection;
  let selection2: Selection;
  let selection3: Selection;

  beforeEach(async () => {
    const env = await defaultBeforeEach();
    document = env.document;
    editor = env.editor;
    selection1 = env.selection1;
    selection2 = env.selection2;
    selection3 = env.selection3;
  });

  afterEach(async () => {
    await defaultAfterEach();
    sinonRestore();
  });

  test("should call store with correct token-value pair", async () => {
    // Make ideal conditions
    sinonStub(window, "showInputBox").returns(Promise.resolve(token1));
    sinonStub(TmpResultStore, "getValue").returns(Promise.resolve(undefined));
    const tmpResultStoreSetSpy = sinonStub(TmpResultStore, "set").returns(
      Promise.resolve(undefined)
    );

    // select text
    editor.selection = selection1;

    // run command
    await commands.executeCommand(Command.replaceWithToken);

    assert.ok(tmpResultStoreSetSpy.calledWith(token1, value1));
  });
});
