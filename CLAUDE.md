# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

There are no npm scripts defined (`package.json` has an empty `scripts` block) — use the Playwright CLI directly via `npx`.

```bash
# Run the full suite (all 3 browser projects: chromium, firefox, webkit)
npx playwright test

# Run a single spec file
npx playwright test tests/test-with-page-object.spec.ts

# Run a single test by name
npx playwright test -g "Fill inline form"

# Run against one browser project only
npx playwright test --project=chromium

# Update visual regression baselines (tests use toHaveScreenshot)
npx playwright test --update-snapshots

# View the last HTML report
npx playwright show-report

# Install/update browser binaries
npx playwright install --with-deps
```

There is no linter or formatter configured.

### Environment / target site

`playwright.config.ts` loads env vars via `dotenv` before tests run: `.env` by default, or `.env.<TEST_ENV>` when the `TEST_ENV` env var is set (e.g. `TEST_ENV=qa` loads `.env.qa`). The key variable is `BASE_URL`, used as the Playwright `baseURL` — all `page.goto('/')` calls resolve against it.

```bash
TEST_ENV=qa npx playwright test
```

CI (`.github/workflows/playwright.yml`) runs on push/PR to `main`/`master`: `npm ci` → `npx playwright install --with-deps` → `npx playwright test`, uploading `playwright-report/` as an artifact.

## Architecture

The suite drives a Nebular/ngx-admin-style Angular app (locators target `nb-card` components, e.g. "Form Layouts" under a "Forms" nav category) via the Page Object Model, wired together through a Playwright fixture:

- **`fixtures/fixture.ts`** extends Playwright's base `test` with a single `pom` fixture. Every test that imports `test` from here gets a ready-to-use `PageManager` and is already navigated to `/` before the test body runs.
- **`page-objects/page-manager.ts`** is the entry point into all page objects — it instantiates and exposes each page object (e.g. `navigateTo`, `formLayoutsPage`) off of `pom`. New page objects should be added here.
- **`page-objects/helper-base.ts`** is the base class all page objects extend; holds the shared `page` reference and cross-cutting helpers (e.g. `getToastrMessage`).
- **`page-objects/navigation-page.ts`** handles the app's expandable side-nav menu (`expandMenuItemAndSelectCategory`).
- **`page-objects/form-layouts-page.ts`** models the Form Layouts page's several forms (inline/grid/basic) as `Locator` fields scoped by `nb-card` text, with fill/submit methods per form.
- **`helpers/test-step-decorator.ts`** exports a `@step` method decorator that wraps a page-object method body in `test.step(ClassName.methodName, ...)`, so decorated methods show up as named steps in the HTML report/trace. Applied throughout `form-layouts-page.ts`.

Adding a new page under test means: create `page-objects/<name>-page.ts` extending `HelperBase`, register it on `PageManager`, then consume it in a spec as `pom.<name>Page`.

Tests assert visual state with `toHaveScreenshot(...)` (see `tests/test-with-page-object.spec.ts`), so baseline snapshots must be generated (`--update-snapshots`) per-machine/browser before those assertions can pass.
