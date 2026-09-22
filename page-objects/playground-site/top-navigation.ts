import { Page, Locator } from "@playwright/test";
import { HelperBase } from "./helper-base";
import { step } from "../../helpers/test-step-decorator";

/**
 * Page object for the top navigation header and the left sidebar it controls
 * (sidebar toggle, theme selector, search, profile menu).
 */
export class TopNavigationPage extends HelperBase {
    private leftNavBar: Locator
    private sideBarToggle: Locator
    private themeSelector: Locator
    private searchIcon: Locator
    private searchField: Locator
    private profileMenu: Locator

    constructor(page: Page){
        super(page)
        this.leftNavBar = this.page.locator("nb-sidebar")
        this.sideBarToggle = this.page.locator('.sidebar-toggle')
        this.themeSelector = this.page.locator('nb-layout-header nb-select')
        this.searchIcon = this.page.locator('nb-action nb-search')
        this.searchField = this.page.locator('nb-search-field input')
        this.profileMenu = this.page.locator('nb-action nb-user')
    }

    getLeftNavBar(): Locator {
        return this.leftNavBar
    }

    /**
     * Expands or compacts the left sidebar, only clicking the toggle if it isn't already in the requested state.
     * @param state 'expanded' or 'compacted'
     */
    @step
    async expandOrCompactLeftNavigationBar(state: string) {
        const isLeftNavBarExpanded = await this.leftNavBar.evaluate(el => el.classList.contains('expanded'))
        if ( state === 'expanded' && !isLeftNavBarExpanded ) {
            await this.sideBarToggle.click()
        } else if ( state === 'compacted' && isLeftNavBarExpanded ) {
            await this.sideBarToggle.click()
        }
    }

    /**
     * Opens the theme dropdown and selects a theme by name.
     * @param themeName accessible name of the theme option (e.g. "Dark", "Light", "Cosmic", "Corporate")
     */
    @step
    async selectTheme(themeName: string) {
        await this.themeSelector.click({force: true})

        await this.page.locator('nb-option-list nb-option').getByText(themeName).click()
        await this.page.mouse.click(0, 0) // Click outside to close the dropdown
    }

    /**
     * Opens the header search field and enters a search term.
     * @param text value to search for
     */
    @step
    async search(text: string) {
        await this.searchIcon.click()
        await this.searchField.fill(text)
        await this.page.keyboard.press('Enter')
    }

    /**
     * Opens the profile/user menu in the header.
     */
    @step
    async openProfileMenu(){
        await this.profileMenu.click()
    }
}
