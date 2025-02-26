import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(diagnosticCollection);
  vscode.workspace.onDidOpenTextDocument(validatePipeline);
  vscode.workspace.onDidChangeTextDocument(e => validatePipeline(e.document));
  vscode.workspace.textDocuments.forEach(validatePipeline);
}

export function deactivate() {
  diagnosticCollection.clear();
}

const diagnosticCollection = vscode.languages.createDiagnosticCollection('buildkite');

function validatePipeline(document: vscode.TextDocument) {
  if (!document.fileName.match(/buildkite.*\.ya?ml$/) && !document.fileName.match(/pipeline.*\.ya?ml$/)) {
    diagnosticCollection.delete(document.uri);
    return;
  }

  const diagnostics: vscode.Diagnostic[] = [];

  const text = document.getText();
  const lines = text.split(/\r?\n/);

  let currentStepLine: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^\s*-\s*(label|input|key)\s*:/)) {
      currentStepLine = i;
    }

    if (line.match(/^\s*depends_on\s*:/) && currentStepLine !== null) {
      const range = new vscode.Range(
        new vscode.Position(currentStepLine, 0),
        new vscode.Position(currentStepLine, lines[currentStepLine].length)
      );

      const diagnostic = new vscode.Diagnostic(
        range,
        "This step has a 'depends_on' field.",
        vscode.DiagnosticSeverity.Error
      );

      diagnostics.push(diagnostic);
      currentStepLine = null;
    }
  }

  diagnosticCollection.set(document.uri, diagnostics);
}

function detectErrors() {
  // Loop over each step and apply rules
}

function checkQueue() {

}

function checkDependsOn() {

}

interface StepElement {
  name: string
  lineNumber: number
  additionalElements?: Array<StepElement>
}

interface BuildkiteStep {
  label: StepElement
  dependsOn?: StepElement
  queue?: StepElement
  command?: StepElement
}

function findAllSteps(document: vscode.TextDocument) {
  // Find all steps as an array, return a json structure with the depends_on line like so:
  if (!document.fileName.match(/buildkite.*\.ya?ml$/) && !document.fileName.match(/pipeline.*\.ya?ml$/)) {
    diagnosticCollection.delete(document.uri);
    return;
  }

  const diagnostics: vscode.Diagnostic[] = [];
  const steps: BuildkiteStep[] = [];

  const text = document.getText();
  const lines = text.split(/\r?\n/);

  // lines.forEach((line) => {
  //   const step = {};
  //   steps.push(step);
  // });

}
