# Buildkite Parse

BuildkiteParse is a simple vscode extension that provides additional syntax highlighting to features specific
to buildkite pipeline.yml files that cannot be provided by simple json schemas.

## Features

Current features include the following:

1. Syntax highlighting for incorrectly used environment variables - mispelt or missing environment variables are highlighted
2. Depends_on step highlighting - ensures each step in your pipeline with a depends_on is used earlier in the pipeline
3. No quoted environment variables - ensures environment vars are not accidentally quoted

## Configuration

To configure the extension create a file called `bkparse.config.json` in your .buildkite directory.
This file has type hinting for a better dx.

```
{
  "rules": {
    "DependsOnRule": false,
    "EnvironmentVarRule": false,
    "NoQuotedEnvRule": true
  },
  "excludedEnvs": ["CI", "PATH", "GLOBAL_TF_BACKEND_S3_REGION"]
}
```

ExcludedEnvs should be environment variables that you may be injecting from outside the pipeline. Add them to this array to exempt them from the `EnvironmentVarRule`.


## Known Issues

None right now, create an issue if you find anything!

# Release Notes

## 0.0.4

* Added new rule allowing the user to check environment variables for quotes that would be included in the string.

Eg: It will provide a warning for the following: `REALLY_COOL_ENVIRONMENT: "super-cool-environment"` as the double quotes will end up included in the string.
This often happens when someone copy pastes the variable from another environment which will parse the quoting as expected.
It can be turned on and off in your config file with the value `NoQuotedEnvRule: boolean`

* Added a config file

This config file can be added to your .buildkite directory to turn specific rules on and off, as well as add in external environment variables that may be injected from outside your pipeline.

---

## Running Locally

It's pretty simple to get running locally.

Hit `F5` or go to `Run > Start Debugging`

This will open a vscode instance with the extension running. The test-pipelines folder has a pipeline to play with to your hearts content.

Or you can throw a buildkite pipeline in there to have a play with.

## Roadmap

Below are the current features in development

* Allow parsing of bash scripts that generate pipeline files
* Add tests for all rules
* Npm install it as a package instead
