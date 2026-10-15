# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run the full suite (all 3 browser projects: chromium, firefox, webkit)
npx playwright test

# Run one suite: UI (playground), network-mocked Conduit UI, or real REST API tests
npx playwright test tests/ui
npx playwright test tests/network-mocking
npx playwright test --project=api   # tests/api (setup project runs first)

# By tag (@smoke = fast gate, every test is also @regression)
npm run smoke
npm run regression

# Static checks (also run in CI before any test job)
npm run typecheck
npm run lint

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

ESLint (flat config, `eslint.config.mjs`, type-checked rules incl. `no-floating-promises`) and `tsc --noEmit` (`strict: true`) are the static checks. No formatter is configured. TypeScript is pinned to `~6.0` because `typescript-eslint` doesn't yet support 7.x.

### Environment / target sites

`playwright.config.ts` loads env vars via `dotenv` before tests run: `.env` by default, or `.env.<TEST_ENV>` when the `TEST_ENV` env var is set (e.g. `TEST_ENV=qa` loads `.env.qa`).

```bash
TEST_ENV=qa npx playwright test
```

Two independent sites are under test, selected per spec file via `test.use({ baseURL: ... })`:

| Var | Used by | Purpose |
|---|---|---|
| `BASE_URL` | `tests/ui/*` | Nebular/ngx-admin demo (`https://playground.bondaracademy.com`) — Playwright's default `baseURL`, so `tests/ui` specs need no override. |
| `CONDUIT_URL` | `tests/network-mocking/*` | Conduit/RealWorld demo (`https://conduit.bondaracademy.com`) — each spec overrides `baseURL` with `test.use({ baseURL: process.env.CONDUIT_URL })`. |
| `API_URL` | `tests/api/*`, `tests/auth.setup.ts` | Conduit REST API (`https://conduit-api.bondaracademy.com/api/`) — **must end with `/`**; request paths are relative (`users/login`, not `/users/login`) or the `/api` segment is dropped. Also the `api` project's `baseURL`. |
| `ACCOUNT_USERNAME` / `ACCOUNT_PASSWORD` | `auth.setup.ts`, `tests/api/*` | Conduit test account (GitHub Secrets in CI). |
| `TAGS_API_URL` | `tests/network-mocking/tags.spec.ts` | Route-mock glob for `GET /api/tags`. |
| `ARTICLES_API_URL` | `tests/network-mocking/global-feed.spec.ts`, `tests/network-mocking/modify-response.spec.ts` | Route-mock glob for `GET /api/articles` (trailing `*` — the real endpoint has a query string). |

CI (`.github/workflows/playwright.yml`) runs on push/PR to `main`/`master`. See **CI pipeline** below.

## Architecture

Three suites live side by side — UI (`tests/ui`), network-mocking (`tests/network-mocking`), real API (`tests/api`) — each with its own fixture and folder; they share only `helpers/` and the test-data builders.

### UI suite — `tests/ui/` (Nebular/ngx-admin playground)

- **`fixtures/fixture.ts`** extends Playwright's base `test` with a `pom` fixture (`PageManager`, auto-navigates to `/` — i.e. `BASE_URL`) and a `testUser`/`userOverrides` fixture pair (see Test data below).
- **`page-objects/playground-site/`** — all page objects for this site:
  - `page-manager.ts` — entry point; instantiates/exposes every page object off `pom` (e.g. `pom.formLayoutsPage`, `pom.dialogPage`). New page objects get registered here.
  - `helper-base.ts` — base class every page object extends; holds the shared `page` reference and `dashboardMainPage` locator (exposed via `getDashboardMainPage()`).
  - `navigation-page.ts`, `top-navigation.ts`, `form-layouts-page.ts`, `date-picker-page.ts`, `dialog-page.ts` — one file per page/feature area.
- Locators are always `private`; anything a test needs is exposed through a `get*()` method returning `Locator` — never a public locator field.
- Adding a new page: create `page-objects/playground-site/<name>-page.ts` extending `HelperBase`, register it on `PageManager`, consume it in a spec as `pom.<name>Page`.
- `tests/ui/forms-layouts.spec.ts`/`top-navigation.spec.ts` assert visual state with `toHaveScreenshot(...)` — see **Visual regression baselines** below before touching them.

### Network-mocking suite — `tests/network-mocking/` (Conduit UI, responses faked via `page.route()`)

