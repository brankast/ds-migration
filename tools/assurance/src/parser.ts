import { slug } from './slug.js';
import type { ChangeEvent, ChangelogDocument } from './types.js';
import { versionGte, versionGt } from './versions.js';

const VERSION_HEADER = /^#\s+(\d+\.\d+\.\d+)\b/gm;
const INTERESTING_SECTIONS = /breaking changes|deprecations/i;
const BACKTICK_API = /`([^`]+)`/g;

export function latestStableVersion(text: string): string {
  const match = text.match(/#\s+(\d+\.\d+\.\d+)\b/);
  return match?.[1] ?? '0.0.0';
}

export function extractChangeEvents(
  changelog: ChangelogDocument,
  fromVersion: string,
  toVersion: string,
): ChangeEvent[] {
  const sections = splitByVersion(changelog.text);
  const events: ChangeEvent[] = [];

  for (const section of sections) {
    if (!inRange(section.version, fromVersion, toVersion)) {
      continue;
    }
    events.push(...eventsFromVersion(section, changelog.sourceUrl, fromVersion, toVersion));
  }

  return dedupe(events);
}

function splitByVersion(text: string): { version: string; body: string }[] {
  const matches = [...text.matchAll(VERSION_HEADER)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? text.length;
    return {
      version: match[1],
      body: text.slice(start, end),
    };
  });
}

function inRange(version: string, fromVersion: string, toVersion: string): boolean {
  return versionGte(version, fromVersion) && !versionGt(version, toVersion);
}

function eventsFromVersion(
  section: { version: string; body: string },
  sourceUrl: string,
  fromVersion: string,
  toVersion: string,
): ChangeEvent[] {
  const blocks = section.body.split(/^##\s+/m).slice(1);
  const events: ChangeEvent[] = [];

  for (const block of blocks) {
    const [headingLine, ...rest] = block.split('\n');
    const heading = headingLine?.trim() ?? '';
    if (!INTERESTING_SECTIONS.test(heading)) {
      continue;
    }
    const body = materialSection(rest.join('\n'));
    const bullets = body
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('-') || line.startsWith('*'));

    for (const bullet of bullets) {
      const apis = [...bullet.matchAll(BACKTICK_API)].map((match) => match[1]);
      if (apis.length === 0) {
        continue;
      }
      const affectedApi = apis[0];
      const replacement = extractReplacement(bullet, affectedApi);
      const changeType = /removed|no longer/i.test(bullet)
        ? 'removed'
        : /deprecated/i.test(heading) || /deprecated/i.test(bullet)
          ? 'deprecated'
          : 'breaking';
      events.push({
        id: slug(`${section.version}-${affectedApi}`),
        library: '@angular/material',
        packageName: '@angular/material',
        fromVersion,
        toVersion: section.version,
        component: componentName(affectedApi, bullet),
        changeType,
        severity: changeType === 'removed' ? 'high' : 'medium',
        description: bullet.replace(/^[-*]\s*/, '').replace(/^\*\s*/, ''),
        affectedApi,
        replacement,
        migrationPath: replacement
          ? `Use \`${replacement}\` instead of \`${affectedApi}\`.`
          : undefined,
        sourceUrl,
        evidence: bullet.replace(/^[-*]\s*/, ''),
        confidence: replacement ? 'documented' : 'inferred',
        autoPatch: Boolean(replacement),
      });
    }
  }

  return events;
}

function materialSection(body: string): string {
  if (!/^###\s+/m.test(body)) {
    return body;
  }
  return body
    .split(/^###\s+/m)
    .slice(1)
    .filter((part) => /^material\b/i.test(part.split('\n')[0] ?? ''))
    .join('\n');
}

function extractReplacement(bullet: string, affectedApi: string): string | undefined {
  const insteadOf = bullet.match(/use\s+`([^`]+)`\s+instead of\s+`([^`]+)`/i);
  if (insteadOf) {
    return insteadOf[1];
  }
  const useInstead = bullet.match(/use\s+`([^`]+)`\s+instead/i);
  if (useInstead && useInstead[1] !== affectedApi) {
    return useInstead[1];
  }
  const renamed = bullet.match(/renamed to\s+`([^`]+)`/i);
  if (renamed) {
    return renamed[1];
  }
  return undefined;
}

function componentName(api: string, bullet: string): string {
  if (api.includes('.')) {
    return api.split('.')[0];
  }
  const named = bullet.match(/\b(Mat[A-Za-z0-9]+)\b/);
  if (named) {
    return named[1];
  }
  if (/form field/i.test(bullet)) {
    return 'MatFormField';
  }
  return api;
}

function dedupe(events: ChangeEvent[]): ChangeEvent[] {
  const byApi = new Map<string, ChangeEvent>();
  for (const event of events) {
    const key = event.affectedApi ?? event.id;
    const existing = byApi.get(key);
    if (!existing || (event.autoPatch && !existing.autoPatch)) {
      byApi.set(key, event);
    }
  }
  return [...byApi.values()];
}

export { slug };
