const { selectLocation } = require('../helpers/rent-navigation.cjs');
const { test, expect } = require('../helpers/browser-game.cjs');
const { newGame } = require('../../.test-build/simulation/game.js');
const { encodeSave, SAVE_KEY } = require('../../.test-build/simulation/save.js');
const { WEATHER } = require('../../.test-build/content/catalog.js');
const { LOCATION_IDS } = require('../../.test-build/content/locations.js');

test('Rent browses all ten choices without a horizontal scrollbar or browsing charge at small sizes', async ({ page }) => {
    await page.goto('/'); await page.locator('[data-page=rent]').click();
    const initial = await page.evaluate(key => localStorage.getItem(key), SAVE_KEY);
    for (const [width, height] of [[1280, 1000], [800, 600], [640, 480], [375, 667]]) {
        await page.setViewportSize({ width, height });
        for (let i = 0; i < LOCATION_IDS.length; i++) {
            await page.locator('#rent-next').click();
            await expect(page.locator('.location-list [aria-pressed=true]')).toBeInViewport();
            const box = await page.locator('.location-list').evaluate(e => {
                e.scrollLeft = 1000;
                return { overflow: getComputedStyle(e).overflowX, excess: e.scrollWidth - e.clientWidth,
                    offset: e.scrollLeft, scrollbar: e.offsetHeight - e.clientHeight,
                    pageFits: document.documentElement.scrollWidth <= innerWidth };
            });
            expect(box.overflow).toBe('clip'); expect(box.excess).toBeLessThanOrEqual(1);
            expect(box.offset).toBe(0); expect(box.scrollbar).toBe(0); expect(box.pageFits).toBe(true);
        }
    }
    expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(initial);
});
test('rain and location previews explain the real visitor and cooling effects before charging rent', async ({ page }) => {
    await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw),
        { key: SAVE_KEY, raw: encodeSave({ ...newGame(), weather: WEATHER[2] }, []) });
    await page.goto('/'); await page.locator('[data-page=rent]').click();
    await selectLocation(page, 'park');
    await expect(page.locator('#rent-description')).toContainText('Rain reduces outdoor foot traffic');
    await selectLocation(page, 'mall');
    await expect(page.locator('#rent-description')).toContainText('Indoors:20°C');
    await expect(page.locator('#rent-details')).toContainText('20°C / 0 ice per cup');
});

test('real rainy Park and Mall days use the previewed visitors and keep indoor temperature after reload', async ({ page }) => {
    const { fundedStandBusiness } = require('../helpers/stand-business.cjs');
    const { expectedTraffic } = require('../../.test-build/simulation/game.js');
    await page.clock.install(); await page.goto('/');
    const observations = {};
    for (const location of ['park', 'mall']) {
        const business = fundedStandBusiness(location);
        business.state = { ...business.state, weather: WEATHER[2] };
        const expected = expectedTraffic(business.state);
        await page.locator('#save-file').setInputFiles({ name: 'rain.json', mimeType: 'application/json',
            buffer: Buffer.from(encodeSave(business.state, business.history)) });
        await expect(page.locator('#save-status')).toContainText('Imported');
        await page.locator('#open').click(); await page.clock.runFor(100);
        if (location === 'mall') await expect(page.locator('#weather')).toHaveText('20°C');
        await page.locator('#skip').click(); await page.clock.runFor(500);
        const raw = await page.evaluate(key => localStorage.getItem(key), SAVE_KEY), doc = JSON.parse(raw);
        expect(doc.history.at(-1).daily.visitors).toBe(expected);
        observations[location] = expected;
        await page.reload(); await page.clock.runFor(500);
        expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(raw);
    }
    expect(observations.park).toBeLessThan(8);
    expect(observations.mall).toBeGreaterThan(observations.park * 10);
});
