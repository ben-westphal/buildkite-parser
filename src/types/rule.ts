import * as vscode from 'vscode';

export interface Rule {
  initialize(document: vscode.TextDocument): void;
  processLine(line: string, lineNumber: number): void;
  finalize(): vscode.Diagnostic[];
}