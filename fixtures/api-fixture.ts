import { test as base, expect, APIRequestContext, APIResponse } from '@playwright/test'
import { ArticleBuilder } from '../test-data/article-builder'

export interface ArticlePayload {
    title?: string
    description: string
    body: string
    tagList: string[]
}

/**
 * Thin typed wrapper over the Conduit REST API. Relative URLs resolve against `API_URL`
 * (which ends with a slash, so no leading slash on the paths below).
 */
export class ConduitApi {
    constructor(private readonly request: APIRequestContext, private readonly authHeaders: Record<string, string>) { }

    createArticle(article: ArticlePayload, authorized = true): Promise<APIResponse> {
        return this.request.post('articles', { headers: authorized ? this.authHeaders : {}, data: { article } })
    }

    getArticle(slug: string): Promise<APIResponse> {
        return this.request.get(`articles/${slug}`)
    }

    updateArticle(slug: string, article: Partial<ArticlePayload>): Promise<APIResponse> {
        return this.request.put(`articles/${slug}`, { headers: this.authHeaders, data: { article } })
    }

    deleteArticle(slug: string, authorized = true): Promise<APIResponse> {
        return this.request.delete(`articles/${slug}`, { headers: authorized ? this.authHeaders : {} })
    }
}

/** Random-but-valid article body for create requests. */
export function buildArticlePayload(): ArticlePayload {
    const { title, description, body, tagList } = new ArticleBuilder().build()
    // Timestamp keeps titles unique across runs, so slugs never collide.
    return { title: `${title} ${Date.now()}`, description, body, tagList }
}

type ApiFixtures = {
    conduitApi: ConduitApi
    // Slugs registered here are deleted after the test, even if it failed halfway.
    createdSlugs: string[]
}

export const test = base.extend<ApiFixtures>({
    conduitApi: async ({ request }, use) => {
        const login = await request.post('users/login', {
            data: { user: { email: process.env.ACCOUNT_USERNAME, password: process.env.ACCOUNT_PASSWORD } },
        })
        expect(login.status()).toBe(200)
        const { user } = await login.json()
        await use(new ConduitApi(request, { Authorization: `Token ${user.token}` }))
    },

    createdSlugs: async ({ conduitApi }, use) => {
        const slugs: string[] = []
        await use(slugs)
        for (const slug of slugs) {
            await conduitApi.deleteArticle(slug)
        }
    },
})

export { expect }
