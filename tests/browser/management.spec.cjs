const { test, expect } = require('@playwright/test');
const { campaign } = require('../helpers/business.cjs');
const { encodeSave } = require('../../.test-build/simulation/save.js');
const { newGame, purchaseUpgrade, setPlan, buy } = require('../../.test-build/simulation/game.js');

test('opening prepares a pitcher and its last sale immediately prepares the next recipe batch', async ({ page }) => {
    let state = setPlan(newGame(), { price: 25, recipe: { lemon: 2, sugar: 1, ice: 0 } });
    for (const [item, quantity] of [['lemon', 6], ['sugar', 3], ['cup', 25]]) state = buy(state, item, quantity);
    await page.clock.install();
    await page.addInitScript(raw => {
        if (!localStorage.getItem('lemonade-tycoon.reboot.save')) localStorage.setItem('lemonade-tycoon.reboot.save', raw);
    }, encodeSave(state, []));
    await page.goto('/');
    await page.clock.runFor(500);
    await page.locator('#open').click();
    await expect(page.locator('#pitcher-cups')).toHaveText('10 cups');
    await expect(page.locator('#setting-pitchers')).toHaveText('1');
    await expect(page.locator('#inventory-lemon')).toHaveText('4');
    for (let tick = 0; tick < 400; tick++) {
        if (await page.locator('#sold').innerText() === '10') break;
        await page.clock.runFor(200);
    }
    await expect(page.locator('#sold')).toHaveText('10');
    await expect(page.locator('#pitcher-cups')).toHaveText('10 cups');
    await expect(page.locator('#setting-pitchers')).toHaveText('2');
    await expect(page.locator('#inventory-lemon')).toHaveText('2');
    await expect(page.locator('#inventory-sugar')).toHaveText('1');
    await page.reload(); await page.clock.runFor(500);
    await expect(page.locator('#lemon')).toBeDisabled();
    await page.locator('#open').click();
    await expect(page.locator('#setting-pitchers')).toHaveText('1');
    await expect(page.locator('#pitcher-cups')).toHaveText('10 cups');
    await expect(page.locator('#inventory-lemon')).toHaveText('4');
});

test('low-cash ice-maker owner sees affordable opening costs and can resume selling', async ({ page }) => {
    let state = purchaseUpgrade(newGame(), 'iceMaker');
    state = setPlan(state, { price: 175, recipe: { lemon: 1, sugar: 1, ice: 1 } });
    state = buy(buy(buy(state, 'lemon', 344), 'sugar', 1), 'cup', 7);
    const raw = encodeSave(state, []);
    await page.addInitScript(raw => {
        if (!localStorage.getItem('lemonade-tycoon.reboot.save')) localStorage.setItem('lemonade-tycoon.reboot.save', raw);
    }, raw);
    await page.goto('/');
    await expect(page.locator('#capacity')).toHaveText('7 cups');
    await expect(page.locator('#supply-warning')).toBeHidden();
    await expect(page.locator('#management-bill')).toContainText('Opening bill $0.00');
    await page.locator('[data-page=upgrades]').click();
    await expect(page.locator('#upgrade-effect-iceMaker')).toContainText('free ice');
    await page.locator('#open').click();
    await expect(page.locator('#selling')).toBeVisible();
    await page.reload();
    await page.locator('#open').click();
    await expect(page.locator('#selling')).toBeVisible();
    await page.locator('#skip').click();
    await expect(page.locator('#results')).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lemonade-tycoon.reboot.save')));
    expect(saved.state.daily.purchases).toBe(state.daily.purchases);
    expect(saved.state.cash).toBe(state.cash + saved.state.daily.revenue);
    expect(saved.state.daily.freeIceUsed).toBeGreaterThan(0);
});

