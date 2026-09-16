import { faker } from '@faker-js/faker';

const DEFAULT_FROM = new Date('2016-01-01');
const DEFAULT_TO = new Date('2099-12-31');

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Generates a random date string in the "MMM D, YYYY" format used by the app's datepickers,
 * e.g. "Oct 30, 2046".
 */
export function getRandomDate(from: Date = DEFAULT_FROM, to: Date = DEFAULT_TO): string {
    return formatDate(faker.date.between({ from, to }));
}

/**
 * Generates a random "<start> - <end>" date range string for the range datepicker,
 * e.g. "Sep 1, 2026 - Jun 22, 2031". The start date always precedes the end date.
 */
export function getRandomDateRange(from: Date = DEFAULT_FROM, to: Date = DEFAULT_TO): string {
    const dateA = faker.date.between({ from, to });
    const dateB = faker.date.between({ from, to });
    const [startDate, endDate] = dateA < dateB ? [dateA, dateB] : [dateB, dateA];
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Generates a random date string within `rangeDays` of today (inclusive), for datepickers
 * whose enabled min/max window is relative to the current date.
 */
export function getRandomDateNearToday(rangeDays: number = 5): string {
    const offset = faker.number.int({ min: -rangeDays, max: rangeDays });
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return formatDate(date);
}
