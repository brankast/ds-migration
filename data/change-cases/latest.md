# Angular Material changelog impact

Found 3 documented Angular Material change(s) through 22.0.0. 2 change(s) match source usages in this repository. Installed package version is 22.1.7.

- Installed version: `22.1.7`
- Latest changelog version: `22.0.0`
- Analyzed range: `21.0.0` → `22.0.0`
- Source: data/releases/CHANGELOG.sample.md
- Draft PR required: yes

- PR status: PR creation was not requested.

# MatListOption — MatListOption.checkboxPosition

- Library: `@angular/material`
- Versions: `21.0.0` → `22.0.0`
- Action: `patch`
- Risk: `medium`
- Source: data/releases/CHANGELOG.sample.md

## Evidence

* `MatListOption.checkboxPosition` has been removed. use `togglePosition` instead.

## Affected files

| File | Line | Snippet |
| --- | --- | --- |
| `src/fixtures/legacy-form.html` | 8 | `<mat-list-option checkboxPosition="before">Express shipping</mat-list-option>` |

## Proposed patch

- `src/fixtures/legacy-form.html`: `checkboxPosition` → `togglePosition`
  - Evidence: * `MatListOption.checkboxPosition` has been removed. use `togglePosition` instead.

## Residual risk

Human review is still required. The draft PR only applies the token named in the changelog. It does not bump `@angular/material`.


---

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

