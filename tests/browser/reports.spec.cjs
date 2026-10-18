const { test, expect } = require('@playwright/test');
const { campaign } = require('../helpers/business.cjs');
const { encodeSave } = require('../../.test-build/simulation/save.js');

test('daily and cumulative reports distinguish buyer taste from missed-customer satisfaction after restore', async ({ page }) => {
    const business = campaign(2026, 2);
    await page.addInitScript(raw => {
        if (!localStorage.getItem('lemonade-tycoon.reboot.save')) localStorage.setItem('lemonade-tycoon.reboot.save', raw);
    }, encodeSave(business.state, business.history));
    await page.goto('/');
    await page.locator('[data-page="results"]').click();
    // Both days had only happy buyers, but lost two and one customers to waiting.
    await expect(page.locator('#result-values dt').filter({ hasText: /^Buyer taste$/ })).toHaveCount(1);
    await expect(page.locator('#result-values dd').nth(8)).toHaveText('100%');
    await expect(page.locator('#report-response')).toContainText('Overall satisfaction: 96%.');
    await expect(page.locator('#report-response')).toContainText('1 left the line.');
    await page.locator('[data-report="ledger"]').click();
    await expect(page.locator('#result-values dd').nth(8)).toHaveText('100%');
    await expect(page.locator('#report-response')).toContainText('Overall satisfaction: 94%.');
    await expect(page.locator('#report-response')).toContainText('3 left the line.');
    await page.reload();
    await page.locator('[data-page="results"]').click();
    await expect(page.locator('#report-response')).toContainText('Overall satisfaction: 96%.');
});
