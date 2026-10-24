const { test, expect } = require('../helpers/browser-game.cjs');
const { campaign } = require('../helpers/business.cjs');
const { encodeSave } = require('../../.test-build/simulation/save.js');

for (const [completed, year, month] of [[30, 1, 2], [360, 2, 1]]) {
    test(`career date restores after ${completed} days and retains cumulative report days`, async ({ page }) => {
        const business = campaign(2026, completed);
        await page.addInitScript(raw => {
            if (!localStorage.getItem('lemonade-tycoon.reboot.save')) localStorage.setItem('lemonade-tycoon.reboot.save', raw);
        }, encodeSave(business.state, business.history));
        await page.goto('/');
        await expect(page.locator('#year')).toHaveText(String(year));
        await expect(page.locator('#month')).toHaveText(String(month));
        await expect(page.locator('#day')).toHaveText('01');
        await expect(page.locator('#career-date')).toHaveAttribute('title', `Business day ${completed + 1}`);
        await page.locator('[data-page="results"]').click();
        await expect(page.locator('#report-day')).toHaveValue(String(completed));
        await page.locator('#report-day').selectOption('1');
        await expect(page.locator('#year')).toHaveText(String(year));
        await page.reload();
        await expect(page.locator('#month')).toHaveText(String(month));
        await page.setViewportSize({ width: 375, height: 667 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: `test-results/calendar-${completed}.png` });
    });
}
