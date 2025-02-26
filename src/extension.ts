import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(diagnosticCollection);
  vscode.workspace.onDidOpenTextDocument(parseDocument);
  vscode.workspace.onDidChangeTextDocument(e => parseDocument(e.document));
  vscode.workspace.textDocuments.forEach(parseDocument);
}

export function deactivate() {
  diagnosticCollection.clear();
}

const diagnosticCollection = vscode.languages.createDiagnosticCollection('buildkite');

interface Document {
  steps: BuildkiteStep[]
  env: string[]
}

interface BuildkiteStep {
  label: StepElement
  lineNumber: number
  range: vscode.Range
  stepNumber: number
  dependsOn?: StepElement[]
  key?: StepElement
}

interface StepElement {
  lineNumber: number
  name: string
  range: vscode.Range
}

function getStep(document: Document, name: string) {
  return document.steps.find((step) => step.label.name === name);
}

function getDocumentStructure(document: vscode.TextDocument) {
  if (!document.fileName.match(/buildkite.*\.ya?ml$/) && !document.fileName.match(/pipeline.*\.ya?ml$/)) {
    diagnosticCollection.delete(document.uri);
    return;
  }

  const lines = document.getText().split(/\r?\n/);
  const steps: BuildkiteStep[] = [];

  let stepCount = 1;
  let currentStep: BuildkiteStep | null = null;
  let stepIndent = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const labelMatch = line.match(/^(\s*)-\s*label:\s*['"]?(.*)['"]?$/);

    if (labelMatch) {
      stepIndent = labelMatch[0].indexOf('-');
      currentStep = {
        label: { name: labelMatch[1].trim(), lineNumber: i, range: new vscode.Range(i, 0, i, line.length) },
        stepNumber: stepCount,
        lineNumber: i + 1,
        range: new vscode.Range(i, 0, i, line.length)
      };

      steps.push(currentStep);
      stepCount++;
      continue;
    }

    if (currentStep && stepIndent < 0 && line.trim().startsWith('label:')) {
      stepIndent = line.search(/\S/);
    }

    if (currentStep && line.includes('depends_on:')) {
      const dependencies: StepElement[] = [];

      // TODO: Add in logic for checking for multiple dependencies
      dependencies.push({
        name: lines[i + 1].trim(),
        lineNumber: i + 1,
        range: new vscode.Range(i + 1, 0, i + 1, lines[i].length)
      });

      currentStep.dependsOn = dependencies;
    }

    if (currentStep && line.includes('key:')) {
      // TODO: Add in logic for checking for multiple dependencies
      currentStep.key = {
        name: extractYamlValue(lines[i], "key").trim(),
        lineNumber: i,
        range: new vscode.Range(i + 1, 0, i + 1, lines[i].length)
      };
    }
  }

  console.log("Parsed document structure: ", steps);
  return steps;
}

// thx gippity
export function extractYamlValue(line: string, key: string): string {
  const regex = new RegExp(`^\\s*${key}\\s*:\\s*(.+)$`);
  const match = line.match(regex);
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
}

function removeLeadingDash(str: string): string {
  return str.replace(/^\s*-\s*/, '');
}

function parseDocument(document: vscode.TextDocument) {
  if (!document.fileName.match(/buildkite.*\.ya?ml$/) && !document.fileName.match(/pipeline.*\.ya?ml$/)) {
    diagnosticCollection.delete(document.uri);
    return;
  }

  const parsedSteps = getDocumentStructure(document) || [];
  const diagnostics: vscode.Diagnostic[] = checkForStepDependencies(parsedSteps);
  console.log(`Found ${diagnostics.length} diagnostics for document`);

  diagnosticCollection.set(document.uri, diagnostics);
}

function checkForStepDependencies(parsedSteps: BuildkiteStep[]) {
  const diagnostics: vscode.Diagnostic[] = [];

  parsedSteps?.forEach((step) => {
    const dependsOnName: string = removeLeadingDash(step.dependsOn?.[0].name || "");

    console.log('Dependency name: ', removeLeadingDash(dependsOnName));

    const previousStepKeys: string[] = [];

    parsedSteps.forEach((step) => {
      step.key?.name && previousStepKeys.push(step.key?.name);
    });

    console.log(previousStepKeys);

    if (dependsOnName && !previousStepKeys.includes(dependsOnName)) {
      console.log("pushing diagnostic");
      diagnostics.push(
        new vscode.Diagnostic(
          step.range,
          "Error: depends_on step not present in pipeline.",
          vscode.DiagnosticSeverity.Error
        )
      );
    }
  });

  console.log(`Returning ${diagnostics.length} step dependency diagnostics`);
  return diagnostics;
}