- **`fixtures/network-mocking-fixture.ts`** extends `test` with a `mockPom` fixture (`ConduitPageManager`) and a `mockedArticles` option fixture for Global Feed preconditions (see Test data below). Unlike `pom`, it does **not** auto-navigate — each spec's own `beforeEach` registers `page.route()` mocks *before* calling `page.goto('/')`, since route order matters.
- **`page-objects/conduit-site/`**:
  - `conduit-helper-base.ts` — page title (`getMainLogoTitle()`) + Popular Tags sidebar (`getPopularTags(): Locator`).
  - `global-feed.ts` — the article feed. Every reader (`getArticleTitles()`, `getArticle{Title,Likes,Tags,Author,Date,Text}ByIndex(i)`) returns a `Locator`, so specs use auto-retrying assertions (`await expect(loc).toHaveText([...])`) instead of reading text once. Don't reintroduce `textContent()`/`allTextContents()` + manual retry loops. `clickReadMoreByIndex(index)` is the only action.
  - `conduit-page-manager.ts` (`ConduitPageManager`) — `extends ConduitHelperBase` (so `mockPom.getPopularTags()` works directly) and additionally exposes `mockPom.globalFeed`.
- `modify-response.spec.ts` demonstrates the "fetch the real response, tweak specific fields, `route.fulfill()`" pattern (`route.fetch()` then mutate `responseJson` before fulfilling) — it hits the *real* `conduit-api.bondaracademy.com` over the network, so it's inherently slower/less deterministic than the other specs, which fulfill entirely from local mock data (`test-data/network-mocks/`).
- Runs in the `*-network-mocking` projects (3 browsers) with the `storageState` written by `tests/auth.setup.ts`.

### API suite — `tests/api/` (real REST calls to the Conduit API)

