import { expect } from '@playwright/test'
import { test } from '../../fixtures/fixture'

test.describe('Top Navigation Tests', () => {
    test('Collapse and expand left navigation bar', async ({ pom }) => {
        await pom.topNavigationPage.expandOrCompactLeftNavigationBar('compacted')
        await expect(pom.topNavigationPage.getLeftNavBar()).toHaveClass(/compacted/)
        await expect(pom.topNavigationPage.getLeftNavBar()).toHaveScreenshot('left-nav-bar-collapsed.png', { maxDiffPixelRatio: 0.01 })

        await pom.topNavigationPage.expandOrCompactLeftNavigationBar('expanded')
        await expect(pom.topNavigationPage.getLeftNavBar()).toHaveClass(/expanded/)
        await expect(pom.topNavigationPage.getLeftNavBar()).toHaveScreenshot('left-nav-bar-expanded.png', { maxDiffPixelRatio: 0.01 })
    })

    test('Select different themes', async ({ pom }) => {
        await pom.topNavigationPage.selectTheme('Dark')
        await expect(pom.topNavigationPage.getDashboardMainPage()).toHaveScreenshot('dark-theme-selected.png', { maxDiffPixelRatio: 0.01 })
        await pom.topNavigationPage.selectTheme('Light')
        await expect(pom.topNavigationPage.getDashboardMainPage()).toHaveScreenshot('light-theme-selected.png', { maxDiffPixelRatio: 0.01 })
        await pom.topNavigationPage.selectTheme('Cosmic')
        await expect(pom.topNavigationPage.getDashboardMainPage()).toHaveScreenshot('cosmic-theme-selected.png', { maxDiffPixelRatio: 0.01 })
        await pom.topNavigationPage.selectTheme('Corporate')
        await expect(pom.topNavigationPage.getDashboardMainPage()).toHaveScreenshot('corporate-theme-selected.png', { maxDiffPixelRatio: 0.01 })
    })

    test('Search for a term', async ({ pom }) => {
        const searchTerm = 'Test Search Term'
        await pom.topNavigationPage.search(searchTerm)
    })

    test('Open profile menu', async ({ pom }) => {
        await pom.topNavigationPage.openProfileMenu()
        await expect(pom.topNavigationPage.getDashboardMainPage()).toHaveScreenshot('profile-menu-opened.png', { maxDiffPixelRatio: 0.01 })
    })
})