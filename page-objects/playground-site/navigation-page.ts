import { Page } from "@playwright/test";
import { HelperBase } from "./helper-base";
import { step } from "../../helpers/test-step-decorator";

/**
 * Page object for the left-hand expandable side-navigation menu.
 * Handles expanding a top-level menu item and selecting a category link inside it.
 */
export class NavigationPage extends HelperBase {
    constructor(page: Page){
        super(page)
    }

    /**
     * Expands a top-level menu item (if not already expanded) and clicks a category link inside it.
     * @param menuItem accessible name of the top-level menu link (e.g. "Forms")
     * @param category accessible name of the category link to click (e.g. "Form Layouts")
     */
    @step
    async expandMenuItemAndSelectCategory(menuItem: string, category: string) {
        // Check if the menu item is already expanded
        if(!(await this.isMenuExpanded(menuItem))) {
            await this.page.getByRole('link', { name: menuItem }).click();
        }
        await this.clickMenuLink(category)
    }

    /**
     * Clicks a top-level menu link that navigates directly, without an expandable category submenu
     * (e.g. "IoT Dashboard").
     * @param menuItem accessible name of the top-level menu link
     */
    @step
    async selectTopLevelPage(menuItem: string) {
        await this.clickMenuLink(menuItem)
    }

    /**
     * Checks whether a top-level menu item is currently expanded.
     * @param menuName accessible name of the top-level menu link
     */
    @step
    async isMenuExpanded(menuName: string): Promise<boolean> {
        const menu = this.page.getByRole('link', { name: menuName });
        const isExpanded = await menu.getAttribute('aria-expanded');
        return isExpanded === 'true';
    }

    // Clicks a menu link and waits for Angular's router to navigate to its target route. Checks
    // like axe.analyze() have no locator of their own to auto-wait on, so without this they can
    // scan the previous page's still-mounted DOM mid-navigation.
    private async clickMenuLink(name: string) {
        const link = this.page.getByRole('link', { name });
        const href = await link.getAttribute('href');
        await link.click();
        if (href) {
            await this.page.waitForURL('**' + href);
        }
    }
}
