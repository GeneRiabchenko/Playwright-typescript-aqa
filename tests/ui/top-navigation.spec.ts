import { expect } from '@playwright/test'
import { test } from '../../fixtures/fixture'
import { checkAccessibility } from '../../helpers/accessibility-helper'

test.describe('Top Navigation Tests', () => {
    test('Collapse and expand left navigation bar', { tag: '@regression' }, async ({ pom }) => {
        await pom.topNavigationPage.expandOrCompactLeftNavigationBar('compacted')
        await expect(pom.topNavigationPage.getLeftNavBar()).toHaveClass(/compacted/)
        await expect(pom.topNavigationPage.getLeftNavBar()).toHaveScreenshot('left-nav-bar-collapsed.png', { maxDiffPixelRatio: 0.01 })
        await pom.topNavigationPage.expandOrCompactLeftNavigationBar('expanded')
        await expect(pom.topNavigationPage.getLeftNavBar()).toHaveClass(/expanded/)
        await expect(pom.topNavigationPage.getLeftNavBar()).toHaveScreenshot('left-nav-bar-expanded.png', { maxDiffPixelRatio: 0.01 })
    })

    test('Select Dark theme', { tag: '@regression' }, async ({ pom, page }) => {
        await pom.topNavigationPage.selectTheme('Dark')
        await expect(pom.topNavigationPage.getDashboardMainPage()).toHaveScreenshot('dark-theme-selected.png', { maxDiffPixelRatio: 0.01 })
        await checkAccessibility(page)
    })

    test('Select Light theme', { tag: '@regression' }, async ({ pom, page }) => {
        await pom.topNavigationPage.selectTheme('Light')
        await expect(pom.topNavigationPage.getDashboardMainPage()).toHaveScreenshot('light-theme-selected.png', { maxDiffPixelRatio: 0.01 })
        await checkAccessibility(page)
    })

    test('Select Cosmic theme', { tag: '@regression' }, async ({ pom, page }) => {
        await pom.topNavigationPage.selectTheme('Cosmic')
        await expect(pom.topNavigationPage.getDashboardMainPage()).toHaveScreenshot('cosmic-theme-selected.png', { maxDiffPixelRatio: 0.01 })
        await checkAccessibility(page)
    })

    test('Select Corporate theme', { tag: '@regression' }, async ({ pom, page }) => {
        await pom.topNavigationPage.selectTheme('Corporate')
        await expect(pom.topNavigationPage.getDashboardMainPage()).toHaveScreenshot('corporate-theme-selected.png', { maxDiffPixelRatio: 0.01 })
        await checkAccessibility(page)
    })

    test('Search for a term', { tag: '@regression' }, async ({ pom }) => {
        const searchTerm = 'Test Search Term'
        await pom.topNavigationPage.search(searchTerm)
        // The demo has no results page: submitting with Enter just closes the overlay and clears the field.
        await expect(pom.topNavigationPage.getSearchOverlay()).not.toHaveClass(/show/)
        await expect(pom.topNavigationPage.getSearchField()).toHaveValue('')
    })

    test('Open profile menu', { tag: '@regression' }, async ({ pom }) => {
        await pom.topNavigationPage.openProfileMenu()
        await expect(pom.topNavigationPage.getDashboardMainPage()).toHaveScreenshot('profile-menu-opened.png', { maxDiffPixelRatio: 0.01 })
    })
})