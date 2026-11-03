const { test, expect } = require('../helpers/browser-game.cjs');
const { withInventoryCosts } = require('../../.test-build/simulation/inventory-costs.js');
const game = require('../../.test-build/simulation/game.js');
const { encodeSave, SAVE_KEY } = require('../../.test-build/simulation/save.js');
const { beginStreetDay, finishStreetDay } = require('../../.test-build/simulation/street-day.js');
const { stock } = require('../helpers/business.cjs');

test('actual weather changes with generated arrivals and paid reload plus SKIP retains the same day', async ({ page }) => {
    const prepared = withInventoryCosts(stock(game.withWeatherForecast(game.newGame(1))));
    const opened = game.openDay(prepared);
    const expected = finishStreetDay(beginStreetDay(opened)).day.game;
    await page.clock.install();
    await page.addInitScript(({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
    }, { key: SAVE_KEY, raw: encodeSave(prepared, []) });
    await page.goto('/'); await page.clock.runFor(500);
    await expect(page.locator('#weather-advice')).toContainText('1: Sunny');
    await expect(page.locator('#weather-advice')).toContainText('2: Cloudy');
    await page.locator('#open').click(); await page.clock.runFor(300);
    await expect(page.locator('#weather')).toHaveText('29°C');
    await expect(page.locator('#app')).toHaveAttribute('data-weather', 'sunny');
    const checkpoint = await page.evaluate(key => localStorage.getItem(key), SAVE_KEY);
    await page.reload(); await page.clock.runFor(500);
    expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(checkpoint);
    await page.locator('#open').click();
    await page.clock.runFor(8200);
    await expect(page.locator('#weather-advice')).toContainText('Period 2 / 3');
    await expect(page.locator('#weather')).toHaveText('25°C');
    await expect(page.locator('#app')).toHaveAttribute('data-weather', 'cloudy');
    await page.screenshot({ path: 'test-results/weather-period-2.png' });
    await page.clock.runFor(6500);
    await expect(page.locator('#weather-advice')).toContainText('Period 3 / 3');
    await expect(page.locator('#weather')).toHaveText('15°C');
    await expect(page.locator('#app')).toHaveAttribute('data-weather', 'rainy');
    await page.screenshot({ path: 'test-results/weather-period-3.png' });
    await page.locator('#skip').click(); await page.clock.runFor(500);
    const saved = JSON.parse(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY));
    expect(saved.version).toBe(14);
    expect(saved.history[0]).toEqual(expected);
    await page.reload(); await page.clock.runFor(500);
    expect(JSON.parse(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY))).toEqual(saved);
});

for (const fast of [false, true]) test(`${fast ? 'fast' : 'normal'} periods finish the same ledger as SKIP`, async ({ page }) => {
    const prepared = withInventoryCosts(stock(game.withWeatherForecast(game.newGame(1))));
    const expected = finishStreetDay(beginStreetDay(game.openDay(prepared))).day.game;
    await page.clock.install();
    await page.addInitScript(({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
    }, { key: SAVE_KEY, raw: encodeSave(prepared, []) });
    await page.goto('/'); await page.clock.runFor(500);
    await page.locator('#open').click();
    if (fast) await page.locator('#speed').click();
    await page.clock.runFor(40000);
    const saved = JSON.parse(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY));
    expect(saved.history).toEqual([expected]);
    expect(saved.state).toEqual(game.withCustomerProfiles(game.nextDay(expected)));
});
