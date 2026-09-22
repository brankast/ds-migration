import fs from 'node:fs';
import path from 'node:path';
import { containsToken } from './scanner.js';
import type { ProposedPatch } from './types.js';

const SOURCE_EXTENSIONS = new Set(['.html', '.ts']);

export function applyDocumentedPatches(root: string, patches: ProposedPatch[]): string[] {
  const byFile = new Map<string, { from: string; to: string }[]>();

  for (const patch of patches) {
    if (!patch.find || !patch.replace || patch.find === patch.replace) {
      continue;
    }
    const current = byFile.get(patch.file) ?? [];
    if (!current.some((item) => item.from === patch.find && item.to === patch.replace)) {
      current.push({ from: patch.find, to: patch.replace });
    }
    byFile.set(patch.file, current);
  }

  const changed: string[] = [];
  for (const [rel, replacements] of byFile) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full) || !SOURCE_EXTENSIONS.has(path.extname(full))) {
      continue;
    }
    const original = fs.readFileSync(full, 'utf8');
    const mode = path.extname(full) === '.html' ? 'tags' : 'tokens';
    const next = rewriteSource(original, replacements, mode);
    if (next !== original) {
      fs.writeFileSync(full, next);
      changed.push(rel);
    }
  }

  return changed;
}

export function rewriteSource(
  source: string,
  replacements: { from: string; to: string }[],
  mode: 'tags' | 'tokens' = 'tags',
): string {
  if (mode === 'tags') {
    return source.replace(/<[^!>][^>]*>/g, (tag) => applyReplacements(tag, replacements));
  }
  return applyReplacements(source, replacements);
}

function applyReplacements(
  source: string,
  replacements: { from: string; to: string }[],
): string {
  let next = source;
  for (const mapping of replacements) {
    if (!containsToken(next, mapping.from)) {
      continue;
    }
    const pattern = new RegExp(`(?<![\\w-])${escapeRegExp(mapping.from)}(?![\\w-])`, 'g');
    next = next.replace(pattern, mapping.to);
  }
  return next;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
