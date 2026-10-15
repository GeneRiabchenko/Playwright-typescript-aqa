import { Locator, Page } from '@playwright/test'
import { step } from "../../helpers/test-step-decorator";

export class GlobalFeed {
    protected readonly page: Page;
    private articlePreviews: Locator

    constructor(page: Page) {
        this.page = page
        this.articlePreviews = this.page.locator('.article-preview')
    }

    /**
     * Returned as Locators (not strings) so specs can use auto-retrying assertions such as
     * `toHaveText([...])` — Playwright then waits out Angular's clear-and-re-render of the feed.
     */

    /** All article titles in the feed. */
    getArticleTitles(): Locator {
        return this.articlePreviews.locator('h1')
    }

    /** @param index 0-based position of the article in the feed */
    getArticleTitleByIndex(index: number): Locator {
        return this.articlePreviews.nth(index).locator('h1')
    }

    /** Favorites/likes button (its text is the count). @param index 0-based position */
    getArticleLikesByIndex(index: number): Locator {
        return this.articlePreviews.nth(index).locator('app-favorite-button button')
    }

    /** Tag pills of one article. @param index 0-based position */
    getArticleTagsByIndex(index: number): Locator {
        return this.articlePreviews.nth(index).locator('.tag-list .tag-default')
    }

    /** @param index 0-based position */
    getArticleAuthorByIndex(index: number): Locator {
        return this.articlePreviews.nth(index).locator('.author')
    }

    /** Publish date as shown in the feed. @param index 0-based position */
    getArticleDateByIndex(index: number): Locator {
        return this.articlePreviews.nth(index).locator('.date')
    }

    /** Preview text (description). @param index 0-based position */
    getArticleTextByIndex(index: number): Locator {
        return this.articlePreviews.nth(index).locator('.preview-link p')
    }

    /**
     * Clicks the "Read more..." link of the article at the given index, navigating to it.
     * @param index 0-based position of the article in the feed
     */
    @step
    async clickReadMoreByIndex(index: number) {
        await this.articlePreviews.nth(index).getByText('Read more...').click()
    }
}
