import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, process.env.TEST_ENV ? `.env.${process.env.TEST_ENV}` : '.env') });

const AUTH_FILE = 'playwright/.auth/user.json';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* CI runners (esp. Firefox) can be slower to start/navigate against the live external
   * site than a local machine — give CI more headroom than the 30s default. */
  timeout: process.env.CI ? 60000 : 30000,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* ubuntu-latest runners have 2 vCPUs; run 2 workers on CI instead of serially. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'never' }], ['allure-playwright']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Attach a page screenshot to failed tests (shows up in the Allure report). */
    screenshot: 'only-on-failure',

    /* Enable test id attribute for easier element selection */
    testIdAttribute: 'data-testid'
  },

  /* Configure projects for major browsers */
  projects: [
    // Logs in through the Conduit REST API and saves the session for the projects that need it.
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // UI suite (playground site) — no authentication needed.
    { name: 'chromium', testMatch: /ui\/.*\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testMatch: /ui\/.*\.spec\.ts/, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: /ui\/.*\.spec\.ts/, use: { ...devices['Desktop Safari'] } },

    // Conduit UI with mocked network responses — runs as a logged-in user.
    {
      name: 'chromium-network-mocking',
      testMatch: /network-mocking\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox-network-mocking',
      testMatch: /network-mocking\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit-network-mocking',
      testMatch: /network-mocking\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },

    // Real REST API tests (`request` fixture) plus API+UI hybrid specs. Browser-independent,
    // so a single project is enough.
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: process.env.API_URL, storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
