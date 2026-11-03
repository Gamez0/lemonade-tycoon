const { test, expect } = require('../helpers/browser-game.cjs');
const { observeAudio, verifyRecovery } = require('../helpers/audio-recovery.cjs');
const { newGame, setPlan, buy } = require('../../.test-build/simulation/game.js');
const { encodeSave } = require('../../.test-build/simulation/save.js');

async function stocked(page, muted = false) {
    let state = setPlan(newGame(), { price: 125, recipe: { lemon: 6, sugar: 3, ice: 2 } });
    for (const [item, amount] of [['lemon', 40], ['sugar', 20], ['ice', 120], ['cup', 60]]) state = buy(state, item, amount);
    await page.addInitScript(({ raw, muted }) => {
        localStorage.setItem('lemonade-tycoon.reboot.save', raw);
        localStorage.setItem('willow-lane.audio.v1', JSON.stringify({music: .25, effects: .35, muted}));
    }, { raw: encodeSave(state, []), muted });
    await page.addInitScript(observeAudio);
    await page.goto('/');
}
const active = page => page.evaluate(() => window.__audioProbe.active());

test('segmented music and effects resume after actual context suspension and focus return', async ({ page }) => {
    await page.addInitScript(observeAudio);
    await page.goto('/');
    await verifyRecovery(page);
});

test('music follows selling/completion once, keeps normal pitch at4x and returns to preparation bed', async ({ page }) => {
    await stocked(page);
    await expect.poll(async () => (await active(page)).some(m => m.source.includes('music-preparation-v2'))).toBe(true);
    await page.locator('#open').click();
    await expect.poll(async () => (await active(page)).some(m => m.source.includes('music-selling-v2'))).toBe(true);
    await page.waitForTimeout(400);
    const selling = (await active(page)).find(m => m.source.includes('music-selling-v2'));
    expect(selling.duration).toBeGreaterThan(8);
    await page.locator('#speed').click();
    const fast = (await active(page)).find(m => m.source.includes('music-selling-v2'));
    expect(fast.rate).toBe(1); expect(fast.time).toBeGreaterThanOrEqual(selling.time);
    await page.locator('#skip').click();
    await expect(page.locator('#results')).toBeVisible();
    await expect.poll(async () => (await active(page)).some(m => m.source.includes('music-results-v2'))).toBe(true);
    await expect.poll(async () => (await active(page)).some(m => m.source.includes('music-preparation-v2')), { timeout: 12000 }).toBe(true);
    await page.locator('[data-page=recipe]').click(); await page.locator('[data-page=results]').click();
    expect(await page.evaluate(() => window.__audioProbe.sources.filter(m => m.source.includes('music-results-v2')).length)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => window.__audioProbe.events.filter(e => e.type === 'play' && e.source.includes('music-results-v2')).length)).toBe(1);
    await page.waitForTimeout(350);
    expect((await active(page)).length).toBe(1);
});

test('persisted mute loads no sources; muted completion does not queue a later fanfare', async ({ page }) => {
    await stocked(page, true);
    expect(await page.evaluate(() => [window.__audioProbe.sources.length, window.__audioProbe.contexts.length])).toEqual([0, 0]);
    await page.locator('#open').click(); await page.locator('#skip').click();
    await page.locator('#help-open').click(); await page.locator('#mute-audio').uncheck();
    await expect.poll(async () => (await active(page)).some(m => m.source.includes('music-preparation-v2'))).toBe(true);
    expect(await page.evaluate(() => window.__audioProbe.events.some(e => e.source.includes('music-results-v2')))).toBe(false);
});

test('unavailable music does not block a paid day, results or a later available cue', async ({ page }) => {
    await page.route(/music-selling-v2-.*\.flac$/, route => route.abort());
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await stocked(page);
    await page.locator('#open').click();
    await expect(page.locator('#selling')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.__audioProbe.events.some(e => e.type === 'error' && e.source.includes('music-selling-v2')))).toBe(true);
    await page.locator('#skip').click();
    await expect(page.locator('#results')).toBeVisible();
    await expect.poll(async () => (await active(page)).some(m => m.source.includes('music-results-v2'))).toBe(true);
    expect(errors).toEqual([]);
});


test('missing completion music returns to the preparation bed without blocking results', async ({ page }) => {
    await page.route(/music-results-v2-.*\.flac$/, route => route.abort());
    await stocked(page);
    await page.locator('#open').click(); await page.locator('#skip').click();
    await expect(page.locator('#results')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.__audioProbe.events.some(e => e.type === 'error' && e.source.includes('music-results-v2')))).toBe(true);
    await expect.poll(async () => (await active(page)).some(m => m.source.includes('music-preparation-v2'))).toBe(true);
});

test('muting while a segment loads cancels its fetch and cannot start a stale voice', async ({ page }) => {
    const errors = [];
    let release;
    const held = new Promise(resolve => { release = resolve; });
    await page.route(/music-preparation-v2-.*\.flac$/, async route => {
        await held;
        await route.continue().catch(() => {});
    });
    page.on('pageerror', error => errors.push(error.message));
    await stocked(page);
    await page.locator('#help-open').click();
    await page.locator('#mute-audio').check();
    release();
    await page.waitForTimeout(400);
    expect(await active(page)).toEqual([]);
    await page.unroute(/music-preparation-v2-.*\.flac$/);
    await page.locator('#mute-audio').uncheck();
    await expect.poll(async () => (await active(page)).some(m => m.source.includes('music-preparation-v2'))).toBe(true);
    expect(errors).toEqual([]);
});
