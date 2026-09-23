import { test } from '../../fixtures/fixture'
import { checkAccessibility, APP_CHROME_SELECTORS, APP_WIDE_RULES } from '../../helpers/accessibility-helper'

// Every category link in the left menu, grouped by the top-level item that expands it.
// IoT Dashboard is handled separately below since it's a direct link with no submenu.
const menuPages: { menuItem: string; category: string }[] = [
  { menuItem: 'Forms', category: 'Form Layouts' },
  { menuItem: 'Forms', category: 'Datepicker' },
  { menuItem: 'Modal & Overlays', category: 'Dialog' },
  { menuItem: 'Modal & Overlays', category: 'Window' },
  { menuItem: 'Modal & Overlays', category: 'Popover' },
  { menuItem: 'Modal & Overlays', category: 'Toastr' },
  { menuItem: 'Modal & Overlays', category: 'Tooltip' },
  { menuItem: 'Extra Components', category: 'Calendar' },
  { menuItem: 'Extra Components', category: 'Drag & Drop' },
  { menuItem: 'Extra Components', category: 'PDF Download' },
  { menuItem: 'Charts', category: 'Echarts' },
  { menuItem: 'Tables & Data', category: 'Smart Table' },
  { menuItem: 'Tables & Data', category: 'Tree Grid' },
  { menuItem: 'Auth', category: 'Login' },
  { menuItem: 'Auth', category: 'Register' },
  { menuItem: 'Auth', category: 'Request Password' },
  { menuItem: 'Auth', category: 'Reset Password' },
]

test('App shell (header, sidebar, footer, document) is accessible', async ({ pom, page }) => {
  // No exclude/disableRules here — this is the one place header/sidebar/footer content and
  // document-wide rules like html-has-lang get tracked, since every other a11y test skips them.
  await checkAccessibility(page)
})

test('IoT Dashboard page is accessible', async ({ pom, page }) => {
  await pom.navigateTo.selectTopLevelPage('IoT Dashboard')
  await checkAccessibility(page, { exclude: APP_CHROME_SELECTORS, disableRules: APP_WIDE_RULES })
})

for (const { menuItem, category } of menuPages) {
  test(`${category} page is accessible`, async ({ pom, page }) => {
    await pom.navigateTo.expandMenuItemAndSelectCategory(menuItem, category)
    await checkAccessibility(page, { exclude: APP_CHROME_SELECTORS, disableRules: APP_WIDE_RULES })
  })
}

test('Dialog is accessible when open', async ({ pom, page }) => {
  await pom.navigateTo.expandMenuItemAndSelectCategory('Modal & Overlays', 'Dialog')
  await pom.dialogPage.openDialogWithComponent()
  await checkAccessibility(page, { exclude: APP_CHROME_SELECTORS, disableRules: APP_WIDE_RULES })
})
