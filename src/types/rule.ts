import * as vscode from 'vscode';
import { ParserConfig } from '../parser/DocumentParser';

export interface Rule {
  /**
   * Initialize the rule, this is called once per parse, use this to set up any state that the rule needs
   */
  initialize(document: vscode.TextDocument, config?: ParserConfig): void;

  /**
   * This is called once per line, use this to process the line and update the state of the rule
   */
  processLine(line: string, lineNumber: number): void;

  /**
   * This is called once per parse at the end, use this to finalize the rule and return diagnostics
   */
  finalize(): vscode.Diagnostic[];

  /**
   * TODO: This will be called once, to clean up state of the processor
   */
  // flush(): void;
}