test('four-ice recipe explains 60 versus 64 shortage and recovers after an actual purchase', async ({ page }) => {
    let state = setPlan(newGame(), { price: 150, recipe: { lemon: 6, sugar: 3, ice: 4 } });
    for (const [item, quantity] of [['lemon', 80], ['sugar', 40], ['ice', 60], ['cup', 40]]) state = buy(state, item, quantity);
    await page.addInitScript(raw => {
        if (!localStorage.getItem('lemonade-tycoon.reboot.save')) localStorage.setItem('lemonade-tycoon.reboot.save', raw);
    }, encodeSave(state, []));
    await page.goto('/');
    await expect(page.locator('#capacity')).toHaveText('0 cups');
    await expect(page.locator('#pitcher-yield')).toContainText('64 ice needed per pitcher');
    await expect(page.locator('#supply-warning')).toHaveText('Need 4 ice cubes to open. Buy supplies or adjust your recipe.');
    await expect(page.locator('#world-status')).toHaveText('Supplies needed');
    await page.locator('#app').screenshot({ path: 'test-results/four-ice-shortage.png' });
    await page.setViewportSize({ width: 800, height: 600 });
    await expect(page.locator('#supply-warning')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.locator('#open').click();
    await expect(page.locator('#selling')).toBeHidden();
    await page.locator('#ice').fill('3');
    await page.locator('#ice').press('Tab');
    await expect(page.locator('#capacity')).toHaveText('14 cups');
    await expect(page.locator('#supply-warning')).toBeHidden();
    await page.locator('#ice').fill('4');
    await page.locator('#ice').press('Tab');
    await page.locator('[data-page=supplies]').click();
    await expect(page.locator('#supply-warning')).toContainText('Need 4 ice cubes');
    await page.locator('[data-supply=ice]').click();
    await page.locator('[data-bundle="0"][data-delta="1"]').click();
    await page.locator('#buy-order').click();
    await expect(page.locator('#capacity')).toHaveText('16 cups');
    await expect(page.locator('#supply-warning')).toBeHidden();
    await expect(page.locator('#world-status')).toHaveText('Ready to open');
    await page.locator('#open').click();
    await expect(page.locator('#selling')).toBeVisible();
});
test('seven screens purchase, hire, advertise, restore and account for a paid replay', async ({ page }) => {
    const earned = campaign();
    const raw = encodeSave(earned.state, earned.history);
    await page.addInitScript(raw => {
        if (!localStorage.getItem('lemonade-tycoon.reboot.save')) localStorage.setItem('lemonade-tycoon.reboot.save', raw);
    }, raw);
    await page.goto('/');
    await expect(page.locator('[data-page]')).toHaveCount(7);
    await page.locator('[data-page=upgrades]').click();
    await page.locator('[data-upgrade=blender]').click();
    await expect(page.locator('#upgrade-effect-blender')).toContainText('Level 1/2');
    await page.locator('[data-page=staff]').click();
    await page.locator('[data-staff=server]').click();
    await page.locator('[data-page=marketing]').click();
    await page.locator('[data-advertising=flyers]').click();
    await page.locator('#price').fill('1.75'); await page.locator('#price').press('Tab');
    await page.reload();
    await page.locator('[data-page=staff]').click();
    await expect(page.locator('[data-staff=server]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-page=supplies]').click();
    for (const key of ['lemon', 'sugar', 'ice', 'cup']) {
        await page.locator(`[data-supply=${key}]`).click();
        await page.locator('[data-bundle="1"][data-delta="1"]').click();
    }
    await page.locator('#buy-order').click();
    await page.locator('#open').click();
    await expect(page.locator('#selling')).toBeVisible();
    await page.reload();
    await page.locator('[data-page=staff]').click();
    await expect(page.locator('[data-staff=none]')).toBeDisabled();
    await page.locator('#open').click(); await page.locator('#skip').click();
    await expect(page.locator('#results')).toBeVisible();
    await expect(page.locator('#result-values')).toContainText('$2.50 / $1.80');
    await expect(page.locator('#result-values')).toContainText('$14.00');
});
test('help keyboard, mute and independent volumes survive reload under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('#help-open').focus(); await page.keyboard.press('Enter');
    await expect(page.locator('#help-dialog')).toBeVisible();
    await page.locator('#mute-audio').check();
    await page.locator('#music-volume').fill('0');
    await page.locator('#effects-volume').fill('20');
    await page.keyboard.press('Escape');
    await expect(page.locator('#help-dialog')).toBeHidden();
    await page.reload(); await page.locator('#help-open').click();
    await expect(page.locator('#mute-audio')).toBeChecked();
    await expect(page.locator('#music-volume')).toHaveValue('0');
    await expect(page.locator('#effects-volume')).toHaveValue('20');
});
