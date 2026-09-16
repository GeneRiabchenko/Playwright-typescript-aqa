import { expect} from '@playwright/test'
import { test } from '../fixtures/fixture'
import { createTestUser } from '../test-data/user-factory'

const testUser = createTestUser({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'test@test.com',
    password: 'password123',
    recipients: 'test@test.com',
    subject: 'Birthdate',
    message: 'This is a long message that can be used for testing purposes. It can contain multiple lines and special characters. The purpose of this message is to test how the application handles long strings and to ensure that it can process them correctly without any issues.',
})

test.beforeEach( async ({ pom }) => {
    await pom.navigateTo.expandMenuItemAndSelectCategory('Forms', 'Form Layouts')
})

test('Fill inline form', async ({ pom }) => {
    await pom.formLayoutsPage.fillAndSubmitInlineForm(`${testUser.firstName} ${testUser.lastName}`, testUser.email, true)
    await expect(pom.formLayoutsPage.getInlineForm()).toHaveScreenshot('inline-form-filled.png', { maxDiffPixelRatio: 0.01 })
})

test('Fill grid form', async ({ pom }) => {
    await pom.formLayoutsPage.fillAndSubmitGridForm(testUser.email, testUser.password, 'Option 1')
    await expect(pom.formLayoutsPage.getGridForm()).toHaveScreenshot('grid-form-filled.png', { maxDiffPixelRatio: 0.01 })
})

test('Fill basic form', async ({ pom }) => {
    await pom.formLayoutsPage.fillAndSubmitBasicForm(testUser.email, testUser.password, true)
    await expect(pom.formLayoutsPage.getBasicForm()).toHaveScreenshot('basic-form-filled.png', { maxDiffPixelRatio: 0.01 })
})

test('Fill without labels form', async ({ pom }) => {
    await pom.formLayoutsPage.fillAndSubmitWithoutLabelsForm(testUser.recipients, testUser.subject, testUser.message)
    await expect(pom.formLayoutsPage.getWithoutLabelsForm()).toHaveScreenshot('without-labels-form-filled.png', { maxDiffPixelRatio: 0.01 })
})

test('Fill horizontal form', async ({ pom }) => {
    await pom.formLayoutsPage.fillAndSubmitHorizontalForm(testUser.email, testUser.password, true)
    await expect(pom.formLayoutsPage.getHorizontalForm()).toHaveScreenshot('horizontal-form-filled.png', { maxDiffPixelRatio: 0.01 })
})
