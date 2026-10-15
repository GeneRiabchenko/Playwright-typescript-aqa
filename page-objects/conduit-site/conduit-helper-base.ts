import { Locator, Page } from '@playwright/test'
import { step } from "../../helpers/test-step-decorator";

export class ConduitHelperBase {
    protected readonly page: Page;

    private popularTags: Locator
    private pageLogoTitle: Locator

    constructor(page: Page) {
        this.page = page;
        this.popularTags = this.page.locator('.sidebar .tag-pill')
        this.pageLogoTitle = this.page.locator('.logo-font')
    }


    /**
     * Popular Tags sidebar pills; assert with `toHaveText([...])` (auto-retries until they render).
     */
    getPopularTags(): Locator {
        return this.popularTags
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