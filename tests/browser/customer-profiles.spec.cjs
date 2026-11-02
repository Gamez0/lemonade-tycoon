const { test, expect } = require('../helpers/browser-game.cjs');
const game = require('../../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../../.test-build/simulation/street-day.js');
const { encodeSave, SAVE_KEY } = require('../../.test-build/simulation/save.js');
const { fundedStandBusiness } = require('../helpers/stand-business.cjs');
const { stock } = require('../helpers/business.cjs');
const { LOCATION_CUSTOMER_WEIGHTS } = require('../../.test-build/content/customer-profiles.js');

test('new eleven-group beach day renders high profile indices, replays its paid snapshot and keeps the exact ledger', async ({ page }) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const fixture = fundedStandBusiness('beach');
    const prepared = stock(game.withCustomerProfiles(game.withWeatherForecast(fixture.state)), 125);
    const expected = finishStreetDay(beginStreetDay(game.openDay(prepared))).day.game;
    await page.clock.install();
    await page.addInitScript(({ key, raw }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, raw); },
        { key: SAVE_KEY, raw: encodeSave(prepared, fixture.history) });
    await page.goto('/'); await page.clock.runFor(500);
    await page.locator('[data-page=rent]').click();
    await expect(page.locator('#rent-details')).toContainText('11 visitor groups');
    await page.locator('#open').click(); await page.clock.runFor(5000);
    await expect(page.locator('#selling')).toBeVisible();
    const paid = JSON.parse(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY));
    expect(paid.state.business.customerModel).toBe('eleven-profiles-v1');
    expect(paid.state.business.weights).toEqual(LOCATION_CUSTOMER_WEIGHTS.beach);
    await page.screenshot({ path: 'test-results/eleven-profile-beach.png' });
    await page.reload(); await page.clock.runFor(500); await page.locator('#open').click();
    await page.locator('#speed').click(); await page.locator('#skip').click(); await page.clock.runFor(500);
    const saved = JSON.parse(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY));
    expect(saved.history.at(-1)).toEqual(expected);
    expect(saved.state).toEqual(game.nextDay(expected));
    expect(errors).toEqual([]);
});

test('paid Rent preview uses frozen weights and queue duration instead of today catalog defaults', async ({ page }) => {
    const opened = game.openDay(stock(game.withCustomerProfiles(game.newGame(1))));
    const checkpoint = { ...opened, phase: 'preparation', business: { ...opened.business,
        weights: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], patienceTicks: 40 } };
    await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw),
        { key: SAVE_KEY, raw: encodeSave(checkpoint, []) });
    await page.goto('/'); await page.locator('[data-page=rent]').click();
    await expect(page.locator('#rent-details')).toContainText('100% · short waits');
    await expect(page.locator('#rent-details')).toContainText('2.0–2.0s');
});

test('an actual v11 paid period day keeps its three-group result and adopts eleven groups only tomorrow', async ({ page }) => {
    const fixture = require('../fixtures/intraday-weather-v11.json').cases[0];
    await page.clock.install();
    await page.addInitScript(({ key, raw }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, raw); },
        { key: SAVE_KEY, raw: JSON.stringify(fixture.document) });
    await page.goto('/'); await page.clock.runFor(500);
    await page.locator('#open').click(); await page.locator('#skip').click(); await page.clock.runFor(500);
    const saved = JSON.parse(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY));
    expect(saved.history[0]).toEqual(fixture.expected);
    expect(saved.history[0].business.weights).toHaveLength(3);
    expect(saved.state.customerProfileModel).toBe('eleven-profiles-v1');
    // The old paid day's remaining ice melted at the genuine overnight boundary.
    await page.locator('[data-page=supplies]').click();
    await page.locator('[data-supply=ice]').click();
    await page.locator('[data-bundle="0"][data-delta="1"]').click();
    await page.locator('#buy-order').click();
    await page.locator('#open').click();
    const next = JSON.parse(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY));
    expect(next.state.business.weights).toHaveLength(11);
});
