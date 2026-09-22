import { test, expect } from '../../fixtures/api-fixture'
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
        const response = await route.fetch()
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

test('Article title', async ({ apiPom }) => {
    const title = await apiPom.globalFeed.getArticleTitleByIndex(0)
    expect(title).toEqual(overrideArticle.title)
})

test('Article text', async ({ apiPom }) => {
    const text = await apiPom.globalFeed.getArticleTextByIndex(0)
    expect(text).toEqual(overrideArticle.description)
})

test('Article author', async ({ apiPom }) => {
    const author = await apiPom.globalFeed.getArticleAuthorByIndex(0)
    expect(author).toEqual(overrideArticle.author.username)
})

test('Article tags', async ({ apiPom }) => {
    const tags = await apiPom.globalFeed.getArticleTagsByIndex(0)
    expect(tags).toEqual(overrideArticle.tagList)
})

test('Article likes', async ({ apiPom }) => {
    const likes = await apiPom.globalFeed.getArticleLikesByIndex(0)
    expect(likes).toEqual(overrideArticle.favoritesCount)
})
