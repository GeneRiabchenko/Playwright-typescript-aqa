# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run the full suite (all 3 browser projects: chromium, firefox, webkit)
npx playwright test

# Run only the UI suite (playground.bondaracademy.com) or the API-mocked suite (conduit.bondaracademy.com)
npx playwright test tests/ui
npx playwright test tests/api

# Run a single spec file / a single test by name
npx playwright test tests/ui/forms-layouts.spec.ts
npx playwright test -g "Fill inline form"

# Run against one browser project only (also available as npm scripts: tests-chrome/tests-firefox/tests-webkit)
npx playwright test --project=chromium

# Update visual regression baselines (tests use toHaveScreenshot) — also: npm run tests-update-snapshots
npx playwright test --update-snapshots

# View the last HTML report
npx playwright show-report

# Run through Allure and open the generated report
npm run test:allure
npm run allure:open

# Install/update browser binaries
npx playwright install --with-deps
```

There is no linter or formatter configured. `package.json`'s `smoke-tests` script points at a `tests/smoke-tests.spec.ts` that no longer exists — stale, don't rely on it.

### Environment / target sites

`playwright.config.ts` loads env vars via `dotenv` before tests run: `.env` by default, or `.env.<TEST_ENV>` when the `TEST_ENV` env var is set (e.g. `TEST_ENV=qa` loads `.env.qa`).

```bash
TEST_ENV=qa npx playwright test
```

Two independent sites are under test, selected per spec file via `test.use({ baseURL: ... })`:

| Var | Used by | Purpose |
|---|---|---|
| `BASE_URL` | `tests/ui/*` | Nebular/ngx-admin demo (`https://playground.bondaracademy.com`) — Playwright's default `baseURL`, so `tests/ui` specs need no override. |
| `CONDUIT_URL` | `tests/api/*` | Conduit/RealWorld demo (`https://conduit.bondaracademy.com`) — each `tests/api` spec overrides `baseURL` with `test.use({ baseURL: process.env.CONDUIT_URL })`. |
| `TAGS_API_URL` | `tests/api/tags.spec.ts` | Route-mock glob for `GET /api/tags`. |
| `ARTICLES_API_URL` | `tests/api/global-feed.spec.ts`, `tests/api/modify-response.spec.ts` | Route-mock glob for `GET /api/articles` (trailing `*` — the real endpoint has a query string). |

CI (`.github/workflows/playwright.yml`) runs on push/PR to `main`/`master`. See **CI pipeline** below.

## Architecture

Two independent Page-Object-Model suites live side by side, each with its own fixture, page-object root, and test folder — they share only `helpers/` and the test-data builders.

### UI suite — `tests/ui/` (Nebular/ngx-admin playground)

- **`fixtures/fixture.ts`** extends Playwright's base `test` with a `pom` fixture (`PageManager`, auto-navigates to `/` — i.e. `BASE_URL`) and a `testUser`/`userOverrides` fixture pair (see Test data below).
- **`page-objects/playground-site/`** — all page objects for this site:
  - `page-manager.ts` — entry point; instantiates/exposes every page object off `pom` (e.g. `pom.formLayoutsPage`, `pom.dialogPage`). New page objects get registered here.
  - `helper-base.ts` — base class every page object extends; holds the shared `page` reference and `dashboardMainPage` locator (exposed via `getDashboardMainPage()`).
  - `navigation-page.ts`, `top-navigation.ts`, `form-layouts-page.ts`, `date-picker-page.ts`, `dialog-page.ts` — one file per page/feature area.
- Locators are always `private`; anything a test needs is exposed through a `get*()` method returning `Locator` — never a public locator field.
- Adding a new page: create `page-objects/playground-site/<name>-page.ts` extending `HelperBase`, register it on `PageManager`, consume it in a spec as `pom.<name>Page`.
- `tests/ui/forms-layouts.spec.ts`/`top-navigation.spec.ts` assert visual state with `toHaveScreenshot(...)` — see **Visual regression baselines** below before touching them.

### API suite — `tests/api/` (Conduit, fully mocked via `page.route()`)

- **`fixtures/api-fixture.ts`** extends `test` with an `apiPom` fixture (`ApiPageManager`) and a `mockedArticles` option fixture for Global Feed preconditions (see Test data below). Unlike `pom`, it does **not** auto-navigate — each spec's own `beforeEach` registers `page.route()` mocks *before* calling `page.goto('/')`, since route order matters.
- **`page-objects/conduit-site/`**:
  - `api-helper-base.ts` — page title (`getMainLogoTitle()`) + Popular Tags sidebar (`getPopularTrimmedTagsText()`).
  - `global-feed.ts` — the article feed; `getTrimmedArticleTitles()` returns all titles, while likes/tags/author/date/text are read per-article via `getArticle*ByIndex(index)` (0-based), plus `clickReadMoreByIndex(index)`.
  - `api-page-manager.ts` (`ApiPageManager`) — `extends ApiHelperBase` (so `apiPom.getMainLogoTitle()` works directly) and additionally exposes `apiPom.globalFeed`.
- `tests/api/modify-response.spec.ts` demonstrates the "fetch the real response, tweak specific fields, `route.fulfill()`" pattern (`route.fetch()` then mutate `responseJson` before fulfilling) — it hits the *real* `conduit-api.bondaracademy.com` over the network, so it's inherently slower/less deterministic than the other two API specs, which fulfill entirely from local mock data.

### Test data builders (`test-data/`)

Fluent builders with faker-generated defaults and `with*()` overrides, mirrored across both suites:

- **`user-builder.ts`** (`UserBuilder`/`TestUser`) — used by the UI suite's `testUser` fixture. Per-file/per-test overrides go through `test.use({ userOverrides: { ... } })`; screenshot tests (`forms-layouts.spec.ts`) pin every field so the rendered text stays stable across runs.
- **`article-builder.ts`** (`ArticleBuilder`/`Article`, plus `buildArticlesResponse()`) — used by `tests/api/global-feed.spec.ts` to build the mocked Global Feed precondition per file via `test.use({ mockedArticles: { articles: [...] } })`.

**Gotcha:** never pass a bare 2-element array as an option-fixture value to `test.use()` — Playwright's fixture machinery treats a 2-element array as the `[value, options]` tuple form (the same shape used when *declaring* an option fixture in `.extend()`), silently keeping only element 0. This is why `mockedArticles` is typed `{ articles: Article[] }` rather than `Article[]`: wrapping the array in an object sidesteps the ambiguity entirely. Apply the same object-wrapping if you add another array-valued option fixture.

### Shared helpers (`helpers/`)

- **`test-step-decorator.ts`** — `@step` method decorator wrapping a call in `test.step(ClassName.methodName, ...)` so it shows as a named step in the HTML/Allure report/trace. Applied to essentially every page-object action method in both suites. **Never decorate a `get*(): Locator` getter with `@step`** — the decorator wraps the return in a Promise, and `expect(locator)` assertions (`toHaveScreenshot`, `toHaveText`, etc.) require the real `Locator`, not a `Promise<Locator>`.
- **`date-helper.ts`** — `getRandomDate()`, `getRandomDateRange()`, `getRandomDateNearToday()` (faker-backed) for `tests/ui/date-pickers.spec.ts`; the "near today" variant exists because that page's picker only allows dates within a small window of the current date.

### Visual regression baselines

Screenshots are platform-specific (font rendering differs win32/linux/darwin), so **`tests/**/*-snapshots/` is gitignored** — baselines are never committed. Locally, Playwright just compares against whatever you last generated with `--update-snapshots` on your own machine. On CI, `.github/workflows/playwright.yml` restores/saves them via `actions/cache` keyed on the static string `playwright-snapshots-v2`:
- Cache miss (first run ever, or after manually invalidating the key) → runs `playwright test --update-snapshots` once to establish the Linux baseline (and deletes the `allure-results` that run produced, so it doesn't pollute the real Allure report), *then* the real `playwright test` run compares against it.
- Cache hit → skips straight to the real run, comparing against the previously-cached Linux baseline, so genuine regressions are still caught.

**The cache key encodes no information about spec-file paths** — a cache *hit* just means "some snapshot tarball exists under this key," not that it matches the current spec-file layout. If you move/rename a `*.spec.ts` file, its `*-snapshots/` directory moves with it, so the cached tarball (built from the old paths) will restore but won't contain the new path, and every screenshot assertion in that file fails with "snapshot doesn't exist" instead of transparently regenerating (the generate-baseline step only runs on a cache *miss*). Bump the key (`v2` → `v3`, etc.) whenever a spec file with screenshots moves or is renamed — not just when you want to force a baseline refresh.

### Reporting

- **HTML** (`playwright-report/`) — always generated (`reporter: [['html', ...], ['allure-playwright']]` in `playwright.config.ts`).
- **Allure** — `allure-playwright` writes `allure-results/`; `npm run test:allure` (or CI's `npx allure run -- npx playwright test`) builds `allure-report/`. `allurerc.mjs` must stay `.mjs` (not `.js`) because `package.json` has `"type": "commonjs"`, and Allure's config is ESM (`import`). `history.jsonl` (trend data across runs) is gitignored locally but cached across CI runs (`actions/cache`, key `allure-history-${{ github.run_id }}` with `restore-keys: allure-history-` to pick up the latest).
- Failed tests get a screenshot attached (`screenshot: 'only-on-failure'` in `playwright.config.ts`) and a trace on first retry (`trace: 'on-first-retry'`).

### CI pipeline (`.github/workflows/playwright.yml`)

`test` job (ubuntu-latest, 2 workers — see config comment): install → restore snapshot cache → conditionally seed baselines → restore Allure history → `allure run -- npx playwright test` → save Allure history → upload `allure-report`/`playwright-report` artifacts → (push to `main` only) upload the Pages artifact. A separate `deploy-report` job publishes it to GitHub Pages, gated to `push` events on `main` (the `github-pages` environment rejects PR-branch deploys). GitHub Pages must be set to **Source: GitHub Actions** in repo settings for that job to succeed.
