import { sourceToken } from './scanner.js';
import type { Action, Assessment, ChangeEvent, ComponentUsage, Impact, ProposedPatch, Risk } from './types.js';

export function assessImpacts(
  events: ChangeEvent[],
  usages: ComponentUsage[],
): { impacts: Impact[]; patches: ProposedPatch[] } {
  const impacts: Impact[] = [];
  const patches: ProposedPatch[] = [];

  for (const event of events) {
    const matched = usages.filter(
      (usage) => usage.matchedApi === event.affectedApi && usage.component === event.component,
    );
    if (matched.length === 0) {
      impacts.push({
        changeId: event.id,
        risk: 'none',
        action: 'none',
        usages: [],
      });
      continue;
    }

    const find = sourceToken(event.affectedApi);
    const canPatch = Boolean(event.replacement && find);
    const action: Action = canPatch ? 'patch' : 'review';
    const risk: Risk = canPatch ? 'medium' : 'high';

    impacts.push({
      changeId: event.id,
      risk,
      action,
      usages: matched,
      uncertainty: canPatch
        ? null
        : 'No documented replacement token was found in the changelog. A human must apply the migration path if one exists.',
    });

    if (canPatch && find && event.replacement) {
      for (const usage of matched) {
        patches.push({
          file: usage.file,
          description: `Replace ${find} with ${event.replacement}`,
          find,
          replace: event.replacement,
          sourceEvidence: event.evidence ?? event.description,
          applied: false,
        });
      }
    }
  }

  return { impacts, patches };
}

export function buildAssessment(input: {
  installedVersion: string;
  latestVersion: string;
  fromVersion: string;
  toVersion: string;
  changelogSource: string;
  events: ChangeEvent[];
  usages: ComponentUsage[];
}): Assessment {
  const { impacts, patches } = assessImpacts(input.events, input.usages);
  const affected = impacts.filter((impact) => impact.action !== 'none');
  const prRequired = affected.length > 0;

  return {
    library: '@angular/material',
    installedVersion: input.installedVersion,
    latestVersion: input.latestVersion,
    fromVersion: input.fromVersion,
    toVersion: input.toVersion,
    changelogSource: input.changelogSource,
    changeEvents: input.events,
    usages: input.usages,
    impacts,
    patches,
    summary: summary(input.events.length, affected.length, input.installedVersion, input.latestVersion),
    prRequired,
  };
}

function summary(
  eventCount: number,
  affectedCount: number,
  installedVersion: string,
  latestVersion: string,
): string {
  return `Found ${eventCount} documented Angular Material change(s) through ${latestVersion}. ${affectedCount} change(s) match source usages in this repository. Installed package version is ${installedVersion}.`;
}
