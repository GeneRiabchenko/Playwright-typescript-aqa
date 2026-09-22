import {test as base} from '@playwright/test'
import { PageManager } from '../page-objects/playground-site/page-manager'
import { TestUser, UserBuilder } from '../test-data/user-builder'

type TestFixtures = {
    pom: PageManager
    userOverrides: Partial<TestUser>
    testUser: TestUser
};

export const test = base.extend<TestFixtures>({

    pom: async ({ page }, use) => {
        await page.goto('/')
        await use(new PageManager(page));
    },

    // Per-file override point: `test.use({ userOverrides: { email: '...' } })` pins fields
    // (e.g. for screenshot tests that need stable text) while the rest stay random.
    userOverrides: [{}, { option: true }],

    testUser: async ({ userOverrides }, use) => {
        await use({ ...new UserBuilder().build(), ...userOverrides });
    }

});
