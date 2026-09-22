import { Locator, Page } from "@playwright/test"
import { HelperBase } from "./helper-base"
import { step } from "../../helpers/test-step-decorator"

/**
 * Page object for the Datepicker page's three calendars: a single-date picker,
 * a range picker, and a single-date picker with a disabled min/max date window.
 */
export class DatePickerPage extends HelperBase {
    private commonDatePicker: Locator
    private commonYearsCell: Locator
    private commonMonthCell: Locator
    private commonDayCell: Locator
    private datePickerWithRange: Locator
    private rangeYearsCell: Locator
    private rangeMonthCell: Locator
    private rangeDayCell: Locator
    private datePickerWithMinMaxValue: Locator

    constructor(page: Page) {
        super(page)
        this.commonDatePicker = page.getByPlaceholder('Form Picker')
        this.commonYearsCell = this.page.locator('nb-calendar-year-cell')
        this.commonMonthCell = this.page.locator('nb-calendar-month-cell')
        this.commonDayCell = this.page.locator('nb-calendar-day-cell:not(.bounding-month)')
        this.datePickerWithRange = page.getByPlaceholder('Range Picker')
        this.rangeYearsCell = this.page.locator('nb-calendar-range-year-cell')
        this.rangeMonthCell = this.page.locator('nb-calendar-range-month-cell')
        this.rangeDayCell = this.page.locator('nb-calendar-range-day-cell:not(.bounding-month)')
        this.datePickerWithMinMaxValue = page.getByPlaceholder('Min Max Picker')
    }

    getCommonDatePicker(): Locator {
        return this.commonDatePicker
    }

    getDatePickerWithRange(): Locator {
        return this.datePickerWithRange
    }

    getDatePickerWithMinMaxValue(): Locator {
        return this.datePickerWithMinMaxValue
    }

    /**
     * Selects a date in the Common Datepicker.
     * @param date date text to select, e.g. "Oct 30, 2046"
     */
    @step
    async selectDateInCommonDate(date: string) {
        await this.selectSingleDate(this.commonDatePicker, date)
    }

    /**
     * Selects a date in the min/max-restricted Datepicker. The date must fall within the
     * picker's enabled window (relative to today), otherwise the target cells are disabled.
     * @param date date text to select, e.g. "Sep 16, 2026"
     */
    @step
    async selectDateInDisabledMinMaxDatePicker(date: string) {
        await this.selectSingleDate(this.datePickerWithMinMaxValue, date)
    }

    /**
     * Shared flow for any single-date (non-range) calendar: opens the calendar, switches to
     * year-selection view, then picks year, month and day.
     * @param pickerInput the datepicker input to click to open the calendar
     * @param date date text to select, e.g. "Oct 30, 2046"
     */
    @step
    private async selectSingleDate(pickerInput: Locator, date: string) {
        const [monthShort, day, year] = date.split(/[\s,]+/)
        await pickerInput.click()
        await this.page.locator('nb-calendar-view-mode button').click()
        await this.selectYear(year, this.commonYearsCell)
        // Select month
        await this.commonMonthCell.filter({hasText: monthShort}).click()
        // Select date
        await this.commonDayCell.getByText(day, {exact: true}).click()
    }

    /**
     * Selects a start and end date in the Range Datepicker.
     * @param dates range text in the form "<start date> - <end date>", e.g. "Sep 1, 2026 - Jun 22, 2031"
     */
    @step
    async selectDatesInRangeDatePicker(dates: string){
        const [start, finish] = dates.split(' - ')
        const [startMonthShort, startDay, startYear] = start.split(/[\s,]+/)
        const [endMonthShort, endDay, endYear] = finish.split(/[\s,]+/)
        await this.datePickerWithRange.click()
        await this.page.locator('nb-calendar-view-mode button').click()
        await this.selectYear(startYear, this.rangeYearsCell)
        // Select month
        await this.rangeMonthCell.filter({hasText: startMonthShort}).click()
        // Select date
        await this.rangeDayCell.getByText(startDay, {exact: true}).click()

        await this.page.locator('nb-calendar-view-mode button').click()

        await this.selectYear(endYear, this.rangeYearsCell)
        // Select month
        await this.rangeMonthCell.filter({hasText: endMonthShort}).click()
        // Select date
        await this.rangeDayCell.getByText(endDay, {exact: true}).click()
    }

    /**
     * Navigates the calendar's year-selection view (paging forward/back as needed) and clicks
     * the target year once it's visible.
     * @param year year to select, e.g. "2046"
     * @param yearLocatorBlock the year-cell locator scoped to the relevant calendar (common or range)
     */
    @step
    async selectYear(year: string, yearLocatorBlock: Locator) {
        let yearsValue
        let trimmedYears
        while (true){
            yearsValue = await yearLocatorBlock.allTextContents()
            trimmedYears = yearsValue.map(year => year.trim())
            if (trimmedYears.includes(year)) {
                await yearLocatorBlock.getByText(year).click()
                return
            } else if (Number(year) < Number(trimmedYears[0])) {
                await this.page.locator('nb-calendar-pageable-navigation button').first().click()
            } else {
                await this.page.locator('nb-calendar-pageable-navigation button').last().click()
            }
        }
    }


}
