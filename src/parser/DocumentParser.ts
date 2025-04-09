import * as vscode from 'vscode';
import { Rule } from '../types/rule';
import { DependsOnRule } from '../rules/DependsOnRule';
import { EnvironmentVarRule } from '../rules/EnvironmentVarRule';

export class DocumentParser {
  private rules: Rule[] = [];

  constructor() {
    this.rules = [
      new DependsOnRule(),
      new EnvironmentVarRule(),
      // new KeyCheckRule(),
    ];
  }

  parse(document: vscode.TextDocument): vscode.Diagnostic[] {
    this.rules.forEach(rule => rule.initialize(document));

    const lines = document.getText().split(/\r?\n/);
    lines.forEach((line, index) => {
      this.rules.forEach(rule => rule.processLine(line, index));
    });

    return this.rules.flatMap(rule => rule.finalize());
  }
}