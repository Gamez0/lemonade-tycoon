const { test, expect } = require('../helpers/browser-game.cjs');
const { fundedStandBusiness } = require('../helpers/stand-business.cjs');
const { purchaseUpgrade } = require('../../.test-build/simulation/game.js');
const { encodeSave } = require('../../.test-build/simulation/save.js');
for (const location of require('../../.test-build/content/locations.js').LOCATION_IDS) test(`${location}: painted background keeps upgraded stand and moving customers separate`, async ({ page }) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const business = fundedStandBusiness(location);
    // Crowded art/motion fixture; sparse rain days have dedicated coverage.
    business.state = { ...business.state, weather: require('../../.test-build/content/catalog.js').WEATHER[0] };
    for (let tier = 0; tier < 3; tier++) business.state = purchaseUpgrade(business.state, 'stand');
    await page.clock.install();
    await page.addInitScript(raw => localStorage.setItem('lemonade-tycoon.reboot.save', raw), encodeSave(business.state, business.history));
    await page.goto('/'); await page.clock.runFor(500);
    const canvas = page.locator('canvas');
    await expect(canvas).toHaveAttribute('width', '1280');
    await expect(canvas).toHaveAttribute('height', '1024');
    await expect(canvas).toHaveAttribute('data-stand-texture', 'stand-3');
    await page.locator('[data-page=rent]').click();
    const thumbnail = await page.locator(`#thumbnail-${location}`).getAttribute('src');
    expect(thumbnail).toMatch(/^data:image\/png/);
    expect(Number(await canvas.getAttribute('data-map-texture-width'))).toBeGreaterThanOrEqual(1000);
    await page.locator('#open').click();
    for (let frame = 0; frame < 8; frame++) {
        await page.clock.runFor(1200);
        await canvas.screenshot({ path: `test-results/map-${location}-walk-${frame}.png` });
    }
    await expect(canvas).toHaveAttribute('data-stand-texture', 'stand-3');
    expect(Number(await page.locator('#sold').innerText())).toBeGreaterThan(0);
    expect(errors).toEqual([]);
});
