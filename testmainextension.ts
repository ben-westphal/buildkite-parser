// src/extension.ts
import * as vscode from 'vscode';
import Parser from 'tree-sitter';
import { SyntaxNode } from 'tree-sitter';
import YAML from 'tree-sitter-yaml';

const parser = new Parser();
parser.setLanguage(YAML);

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('buildkite-pipeline');
  context.subscriptions.push(diagnosticCollection);

  vscode.workspace.onDidOpenTextDocument(validatePipeline);
  vscode.workspace.onDidChangeTextDocument(e => validatePipeline(e.document));

  vscode.workspace.textDocuments.forEach(validatePipeline);
}

function validatePipeline(document: vscode.TextDocument) {
  if (!document.fileName.match(/buildkite.*\.ya?ml$/) && !document.fileName.includes('.buildkite')) {
    return;
  }

  const tree = parser.parse(document.getText());
  const diagnostics: vscode.Diagnostic[] = [];

  const stepsNodes = findStepsNodes(tree.rootNode);

  stepsNodes.forEach(stepNode => {
    if (stepHasDependsOn(stepNode)) {
      const labelNode = findLabelNode(stepNode);
      const range = nodeToRange(labelNode ?? stepNode, document);

      diagnostics.push(new vscode.Diagnostic(
        range,
        `Step contains 'depends_on' field.`,
        vscode.DiagnosticSeverity.Warning
      ));
    }

  });

  diagnosticCollection.set(document.uri, diagnostics);
}

export function nodeToRange(node: Parser.SyntaxNode): vscode.Range {
    return new vscode.Range(
        new vscode.Position(node.startPosition.row, node.startPosition.column),
        new vscode.Position(node.endPosition.row, node.endPosition.column)
    );
}

export function deactivate() {
  diagnosticCollection.clear();
}

function findStepsNodes(root: Parser.SyntaxNode): Parser.SyntaxNode[] {
  const stepsNodes: Parser.SyntaxNode[] = [];

  root.descendantsOfType('block_mapping_pair').forEach(node => {
    const key = node.child(0)?.text;
    if (key === 'steps') {
      const sequenceNode = node.childForFieldName('value');
      if (sequenceIsArray(sequenceNodeType(node))) {
        stepsNodes.push(...node.descendantsOfType('block_node'));
      }
    }
  });

  return stepsNodes;
}

function stepHasDependsOn(stepNode: Parser.SyntaxNode): boolean {
  return stepNode.descendantsOfType('block_mapping_pair').some(pair =>
    pair.child(0)?.text === 'depends_on'
  );
}

function findLabelNode(stepNode: Parser.SyntaxNode): Parser.SyntaxNode | null {
  return stepNode.descendantsOfType('block_mapping_pair').find(pair =>
    pair.child(0)?.text === 'label'
  )?.child(1) || null;
}
