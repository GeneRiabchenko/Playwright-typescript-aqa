import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const authFile = 'playwright/.auth/user.json';

// Logs in through the Conduit REST API (no browser UI round-trip) and writes the JWT into the
// same `localStorage` key the Conduit frontend reads (`jwtToken`), so projects that load
// `storageState` start out logged in.
setup('authenticate', async ({ request }) => {
    const response = await request.post(`${process.env.API_URL}users/login`, {
        data: { user: { email: process.env.ACCOUNT_USERNAME, password: process.env.ACCOUNT_PASSWORD } },
    });
    expect(response.status()).toBe(200);
    const { user } = await response.json();

    const conduitOrigin = new URL(process.env.CONDUIT_URL!).origin;
    const state = { cookies: [], origins: [{ origin: conduitOrigin, localStorage: [{ name: 'jwtToken', value: user.token }] }] };
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    fs.writeFileSync(authFile, JSON.stringify(state, null, 2));
});
