import { test, expect, buildArticlePayload } from '../../fixtures/api-fixture'

test.describe('Articles API — negative cases', () => {
    test('POST /articles without a token returns 401', { tag: '@regression' }, async ({ conduitApi }) => {
        const response = await conduitApi.createArticle(buildArticlePayload(), false)
        expect(response.status()).toBe(401)
    })

    test('POST /articles without a title returns 422', { tag: '@regression' }, async ({ conduitApi }) => {
        // `undefined` is dropped by JSON.stringify, so the request body has no `title` key at all.
        const response = await conduitApi.createArticle({ ...buildArticlePayload(), title: undefined })
        expect(response.status()).toBe(422)
    })

    test('DELETE /articles/:slug without a token returns 401', { tag: '@regression' }, async ({ conduitApi, createdSlugs }) => {
        const created = await conduitApi.createArticle(buildArticlePayload())
        const { slug } = (await created.json()).article
        createdSlugs.push(slug)

        const response = await conduitApi.deleteArticle(slug, false)
        expect(response.status()).toBe(401)
    })

    test('login with a wrong password is rejected', { tag: '@regression' }, async ({ request }) => {
        const response = await request.post('users/login', {
            data: { user: { email: process.env.ACCOUNT_USERNAME, password: 'definitely-wrong-password' } },
        })
        expect([401, 403, 422]).toContain(response.status())
    })
})
