import { expect } from '@playwright/test'
import { test } from '../../fixtures/fixture'
import { seedFaker, getRandomDate, getRandomDateRange, getRandomDateNearToday } from '../../helpers/date-helper'

test.beforeEach( async ({ pom }) => {
    // Dates are random; the seed is attached to the report so a failure can be replayed with FAKER_SEED=<seed>
    test.info().annotations.push({ type: 'faker-seed', description: String(seedFaker()) })
    await pom.navigateTo.expandMenuItemAndSelectCategory('Forms', 'Datepicker')
})

test('Select date in common datepicker', { tag: ['@smoke', '@regression'] }, async ({ pom }) => {
    const expectedDate = getRandomDate()
    await pom.datePickerPage.selectDateInCommonDate(expectedDate)
    await expect(pom.datePickerPage.getCommonDatePicker()).toHaveValue(expectedDate)
})

test('Select date in range datepicker', { tag: '@regression' }, async ({ pom }) => {
    const expectedDate = getRandomDateRange()
    await pom.datePickerPage.selectDatesInRangeDatePicker(expectedDate)
    await expect(pom.datePickerPage.getDatePickerWithRange()).toHaveValue(expectedDate)
})

test('Select date in datepicker with disabled min and max dates', { tag: '@regression' }, async ({ pom }) => {
    // Min/max dates are relative to today, so the target date must stay within the enabled window
    const expectedDate = getRandomDateNearToday()
    await pom.datePickerPage.selectDateInDisabledMinMaxDatePicker(expectedDate)
    await expect(pom.datePickerPage.getDatePickerWithMinMaxValue()).toHaveValue(expectedDate)
})
