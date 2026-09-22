import { test, expect } from '../../fixtures/api-fixture'
import { ArticleBuilder, buildArticlesResponse } from '../../test-data/article-builder'

test.use({ baseURL: process.env.CONDUIT_URL })

// Precondition for every test in this file: two known articles served by the mocked API.
const firstArticle = new ArticleBuilder()
    .withTitle('Playwright Locators Explained')
    .withDescription('A practical guide to writing stable, user-facing locators.')
    .withTags(['Playwright', 'TypeScript', 'Testing'])
    .withFavoritesCount(42)
    .withAuthor('Jane Doe')
    .build()

const secondArticle = new ArticleBuilder()
    .withTitle('Mocking APIs with page.route')
    .withDescription('How to intercept and fulfill network requests in Playwright tests.')
    .withTags(['API', 'Mocking'])
    .withFavoritesCount(17)
    .withAuthor('John Smith')
    .build()

test.use({ mockedArticles: { articles: [firstArticle, secondArticle] } })

test.beforeEach(async ({ page, mockedArticles }) => {
    await page.route(process.env.ARTICLES_API_URL!, async route => {
        await route.fulfill({
            json: buildArticlesResponse(mockedArticles.articles)
        })
    })

    await page.goto('/')
})

test('Global Feed', async ({ apiPom }) => {
    const expectedTitles = [firstArticle.title, secondArticle.title]
    expect(await apiPom.globalFeed.getTrimmedArticleTitles()).toEqual(expectedTitles)
})

test('Article title', async ({ apiPom }) => {
    const title = await apiPom.globalFeed.getArticleTitleByIndex(0)
    expect(title).toEqual(firstArticle.title)
})

test('Article text', async ({ apiPom }) => {
    const text = await apiPom.globalFeed.getArticleTextByIndex(0)
    expect(text).toEqual(firstArticle.description)
})

test('Article author', async ({ apiPom }) => {
    const author = await apiPom.globalFeed.getArticleAuthorByIndex(0)
    expect(author).toEqual(firstArticle.author.username)
})

test('Article tags', async ({ apiPom }) => {
    const tags = await apiPom.globalFeed.getArticleTagsByIndex(0)
    expect(tags).toEqual(firstArticle.tagList)
})

test('Article likes', async ({ apiPom }) => {
    const likes = await apiPom.globalFeed.getArticleLikesByIndex(0)
    expect(likes).toEqual(firstArticle.favoritesCount)
})
