# Playwright TypeScript AQA

Automated test suite built with [Playwright](https://playwright.dev) + TypeScript, practicing the Page Object Model, UI test automation, API mocking, test data builders, and CI reporting (HTML + Allure, published to GitHub Pages).

Two independent demo sites are covered:

- **UI suite** — [playground.bondaracademy.com](https://playground.bondaracademy.com), a Nebular/ngx-admin Angular demo (forms, datepickers, dialogs, navigation).
- **API suite** — [conduit.bondaracademy.com](https://conduit.bondaracademy.com), a Conduit/RealWorld demo, driven entirely through mocked API responses (`page.route()`).

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
```

## Running tests

```bash
# Full suite, all 3 browsers (chromium, firefox, webkit)
npx playwright test

# Just the UI suite or just the API suite
npx playwright test tests/ui
npx playwright test tests/api

# One browser project
npm run tests-chrome     # or tests-firefox / tests-webkit

# One spec file or one test by name
npx playwright test tests/ui/forms-layouts.spec.ts
npx playwright test -g "Fill inline form"

# Against a different environment (loads .env.<name> instead of .env)
TEST_ENV=qa npx playwright test
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
  api/           API-mocked suite specs (conduit.bondaracademy.com)
page-objects/
  playground-site/   Page objects for the UI suite
  conduit-site/       Page objects for the API suite
fixtures/
  fixture.ts          UI suite's `pom` + `testUser` fixtures
  api-fixture.ts       API suite's `apiPom` + `mockedArticles` fixtures
test-data/
  user-builder.ts      Fluent builder for UI test users (faker-backed)
  article-builder.ts   Fluent builder for mocked Conduit articles (faker-backed)
  api-mocks/           Static JSON fixtures for route mocking
helpers/
  test-step-decorator.ts   `@step` decorator — page-object methods as named report steps
  date-helper.ts           Random date generators for datepicker tests
```

See [CLAUDE.md](CLAUDE.md) for a deeper architectural walkthrough (fixture wiring, gotchas, CI pipeline details).

## CI/CD

`.github/workflows/playwright.yml` runs the full suite on every push/PR to `main`/`master`, reports via Allure, and (on push to `main`) publishes the Allure report to GitHub Pages.
