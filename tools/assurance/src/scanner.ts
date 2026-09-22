import fs from 'node:fs';
import path from 'node:path';
import type { ChangeEvent, ComponentUsage } from './types.js';

const SCAN_EXTENSIONS = new Set(['.html', '.ts', '.scss']);

export function scanUsages(
  roots: string[],
  events: ChangeEvent[],
  options: { project?: string; relativeTo?: string } = {},
): ComponentUsage[] {
  const files = roots.flatMap((root) => collectFiles(root));
  const usages: ComponentUsage[] = [];
  const project = options.project ?? 'ds-migration';
  const relativeTo = options.relativeTo;

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const rel = toPosix(file);
    const lines = text.split('\n');

    for (const event of events) {
      const needles = needlesFor(event.affectedApi);
      if (needles.length === 0) {
        continue;
      }
      lines.forEach((line, index) => {
        if (!needles.some((token) => containsToken(line, token))) {
          return;
        }
        usages.push({
          project,
          component: event.component,
          usageType: event.affectedApi?.startsWith('mat-') ? 'directive' : 'property',
          file: relativeIfPossible(rel, roots, relativeTo),
          line: index + 1,
          matchedApi: event.affectedApi,
          codeSnippet: line.trim(),
        });
      });
    }
  }

  return usages;
}

export function sourceToken(affectedApi?: string): string | undefined {
  if (!affectedApi) {
    return undefined;
  }
  if (affectedApi.includes('.')) {
    return affectedApi.split('.').pop();
  }
  return affectedApi;
}

export function needlesFor(affectedApi?: string): string[] {
  if (!affectedApi) {
    return [];
  }
  return [...new Set([affectedApi, sourceToken(affectedApi)].filter(Boolean) as string[])];
}

export function containsToken(line: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`);
  return pattern.test(line);
}

function collectFiles(root: string): string[] {
  if (!fs.existsSync(root)) {
    return [];
  }
  const out: string[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) {
          continue;
        }
        stack.push(full);
      } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
        out.push(full);
      }
    }
  }
  return out;
}

function toPosix(file: string): string {
  return file.split(path.sep).join('/');
}

function relativeIfPossible(file: string, roots: string[], relativeTo?: string): string {
  if (relativeTo) {
    const base = toPosix(relativeTo);
    if (file.startsWith(base)) {
      return file.slice(base.length + 1);
    }
  }
  for (const root of roots) {
    const posixRoot = toPosix(root);
    if (file.startsWith(posixRoot)) {
      const parent = toPosix(path.dirname(root));
      return file.slice(parent.length + 1);
    }
  }
  return file;
}
