import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup.use({ baseURL: process.env.CONDUIT_URL });

setup('authenticate', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(process.env.ACCOUNT_USERNAME!);
    await page.getByPlaceholder('Password').fill(process.env.ACCOUNT_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Confirms the login actually succeeded before saving state — the header switches
    // from "Sign in"/"Sign up" links to the logged-in user's profile link.
    await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible();

    await page.context().storageState({ path: authFile });
});
