import fs from 'node:fs';
import path from 'node:path';

const VERSION_RE = /(\d+)\.(\d+)\.(\d+)/;

export function parseVersion(raw: string): [number, number, number] | null {
  const match = raw.match(VERSION_RE);
  if (!match) {
    return null;
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function versionGt(left: string, right: string): boolean {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) {
    return left > right;
  }
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) {
      return a[i] > b[i];
    }
  }
  return false;
}

export function versionGte(left: string, right: string): boolean {
  return left === right || versionGt(left, right) || compareEqual(left, right);
}

function compareEqual(left: string, right: string): boolean {
  const a = parseVersion(left);
  const b = parseVersion(right);
  return Boolean(a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2]);
}

export function previousMajorFloor(version: string): string {
  const parsed = parseVersion(version);
  if (!parsed) {
    return '0.0.0';
  }
  const major = parsed[0];
  if (major <= 0) {
    return '0.0.0';
  }
  return `${major - 1}.0.0`;
}

export function readInstalledMaterialVersion(root: string): string {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
  ) as { dependencies?: Record<string, string> };
  const raw = packageJson.dependencies?.['@angular/material'] ?? '0.0.0';
  const parsed = parseVersion(raw);
  return parsed ? parsed.join('.') : raw.replace(/^[^\d]+/, '');
}
