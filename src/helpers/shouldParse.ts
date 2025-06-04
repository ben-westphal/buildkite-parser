import * as path from 'path';
import * as vscode from 'vscode';
import { ParserConfig } from '../parser/DocumentParser';

export function shouldParse(filePath: string, config: ParserConfig | undefined): boolean {
  const isInBuildkiteFolder = /[/\\]\.buildkite[/\\]/i.test(filePath);
  const isYaml = /\.(ya?ml)$/i.test(filePath);
  const isShell = /\.sh$/i.test(filePath);
  const hasPipelineInName = /pipeline/i.test(path.basename(filePath));
  const bashExperimentalEnabled = config?.bashExperimental === true;

  if (!isInBuildkiteFolder) {
    return false;
  }

  if (isYaml) {
    return true;
  }

  if (isShell) {
    return hasPipelineInName && bashExperimentalEnabled;
  }

  return false;
}