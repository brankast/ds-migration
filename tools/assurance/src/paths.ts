import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
}

export function dataDir(root = repoRoot()): string {
  return path.join(root, 'data');
}

export function scanRoots(root = repoRoot()): string[] {
  return [path.join(root, 'src')];
}

export function changelogSamplePath(root = repoRoot()): string {
  return path.join(dataDir(root), 'releases', 'CHANGELOG.sample.md');
}

export function changelogCachePath(root = repoRoot()): string {
  return path.join(dataDir(root), 'releases', 'CHANGELOG.cache.md');
}

export function latestEventsPath(root = repoRoot()): string {
  return path.join(dataDir(root), 'releases', 'latest-events.json');
}

export function latestAssessmentPath(root = repoRoot()): string {
  return path.join(dataDir(root), 'assessments', 'latest.json');
}

export function changeCasesDir(root = repoRoot()): string {
  return path.join(dataDir(root), 'change-cases');
}

export function latestChangeCasePath(root = repoRoot()): string {
  return path.join(changeCasesDir(root), 'latest.md');
}

export const CHANGELOG_URL =
  'https://raw.githubusercontent.com/angular/components/main/CHANGELOG.md';
