import { expect } from '@playwright/test'
import { test } from '../../fixtures/fixture'

test.beforeEach( async ({ pom }) => {
    await pom.navigateTo.expandMenuItemAndSelectCategory('Modal & Overlays', 'Dialog')
})

test('Open dialog with component', async ({ pom }) => {
    await pom.dialogPage.openDialogWithComponent()
    await expect(pom.dialogPage.getDialogTitle()).toHaveText('This is a title passed to the dialog component')
    await expect(pom.dialogPage.getDialogBody()).toContainText('Lorem ipsum dolor sit amet')

    await pom.dialogPage.closeDialogWithDismissButton()
    await expect(await pom.dialogPage.isDialogOpen()).toBe(false)
})

test('Open dialog with template', async ({ pom }) => {
    await pom.dialogPage.openDialogWithTemplate()
    await expect(pom.dialogPage.getDialogTitle()).toHaveText('Friendly reminder')
    await expect(pom.dialogPage.getDialogBody()).toHaveText('this is some additional data passed to dialog')

    await pom.dialogPage.closeDialogWithOkButton()
    await expect(await pom.dialogPage.isDialogOpen()).toBe(false)
})

test('Open dialog with 10 second delay', async ({ pom }) => {
    await pom.dialogPage.openDialogWithDelay10Seconds()
    await expect(pom.dialogPage.getDialogTitle()).toHaveText('Friendly reminder', { timeout: 15000 })
    await expect(pom.dialogPage.getDialogBody()).toHaveText('Dialog opened after a 10 second API call')

    await pom.dialogPage.closeDialogWithOkButton()
    await expect(await pom.dialogPage.isDialogOpen()).toBe(false)
})

test('Open dialog with 3 second delay', async ({ pom }) => {
    await pom.dialogPage.openDialogWithDelay3Seconds()
    await expect(pom.dialogPage.getDialogTitle()).toHaveText('Friendly reminder')
    await expect(pom.dialogPage.getDialogBody()).toHaveText('Dialog opened after a 3 second API call')

    await pom.dialogPage.closeDialogWithOkButton()
    await expect(await pom.dialogPage.isDialogOpen()).toBe(false)
})

test('Open random dialog', async ({ pom }) => {
    await pom.dialogPage.openNamePromptDialog()
    await expect(pom.dialogPage.getDialogTitle()).toHaveText('Enter your name')

    await pom.dialogPage.closeNamePromptWithCancel()
    await expect(await pom.dialogPage.isDialogOpen()).toBe(false)
})

test('Open dialog with backdrop click', async ({ pom }) => {
    await pom.dialogPage.openDialogWithBackdropClick()
    await expect(pom.dialogPage.getDialogTitle()).toHaveText('This is a title passed to the dialog component')
    await expect(pom.dialogPage.getDialogBody()).toContainText('Lorem ipsum dolor sit amet')

    await pom.dialogPage.clickBackdrop()
    await expect(await pom.dialogPage.isDialogOpen()).toBe(false)
})

test('Open dialog without backdrop click', async ({ pom }) => {
    await pom.dialogPage.openDialogWithoutBackdropClick()
    await expect(pom.dialogPage.getDialogTitle()).toHaveText('Friendly reminder')
    await expect(pom.dialogPage.getDialogBody()).toHaveText('this is some additional data passed to dialog')

    await pom.dialogPage.clickBackdrop()
    await expect(await pom.dialogPage.isDialogOpen()).toBe(true)

    await pom.dialogPage.closeDialogWithOkButton()
    await expect(await pom.dialogPage.isDialogOpen()).toBe(false)
})
