import { Page } from '@playwright/test'
import { NavigationPage } from './navigation-page'
import { FormLayoutsPage } from './form-layouts-page'
import { TopNavigationPage } from './top-navigation'
import { DatePickerPage } from './date-picker-page'
import { DialogPage } from './dialog-page'

export class PageManager {
    readonly navigateTo: NavigationPage
    readonly formLayoutsPage: FormLayoutsPage
    readonly topNavigationPage: TopNavigationPage
    readonly datePickerPage: DatePickerPage
    readonly dialogPage: DialogPage

    constructor(page: Page) {
        this.navigateTo = new NavigationPage(page)
        this.formLayoutsPage = new FormLayoutsPage(page)
        this.topNavigationPage = new TopNavigationPage(page)
        this.datePickerPage = new DatePickerPage(page)
        this.dialogPage = new DialogPage(page)
    }
}