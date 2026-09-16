import { Locator, Page} from "@playwright/test"
import { step } from "../helpers/test-step-decorator";
import { HelperBase } from "./helper-base";

/**
 * Page object for the "Form Layouts" page.
 * Models each `nb-card` form (inline, grid, basic, without labels, block, horizontal)
 * as a scoped locator, with fill/submit helpers for each.
 */
export class FormLayoutsPage extends HelperBase {
    private inlineForm: Locator
    private gridForm: Locator
    private basicForm: Locator
    private withoutLabelsForm: Locator
    private blockForm: Locator
    private horizontalForm: Locator

    constructor(page: Page){
        super(page)
        this.inlineForm = this.page.locator('nb-card', { hasText: 'Inline form' })
        this.gridForm = this.page.locator('nb-card', { hasText: 'Using the Grid' })
        this.basicForm = this.page.locator('nb-card', { hasText: 'Basic form' })
        this.withoutLabelsForm = this.page.locator('nb-card', { hasText: 'Form without labels' })
        this.blockForm = this.page.locator('nb-card', { hasText: 'Block form' })
        this.horizontalForm = this.page.locator('nb-card', { hasText: 'Horizontal form' })
    }

    getInlineForm(): Locator {
        return this.inlineForm
    }

    getGridForm(): Locator {
        return this.gridForm
    }

    getBasicForm(): Locator {
        return this.basicForm
    }

    getWithoutLabelsForm(): Locator {
        return this.withoutLabelsForm
    }

    getHorizontalForm(): Locator {
        return this.horizontalForm
    }

    /**
     * Fills the Email field within a given form block.
     * @param block form card to scope the field lookup to
     * @param email value to enter
     */
    @step
    async fillEmailField(block: Locator, email: string) {
        await block.getByPlaceholder('Email').fill(email)
    }

    /**
     * Fills the Password field within a given form block.
     * @param block form card to scope the field lookup to
     * @param password value to enter
     */
    @step
    async fillPasswordField(block: Locator, password: string) {
        await block.getByPlaceholder('Password').fill(password)
    }

    /**
     * Clicks the submit/send/sign-in button within a given form block.
     * @param block form card to scope the button lookup to
     */
    @step
    async clickSignInSubmitOrSend(block: Locator) {
        await block.getByRole('button').click()
    }

    /**
     * Fills email and password within a form block and submits it.
     * @param block form card to scope the fields/button to
     * @param email value to enter
     * @param password value to enter
     */
    @step
    async fillEmailPasswordAndSubmitForm(block: Locator, email: string, password: string) {
        await this.fillEmailField(block, email)
        await this.fillPasswordField(block, password)
        await this.clickSignInSubmitOrSend(block)
    }

    /**
     * Selects a radio option within the Grid form.
     * @param option accessible name of the radio to select
     */
    @step
    async selectRadioOption(option: string) {
        await this.gridForm.getByRole('radio', { name: option }).click({force: true})
    }

    /**
     * Checks or unchecks the "Remember me" checkbox within a given form block.
     * @param block form card to scope the checkbox lookup to
     * @param checked true to check, false to uncheck
     */
    @step
    async checkRememberMeCheckbox(block: Locator, checked: boolean) {
        if (checked) {
            await block.getByRole('checkbox').check({ force: true })
        } else {
            await block.getByRole('checkbox').uncheck({ force: true })
        }
    }

    /**
     * Checks or unchecks the "Check me out" checkbox on the Basic form.
     * @param checked true to check, false to uncheck
     */
    @step
    async checkMeOutCheckbox(checked: boolean) {
        if (checked) {
            await this.basicForm.getByRole('checkbox').check({ force: true })
        } else {
            await this.basicForm.getByRole('checkbox').uncheck({ force: true })
        }
    }

    /**
     * Fills the name field (placeholder "Jane Doe") on the Inline form.
     * @param name value to enter
     */
    @step
    async fillJaneDoeInputField(name: string) {
        await this.inlineForm.getByPlaceholder('Jane Doe').fill(name)
    }

