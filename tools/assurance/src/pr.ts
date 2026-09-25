import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { applyDocumentedPatches } from './codemod.js';
import { latestChangeCasePath } from './paths.js';
import type { Assessment } from './types.js';

export interface PrResult {
  created: boolean;
  url: string | null;
  reason: string;
}

export function maybeCreatePullRequest(options: {
  root: string;
  assessment: Assessment;
  create: boolean;
}): PrResult {
  if (!options.create) {
    return { created: false, url: null, reason: 'PR creation was not requested.' };
  }
  if (!options.assessment.prRequired) {
    return {
      created: false,
      url: null,
      reason: 'No matching Material usages. Nothing to report.',
    };
  }

  const dirty = porcelain(options.root).filter((line) => !isGeneratedOutput(line));
  if (dirty.length > 0) {
    return {
      created: false,
      url: null,
      reason: `Working tree is dirty (${dirty.length} file(s)). Write the Change Case locally and skip the PR.`,
    };
  }

  const changed = applyDocumentedPatches(options.root, options.assessment.patches);
  const title = prTitle(options.assessment, changed.length > 0);

  if (!hasGh()) {
    return {
      created: false,
      url: null,
      reason:
        changed.length > 0
          ? 'gh CLI is not available. Documented replacements were written locally instead of opening a PR.'
          : 'gh CLI is not available. Change Case was written locally instead of opening a PR.',
    };
  }

  const branch = `assure/material-${options.assessment.toVersion}-${stamp()}`;
  try {
    runGit(options.root, ['checkout', '-b', branch]);
    runGit(options.root, [
      'add',
      ...changed,
      'data/assessments',
      'data/change-cases',
      'data/releases',
    ]);
    runGit(options.root, ['commit', '-m', title]);
    runGit(options.root, ['push', '-u', 'origin', 'HEAD']);
    const bodyFile = latestChangeCasePath(options.root);
    const url = execFileSync(
      'gh',
      ['pr', 'create', '--draft', '--title', title, '--body-file', bodyFile],
      { cwd: options.root, encoding: 'utf8' },
    ).trim();
    return { created: true, url, reason: 'Draft pull request created.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      created: false,
      url: null,
      reason: `GitHub PR creation failed: ${message.split('\n')[0]}`,
    };
  }
}

function prTitle(assessment: Assessment, hasPatch: boolean): string {
  const range = `${assessment.fromVersion} → ${assessment.toVersion}`;
  return hasPatch
    ? `chore(material): apply documented changelog replacements (${range})`
    : `chore(material): changelog breaking-change impact (${range})`;
}

function porcelain(root: string): string[] {
  try {
    const output = execFileSync('git', ['status', '--porcelain'], {
      cwd: root,
      encoding: 'utf8',
    });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return ['?? (not a git repository)'];
  }
}

function isGeneratedOutput(line: string): boolean {
  return /data\/(assessments|change-cases|releases)\//.test(line);
}

function hasGh(): boolean {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function runGit(root: string, args: string[]): void {
  execFileSync('git', args, { cwd: root, stdio: 'pipe' });
}

function stamp(): string {
  return new Date().toISOString().slice(0, 10).replaceAll('-', '');
}

export function writeJson(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function writeText(file: string, value: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value.endsWith('\n') ? value : `${value}\n`);
}
