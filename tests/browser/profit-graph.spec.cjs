const { test, expect } = require('../helpers/browser-game.cjs');
const { stock, campaign } = require('../helpers/business.cjs');
const { newGame, openDay, nextDay, hireStaff, selectAdvertising } = require('../../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../../.test-build/simulation/street-day.js');
const { encodeSave } = require('../../.test-build/simulation/save.js');
const finish = state => finishStreetDay(beginStreetDay(openDay(state))).day.game;
async function restore(page, state, history) {
    await page.addInitScript(raw => {
        if (!localStorage.getItem('lemonade-tycoon.reboot.save')) localStorage.setItem('lemonade-tycoon.reboot.save', raw);
    }, encodeSave(state, history));
    await page.goto('/'); await page.locator('[data-page="results"]').click();
    await page.locator('[data-report="graph"]').click();
}

test('profit graph plots actual loss and profit on opposite sides of zero without changing cash', async ({ page }) => {
    const first = finish(selectAdvertising(hireStaff(stock(newGame(), 25), 'server'), 'radio'));
    const second = finish(selectAdvertising(hireStaff(stock(nextDay(first)), 'none'), 'none'));
    await restore(page, nextDay(second), [first, second]);
    const cash = await page.locator('#cash').textContent();
    await expect(page.locator('#profit-graph svg')).toBeVisible();
    await expect(page.locator('#profit-graph [data-report-day="1"]')).toHaveAttribute('data-profit', '-484');
    await expect(page.locator('#profit-graph [data-report-day="1"]')).toHaveAttribute('y', '115');
    const positive = page.locator('#profit-graph [data-report-day="2"]');
    expect(Number(await positive.getAttribute('data-profit'))).toBeGreaterThan(0);
    expect(Number(await positive.getAttribute('y'))).toBeLessThan(115);
    await expect(page.locator('#report-day-picker')).toBeHidden();
    await expect(page.locator('#profit-graph-description')).toContainText('bars below zero are losses');
    await page.setViewportSize({ width: 375, height: 667 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('[data-report="daily"]').click();
    await expect(page.locator('#result-intro')).toContainText('Day 2');
    await expect(page.locator('#profit-graph')).toBeHidden();
    await expect(page.locator('#cash')).toHaveText(cash);
});

test('profit graph limits a long business to the latest thirty completed days', async ({ page }) => {
    const business = campaign(2026, 31);
    await restore(page, business.state, business.history);
    await expect(page.locator('#profit-graph [data-report-day]')).toHaveCount(30);
    await expect(page.locator('#profit-graph-title')).toHaveText('Daily profit, days 2 to 31');
    await expect(page.locator('#profit-graph [data-report-day="1"]')).toHaveCount(0);
});
