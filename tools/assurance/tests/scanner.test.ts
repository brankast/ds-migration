import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { containsToken, scanUsages } from '../src/scanner';
import type { ChangeEvent } from '../src/types';

const checkbox: ChangeEvent = {
  id: 'list-checkbox',
  library: '@angular/material',
  fromVersion: '21.0.0',
  toVersion: '22.0.0',
  component: 'MatListOption',
  changeType: 'removed',
  severity: 'high',
  description: 'checkboxPosition removed',
  affectedApi: 'MatListOption.checkboxPosition',
  replacement: 'togglePosition',
  autoPatch: true,
};

describe('scanner', () => {
  it('does not treat a longer token as a match', () => {
    expect(containsToken('<button mat-icon-button>', 'mat-button')).toBe(false);
    expect(containsToken('<mat-list-option checkboxPosition="before">', 'checkboxPosition')).toBe(
      true,
    );
  });

  it('finds changelog APIs with file and line evidence', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'assure-scan-'));
    mkdirSync(path.join(dir, 'src'));
    writeFileSync(
      path.join(dir, 'src', 'demo.html'),
      '<mat-list-option checkboxPosition="before">Express</mat-list-option>\n',
    );

    const usages = scanUsages([path.join(dir, 'src')], [checkbox], { relativeTo: dir });
    expect(usages).toHaveLength(1);
    expect(usages[0]?.file).toBe('src/demo.html');
    expect(usages[0]?.line).toBe(1);
    expect(usages[0]?.matchedApi).toBe('MatListOption.checkboxPosition');
  });
});
