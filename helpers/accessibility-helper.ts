import { Page, expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

interface AxeViolation {
    id: string;
    impact: 'minor' | 'moderate' | 'serious' | 'critical' | null;
    description: string;
    nodes: { target: string[] }[];
}

// axe finds real issues at every impact level, and this app has plenty. Blocking CI on
// all of them right away isn't realistic — fail only on critical/serious (the ones that
// actually block a user), and still surface moderate/minor via an Allure/HTML attachment
// so they stay visible and trackable without blocking every PR.
const BLOCKING_IMPACTS: Array<AxeViolation['impact']> = ['critical', 'serious'];

// Header/sidebar/footer are shared app chrome, identical on every page — excluding them from
// per-page checks avoids re-reporting the same violation on every single test. Covered once by
// a dedicated app-shell a11y test instead.
export const APP_CHROME_SELECTORS = ['nb-layout-header', 'nb-sidebar', 'nb-layout-footer'];

// Rules that check something document-wide (not scoped to any element) rather than page content,
// so they fire identically on every route. Same reasoning as APP_CHROME_SELECTORS — disable them
// on per-page checks and let the dedicated app-shell test be the one place that tracks them.
export const APP_WIDE_RULES = ['html-has-lang'];

export async function checkAccessibility(page: Page, options?: { exclude?: string[]; disableRules?: string[] }) {
    const builder = new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa']); // фокус на A/AA — реалістичний baseline

    options?.exclude?.forEach(selector => builder.exclude(selector));
    if (options?.disableRules?.length) {
        builder.disableRules(options.disableRules);
    }

    const results = await builder.analyze();
    const violations = results.violations as AxeViolation[];

    if (violations.length > 0) {
        // test.info().attach() shows up in both the Playwright HTML report and the Allure
        // report (allure-playwright picks up Playwright's own attachments) — no extra
        // Allure-specific dependency needed.
        await test.info().attach('a11y-violations.json', {
            body: JSON.stringify(violations, null, 2),
            contentType: 'application/json',
        });
    }

    const blocking = violations.filter(v => BLOCKING_IMPACTS.includes(v.impact));
    expect(blocking, formatViolations(blocking)).toEqual([]);
}

function formatViolations(violations: AxeViolation[]): string {
    return violations.map(v => `[${v.impact}] ${v.id}: ${v.description}\n  → ${v.nodes.map(n => n.target).join(', ')}`).join('\n\n');
}
