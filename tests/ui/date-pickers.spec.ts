import { expect } from '@playwright/test'
import { test } from '../../fixtures/fixture'
import { getRandomDate, getRandomDateRange, getRandomDateNearToday } from '../../helpers/date-helper'

test.beforeEach( async ({ pom }) => {
    await pom.navigateTo.expandMenuItemAndSelectCategory('Forms', 'Datepicker')
})

test('Select date in common datepicker',async ({ pom }) => {
    const expectedDate = getRandomDate()
    await pom.datePickerPage.selectDateInCommonDate(expectedDate)
    await expect(pom.datePickerPage.getCommonDatePicker()).toHaveValue(expectedDate)
})

test('Select date in range datepicker',async ({ pom }) => {
    const expectedDate = getRandomDateRange()
    await pom.datePickerPage.selectDatesInRangeDatePicker(expectedDate)
    await expect(pom.datePickerPage.getDatePickerWithRange()).toHaveValue(expectedDate)
})

test('Select date in datepicker with disabled min and max dates', async ({ pom }) => {
    // Min/max dates are relative to today, so the target date must stay within the enabled window
    const expectedDate = getRandomDateNearToday()
    await pom.datePickerPage.selectDateInDisabledMinMaxDatePicker(expectedDate)
    await expect(pom.datePickerPage.getDatePickerWithMinMaxValue()).toHaveValue(expectedDate)
})
