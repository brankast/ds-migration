# Angular Material changelog impact

Found 64 documented Angular Material change(s) through 22.2.0. 1 change(s) match source usages in this repository. Installed package version is 22.1.7.

- Installed version: `22.1.7`
- Latest changelog version: `22.2.0`
- Analyzed range: `21.0.0` → `22.2.0`
- Source: https://raw.githubusercontent.com/angular/components/main/CHANGELOG.md
- Draft PR required: yes



# MatListOption — MatListOption.checkboxPosition

- Library: `@angular/material`
- Versions: `21.0.0` → `22.0.0`
- Action: `patch`
- Risk: `medium`
- Source: https://raw.githubusercontent.com/angular/components/main/CHANGELOG.md

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

