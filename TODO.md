# TODO

- add options to select one wrapper from multiple pre-defined
- add `contributes/viewsWelcome` with a friendly configuration form activated (by default for all?) or at least friendly setup manual
- make configuration validation on tokenizer-configuration class level
- allow results to be merged to file (low priority)

# Thoughts

- track if users would like to have an access to "update external token storage" trigger (e.g. if they have tokens on remote and want to update it by some custom logic)
- track reaction of users: should we put tokens to local store in case they were already in the external storage?

# Issues

- if config paths are imported once and functions get cached and won't update (user change function -> code behave the same)
- inline hints are shown in system panes, this should not be, only text editors
