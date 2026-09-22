import { assessImpacts, buildAssessment } from '../src/impact';
import type { ChangeEvent, ComponentUsage } from '../src/types';

const listEvent: ChangeEvent = {
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

const legacyEvent: ChangeEvent = {
  id: 'form-legacy',
  library: '@angular/material',
  fromVersion: '21.0.0',
  toVersion: '22.0.0',
  component: 'MatFormField',
  changeType: 'removed',
  severity: 'high',
  description: 'legacy appearance removed',
  affectedApi: 'appearance="legacy"',
  autoPatch: false,
};

const listUsage: ComponentUsage = {
  project: 'ds-migration',
  component: 'MatListOption',
  usageType: 'property',
  file: 'src/fixtures/legacy-form.html',
  line: 8,
  matchedApi: 'MatListOption.checkboxPosition',
  codeSnippet: '<mat-list-option checkboxPosition="before">Express shipping</mat-list-option>',
};

const legacyUsage: ComponentUsage = {
  project: 'ds-migration',
  component: 'MatFormField',
  usageType: 'property',
  file: 'src/fixtures/legacy-form.html',
  line: 2,
  matchedApi: 'appearance="legacy"',
  codeSnippet: '<mat-form-field appearance="legacy">',
};

describe('impact', () => {
  it('patches only when the changelog named a replacement', () => {
    const { impacts, patches } = assessImpacts(
      [listEvent, legacyEvent],
      [listUsage, legacyUsage],
    );
    const list = impacts.find((impact) => impact.changeId === listEvent.id);
    const legacy = impacts.find((impact) => impact.changeId === legacyEvent.id);
    expect(list?.action).toBe('patch');
    expect(legacy?.action).toBe('review');
    expect(patches).toHaveLength(1);
    expect(patches[0]?.find).toBe('checkboxPosition');
    expect(patches[0]?.replace).toBe('togglePosition');
  });

  it('marks unmatched events as none', () => {
    const { impacts } = assessImpacts([listEvent], []);
    expect(impacts[0]?.action).toBe('none');
  });

  it('requires a draft PR whenever this repo is affected', () => {
    const assessment = buildAssessment({
      installedVersion: '22.1.7',
      latestVersion: '22.0.0',
      fromVersion: '21.0.0',
      toVersion: '22.0.0',
      changelogSource: 'sample',
      events: [legacyEvent],
      usages: [legacyUsage],
    });
    expect(assessment.prRequired).toBe(true);
    expect(assessment.patches).toHaveLength(0);
  });
});
