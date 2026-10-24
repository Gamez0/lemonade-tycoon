const { test, expect } = require('../helpers/browser-game.cjs');
const { campaign } = require('../helpers/business.cjs');
const { encodeSave } = require('../../.test-build/simulation/save.js');

for (const phase of ['preparation', 'results']) test(`${phase}: daily and cumulative reports distinguish buyer taste from missed-customer satisfaction after restore`, async ({ page }) => {
    const business = campaign(2026, 2);
    if (phase === 'results') business.state = business.history.at(-1);
    await page.addInitScript(raw => {
        if (!localStorage.getItem('lemonade-tycoon.reboot.save')) localStorage.setItem('lemonade-tycoon.reboot.save', raw);
    }, encodeSave(business.state, business.history));
    await page.goto('/');
    if (phase === 'preparation') await page.locator('[data-page="results"]').click();
    // Both days had only happy buyers, but lost two and one customers to waiting.
    await expect(page.locator('#result-values dt').filter({ hasText: /^Buyer taste$/ })).toHaveCount(1);
    await expect(page.locator('#result-values dd').nth(8)).toHaveText('100%');
    await expect(page.locator('#report-response')).toContainText('Overall satisfaction: 96%.');
    await expect(page.locator('#report-response')).toContainText('1 left the line.');
    const cash = await page.locator('#cash').textContent();
    await page.locator('#report-day').selectOption('1');
    await expect(page.locator('#result-intro')).toContainText('Day 1');
    await expect(page.locator('#report-response')).toContainText('Overall satisfaction: 92%.');
    await expect(page.locator('#report-response')).toContainText('2 left the line.');
    if (phase === 'results') await expect(page.locator('#next')).toContainText('Prepare day 3');
    await page.locator('[data-report="ledger"]').click();
    await expect(page.locator('#result-values dd').nth(8)).toHaveText('100%');
    await expect(page.locator('#report-response')).toContainText('Overall satisfaction: 94%.');
    await expect(page.locator('#report-response')).toContainText('3 left the line.');
    await expect(page.locator('#report-day-picker')).toBeHidden();
    await page.locator('[data-report="daily"]').click();
    await expect(page.locator('#report-day')).toHaveValue('1');
    await expect(page.locator('#cash')).toHaveText(cash);
    await page.reload();
    if (phase === 'preparation') await page.locator('[data-page="results"]').click();
    await expect(page.locator('#report-response')).toContainText('Overall satisfaction: 96%.');
    if (phase === 'results') {
        await page.locator('#report-day').selectOption('1');
        await page.locator('#next').click();
        await expect(page.locator('#day')).toHaveText('03');
        await expect(page.locator('#preparation')).toBeVisible();
    }
});
