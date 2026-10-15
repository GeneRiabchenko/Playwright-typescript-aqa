import { test, expect } from '../../fixtures/network-mocking-fixture'
import { ArticleBuilder } from '../../test-data/article-builder'

test.use({ baseURL: process.env.CONDUIT_URL })

// Precondition: whatever the real API returns for the first article gets overwritten with
// these known values before the response reaches the page.
const overrideArticle = new ArticleBuilder()
    .withTitle('Mocking APIs with page.route')
    .withDescription('How to intercept and fulfill network requests in Playwright tests.')
    .withTags(['API', 'Mocking'])
    .withFavoritesCount(17)
    .withAuthor('John Smith')
    .build()

test.beforeEach(async ({ page }) => {
    await page.route(process.env.ARTICLES_API_URL!, async route => {
        // Firefox advertises zstd, which route.fetch() can't decode (response.json() then throws
        // on binary garbage) — restrict the real request to encodings Playwright understands.
        const response = await route.fetch({
            headers: { ...route.request().headers(), 'accept-encoding': 'gzip, deflate' },
        })
        const responseJson = await response.json()
        responseJson.articles[0].title = overrideArticle.title
        responseJson.articles[0].description = overrideArticle.description
        responseJson.articles[0].tagList = overrideArticle.tagList
        responseJson.articles[0].favoritesCount = overrideArticle.favoritesCount
        responseJson.articles[0].createdAt = overrideArticle.createdAt
        responseJson.articles[0].author.username = overrideArticle.author.username

        await route.fulfill({
            json: responseJson
        })
    })

    await page.goto('/')
})

test('Article title', { tag: '@regression' }, async ({ mockPom }) => {
    await expect(mockPom.globalFeed.getArticleTitleByIndex(0)).toHaveText(overrideArticle.title)
})

test('Article text', { tag: '@regression' }, async ({ mockPom }) => {
    await expect(mockPom.globalFeed.getArticleTextByIndex(0)).toHaveText(overrideArticle.description)
})

test('Article author', { tag: '@regression' }, async ({ mockPom }) => {
    await expect(mockPom.globalFeed.getArticleAuthorByIndex(0)).toHaveText(overrideArticle.author.username)
})

test('Article tags', { tag: '@regression' }, async ({ mockPom }) => {
    await expect(mockPom.globalFeed.getArticleTagsByIndex(0)).toHaveText(overrideArticle.tagList)
})

test('Article likes', { tag: '@regression' }, async ({ mockPom }) => {
    await expect(mockPom.globalFeed.getArticleLikesByIndex(0)).toHaveText(String(overrideArticle.favoritesCount))
})
