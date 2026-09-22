import { extractChangeEvents, latestStableVersion } from '../src/parser';
import { loadChangelog } from '../src/changelog';
import { repoRoot } from '../src/paths';

function changelog() {
  return loadChangelog({
    root: repoRoot(),
    changelogPath: 'data/releases/CHANGELOG.sample.md',
    fetchRemote: false,
  });
}

describe('parser', () => {
  it('reads the latest stable version', async () => {
    const doc = await changelog();
    expect(latestStableVersion(doc.text)).toBe('22.0.0');
  });

  it('extracts a documented list breaking change as auto-patch', async () => {
    const doc = await changelog();
    const events = extractChangeEvents(doc, '21.0.0', '22.0.0');
    const checkbox = events.find((event) => event.affectedApi === 'MatListOption.checkboxPosition');
    expect(checkbox?.changeType).toBe('removed');
    expect(checkbox?.replacement).toBe('togglePosition');
    expect(checkbox?.autoPatch).toBe(true);
  });

  it('does not invent a replacement when the changelog names none', async () => {
    const doc = await changelog();
    const events = extractChangeEvents(doc, '21.0.0', '22.0.0');
    const legacy = events.find((event) => event.affectedApi === 'appearance="legacy"');
    expect(legacy?.replacement).toBeUndefined();
    expect(legacy?.autoPatch).toBe(false);
  });

  it('does not seed MatButton mappings and skips CDK', async () => {
    const doc = await changelog();
    const events = extractChangeEvents(doc, '21.0.0', '22.0.0');
    expect(events.some((event) => event.affectedApi === 'mat-raised-button')).toBe(false);
    expect(events.some((event) => event.affectedApi === 'ContextMenuTracker')).toBe(false);
  });
});
