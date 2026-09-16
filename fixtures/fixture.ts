import {test as base} from '@playwright/test'
import { PageManager } from '../page-objects/page-manager'

type TestFixtures = {
    pom: PageManager
};

export const test = base.extend<TestFixtures>({

    pom: async ({ page }, use) => {
        await page.goto('/')
        const pageManager = new PageManager(page);
        await use(pageManager);
    }
  
});
