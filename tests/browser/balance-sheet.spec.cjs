const { test, expect } = require('../helpers/browser-game.cjs');
const { stock } = require('../helpers/business.cjs');
const { newGame, openDay, nextDay, purchaseUpgrade, setPlan } = require('../../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../../.test-build/simulation/street-day.js');
const { encodeSave } = require('../../.test-build/simulation/save.js');

test('a new business can read its balance sheet before completing a day', async ({ page }) => {
    await page.goto('/'); await page.locator('[data-page="results"]').click();
    await page.locator('[data-report="balance"]').click();
    await expect(page.locator('#result-values dd')).toHaveText(['$40.00', '$0.00', '$0.00', '$40.00', '$40.00', '$0.00', '$40.00']);
    await page.locator('[data-report="daily"]').click();
    await expect(page.locator('#result-intro')).toContainText('No completed days');
});

for (const [name, refrigerator, maker, values] of [
    ['paid ice without refrigeration', false, false, ['$66.80', '$6.16', '$0.00', '$72.96', '$40.00', '$32.96', '$72.96']],
    ['half the paid ice retained', true, false, ['$57.80', '$8.40', '$9.00', '$75.20', '$40.00', '$35.20', '$75.20']],
    ['free ice excluded from inventory value', true, true, ['$45.80', '$8.76', '$21.00', '$75.56', '$40.00', '$35.56', '$75.56']],
]) test(`balance sheet: ${name} after an actual overnight transition`, async ({ page }) => {
    let state = newGame();
    if (refrigerator) state = purchaseUpgrade(state, 'refrigerator');
    if (maker) state = purchaseUpgrade(state, 'iceMaker');
    state = stock(state);
    if (maker) state = setPlan(state, { ...state.plan, recipe: { ...state.plan.recipe, ice: 0 } });
    const done = finishStreetDay(beginStreetDay(openDay(state))).day.game;
    await page.addInitScript(raw => localStorage.setItem('lemonade-tycoon.reboot.save', raw), encodeSave(nextDay(done), [done]));
    await page.goto('/'); await page.locator('[data-page="results"]').click();
    const cash = await page.locator('#cash').textContent();
    await page.locator('[data-report="balance"]').click();
    await expect(page.locator('#result-intro')).toContainText('Current balance sheet: day 2');
    await expect(page.locator('#result-values dd')).toHaveText(values);
    await expect(page.locator('#report-day-picker')).toBeHidden();
    await page.setViewportSize({ width: 375, height: 667 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('[data-report="ledger"]').click();
    await expect(page.locator('#result-values dd').nth(3)).toHaveText(maker ? '$38.76' : '$37.44');
    await expect(page.locator('#cash')).toHaveText(cash);
});
