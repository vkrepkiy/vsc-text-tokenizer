import * as assert from "assert";
import { afterEach, beforeEach } from "mocha";
import { stub as sinonStub, restore as sinonRestore } from "sinon";
import {
  commands,
  MessageItem,
  Selection,
  TextDocument,
  TextEditor,
  window,
} from "vscode";
import {
  defaultAfterEach,
  defaultBeforeEach,
  token1,
  token3,
  value1,
  value3,
} from "../test/test-helpers";
import { TokenizerStorage } from "../core/tokenizer-storage";
import { externalTokenStorage } from "../core/external-token-storage";
import { TokenizerCommand } from "../constants";

suite("Replace with token", () => {
  let document: TextDocument;
  let editor: TextEditor;
  let selection1: Selection;
  let selection2: Selection;
  let selection3: Selection;
  let selection4: Selection;

  beforeEach(async () => {
    const env = await defaultBeforeEach();
    document = env.document;
    editor = env.editor;
    selection1 = env.selection1;
    selection2 = env.selection2;
    selection3 = env.selection3;
    selection4 = env.selection4;
  });

  afterEach(async () => {
    await defaultAfterEach();
    sinonRestore();
  });

  suite("__valid__ inputs (token and selections)", () => {
    test("should call store with the correct token-value pair (__single__ selection)", async () => {
      // Correct user-input
      sinonStub(window, "showInputBox").returns(Promise.resolve(token1));
      // Token was never defined before
      sinonStub(TokenizerStorage, "getTokenValue").returns(
        Promise.resolve(undefined)
      );

      const setTokenSpy = sinonStub(TokenizerStorage, "setToken").returns(
        Promise.resolve(undefined)
      );

      // Set editor selections
      editor.selections = [selection1];

      // run command
      await commands.executeCommand(TokenizerCommand.replaceWithToken);

      assert.ok(setTokenSpy.calledWith(token1, value1));
    });

    test("should call store with the correct token-value pair (__multiple__ selections)", async () => {
      // Correct user-input
      sinonStub(window, "showInputBox").returns(Promise.resolve(token3));
      // Token was never defined before
      sinonStub(TokenizerStorage, "getTokenValue").returns(
        Promise.resolve(undefined)
      );

      const setTokenSpy = sinonStub(TokenizerStorage, "setToken").returns(
        Promise.resolve(undefined)
      );

      // Set editor selections
      editor.selections = [selection3, selection4];

      // run command
      await commands.executeCommand(TokenizerCommand.replaceWithToken);

      assert.ok(setTokenSpy.calledWith(token3, value3));
    });
  });

  suite("__invalid__ inputs (token and selections)", () => {
    test("should show an error message if user have no active text editor", async () => {
      // Spy on show error message method
      const showErrorMessageSpy = sinonStub(window, "showErrorMessage").returns(
        Promise.resolve(undefined as unknown as MessageItem)
      );

      // Incorrect user-input
      sinonStub(window, "activeTextEditor").returns(Promise.resolve(null));

      const setTokenSpy = sinonStub(TokenizerStorage, "setToken").returns(
        Promise.resolve(undefined)
      );

      // run command
      await commands.executeCommand(TokenizerCommand.replaceWithToken);

      assert.ok(setTokenSpy.notCalled);
      assert.ok(showErrorMessageSpy.calledOnce);
    });

    test("should show an error message if user have an empty selection", async () => {
      // Spy on show error message method
      const showErrorMessageSpy = sinonStub(window, "showErrorMessage").returns(
        Promise.resolve(undefined as unknown as MessageItem)
      );

      // Incorrect user-input
      sinonStub(window, "showInputBox").returns(Promise.resolve(""));

      const setTokenSpy = sinonStub(TokenizerStorage, "setToken").returns(
        Promise.resolve(undefined)
      );

      // Set editor selections
      editor.selections = [];

      // run command
      await commands.executeCommand(TokenizerCommand.replaceWithToken);

      assert.ok(setTokenSpy.notCalled);
      assert.ok(showErrorMessageSpy.calledOnce);
    });

    test("should show an error message if user tries to tokenize multiple __unequal__ selections", async () => {
      // Spy on show error message method
      const showErrorMessageSpy = sinonStub(window, "showErrorMessage").returns(
        Promise.resolve(undefined as unknown as MessageItem)
      );

      // Token was never defined before
      sinonStub(TokenizerStorage, "getTokenValue").returns(
        Promise.resolve(undefined)
      );

      const setTokenSpy = sinonStub(TokenizerStorage, "setToken").returns(
        Promise.resolve(undefined)
      );

      // Set editor selections
      editor.selections = [selection1, selection3];

      // run command
      await commands.executeCommand(TokenizerCommand.replaceWithToken);

      assert.ok(setTokenSpy.notCalled);
      assert.ok(showErrorMessageSpy.calledOnce);
    });

    test("should show a warning dialog if user tries to override a token's value which is already existing in __tokenizer-storage__", async () => {
      // Spy on show error message method
      const showWarningMessageSpy = sinonStub(
        window,
        "showWarningMessage"
      ).returns(Promise.resolve(undefined as unknown as MessageItem));

      // Correct user-input for token1-value1 pair
      sinonStub(window, "showInputBox").returns(Promise.resolve(token1));
      // Token1 has value1 value in the __tokenizer storage__
      sinonStub(TokenizerStorage, "getTokenValue").returns(
        Promise.resolve(value1)
      );

      const setTokenSpy = sinonStub(TokenizerStorage, "setToken").returns(
        Promise.resolve(undefined)
      );

      // Set editor selections (differs from the one in the store)
      editor.selections = [selection3];

      // run command
      await commands.executeCommand(TokenizerCommand.replaceWithToken);

      assert.ok(setTokenSpy.notCalled);
      assert.ok(showWarningMessageSpy.calledOnce);
    });
  });

  test("should show a warning dialog if user tries to override a token's value which is already existing in __external-token-storage__", async () => {
    // Spy on show error message method
    const showWarningMessageSpy = sinonStub(
      window,
      "showWarningMessage"
    ).returns(Promise.resolve(undefined as unknown as MessageItem));

    // Correct user-input for token1-value1 pair
    sinonStub(window, "showInputBox").returns(Promise.resolve(token1));
    // Token1 has value1 value in the __external token storage__
    sinonStub(externalTokenStorage, "getTokenValue").returns(
      Promise.resolve(value1)
    );

    const setTokenSpy = sinonStub(TokenizerStorage, "setToken").returns(
      Promise.resolve(undefined)
    );

    // Set editor selections (differs from the one in the store)
    editor.selections = [selection3];

    // run command
    await commands.executeCommand(TokenizerCommand.replaceWithToken);

    assert.ok(setTokenSpy.notCalled);
    assert.ok(showWarningMessageSpy.calledOnce);
  });
});
