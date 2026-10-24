const { test, expect } = require('../helpers/browser-game.cjs');
const crypto = require('node:crypto');
const { encodeSave } = require('../../.test-build/simulation/save.js');
const { fundedStandBusiness: funded } = require('../helpers/stand-business.cjs');
const key = 'lemonade-tycoon.reboot.save';
for (const location of require('../../.test-build/content/locations.js').LOCATION_IDS) test(`${location}: all stand tiers change only the separate stand, persist and keep the same map`, async ({ page }) => {
    const business = funded(location), raw = encodeSave(business.state, business.history);
    await page.addInitScript(({ key, raw }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, raw); }, { key, raw });
    await page.goto('/'); const canvas = page.locator('canvas');
    await expect(canvas).toHaveAttribute('data-stand-texture', 'stand-0');
    await page.locator('[data-page=rent]').click();
    const background = await page.locator(`#thumbnail-${location}`).getAttribute('src');
    expect(background).toMatch(/^data:image\/png/);
    const frames = new Set();
    const catalogueFrames = new Set();
    for (let level = 0; level <= 3; level++) {
        await page.locator('[data-page=upgrades]').click();
        if (level) {
            const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).state.cash, key);
            await page.locator('[data-upgrade=stand]').click();
            expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).state.cash, key))
                .toBe(before - [44999, 99999, 999999][level - 1]);
        }
        await expect(canvas).toHaveAttribute('data-stand-texture', `stand-${level}`);
        const picture = page.locator('#upgrade-art-stand');
        await expect(picture).toHaveAttribute('data-level', String(level));
        const illustration = picture.locator('svg');
        await expect(illustration.locator('image')).toHaveAttribute('href',
            new RegExp(`stand-${['basic', 'classic', 'lemon', 'castle'][level]}-v2`));
        await illustration.locator('image').evaluate(async image => {
            const native = new Image(); native.src = image.href.baseVal; await native.decode();
            if (native.naturalWidth !== 1402 || native.naturalHeight !== 1122)
                throw Error('Catalogue must retain the native stand source');
        });
        await picture.scrollIntoViewIfNeeded();
        const illustrationFrame = await illustration.screenshot({ path: `test-results/stand-catalogue-${location}-${level}.png` });
        catalogueFrames.add(crypto.createHash('sha256').update(illustrationFrame).digest('hex'));
        const frame = await canvas.screenshot({ path: `test-results/stand-${location}-${level}.png` });
        frames.add(crypto.createHash('sha256').update(frame).digest('hex'));
        await page.reload(); await expect(canvas).toHaveAttribute('data-stand-level', String(level));
        expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).version, key)).toBe(10);
        await page.locator('[data-page=rent]').click();
        expect(await page.locator(`#thumbnail-${location}`).getAttribute('src')).toBe(background);
    }
    expect(frames.size).toBe(4);
    expect(catalogueFrames.size).toBe(4);
    await page.locator('[data-page=upgrades]').click();
    await expect(page.locator('[data-upgrade=stand]')).toHaveText('MAX LEVEL');
    await expect(page.locator('[data-upgrade=stand]')).toBeDisabled();
    await page.locator('#open').click();
    await expect(canvas).toHaveAttribute('data-stand-texture', 'stand-3');
    await expect(page.locator('[data-upgrade=stand]')).toBeDisabled();
});
