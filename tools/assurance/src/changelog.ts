import fs from 'node:fs';
import path from 'node:path';
import { CHANGELOG_URL, changelogCachePath, changelogSamplePath } from './paths.js';
import type { ChangelogDocument } from './types.js';

export async function loadChangelog(options: {
  root: string;
  changelogPath?: string;
  fetchRemote?: boolean;
}): Promise<ChangelogDocument> {
  if (options.changelogPath) {
    const resolved = path.resolve(options.root, options.changelogPath);
    return {
      text: fs.readFileSync(resolved, 'utf8'),
      sourceUrl: resolved,
    };
  }

  if (options.fetchRemote !== false) {
    try {
      const response = await fetch(CHANGELOG_URL, {
        headers: { 'user-agent': 'ds-migration-assurance' },
      });
      if (!response.ok) {
        throw new Error(`Changelog fetch failed with ${response.status}`);
      }
      const text = await response.text();
      const cachePath = changelogCachePath(options.root);
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      fs.writeFileSync(cachePath, text);
      return { text, sourceUrl: CHANGELOG_URL };
    } catch {
      const cachePath = changelogCachePath(options.root);
      if (fs.existsSync(cachePath)) {
        return {
          text: fs.readFileSync(cachePath, 'utf8'),
          sourceUrl: cachePath,
        };
      }
    }
  }

  const sample = changelogSamplePath(options.root);
  return {
    text: fs.readFileSync(sample, 'utf8'),
    sourceUrl: sample,
  };
}