- **`fixtures/api-fixture.ts`** — `conduitApi` (`ConduitApi`: typed `create/get/update/deleteArticle`, logs in once per test via `users/login`) and `createdSlugs` (push a slug in; it's deleted in teardown even if the test fails). `buildArticlePayload()` builds a unique valid payload from `ArticleBuilder`.
- Specs: `articles-crud.spec.ts` (create→read→update→delete→404), `articles-negative.spec.ts` (401 without token, 422 without title, bad login), `article-ui-hybrid.spec.ts` (precondition via API, assertion in the UI with `page`).
- Runs in the single `api` project (`baseURL = API_URL`, so paths are relative, no leading `/`). The hybrid spec uses that project's `storageState` to be logged in.

### Authentication

`tests/auth.setup.ts` (`setup` project) logs in via `POST users/login` and writes `playwright/.auth/user.json` containing the JWT under the `jwtToken` localStorage key for the Conduit origin — no UI login. Only `api` and `*-network-mocking` projects depend on it; the playground UI projects (`chromium`/`firefox`/`webkit`) neither load `storageState` nor wait for `setup`.

### Tags

Every test carries `@regression`; a handful also carry `@smoke` (use `{ tag: ['@smoke', '@regression'] }` as the 2nd argument of `test()`). Add the tag to new tests.

### Test data builders (`test-data/`)

Fluent builders with faker-generated defaults and `with*()` overrides, mirrored across both suites:

- **`user-builder.ts`** (`UserBuilder`/`TestUser`) — used by the UI suite's `testUser` fixture. Per-file/per-test overrides go through `test.use({ userOverrides: { ... } })`; screenshot tests (`forms-layouts.spec.ts`) pin every field so the rendered text stays stable across runs.
- **`article-builder.ts`** (`ArticleBuilder`/`Article`, plus `buildArticlesResponse()`) — used by `tests/network-mocking/global-feed.spec.ts` to build the mocked Global Feed precondition per file via `test.use({ mockedArticles: { articles: [...] } })`.

**Gotcha:** never pass a bare 2-element array as an option-fixture value to `test.use()` — Playwright's fixture machinery treats a 2-element array as the `[value, options]` tuple form (the same shape used when *declaring* an option fixture in `.extend()`), silently keeping only element 0. This is why `mockedArticles` is typed `{ articles: Article[] }` rather than `Article[]`: wrapping the array in an object sidesteps the ambiguity entirely. Apply the same object-wrapping if you add another array-valued option fixture.

### Shared helpers (`helpers/`)

- **`test-step-decorator.ts`** — `@step` method decorator wrapping a call in `test.step(ClassName.methodName, ...)` so it shows as a named step in the HTML/Allure report/trace. Applied to essentially every page-object action method in both suites. **Never decorate a `get*(): Locator` getter with `@step`** — the decorator wraps the return in a Promise, and `expect(locator)` assertions (`toHaveScreenshot`, `toHaveText`, etc.) require the real `Locator`, not a `Promise<Locator>`.
- **`date-helper.ts`** — `getRandomDate()`, `getRandomDateRange()`, `getRandomDateNearToday()` (faker-backed) for `tests/ui/date-pickers.spec.ts`; the "near today" variant exists because that page's picker only allows dates within a small window of the current date.

### Visual regression baselines

Screenshots are platform-specific (font rendering differs win32/linux/darwin), so **`tests/**/*-snapshots/` is gitignored** — baselines are never committed. Locally, Playwright just compares against whatever you last generated with `--update-snapshots` on your own machine. On CI, `.github/workflows/playwright.yml` restores/saves them via `actions/cache` keyed on the static string `playwright-snapshots-v2`:
- Cache miss (first run ever, or after manually invalidating the key) → runs `playwright test --update-snapshots` once to establish the Linux baseline (and deletes the `allure-results` that run produced, so it doesn't pollute the real Allure report), *then* the real `playwright test` run compares against it.
- Cache hit → skips straight to the real run, comparing against the previously-cached Linux baseline, so genuine regressions are still caught.

**The cache key encodes no information about spec-file paths** — a cache *hit* just means "some snapshot tarball exists under this key," not that it matches the current spec-file layout. If you move/rename a `*.spec.ts` file, its `*-snapshots/` directory moves with it, so the cached tarball (built from the old paths) will restore but won't contain the new path, and every screenshot assertion in that file fails with "snapshot doesn't exist" instead of transparently regenerating (the generate-baseline step only runs on a cache *miss*). Bump the key (`v2` → `v3`, etc.) whenever a spec file with screenshots moves or is renamed — not just when you want to force a baseline refresh.

### Accessibility checks

`checkAccessibility()` (`helpers/accessibility-helper.ts`) is non-blocking by default: critical/serious axe violations are attached to the report and added as an `a11y-known-issue` annotation, but the test passes (the live playground has many unresolved violations). Run with `A11Y_ENFORCE=true` to fail on them.

### Reporting

- **HTML** (`playwright-report/`) — always generated (`reporter: [['html', ...], ['allure-playwright']]` in `playwright.config.ts`).
- **Allure** — `allure-playwright` writes `allure-results/`; `npm run test:allure` (or CI's `npx allure run -- npx playwright test`) builds `allure-report/`. `allurerc.mjs` must stay `.mjs` (not `.js`) because `package.json` has `"type": "commonjs"`, and Allure's config is ESM (`import`). `history.jsonl` (trend data across runs) is gitignored locally but cached across CI runs (`actions/cache`, key `allure-history-${{ github.run_id }}` with `restore-keys: allure-history-` to pick up the latest).
- Failed tests get a screenshot attached (`screenshot: 'only-on-failure'` in `playwright.config.ts`) and a trace on first retry (`trace: 'on-first-retry'`).

### CI pipeline (`.github/workflows/playwright.yml`)

Four jobs, run as `prepare-baselines` → `test` (2-shard matrix) → `merge-reports` → `deploy-report`:
- `prepare-baselines` (once, not per shard): restores/seeds the snapshot cache (`actions/cache@v4`, key `playwright-snapshots-v2`); on a miss runs `playwright test --update-snapshots`. Kept out of the matrix so shards don't duplicate baseline generation or race on saving the same cache key.
- `test` (matrix `shardIndex: [1, 2]`, `shardTotal: 2`, `fail-fast: false`, 2 workers each): restore-only snapshot cache, then `playwright test --shard=X/2 --reporter=blob,allure-playwright` (the CLI flag replaces the config's reporters for that run), uploading `blob-report-X` and `allure-results-X` artifacts.
- `merge-reports`: downloads all shard artifacts (`merge-multiple: true`), `playwright merge-reports --reporter=html` → `playwright-report/`, `allure generate ./allure-results` → `allure-report/` (config/history picked up from `allurerc.mjs`; `history.jsonl` restored/saved here, not in the shards), uploads both reports, and (push to `main` only) the Pages artifact.
- `deploy-report`: publishes to GitHub Pages, gated to `push` events on `main` (the `github-pages` environment rejects PR-branch deploys). GitHub Pages must be set to **Source: GitHub Actions** in repo settings for that job to succeed.

Locally, sharding works the same way (`--shard=1/2`), but the blob reporter wipes `blob-report/` on every run — move each shard's zip out before running the next shard.
