# ds-migration

Angular + Material app with a TypeScript CLI that **tracks the official Angular Material changelog**, finds those APIs in this repo, and **informs the developer** with a Change Case (and an optional draft PR).

There is no local rule file. Developers do not maintain mappings. If the changelog names `use X instead of Y`, that token swap can be applied in the draft PR. If it does not name a replacement, the PR is report-only.

The CLI does not auto-merge, does not bump `@angular/material`, and does not invent migrations.

## Demo

```bash
npm install
npm start
```

Open [http://localhost:4200/checkout](http://localhost:4200/checkout). That page uses current Material APIs so the app still builds.

In a second terminal:

```bash
npm run assure -- run --no-fetch --changelog data/releases/CHANGELOG.sample.md
```

That scan writes:

- `data/assessments/latest.json`
- `data/change-cases/latest.md`

Reload [http://localhost:4200/assurance](http://localhost:4200/assurance) to see affected files. The sample changelog includes `checkboxPosition` → `togglePosition` (patch) and `appearance="legacy"` (review only). Those removed APIs live in `src/fixtures/legacy-form.html`.

Open a **draft PR** when this repo is affected (clean git tree + `gh` required):

```bash
npm run assure -- run --create-pr
```

Review the draft PR, then merge it yourself. The Action never merges.

## What the tool will and will not do

| Will | Will not |
| --- | --- |
| Fetch the Angular Components changelog (or use the sample / cache) | Ask a developer to maintain mapping rules |
| Find `src` files that use a changelog API | Guess a replacement that is not documented |
| Classify impact as `none`, `review`, or `patch` | Auto-merge or bump Material |
| Write a Change Case with quoted evidence | Scrape `material.angular.dev` for undocumented rewrites |
| Open a **draft PR** whenever this repo is affected | |

## Layout

- `src/` — Angular + Material app (Checkout, Assurance)
- `src/fixtures/legacy-form.html` — scan-only APIs that no longer compile
- `tools/assurance/` — changelog monitor, scanner, impact, Change Case, documented token replace, PR
- `data/` — cached changelog, assessments, change cases
- `.github/workflows/assure.yml` — weekly watch + `workflow_dispatch`

## Other commands

```bash
npm run assure -- watch
npm run test:assurance
npm test
npm run build
```
