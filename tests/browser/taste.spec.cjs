const { test, expect } = require('../helpers/browser-game.cjs');
const { newGame, setPlan, buyOrder } = require('../../.test-build/simulation/game.js');
const { encodeSave } = require('../../.test-build/simulation/save.js');
const { WEATHER } = require('../../.test-build/content/catalog.js');

for (const [name, weather, ice, reaction, advice] of [
    ['hot day with too little ice', WEATHER[0], 0, 'Too warm!', 'Not enough ice'],
    ['cold day with diluted lemonade', WEATHER[2], 7, 'Too watery!', 'Too watery'],
]) test(name + ' reports buyer taste during sales and after reload, without applying it to other days', async ({ page }) => {
    const state = buyOrder(setPlan({ ...newGame(), weather }, { price: 25, recipe: { lemon: 6, sugar: 3, ice } }),
        { lemon: 40, sugar: 20, ice: 500, cup: 40 });
    await page.clock.install();
    await page.addInitScript(raw => {
        if (!localStorage.getItem('lemonade-tycoon.reboot.save')) localStorage.setItem('lemonade-tycoon.reboot.save', raw);
    }, encodeSave(state, []));
    await page.goto('/'); await page.clock.runFor(500);
    await page.locator('#open').click();
    let tasted = false;
    for (let i = 0; i < 120; i++) {
        await page.clock.runFor(100);
        if ((await page.locator('#feedback').textContent()).includes(reaction)) { tasted = true; break; }
    }
    expect(tasted).toBe(true);
    expect(Number(await page.locator('#sold').textContent())).toBeGreaterThan(0);
    await page.locator('#app').screenshot({ path: 'test-results/taste-' + ice + '-selling.png' });
    await page.locator('#skip').click(); await page.clock.runFor(500);
    await expect(page.locator('#report-response')).toContainText(advice);
    await page.locator('#app').screenshot({ path: 'test-results/taste-' + ice + '-results.png' });
    await page.reload(); await page.clock.runFor(500);
    await page.locator('[data-page=results]').click();
    await expect(page.locator('#report-response')).toContainText(advice);
    await page.locator('[data-report="ledger"]').click();
    await expect(page.locator('#report-response')).not.toContainText(advice);
    await page.locator('[data-page=recipe]').click();
    await page.locator('[data-page="recipe"]').click();
    await expect(page.locator('#lemon')).toHaveValue('6');
    await expect(page.locator('#sugar')).toHaveValue('3');
});
