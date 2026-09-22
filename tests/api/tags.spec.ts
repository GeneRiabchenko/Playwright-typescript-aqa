import { test, expect } from '../../fixtures/api-fixture'
import tags from '../../test-data/api-mocks/tags.json'

test.use({ baseURL: process.env.CONDUIT_URL })

test.beforeEach(async ({ page }) => {
    await page.route(process.env.TAGS_API_URL!, async route => {
        await route.fulfill({
            json: tags
        })
    })

    await page.goto('/')
})

test('Popular Tags', async ({ apiPom }) =>{
    const expectedTage = tags.tags
    expect(await apiPom.getPopularTrimmedTagsText()).toEqual(expectedTage)
})