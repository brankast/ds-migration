import fs from 'node:fs';
import { buildChangeCases, renderChangeCaseMarkdown, renderLatestMarkdown } from './change-case.js';
import { loadChangelog } from './changelog.js';
import { buildAssessment } from './impact.js';
import { extractChangeEvents, latestStableVersion } from './parser.js';
import {
  changeCasesDir,
  latestAssessmentPath,
  latestChangeCasePath,
  latestEventsPath,
  repoRoot,
  scanRoots,
} from './paths.js';
import { maybeCreatePullRequest, writeJson, writeText } from './pr.js';
import { scanUsages } from './scanner.js';
import type { Assessment } from './types.js';
import { previousMajorFloor, readInstalledMaterialVersion } from './versions.js';

export interface RunOptions {
  root?: string;
  changelogPath?: string;
  fetchRemote?: boolean;
  createPr?: boolean;
}

export async function runAssurance(options: RunOptions = {}): Promise<Assessment> {
  const root = options.root ?? repoRoot();
  const installedVersion = readInstalledMaterialVersion(root);
  const changelog = await loadChangelog({
    root,
    changelogPath: options.changelogPath,
    fetchRemote: options.fetchRemote,
  });
  const latestVersion = latestStableVersion(changelog.text);
  const fromVersion = previousMajorFloor(installedVersion);
  const toVersion = latestVersion;
  const changelogSource = toDisplaySource(root, changelog.sourceUrl);
  const events = extractChangeEvents(changelog, fromVersion, toVersion).map((event) => ({
    ...event,
    sourceUrl: event.sourceUrl?.startsWith('http') ? event.sourceUrl : changelogSource,
  }));
  writeJson(latestEventsPath(root), events);

  const usages = scanUsages(scanRoots(root), events, { relativeTo: root });
  const assessment = buildAssessment({
    installedVersion,
    latestVersion,
    fromVersion,
    toVersion,
    changelogSource,
    events,
    usages,
  });

  const cases = buildChangeCases(assessment);
  writeJson(latestAssessmentPath(root), assessment);
  replaceChangeCases(root, cases, assessment);

  const pr = maybeCreatePullRequest({
    root,
    assessment,
    create: Boolean(options.createPr),
  });
  assessment.prCreated = pr.created;
  assessment.prUrl = pr.url;
  assessment.prReason = pr.reason;
  writeJson(latestAssessmentPath(root), assessment);
  writeText(latestChangeCasePath(root), renderLatestMarkdown(assessment, cases));

  return assessment;
}

function replaceChangeCases(
  root: string,
  cases: ReturnType<typeof buildChangeCases>,
  assessment: Assessment,
): void {
  const dir = changeCasesDir(root);
  fs.mkdirSync(dir, { recursive: true });
  for (const file of fs.readdirSync(dir)) {
    if (file.endsWith('.md')) {
      fs.unlinkSync(`${dir}/${file}`);
    }
  }
  writeText(latestChangeCasePath(root), renderLatestMarkdown(assessment, cases));
  for (const changeCase of cases) {
    writeText(`${dir}/${changeCase.id}.md`, renderChangeCaseMarkdown(changeCase));
  }
}

export async function watchChangelog(options: RunOptions = {}): Promise<void> {
  const root = options.root ?? repoRoot();
  const installedVersion = readInstalledMaterialVersion(root);
  const changelog = await loadChangelog({
    root,
    changelogPath: options.changelogPath,
    fetchRemote: options.fetchRemote,
  });
  const latestVersion = latestStableVersion(changelog.text);
  const events = extractChangeEvents(changelog, previousMajorFloor(installedVersion), latestVersion);
  writeJson(latestEventsPath(root), events);
  console.log(`Installed @angular/material: ${installedVersion}`);
  console.log(`Latest changelog version: ${latestVersion}`);
  console.log(`Change events: ${events.length}`);
  console.log(`Wrote ${latestEventsPath(root)}`);
}

export function printAssessment(assessment: Assessment): void {
  console.log(assessment.summary);
  console.log(`PR required: ${assessment.prRequired}`);
  if (assessment.prReason) {
    console.log(assessment.prReason);
  }
  if (assessment.prUrl) {
    console.log(assessment.prUrl);
  }
}

export function ensureDataDirs(root: string): void {
  for (const dir of ['data/releases', 'data/assessments', 'data/change-cases']) {
    fs.mkdirSync(`${root}/${dir}`, { recursive: true });
  }
}

function toDisplaySource(root: string, sourceUrl: string): string {
  const prefix = root.endsWith('/') ? root : `${root}/`;
  if (sourceUrl.startsWith(prefix)) {
    return sourceUrl.slice(prefix.length);
  }
  return sourceUrl;
}
