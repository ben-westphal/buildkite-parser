import * as vscode from 'vscode';
import { DocumentParser } from './parser/DocumentParser';

const diagnosticCollection = vscode.languages.createDiagnosticCollection('buildkite');

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(diagnosticCollection);

  const parser = new DocumentParser();

  const parse = (document: vscode.TextDocument) => {
    if (!/(buildkite|pipeline).*\.ya?ml$/.test(document.fileName)) {
      diagnosticCollection.delete(document.uri);
      return;
    }
    const diagnostics = parser.parse(document);
    diagnosticCollection.set(document.uri, diagnostics);
  };

  vscode.workspace.textDocuments.forEach(parse);
  vscode.workspace.onDidOpenTextDocument(parse);
  vscode.workspace.onDidChangeTextDocument(e => parse(e.document));
}

export function deactivate() {
  diagnosticCollection.clear();
}