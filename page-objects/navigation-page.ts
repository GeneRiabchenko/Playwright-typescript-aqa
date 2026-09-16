import {Page} from "@playwright/test";
import { HelperBase } from "./helper-base";
import { step } from "../helpers/test-step-decorator";

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
        await this.page.getByRole('link', { name: category }).click();
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
}
