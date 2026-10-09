const { test, expect } = require('@playwright/test');
const { stock, campaign } = require('../helpers/business.cjs');
const { encodeSave } = require('../../.test-build/simulation/save.js');
const key = 'lemonade-tycoon.reboot.save';
const saved = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
async function ready(page) {
    const business = campaign(); business.state = stock(business.state);
    await page.addInitScript(({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
    }, { key, raw: encodeSave(business.state, business.history) });
    await page.goto('/'); await expect(page.locator('canvas')).toBeVisible();
    return business;
}
test('locked location costs are readable; browsing and cancelled reservations never charge or change scenery', async ({ page }) => {
    await page.goto('/'); await expect(page.locator('canvas')).toBeVisible();
    await page.locator('[data-page=rent]').click();
    await page.locator('button[data-location=park]').click();
    await expect(page.locator('#rent-details')).toContainText('$2.00 / $1.00');
    await expect(page.locator('#rent-unlock')).toContainText('3 completed days');
    await expect(page.locator('#confirm-rent')).toBeDisabled();
    await expect(page.locator('#location-name')).toHaveText('The Neighborhood');
    await expect(page.locator('#thumbnail-park')).toBeVisible();
    await expect(page.locator('#cash')).toHaveText('$40.00');
    await page.setViewportSize({ width: 375, height: 900 });
    for (const id of ['neighborhood', 'park', 'downtown']) {
        await page.locator(`button[data-location=${id}]`).click();
        await expect(page.locator('#rent-details')).toBeVisible();
        await expect(page.locator('#rent-unlock')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.screenshot({ path: 'test-results/m5-rent-narrow.png', fullPage: true });
});
test('reservation, charged opening replay, park results and free return reconcile the ledger', async ({ page }) => {
    const initial = await ready(page);
    await page.locator('[data-page=rent]').click();
    await page.locator('button[data-location=park]').click();
    await page.locator('#confirm-rent').click();
    const reserved = await saved(page);
    expect(reserved.state.pendingLocation).toBe('park');
    expect(reserved.state.cash).toBe(initial.state.cash);
    await expect(page.locator('#app')).toHaveAttribute('data-location', 'neighborhood');
    await page.locator('#cancel-rent').click();
    expect((await saved(page)).state.pendingLocation).toBe(null);
    await page.locator('#confirm-rent').click();
    await page.reload();
    await page.locator('[data-page=rent]').click();
    await expect(page.locator('#rent-reservation')).toContainText('Riverside Park');
    await page.locator('#open').click();
    await expect(page.locator('#app')).toHaveAttribute('data-location', 'park');
    const paid = await saved(page);
    expect(paid.state.phase).toBe('preparation');
    expect(paid.state.cash).toBe(initial.state.cash - 300);
    expect(paid.state.daily.rent).toBe(200); expect(paid.state.daily.moveFee).toBe(100);
    await page.reload();
    expect(await saved(page)).toEqual(paid);
    await page.locator('[data-page=rent]').click();
    await expect(page.locator('#confirm-rent')).toBeDisabled();
    await page.locator('#open').click();
    expect(await saved(page)).toEqual(paid);
    await page.locator('#skip').click();
    await expect(page.locator('#app')).toHaveAttribute('data-phase', 'results');
    const done = await saved(page);
    expect(done.state.cash).toBe(initial.state.cash - 300 + done.state.daily.revenue);
    await expect(page.locator('#result-values')).toContainText('Rent');
    await page.screenshot({ path: 'test-results/m5-park-results.png', fullPage: true });
    await page.locator('#next').click();
    await page.locator('[data-page=rent]').click();
    await page.locator('button[data-location=neighborhood]').click();
    await page.locator('#confirm-rent').click();
    await page.locator('[data-page=recipe]').click();
    await page.locator('#ice').fill('0'); await page.locator('#ice').press('Tab');
    await page.locator('#open').click();
    await expect(page.locator('#app')).toHaveAttribute('data-location', 'neighborhood');
    expect((await saved(page)).state.daily.rent).toBe(0);
    expect((await saved(page)).state.daily.moveFee).toBe(0);
    await page.locator('#skip').click();
    await page.locator('[data-report=ledger]').click();
    const ledger = await saved(page);
    const sum = field => ledger.history.reduce((total, day) => total + day.daily[field], 0);
    expect(ledger.state.cash).toBe(4000 + sum('revenue') - sum('purchases') - sum('rent') - sum('moveFee'));
});
test('pending supplies block contracts, unaffordable rent is atomic, and bankruptcy keeps export/reset cancellation', async ({ page }) => {
    const initial = await ready(page);
    await page.locator('[data-page=supplies]').click();
    await page.locator('[data-bundle="0"][data-delta="1"]').click();
    await page.locator('[data-page=rent]').click();
    await page.locator('button[data-location=downtown]').click();
    await page.locator('#confirm-rent').click();
    await expect(page.locator('#message')).toContainText('pending supply order');
    expect((await saved(page)).state.pendingLocation).toBe(null);
    const poor = { ...initial.state, cash: 799,
        daily: { ...initial.state.daily, purchases: initial.state.openingCash - 799 } };
    await page.locator('#save-file').setInputFiles({ name: 'test-business.json', mimeType: 'application/json',
        buffer: Buffer.from(encodeSave(poor, initial.history)) });
    await page.locator('[data-page=rent]').click();
    await page.locator('button[data-location=downtown]').click(); await page.locator('#confirm-rent').click();
    const before = await saved(page);
    await page.locator('#open').click(); await expect(page.locator('#message')).toContainText('Not enough cash for opening costs');
    expect(await saved(page)).toEqual(before);
    await page.locator('button[data-location=neighborhood]').click(); await page.locator('#confirm-rent').click();
    expect((await saved(page)).state.pendingLocation).toBe(null);
    const broke = { ...poor, cash: 0, stock: { lemon: 0, sugar: 0, ice: 0, cup: 0 },
        daily: { ...poor.daily, purchases: poor.openingCash } };
    await page.locator('#save-file').setInputFiles({ name: 'broke.json', mimeType: 'application/json',
        buffer: Buffer.from(encodeSave(broke, initial.history)) });
    await expect(page.locator('#business-warning')).toContainText('cheapest pitcher');
    await expect(page.locator('#export-save')).toBeEnabled();
    await page.locator('#restart').click(); await page.locator('#restart').press('Escape');
    await page.reload(); expect((await saved(page)).state.cash).toBe(0);
});
