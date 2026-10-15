import { test, expect } from '../../fixtures/network-mocking-fixture'
import tags from '../../test-data/network-mocks/tags.json'

test.use({ baseURL: process.env.CONDUIT_URL })

test.beforeEach(async ({ page }) => {
    await page.route(process.env.TAGS_API_URL!, async route => {
        await route.fulfill({
            json: tags
        })
    })

    await page.goto('/')
})

test('Popular Tags', { tag: '@regression' }, async ({ mockPom }) =>{
    const expectedTage = tags.tags
    await expect(mockPom.getPopularTags()).toHaveText(expectedTage)
})