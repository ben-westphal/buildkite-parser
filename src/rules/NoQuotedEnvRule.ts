import * as vscode from 'vscode';
import { Rule } from '../types/rule';

export class NoQuotedEnvRule implements Rule {
  private violations: { name: string; range: vscode.Range }[] = [];

  initialize(): void {
    console.log('NoQuotedEnvRule initialized');
    this.violations = [];
  }

  processLine(line: string, lineNumber: number): void {
    const regex = /(['"])([A-Z][A-Z0-9_]+)\1/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      const fullMatch = match[0];
      const varName = match[2];
      const startCol = match.index;
      const endCol = startCol + fullMatch.length;

      this.violations.push({
        name: varName,
        range: new vscode.Range(
          new vscode.Position(lineNumber, startCol),
          new vscode.Position(lineNumber, endCol)
        )
      });
    }
  }

  finalize(): vscode.Diagnostic[] {
    const violations = this.violations.map(v => new vscode.Diagnostic(
      v.range,
      `Environment variable "${v.name}" should not be quoted.`,
      vscode.DiagnosticSeverity.Error
    ));

    this.violations = [];
    return violations;
  }
}
