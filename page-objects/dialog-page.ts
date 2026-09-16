import { Locator, Page } from "@playwright/test"
import { HelperBase } from "./helper-base"
import { step } from "../helpers/test-step-decorator"

/**
 * Page object for the Dialog page. Models the buttons that open each dialog variant
 * plus the single shared dialog overlay (title/body/close controls).
 */
export class DialogPage extends HelperBase {
    private openDialogWithComponentButton: Locator
    private openDialogWithTemplateButton: Locator
    private openWithDelay3SecondsButton: Locator
    private openWithDelay10SecondsButton: Locator
    private openDialogWithBackdropClickButton: Locator
    private openWithoutBackdropClickButton: Locator
    private enterNameButton: Locator

    private dialogContainer: Locator
    private dialogTitle: Locator
    private dialogBody: Locator
    private dialogNameInput: Locator
    private backdrop: Locator

    constructor(page: Page) {
        super(page)
        this.openDialogWithComponentButton = page.getByRole('button', { name: 'Open Dialog with component' })
        this.openDialogWithTemplateButton = page.getByRole('button', { name: 'Open Dialog with template' })
        this.openWithDelay3SecondsButton = page.getByRole('button', { name: 'Open with delay 3 seconds' })
        this.openWithDelay10SecondsButton = page.getByRole('button', { name: 'Open with delay 10 seconds' })
        this.openDialogWithBackdropClickButton = page.getByRole('button', { name: 'Open Dialog with backdrop click' })
        this.openWithoutBackdropClickButton = page.getByRole('button', { name: 'Open without backdrop click' })
        this.enterNameButton = page.getByRole('button', { name: 'Enter Name' })

        this.dialogContainer = page.locator('nb-dialog-container')
        this.dialogTitle = this.dialogContainer.locator('nb-card-header')
        this.dialogBody = this.dialogContainer.locator('nb-card-body')
        this.dialogNameInput = this.dialogContainer.getByPlaceholder('Name')
        this.backdrop = page.locator('.cdk-overlay-backdrop')
    }

    getDialogTitle(): Locator {
        return this.dialogTitle
    }

    getDialogBody(): Locator {
        return this.dialogBody
    }

    /**
     * Whether a dialog overlay is currently open.
     */
    @step
    async isDialogOpen(): Promise<boolean> {
        return await this.dialogContainer.count() > 0
    }

    /**
     * Opens the dialog built as an Angular component ("This is a title passed to the dialog component").
     */
    @step
    async openDialogWithComponent() {
        await this.openDialogWithComponentButton.click()
    }

    /**
     * Closes a dialog via its "Dismiss Dialog" button.
     */
    @step
    async closeDialogWithDismissButton() {
        await this.dialogContainer.getByRole('button', { name: 'Dismiss Dialog' }).click()
    }

    /**
     * Opens the dialog built from a template ("Friendly reminder" / additional data passed to dialog).
     */
    @step
    async openDialogWithTemplate() {
        await this.openDialogWithTemplateButton.click()
    }

    /**
     * Closes a dialog via its "OK" button.
     */
    @step
    async closeDialogWithOkButton() {
        await this.dialogContainer.getByRole('button', { name: 'OK' }).click()
    }

    /**
     * Opens a dialog after a 3 second delay.
     */
    @step
    async openDialogWithDelay3Seconds() {
        await this.openWithDelay3SecondsButton.click()
    }

    /**
     * Opens a dialog after a 10 second delay.
     */
    @step
    async openDialogWithDelay10Seconds() {
        await this.openWithDelay10SecondsButton.click()
    }

    /**
     * Opens a dialog configured to close when its backdrop is clicked.
     */
    @step
    async openDialogWithBackdropClick() {
        await this.openDialogWithBackdropClickButton.click()
    }

    /**
     * Opens a dialog configured to NOT close when its backdrop is clicked.
     */
    @step
    async openDialogWithoutBackdropClick() {
        await this.openWithoutBackdropClickButton.click()
    }

    /**
     * Clicks the dialog's backdrop (outside the dialog card). Clicks near the corner of the
     * backdrop, since its center is covered by the dialog card itself.
     */
    @step
    async clickBackdrop() {
        await this.backdrop.click({ position: { x: 5, y: 5 } })
    }

    /**
     * Clicks "Enter Name" repeatedly until the "Enter your name" prompt dialog (with the
     * name input) actually appears. This card opens a random dialog variant on each click
     * (the name prompt, or a validation reminder), so retrying is required to reliably reach
     * the name prompt. Each attempt waits for whichever dialog opens to actually render before
     * deciding what to do, then closes it (Escape for the name prompt, its "OK" button for the
     * reminder, which does not close on Escape) before retrying — this avoids racing a second
     * click against a dialog that hasn't finished rendering yet.
     * @param maxAttempts safety cap to avoid looping forever if the prompt never appears
     */
    @step
    async openNamePromptDialog(maxAttempts: number = 20) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await this.enterNameButton.click({ timeout: 5000 })
            await this.dialogContainer.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
            if (await this.dialogNameInput.isVisible().catch(() => false)) {
                return
            }
            if (await this.dialogContainer.count() > 0) {
                await this.page.keyboard.press('Escape')
                if (await this.dialogContainer.count() > 0) {
                    await this.dialogContainer.getByRole('button').first().click({ timeout: 5000 }).catch(() => {})
                }
            }
        }
        throw new Error(`Name prompt dialog did not appear after ${maxAttempts} attempts`)
    }

    /**
     * Closes the name prompt dialog via its "Cancel" button.
     */
    @step
    async closeNamePromptWithCancel() {
        await this.dialogContainer.getByRole('button', { name: 'Cancel' }).click()
    }
}
