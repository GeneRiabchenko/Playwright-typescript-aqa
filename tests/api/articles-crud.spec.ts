import { test, expect, buildArticlePayload } from '../../fixtures/api-fixture'

test.describe('Articles API — CRUD', () => {
    test('create, read, update and delete an article', { tag: ['@smoke', '@regression'] }, async ({ conduitApi }) => {
        const payload = buildArticlePayload()

        const created = await conduitApi.createArticle(payload)
        expect(created.status()).toBe(201)
        const { article } = await created.json()
        expect(article).toMatchObject({ title: payload.title, description: payload.description, body: payload.body })
        expect(article.slug).toEqual(expect.any(String))
        expect(article.author.username).toEqual(expect.any(String))

        const fetched = await conduitApi.getArticle(article.slug)
        expect(fetched.status()).toBe(200)
        expect((await fetched.json()).article.slug).toBe(article.slug)

        const updated = await conduitApi.updateArticle(article.slug, { body: 'updated body' })
        expect(updated.status()).toBe(200)
        expect((await updated.json()).article.body).toBe('updated body')

        const deleted = await conduitApi.deleteArticle(article.slug)
        expect(deleted.status()).toBe(204)

        const afterDelete = await conduitApi.getArticle(article.slug)
        expect(afterDelete.status()).toBe(404)
    })
})
