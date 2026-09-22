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
