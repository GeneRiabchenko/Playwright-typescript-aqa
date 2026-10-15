import { Page } from '@playwright/test'
import { GlobalFeed } from './global-feed'
import { ConduitHelperBase } from './conduit-helper-base'

export class ConduitPageManager extends ConduitHelperBase {
    readonly globalFeed: GlobalFeed


    constructor(page: Page) {
        super(page)
        this.globalFeed = new GlobalFeed(page)
    }

}
