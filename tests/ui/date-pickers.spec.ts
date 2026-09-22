import { expect } from '@playwright/test'
import { test } from '../../fixtures/fixture'
import { getRandomDate, getRandomDateRange, getRandomDateNearToday } from '../../helpers/date-helper'

test.beforeEach( async ({ pom }) => {
    await pom.navigateTo.expandMenuItemAndSelectCategory('Forms', 'Datepicker')
})

test('Select date in common datepicker',async ({ pom }) => {
    const expectedDate = getRandomDate()
    await pom.DatePickerPage.selectDateInCommonDate(expectedDate)
    await expect(pom.DatePickerPage.getCommonDatePicker()).toHaveValue(expectedDate)
})

test('Select date in range datepicker',async ({ pom }) => {
    const expectedDate = getRandomDateRange()
    await pom.DatePickerPage.selectDatesInRangeDatePicker(expectedDate)
    await expect(pom.DatePickerPage.getDatePickerWithRange()).toHaveValue(expectedDate)
})

test('Select date in datepicker with disabled min and max dates', async ({ pom }) => {
    // Min/max dates are relative to today, so the target date must stay within the enabled window
    const expectedDate = getRandomDateNearToday()
    await pom.DatePickerPage.selectDateInDisabledMinMaxDatePicker(expectedDate)
    await expect(pom.DatePickerPage.getDatePickerWithMinMaxValue()).toHaveValue(expectedDate)
})
