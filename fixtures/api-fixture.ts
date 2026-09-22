import { test as base } from '@playwright/test'
import { ApiPageManager } from '../page-objects/conduit-site/api-page-manager'
import { Article } from '../test-data/article-builder'

type ApiTestFixtures = {
    apiPom: ApiPageManager
    // Precondition data for the Global Feed — override per file/describe via
    // `test.use({ mockedArticles: { articles: [...] } })`, built with ArticleBuilder.
    // Wrapped in an object (not a bare array) because `test.use()` treats a 2-element
    // array value as a `[value, options]` tuple and silently drops the second element.
    mockedArticles: { articles: Article[] }
};

export const test = base.extend<ApiTestFixtures>({

    apiPom: async ({ page }, use) => {
        await use(new ApiPageManager(page));
    },

    mockedArticles: [{ articles: [] }, { option: true }],

});

export { expect } from '@playwright/test'
