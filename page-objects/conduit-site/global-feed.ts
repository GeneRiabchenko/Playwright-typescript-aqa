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
     * `allTextContents()` doesn't retry. When the feed is first fulfilled by a mocked/modified
     * route, Angular briefly clears and re-renders the list, so a read can land in that empty
     * window. Retry until the list is non-empty (or attempts run out) instead of trusting a
     * single read.
     */
    private async getAllTrimmedTexts(locator: Locator, maxAttempts: number = 10): Promise<string[]> {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await locator.first().waitFor()
            const texts = await locator.allTextContents()
            if (texts.length > 0) {
                return texts.map(text => text.trim())
            }
            await this.page.waitForTimeout(100)
        }
        return []
    }

    /**
     * @returns array of the trimmed article titles shown in the feed
     */
    @step
    async getTrimmedArticleTitles(): Promise<string[]> {
        return this.getAllTrimmedTexts(this.articlePreviews.locator('h1'))
    }

    /**
     * @param index 0-based position of the article in the feed
     * @returns the article's trimmed title
     */
    @step
    async getArticleTitleByIndex(index: number): Promise<string> {
        const title = await this.articlePreviews.nth(index).locator('h1').textContent()
        return title!.trim()
    }

    /**
     * @param index 0-based position of the article in the feed
     * @returns the article's favorites/likes count
     */
    @step
    async getArticleLikesByIndex(index: number): Promise<number> {
        const likesText = await this.articlePreviews.nth(index).locator('app-favorite-button button').textContent()
        return Number(likesText?.trim())
    }

    /**
     * @param index 0-based position of the article in the feed
     * @returns array of the article's trimmed tag names
     */
    @step
    async getArticleTagsByIndex(index: number): Promise<string[]> {
        return this.getAllTrimmedTexts(this.articlePreviews.nth(index).locator('.tag-list .tag-default'))
    }

    /**
     * @param index 0-based position of the article in the feed
     * @returns the article's author name
     */
    @step
    async getArticleAuthorByIndex(index: number): Promise<string> {
        const author = await this.articlePreviews.nth(index).locator('.author').textContent()
        return author!.trim()
    }

    /**
     * @param index 0-based position of the article in the feed
     * @returns the article's publish date as shown in the feed
     */
    @step
    async getArticleDateByIndex(index: number): Promise<string> {
        const date = await this.articlePreviews.nth(index).locator('.date').textContent()
        return date!.trim()
    }

    /**
     * @param index 0-based position of the article in the feed
     * @returns the article's preview text (description)
     */
    @step
    async getArticleTextByIndex(index: number): Promise<string> {
        const text = await this.articlePreviews.nth(index).locator('.preview-link p').textContent()
        return text!.trim()
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
