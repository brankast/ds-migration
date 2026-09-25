import { sourceToken } from './scanner.js';
import type { Assessment, ChangeCase, ChangeEvent, Impact } from './types.js';
import { slug } from './slug.js';

export function buildChangeCases(assessment: Assessment): ChangeCase[] {
  return assessment.impacts
    .filter((impact) => impact.action !== 'none')
    .map((impact) => {
      const event = assessment.changeEvents.find((item) => item.id === impact.changeId);
      if (!event) {
        throw new Error(`Missing change event ${impact.changeId}`);
      }
      return toChangeCase(event, impact, assessment);
    });
}

function toChangeCase(event: ChangeEvent, impact: Impact, assessment: Assessment): ChangeCase {
  const find = sourceToken(event.affectedApi);
  const patch = assessment.patches.find(
    (item) =>
      (item.find === event.affectedApi || item.find === find) &&
      impact.usages.some((usage) => usage.file === item.file),
  );

  return {
    id: event.id,
    title: `${event.component} — ${event.affectedApi}`,
    library: event.library,
    fromVersion: event.fromVersion,
    toVersion: event.toVersion,
    action: impact.action,
    risk: impact.risk,
    evidence: event.evidence ?? event.description,
    sourceUrl: event.sourceUrl,
    affectedFiles: impact.usages,
    proposedPatch: impact.action === 'patch' ? patch : undefined,
    residualRisk: residualRisk(impact),
  };
}

function residualRisk(impact: Impact): string {
  if (impact.action === 'patch') {
    return 'Human review is still required. The draft PR only applies the token named in the changelog. It does not bump `@angular/material`.';
  }
  return 'No documented replacement was extracted from the changelog. Do not guess a migration; verify against the changelog and apply manually.';
}

export function renderChangeCaseMarkdown(changeCase: ChangeCase): string {
  const files = changeCase.affectedFiles
    .map((usage) => `| \`${usage.file}\` | ${usage.line} | \`${escapePipes(usage.codeSnippet ?? '')}\` |`)
    .join('\n');

  const patch = changeCase.proposedPatch
    ? `## Proposed patch

- \`${changeCase.proposedPatch.file}\`: \`${changeCase.proposedPatch.find}\` → \`${changeCase.proposedPatch.replace}\`
  - Evidence: ${changeCase.proposedPatch.sourceEvidence}`
    : '## Proposed patch\n\nNone. This change is review-only.';

  return `# ${changeCase.title}

- Library: \`${changeCase.library}\`
- Versions: \`${changeCase.fromVersion}\` → \`${changeCase.toVersion}\`
- Action: \`${changeCase.action}\`
- Risk: \`${changeCase.risk}\`
${changeCase.sourceUrl ? `- Source: ${changeCase.sourceUrl}` : ''}

## Evidence

${changeCase.evidence}

## Affected files

| File | Line | Snippet |
| --- | --- | --- |
${files}

${patch}

## Residual risk

${changeCase.residualRisk}
`;
}

export function renderLatestMarkdown(assessment: Assessment, cases: ChangeCase[]): string {
  const caseBodies = cases.map(renderChangeCaseMarkdown).join('\n\n---\n\n');
  return `# Angular Material changelog impact

${assessment.summary}

- Installed version: \`${assessment.installedVersion}\`
- Latest changelog version: \`${assessment.latestVersion}\`
- Analyzed range: \`${assessment.fromVersion}\` → \`${assessment.toVersion}\`
- Source: ${assessment.changelogSource}
- Draft PR required: ${assessment.prRequired ? 'yes' : 'no'}
${assessment.prUrl ? `- Draft PR: ${assessment.prUrl}` : ''}
${assessment.prReason ? `- PR status: ${assessment.prReason}` : ''}

${caseBodies || '_No matching usages._'}
`;
}

function escapePipes(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/`/g, "'");
}

export { slug };
