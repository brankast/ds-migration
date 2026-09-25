# MatFormField — appearance="legacy"

- Library: `@angular/material`
- Versions: `21.0.0` → `22.0.0`
- Action: `review`
- Risk: `high`
- Source: data/releases/CHANGELOG.sample.md

## Evidence

* `appearance="legacy"` is no longer supported on form fields.

## Affected files

| File | Line | Snippet |
| --- | --- | --- |
| `src/fixtures/legacy-form.html` | 2 | `<mat-form-field appearance="legacy">` |

## Proposed patch

None. This change is review-only.

## Residual risk

No documented replacement was extracted from the changelog. Do not guess a migration; verify against the changelog and apply manually.
