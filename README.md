# Text Tokenizer

This extension is meant to improve the process of replacing text parts with tokens (e.g. localization of hardcoded values). It is designed to be framework agnostic, so make sure to configure it to achieve the best experience.

## Text tokenization

Each time you replace a string with a token it is stored in memory. You can make multiple replacement operations one by one and finally generate the results as a JSON file which can be easily processed for any application.

## Mouseover hints

If properly configured (see "Configuration" section below) it would provide hints on mouse over tokens containing the associated value.

![Functionality presentation](./presentation.gif)

## Configuration

It's recommended to define custom options in the [workspace settings](https://code.visualstudio.com/docs/getstarted/settings) to get the most out of the extension.

### Text tokenization configuration

#### **text-tokenizer.tokenWrapper**

The default scenario is to have a token inside some wrapper (e.g. localization function or HTML tag), you can define a `text-tokenizer.tokenWrapper` param.

```json
{
  "text-tokenizer.tokenWrapper": "$translate(\"%token%\")"
}
```

### Mouseover hints configuration

#### **text-tokenizer.tokenRegExps**

It is possible to provide multiple regular expressions to let the extension to look up for different patterns to extract token.

```json
{
  "text-tokenizer.tokenRegExps": [
    "translate\\([\\s\\n]*?['\"`]%token%['\"`][\\s\\n]*?\\)",
    "useTranslator\\([\\s\\n]*?['\"`]%token%['\"`][\\s\\n]*?\\)"
  ]
}
```

#### **text-tokenizer.tokenCollectionPath**

This option should be set up with the `text-tokenizer.tokenCollectionGetter`. It is used to watch file changes and update token list only when it is necessary.

- The path should be **absolute**.
- If `text-tokenizer.tokenCollectionGetter` is set to the preset (e.g. `json-array`, `json-map`) the path should point to a valid **JSON** file.
- If `text-tokenizer.tokenCollectionGetter` is a path to a custom function, this path would be used only for tracking file changes to get token updates.

```json
{
  "text-tokenizer.tokenCollectionPath": "/absolute/path/to/file.json"
}
```

#### **text-tokenizer.tokenCollectionGetter**

It's possible to enable the functionality of getting code hints for the existing tokens (in-memory ones would be shown anyway) by providing the preset key or an absolute path to the file with the default export of the function.

Available values:

- `json-map` would read JSON file from `text-tokenizer.tokenCollectionPath` absolute path. Data should be in the following format:

```json
// workspace.json
{
  "text-tokenizer.tokenCollectionGetter": "json-map",
  "text-tokenizer.tokenCollectionPath": "/absolute/path/to/token-collection.json"
}

// token-collection.json
{
  "token1": "value1",
  "token2": "value2",
  ...
}
```

- `json-array` would read JSON file from `text-tokenizer.tokenCollectionPath` absolute path. Data should be in the following format:

```json
// workspace.json
{
  "text-tokenizer.tokenCollectionGetter": "json-array",
  "text-tokenizer.tokenCollectionPath": "/absolute/path/to/token-collection.json"
}

// token-collection.json
[
  {
    "token": "token1",
    "value": "value1"
  },
  {
    "token": "token2",
    "value": "value2"
  }
]
```

- `/absolute/path/to/token-getter-function.js` pointing to a file containing default export with a function which **returns a Promise** with an array of tokens and values in the following format:

```javascript
// workspace.json
{
  "text-tokenizer.tokenCollectionGetter": "/absolute/path/to/token-getter-function.js",
  "text-tokenizer.tokenCollectionPath": "/absolute/path/to/token-collection.json"
}

// token-collection.json
{
  tokens: [
    {
      "token": "token.number.one",
      "value": "The corresponding value One"
    },

    {
      "token": "token.number.two",
      "value": "The corresponding value Two"
    }
  ]
}

// token-getter-function.js
const { readFile } = require("fs/promises");

module.exports = async function (tokenCollectionPath) {
  const fileContent = await readFile(tokenCollectionPath, {
    encoding: "utf-8",
  });

  return JSON.parse(fileContent).tokens;
};

```

## Commands

### Text tokenizer: Replace selection with a token

Select a text fragment you wish to replace and execute the command. You'll see a prompt, enter a token, and it would replace your selection.
You can execute the command multiple times. All selected text-token pairs would be stored until you run the "Text tokenizer: Generate results and clean cache" command.

### Text tokenizer: Generate results and clean cache

This command would open a new document with all replaced selection-to-token pairs.
**The text tokenizer store would be cleaned, so copy the result before closing the generated document**

```json
[
  {
    "token": "token.one",
    "value": "selection-1"
  },
  {
    "token": "token.two",
    "value": "selection-2"
  }
]
```

## Limitations

I'm trying to improve this extension in my free time, but still there is much to do. The most important limitations are caused by the fact that now this extension relies on **RegExps** to detect tokens on a **single line**, so:

- it can't detect multiline wrapped tokens even if such regexps are provided;
- it can't detect dynamic tokens like `errors.${key}` as it is not relying on any language server.
