import { test, expect } from '../../fixtures/network-mocking-fixture'
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

test('Global Feed', { tag: ['@smoke', '@regression'] }, async ({ mockPom }) => {
    await expect(mockPom.globalFeed.getArticleTitles()).toHaveText([firstArticle.title, secondArticle.title])
})

test('Article title', { tag: '@regression' }, async ({ mockPom }) => {
    await expect(mockPom.globalFeed.getArticleTitleByIndex(0)).toHaveText(firstArticle.title)
})

test('Article text', { tag: '@regression' }, async ({ mockPom }) => {
    await expect(mockPom.globalFeed.getArticleTextByIndex(0)).toHaveText(firstArticle.description)
})

test('Article author', { tag: '@regression' }, async ({ mockPom }) => {
    await expect(mockPom.globalFeed.getArticleAuthorByIndex(0)).toHaveText(firstArticle.author.username)
})

test('Article tags', { tag: '@regression' }, async ({ mockPom }) => {
    await expect(mockPom.globalFeed.getArticleTagsByIndex(0)).toHaveText(firstArticle.tagList)
})

test('Article likes', { tag: '@regression' }, async ({ mockPom }) => {
    await expect(mockPom.globalFeed.getArticleLikesByIndex(0)).toHaveText(String(firstArticle.favoritesCount))
})
