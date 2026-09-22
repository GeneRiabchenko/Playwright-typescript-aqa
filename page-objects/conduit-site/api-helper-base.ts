import { Locator, Page } from '@playwright/test'
import { step } from "../../helpers/test-step-decorator";

export class ApiHelperBase {
    protected readonly page: Page;

    private popularTags: Locator
    private pageLogoTitle: Locator

    constructor(page: Page) {
        this.page = page;
        this.popularTags = this.page.locator('.sidebar .tag-pill')
        this.pageLogoTitle = this.page.locator('.logo-font')
    }


    /**
     * 
     * @returns array of the trimmed popular tag text
     */
    @step
    async getPopularTrimmedTagsText() {
        await this.popularTags.first().waitFor()
        const tags = await this.popularTags.allTextContents()
        return tags.map(tag => tag.trim())
    }

    /**
     * Return logo text from main page
     */
    @step
    async getMainLogoTitle() {
        // Wait for the toastr message to appear
        return await this.pageLogoTitle.textContent()
    }

}