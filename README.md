# Playwright TypeScript AQA

[![Playwright Tests](https://github.com/GeneRiabchenko/Playwright-typescript-aqa/actions/workflows/playwright.yml/badge.svg)](https://github.com/GeneRiabchenko/Playwright-typescript-aqa/actions/workflows/playwright.yml)
[![Allure report](https://img.shields.io/badge/Allure-live%20report-orange)](https://generiabchenko.github.io/Playwright-typescript-aqa/)

Test automation portfolio project: **UI, REST API and network-mocking tests** with Playwright + TypeScript, a Page Object architecture, typed test-data builders, static analysis and a sharded CI pipeline with published reports.

**[Live Allure report →](https://generiabchenko.github.io/Playwright-typescript-aqa/)** (published from `main` by GitHub Actions)

## What is tested

| Suite | Folder | Target | What it shows |
|---|---|---|---|
| UI | `tests/ui` | [playground.bondaracademy.com](https://playground.bondaracademy.com) (Angular / Nebular) | Page Object Model, forms, datepickers, dialogs, visual regression (`toHaveScreenshot`), axe accessibility checks, 3 browsers |
| API | `tests/api` | [Conduit REST API](https://conduit-api.bondaracademy.com/api) | Real HTTP tests via the `request` fixture: article CRUD, negative cases (401 / 422), API → UI hybrid scenario, auto-cleanup of created data |
| Network mocking | `tests/network-mocking` | [conduit.bondaracademy.com](https://conduit.bondaracademy.com) UI | `page.route()` fulfil / modify-response, deterministic UI checks on faked data |

## Engineering highlights

- **Auto-waiting assertions only** — page objects expose `Locator`s and specs use `expect(locator).toHaveText(...)`; no `waitForTimeout` or one-shot `textContent()` reads.
- **Fast auth** — `setup` project logs in through the REST API and stores the JWT as `storageState`; UI suites that don't need a session don't pay for one.
- **Typed builders** (`test-data/`) with faker defaults; a failed datepicker run is reproducible via `FAKER_SEED` (seed is attached to the report).
- **Static checks** — `strict` TypeScript + ESLint (`@typescript-eslint/no-floating-promises`) run in CI before any test job.
- **Tags** — `@smoke` (fast gate) and `@regression` (everything).
- **CI** — GitHub Actions (2 shards, cached visual baselines, merged HTML + Allure reports, GitHub Pages) and an equivalent `.gitlab-ci.yml`.

## Known limitations (honest notes)

- **Accessibility tests fail on purpose.** `accessibility-tests.spec.ts` and the four theme tests run axe (WCAG A/AA) and *fail on critical/serious violations*. The demo playground really has them (`color-contrast`, `button-name`, `label`, `link-name`, `frame-title`), so these tests are red until the site is fixed — they are findings, not flakiness. Moderate/minor violations are attached to the report without failing.
- `network-mocking/modify-response.spec.ts` fetches the real backend before modifying the response, so it depends on that service being up.
- The target sites are public demo apps I don't control; a site change can break tests.

## Quick start

```bash
npm ci
npx playwright install --with-deps
```

Create `.env`:

```bash
BASE_URL=https://playground.bondaracademy.com
CONDUIT_URL=https://conduit.bondaracademy.com/
API_URL=https://conduit-api.bondaracademy.com/api/   # trailing slash matters
TAGS_API_URL=*/**/api/tags
ARTICLES_API_URL=*/**/api/articles*
ACCOUNT_USERNAME=<conduit account email>
ACCOUNT_PASSWORD=<conduit account password>
```

## Running tests

```bash
npx playwright test                       # everything, 3 browsers
npx playwright test tests/ui              # one suite
npx playwright test tests/network-mocking
npm run tests-api                         # real REST tests (+ hybrid)

npm run smoke                             # --grep @smoke
npm run regression                        # --grep @regression

npm run typecheck                         # tsc --noEmit
npm run lint                              # ESLint

npm run tests-chrome                      # or tests-firefox / tests-webkit
npx playwright test -g "Fill inline form" # one test by name
TEST_ENV=qa npx playwright test           # loads .env.qa instead of .env
FAKER_SEED=12345 npx playwright test tests/ui/date-pickers.spec.ts   # replay random dates
```

### Docker

```bash
docker run --rm --ipc=host -v "$PWD":/work -w /work --env-file .env \
  mcr.microsoft.com/playwright:v1.62.1-noble \
  sh -c "npm ci && npx playwright test --grep @smoke"
```

Keep the image tag in sync with `@playwright/test` in `package.json`.

### Reports

```bash
npx playwright show-report                # built-in HTML report
npm run test:allure && npm run allure:open
```

### Visual regression

Screenshot baselines are platform-specific and **not committed** (`tests/**/*-snapshots/` is gitignored). Generate your own locally once:

```bash
npx playwright test --update-snapshots
```

CI generates and caches Linux baselines on its own.

## Project structure

```
tests/
  ui/                 UI specs (playground)
  api/                REST API specs + API→UI hybrid
  network-mocking/    Conduit UI specs with page.route() mocks
  auth.setup.ts       API login → storageState
page-objects/         playground-site/ and conduit-site/ page objects
fixtures/             fixture.ts (pom, testUser), api-fixture.ts (conduitApi), network-mocking-fixture.ts
test-data/            builders (user, article) + static mock JSON
helpers/              @step decorator, axe helper, date helper
```

See [CLAUDE.md](CLAUDE.md) for the deeper architectural walkthrough (fixture wiring, gotchas, CI details).

## CI/CD

- **GitHub Actions** — `.github/workflows/playwright.yml`: typecheck + lint → baseline cache → 2-shard test matrix → merged Playwright HTML + Allure reports → GitHub Pages (on `main`).
- **GitLab CI** — `.gitlab-ci.yml`: typecheck/lint → baselines → smoke + sharded regression → merged HTML report → GitLab Pages.
