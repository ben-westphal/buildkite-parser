# buildkite-parse README

BuildkiteParse is a simple vscode extension that provides additional syntax highlighting to features specific to buildkite pipeline.yml files that cannot be provided by simple json schemas.

## Features

Current features include the following:

1. Syntax highlighting for incorrectly used environment variables
2. Depends_on step highlighting

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.

## Known Issues

1. Depends_on parsing is a little broken at the moment

## Release Notes

Users appreciate release notes as you update your extension.

###

---

## Running Locally

It's pretty simple to get running locally.

Hit `F5` or go to `Run > Start Debugging`

This will open a vscode instance with the extension running. The test-pipelines folder has a pipeline to play with to your hearts content.

Or you can throw a buildkite pipeline in there to have a play with.

## Roadmap

Below are the current features in development

1. Settings for environment variables allowing the user to provide vars that are inserted externally to the pipeline.yml file itself.

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Other info

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
