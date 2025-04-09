# Change Log

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