import { Page } from '@playwright/test'
import { GlobalFeed } from './global-feed'
import { ApiHelperBase } from './api-helper-base'

export class ApiPageManager extends ApiHelperBase {
    readonly globalFeed: GlobalFeed


    constructor(page: Page) {
        super(page)
        this.globalFeed = new GlobalFeed(page)
    }

}
