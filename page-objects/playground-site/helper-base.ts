import { Page, Locator } from '@playwright/test'

/**
 * Base class all page objects extend. Holds the shared `page` reference plus
 * locators/helpers that are common across every page (e.g. the dashboard's main content area).
 */
export class HelperBase {
    protected readonly page: Page;

    private dashboardMainPage: Locator

    constructor(page: Page) {
        this.page = page;
        this.dashboardMainPage = this.page.locator('ngx-pages')
    }

    /**
     * Main content area of the dashboard, outside the sidebar/header.
     */
    getDashboardMainPage(): Locator {
        return this.dashboardMainPage
    }
}
