import * as vscode from 'vscode';
import { Rule } from '../types/rule';

export class NoQuotedEnvRule implements Rule {
  private violations: { name: string; range: vscode.Range }[] = [];
  private inEnvSection: boolean = false;
  private envIndent: number = 0;

  initialize(): void {
    console.log('NoQuotedEnvRule initialized');
    this.violations = [];
    this.inEnvSection = false;
    this.envIndent = 0;
  }

  processLine(line: string, lineNumber: number): void {
    const envHeaderMatch = /^([ \t]*)env:\s*$/.exec(line);
    if (envHeaderMatch) {
      this.inEnvSection = true;
      this.envIndent = envHeaderMatch[1].length;
      return;
    }

    if (this.inEnvSection) {
      const indentMatch = /^([ \t]*)/.exec(line);
      const currentIndent = indentMatch ? indentMatch[1].length : 0;

      if (currentIndent <= this.envIndent || (/^\s*\S+\s*:\s*/.test(line) && indentMatch && indentMatch[1].length <= this.envIndent)) {
        this.inEnvSection = false;
      } else {
        const keyValMatch = /^\s*([A-Z][A-Z0-9_]*)\s*:\s*(.+?)\s*(?:#.*)?$/.exec(line);
        if (keyValMatch) {
          const varName = keyValMatch[1];
          const rawValue = keyValMatch[2].trim();
          const quoteMatch = /^(['"])(.*)\1$/.exec(rawValue);
          if (quoteMatch) {
            const startCol = line.indexOf(rawValue);
            const endCol = startCol + rawValue.length;
            this.violations.push({
              name: varName,
              range: new vscode.Range(
                new vscode.Position(lineNumber, startCol),
                new vscode.Position(lineNumber, endCol)
              )
            });
          }
        }
      }
    }
  }

  finalize(): vscode.Diagnostic[] {
    const diagnostics = this.violations.map(v => new vscode.Diagnostic(
      v.range,
      `Environment variable "${v.name}" could be incorrectly quoted.`,
      vscode.DiagnosticSeverity.Error
    ));
    this.violations = [];
    return diagnostics;
  }
}