import { test, expect, buildArticlePayload } from '../../fixtures/api-fixture'

// Hybrid scenario: the precondition is created through the REST API (fast, deterministic),
// the assertion is made in the real UI. Runs as a logged-in user via the project's storageState.
test('article created via API is visible in the UI', { tag: ['@smoke', '@regression'] }, async ({ conduitApi, createdSlugs, page }) => {
    const payload = buildArticlePayload()
    const created = await conduitApi.createArticle(payload)
    expect(created.status()).toBe(201)
    const { slug } = (await created.json()).article
    createdSlugs.push(slug)

    await page.goto(new URL(`article/${slug}`, process.env.CONDUIT_URL).href)

    await expect(page.getByRole('heading', { name: payload.title })).toBeVisible()
    await expect(page.getByText(payload.body)).toBeVisible()
})
