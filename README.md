# Text Tokenizer

This extension would help to automate replacement of selected text with tokens. I found it very useful when had a task to localize the project with hardcoded text.

Each time you replace a string with a token it is stored in memory, so you can repeat this operation multiple times.
When you are ready, just select a command to generate results.

![Functionality presentation](./presentation.gif)

## Configuration

### tokenWrapper

As you would usually need a token inside some localization function, you can define a `tokenWrapper` param in the workspace configuration:

```
{
    "text-tokenizer.tokenWrapper": "$translate(\"%token%\")"
}
```

## Commands

### Text tokenizer: Replace selection with a token

Select a text fragment you wish to replace and execute the command. You'll see a prompt, enter a token, it would replace your selection.
You can execute command multiple times. All selected text-token pairs would be stored until you run "Text tokenizer: Generate results and clean cache" command.

### Text tokenizer: Generate results and clean cache

This command would open a new document with all replaced selection to token pairs.
**The text tokenizer store would be cleaned, so copy this before close**

```
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
