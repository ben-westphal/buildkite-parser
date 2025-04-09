import * as vscode from 'vscode';
import { Rule } from '../types/rule';

export class EnvironmentVarRule implements Rule {
  private definedEnvVars: Set<string> = new Set();
  private usedEnvVars: { name: string, range: vscode.Range }[] = [];
  private inEnvSection = false;

  initialize(): void {
    this.definedEnvVars.clear();
    this.usedEnvVars = [];
    this.inEnvSection = false;
  }

  processLine(line: string, lineNumber: number): void {
    if (/^\s*env\s*:/.test(line)) {
      this.inEnvSection = true;
      return;
    }

    if (this.inEnvSection && /^\S/.test(line)) {
      this.inEnvSection = false;
    }

    if (this.inEnvSection) {
      const match = line.match(/^\s+([\w\d_]+)\s*:/);
      if (match) {
        this.definedEnvVars.add(match[1].trim());
      }
    }

    const regex = /\$\{([\w\d_]+)\}/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      const varName = match[1];
      const start = match.index + 2;
      const range = new vscode.Range(
        new vscode.Position(lineNumber, start),
        new vscode.Position(lineNumber, start + varName.length)
      );

      this.usedEnvVars.push({ name: varName, range });
    }
  }

  finalize(): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    for (const used of this.usedEnvVars) {
      if (!this.definedEnvVars.has(used.name)) {
        diagnostics.push(new vscode.Diagnostic(
          used.range,
          `Environment variable "${used.name}" is used but not defined in env section.`,
          vscode.DiagnosticSeverity.Error
        ));
      }
    }

    return diagnostics;
  }
}