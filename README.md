# Playwright TypeScript AQA

Automated test suite built with [Playwright](https://playwright.dev) + TypeScript, practicing the Page Object Model, UI test automation, API mocking, test data builders, and CI reporting (HTML + Allure, published to GitHub Pages).

Two independent demo sites are covered:

- **UI suite** — [playground.bondaracademy.com](https://playground.bondaracademy.com), a Nebular/ngx-admin Angular demo (forms, datepickers, dialogs, navigation).
- **API suite** (`tests/api`) — real REST tests against the Conduit API (`request` fixture): article CRUD, negative cases (401/422), and an API→UI hybrid scenario.
- **Network-mocking suite** (`tests/network-mocking`) — the Conduit UI ([conduit.bondaracademy.com](https://conduit.bondaracademy.com)) with responses faked/modified via `page.route()`.

## Prerequisites

- [Node.js](https://nodejs.org) (LTS)
- npm

## Setup

```bash
npm ci
npx playwright install --with-deps
```

Copy `.env.example` to `.env` if one exists, or create `.env` with:

```bash
BASE_URL=https://playground.bondaracademy.com
CONDUIT_URL=https://conduit.bondaracademy.com/
TAGS_API_URL=*/**/api/tags
ARTICLES_API_URL=*/**/api/articles*
API_URL=https://conduit-api.bondaracademy.com/api/   # trailing slash matters
ACCOUNT_USERNAME=<conduit account email>
ACCOUNT_PASSWORD=<conduit account password>
```

## Running tests

```bash
# Full suite, all 3 browsers (chromium, firefox, webkit)
npx playwright test

# One suite
npx playwright test tests/ui
npx playwright test tests/network-mocking
npm run tests-api                 # real REST tests (+ hybrid)

# By tag
npm run smoke                     # --grep @smoke  (fast gate)
npm run regression                # --grep @regression

# Static checks
npm run typecheck                 # tsc --noEmit
npm run lint                      # ESLint incl. no-floating-promises

# Reproduce a failed datepicker run (the seed is attached to the test report as `faker-seed`)
FAKER_SEED=12345 npx playwright test tests/ui/date-pickers.spec.ts

# One browser project
npm run tests-chrome     # or tests-firefox / tests-webkit

# One spec file or one test by name
npx playwright test tests/ui/forms-layouts.spec.ts
npx playwright test -g "Fill inline form"

# Against a different environment (loads .env.<name> instead of .env)
TEST_ENV=qa npx playwright test
```

## Running in Docker

Uses the official Playwright image (keep the tag in sync with `@playwright/test`):

```bash
docker run --rm --ipc=host -v "$PWD":/work -w /work --env-file .env \n  mcr.microsoft.com/playwright:v1.62.1-noble \n  sh -c "npm ci && npx playwright test --grep @smoke"
```

## Reports

```bash
# Playwright's built-in HTML report (generated after every run)
npx playwright show-report

# Allure report (richer, with history/trends)
npm run test:allure
npm run allure:open
```

## Visual regression

Some UI tests assert screenshots (`toHaveScreenshot`). Baselines are **not** committed — they're platform-specific and gitignored (`tests/**/*-snapshots/`). Generate your own locally before those tests will pass:

```bash
npx playwright test --update-snapshots
```

CI generates and caches its own Linux baselines independently (see `.github/workflows/playwright.yml`), so this only affects your local runs.

## Project structure

```
tests/
  ui/            UI suite specs (playground.bondaracademy.com)
  api/           Real REST API specs + API→UI hybrid (conduit-api.bondaracademy.com)
  network-mocking/  Conduit UI specs with page.route() mocks
page-objects/
  playground-site/   Page objects for the UI suite
  conduit-site/       Page objects for the Conduit UI (network-mocking suite)
fixtures/
  fixture.ts          UI suite's `pom` + `testUser` fixtures
  network-mocking-fixture.ts   `mockPom` + `mockedArticles` fixtures
  api-fixture.ts       `conduitApi` REST client + auto-cleanup `createdSlugs` fixtures
test-data/
  user-builder.ts      Fluent builder for UI test users (faker-backed)
  article-builder.ts   Fluent builder for mocked Conduit articles (faker-backed)
  network-mocks/       Static JSON fixtures for route mocking
helpers/
  test-step-decorator.ts   `@step` decorator — page-object methods as named report steps
  date-helper.ts           Random date generators for datepicker tests
```

See [CLAUDE.md](CLAUDE.md) for a deeper architectural walkthrough (fixture wiring, gotchas, CI pipeline details).

## CI/CD

`.gitlab-ci.yml` mirrors the pipeline for GitLab (typecheck/lint → smoke + sharded regression → merged HTML report).

`.github/workflows/playwright.yml` runs the full suite on every push/PR to `main`/`master`, reports via Allure, and (on push to `main`) publishes the Allure report to GitHub Pages.
