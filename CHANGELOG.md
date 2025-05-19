# Change Log

## 0.0.5

### Bug Fixes

## 0.0.4

* Added new rule allowing the user to check environment variables for quotes that would be included in the string.

Eg: It will provide a warning for the following: `REALLY_COOL_ENVIRONMENT: "super-cool-environment"` as the double quotes will end up included in the string.
This often happens when someone copy pastes the variable from another environment which will parse the quoting as expected.
It can be turned on and off in your config file with the value `NoQuotedEnvRule: boolean`

* Added a config file

This config file can be added to your .buildkite directory to turn specific rules on and off, as well as add in external environment variables that may be injected from outside your pipeline.

## 0.0.3

### Bug Fixes

- Fixed issues with the depends_on step validation. Still havent tested to see if it's completely perfect.

### Features

- Performance significantly increased. Old performance scaled exponentially, 0.0.3 now scales linearly with the size of the document. Only one pass over the document is needed now.
- Project structure has been overhauled. Rules now have a strictly defined structure using an interface to ensure cohesion and easily add new rules.
- Removed pnpm, sysmlinks were causing issues with the build step, couldnt be bothered resolving them.

### Known Issues

- Probably some

## 0.0.2

### Features

- Added support for all vscode versions above 1.95

### Known Issues

- Parsing to ensure depends_on step appears in your pipeline is incomplete

## 0.0.1

### Features

- Initial release
- Add parsing for environment variables
- Add parsing to ensure depends_on step appears in your pipeline [beta]

### Known Issues

- Parsing to ensure depends_on step appears in your pipeline is incomplete