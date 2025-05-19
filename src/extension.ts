import * as vscode from 'vscode';
import { DocumentParser } from './parser/DocumentParser';

const diagnosticCollection = vscode.languages.createDiagnosticCollection('buildkite');

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(diagnosticCollection);

  const parser = new DocumentParser();

  const parseDoc = (document: vscode.TextDocument) => {
    if (!/(buildkite|pipeline).*\.ya?ml$/.test(document.fileName)) {
      diagnosticCollection.delete(document.uri);
      return;
    }
    diagnosticCollection.delete(document.uri);
    const diagnostics = parser.parse(document);
    diagnosticCollection.set(document.uri, diagnostics);
  };

  vscode.workspace.textDocuments.forEach(parseDoc);
  vscode.workspace.onDidOpenTextDocument(parseDoc);
  vscode.workspace.onDidChangeTextDocument(e => parseDoc(e.document));

  // below is how we interact with the users config file
  // we don't want to load the file from disk every single time we parse
  // so instead we throw it in memory. And then re pull it if we ever see a change to
  // the users config file.
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    const root = folders[0];
    const pattern = new vscode.RelativePattern(root, '.buildkite/pipelint.config.json');
    const configWatcher = vscode.workspace.createFileSystemWatcher(pattern);

    context.subscriptions.push(
      configWatcher,
      configWatcher.onDidChange(() => {
        parser.reloadConfig();
        vscode.workspace.textDocuments.forEach(parseDoc);
      }),
      configWatcher.onDidCreate(() => {
        parser.reloadConfig();
        vscode.workspace.textDocuments.forEach(parseDoc);
      }),
      configWatcher.onDidDelete(() => {
        parser.reloadConfig();
        vscode.workspace.textDocuments.forEach(parseDoc);
      })
    );
  }
}

export function deactivate() {
  diagnosticCollection.clear();
}