import * as vscode from 'vscode';
import { Rule } from '../types/rule';
import { DependsOnRule } from '../rules/DependsOnRule';
import { EnvironmentVarRule } from '../rules/EnvironmentVarRule';
import path from 'path';
import fs from 'fs';
import { NoQuotedEnvRule } from '../rules/NoQuotedEnvRule';

export interface ParserConfig {
  rules?: Record<string, any>;
  whitelistedEnvs?: string[];
}

export class DocumentParser {
  constructor() {
    this.reloadConfig();
  }

  private config: ParserConfig = {};

  public reloadConfig(): void {
    const userConfig = this.loadConfig();
    const defaults = this.defaultConfig();
    this.config = {
      rules: { ...defaults.rules, ...userConfig.rules },
      whitelistedEnvs: userConfig.whitelistedEnvs || [],
    };
  }

  private defaultConfig(): ParserConfig {
    return {
      rules: {
        DependsOnRule: true,
        EnvironmentVarRule: true,
        NoQuotedEnvRule: true,
      },
      whitelistedEnvs: [],
    };
  }

  parse(document: vscode.TextDocument): vscode.Diagnostic[] {
    const localConfig = this.config;

    const ruleConstructors: Array<new (whitelistedEnvs?: string[]) => Rule> = [
      DependsOnRule,
      EnvironmentVarRule,
      NoQuotedEnvRule
    ];

    const rules = ruleConstructors
      .filter(ruleConstructor => localConfig.rules?.[ruleConstructor.name] !== false)
      .map(ruleConstructor => new ruleConstructor(localConfig.whitelistedEnvs || []));

    rules.forEach(rule => rule.initialize(document, localConfig));

    const lines = document.getText().split(/\r?\n/);
    lines.forEach((line, index) => {
      rules.forEach(rule => rule.processLine(line, index));
    });

    return rules.flatMap(rule => rule.finalize());
  }

  private loadConfig(): Partial<ParserConfig> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders?.length) {
      return {};
    }

    const root = folders[0].uri.fsPath;
    const configPath = path.join(root, '.buildkite', 'pipelint.config.json');
    if (!fs.existsSync(configPath)) {
      return {};
    }

    try {
      const raw = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(raw);

      const allowedRoot = new Set(['rules', 'whitelistedEnvs']);
      for (const key of Object.keys(parsed)) {
        if (!allowedRoot.has(key)) {
          throw new Error(`Unknown property "${key}" in pipelint.config.json`);
        }
      }

      const allowedRules = new Set([
        'DependsOnRule',
        'EnvironmentVarRule',
        'NoQuotedEnvRule'
      ]);

      if (parsed.rules) {
        for (const r of Object.keys(parsed.rules)) {
          if (!allowedRules.has(r)) {
            throw new Error(`Unknown rule "${r}" in pipelint.config.json.rules`);
          }
        }
      }

      if (parsed.whitelistedEnvs && !Array.isArray(parsed.whitelistedEnvs)) {
        throw new Error(`"whitelistedEnvs" must be an array in pipelint.config.json`);
      }

      return {
        rules: parsed.rules,
        whitelistedEnvs: parsed.whitelistedEnvs,
      };
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : err;
      console.error('Failed loading config:', message);
      return {};
    }
  }
}