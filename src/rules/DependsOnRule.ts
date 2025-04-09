import * as vscode from 'vscode';
import { Rule } from '../types/rule';

interface DefinedKey {
  name: string;
  lineNumber: number;
}

interface DependsOnReference {
  name: string;
  range: vscode.Range;
  lineNumber: number;
}

export class DependsOnRule implements Rule {
  private definedKeys: DefinedKey[] = [];
  private dependsOnRefs: DependsOnReference[] = [];

  initialize(): void {
    this.definedKeys = [];
    this.dependsOnRefs = [];
  }

  processLine(line: string, lineNumber: number): void {
    const keyMatch = line.match(/^\s*key\s*:\s*(.+)$/);
    if (keyMatch) {
      const key = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');
      this.definedKeys.push({ name: key, lineNumber });
      return;
    }

    const dependsInlineMatch = line.match(/^\s*depends_on\s*:\s*(.+)$/);
    if (dependsInlineMatch && !dependsInlineMatch[1].startsWith('[')) {
      const name = dependsInlineMatch[1].trim().replace(/^['"-]+|['"-]+$/g, '');
      const index = line.indexOf(name);
      this.dependsOnRefs.push({
        name,
        lineNumber,
        range: new vscode.Range(lineNumber, index, lineNumber, index + name.length),
      });
      return;
    }

    if (/^\s*-\s*(.+)$/.test(line) && this.previousLineWasDependsOn) {
      const name = line.match(/^\s*-\s*(.+)$/)?.[1]?.trim().replace(/^['"]|['"]$/g, '');
      if (name) {
        const index = line.indexOf(name);
        this.dependsOnRefs.push({
          name,
          lineNumber,
          range: new vscode.Range(lineNumber, index, lineNumber, index + name.length),
        });
      }
    }

    this.previousLineWasDependsOn = /^\s*depends_on\s*:\s*$/.test(line);
  }

  private previousLineWasDependsOn = false;

  finalize(): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    for (const dep of this.dependsOnRefs) {
      const definedBefore = this.definedKeys.find(k => k.name === dep.name && k.lineNumber < dep.lineNumber);
      if (!definedBefore) {
        diagnostics.push(new vscode.Diagnostic(
          dep.range,
          `depends_on step "${dep.name}" has not been defined previously in this pipeline.`,
          vscode.DiagnosticSeverity.Error
        ));
      }
    }

    return diagnostics;
  }
}