    /**
     * Fills and submits the Inline form.
     * @param name value for the name field
     * @param email value for the email field
     * @param rememberMeChecked whether to check "Remember me"
     */
    @step
    async fillAndSubmitInlineForm(name: string, email: string, rememberMeChecked: boolean) {
        await this.fillJaneDoeInputField(name)
        await this.fillEmailField(this.inlineForm, email)
        await this.checkRememberMeCheckbox(this.inlineForm, rememberMeChecked)
        await this.clickSignInSubmitOrSend(this.inlineForm)
    }

    /**
     * Fills and submits the Grid form.
     * @param email value for the email field
     * @param password value for the password field
     * @param radioOption accessible name of the radio option to select
     */
    @step
    async fillAndSubmitGridForm(email: string, password: string, radioOption: string) {
        await this.fillEmailField(this.gridForm, email)
        await this.fillPasswordField(this.gridForm, password)
        await this.selectRadioOption(radioOption)
        await this.clickSignInSubmitOrSend(this.gridForm)
    }

    /**
     * Fills and submits the Basic form.
     * @param email value for the email field
     * @param password value for the password field
     * @param checkMeOutChecked whether to check "Check me out"
     */
    @step
    async fillAndSubmitBasicForm(email: string, password: string, checkMeOutChecked: boolean) {
        await this.fillEmailField(this.basicForm, email)
        await this.fillPasswordField(this.basicForm, password)
        await this.checkMeOutCheckbox(checkMeOutChecked)
        await this.clickSignInSubmitOrSend(this.basicForm)
    }

    /**
     * Fills the Recipients field on the Form without labels.
     * @param recipients value to enter
     */
    @step
    async fillRecipientField(recipients: string) {
        await this.withoutLabelsForm.getByPlaceholder('Recipients').fill(recipients)
    }

    /**
     * Fills the Subject field on the Form without labels.
     * @param subject value to enter
     */
    @step
    async fillSubjectField(subject: string) {
        await this.withoutLabelsForm.getByPlaceholder('Subject').fill(subject)
    }

    /**
     * Fills the message field in the without labels form
     * @param message
     */
    @step
    async fillMessageField(message: string) {
        await this.withoutLabelsForm.getByPlaceholder('Message').fill(message)
    }

    /**
     * Fills and submits the Form without labels.
     * @param recipients value for the recipients field
     * @param subject value for the subject field
     * @param message value for the message field
     */
    @step
    async fillAndSubmitWithoutLabelsForm(recipients: string, subject: string, message: string) {
        await this.fillRecipientField(recipients)
        await this.fillSubjectField(subject)
        await this.fillMessageField(message)
        await this.clickSignInSubmitOrSend(this.withoutLabelsForm)
    }

    /**
     * Fills the First Name field on the Block form.
     * @param firstName value to enter
     */
    @step
    async fillFirstNameField(firstName: string) {
        await this.blockForm.getByPlaceholder('First Name').fill(firstName)
    }

    /**
     * Fills the Last Name field on the Block form.
     * @param lastName value to enter
     */
    @step
    async fillLastNameField(lastName: string) {
        await this.blockForm.getByPlaceholder('Last Name').fill(lastName)
    }

    /**
     * Fills the Website field on the Block form.
     * @param website value to enter
     */
    @step
    async fillWebsiteField(website: string) {
        await this.blockForm.getByPlaceholder('Website').fill(website)
    }

    /**
     * Fills and submits the Block form.
     * @param firstName value for the first name field
     * @param lastName value for the last name field
     * @param email value for the email field
     * @param website value for the website field
     */
    @step
    async fillAndSubmitBlockForm(firstName: string, lastName: string, email: string, website: string) {
        await this.fillFirstNameField(firstName)
        await this.fillLastNameField(lastName)
        await this.fillEmailField(this.blockForm, email)
        await this.fillWebsiteField(website)
        await this.clickSignInSubmitOrSend(this.blockForm)
    }

    /**
     * Fills and submits the Horizontal form.
     * @param email value for the email field
     * @param password value for the password field
     * @param rememberMeChecked whether to check "Remember me"
     */
    @step
    async fillAndSubmitHorizontalForm(email: string, password: string, rememberMeChecked: boolean) {
        await this.fillEmailField(this.horizontalForm, email)
        await this.fillPasswordField(this.horizontalForm, password)
        await this.checkRememberMeCheckbox(this.horizontalForm, rememberMeChecked)
        await this.clickSignInSubmitOrSend(this.horizontalForm)
    }

}