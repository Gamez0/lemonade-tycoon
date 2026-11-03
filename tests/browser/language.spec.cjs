const { test, expect } = require('../helpers/browser-game.cjs');
const SAVE = 'lemonade-tycoon.reboot.save';
const rawSave = page => page.evaluate(key => localStorage.getItem(key), SAVE);
async function choose(page, language) {
    await page.locator('#help-open').click();
    await page.locator('#language').selectOption(language);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#help-close').click();
}

test('language switches preserve business bytes, restore English and persist Korean with a bundled font', async ({ page }) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const before = await rawSave(page);
    await choose(page, 'ko');
    await expect(page.locator('#panel-title')).toHaveText('레시피');
    await expect(page.locator('#save-status')).toContainText('저장');
    expect(await page.evaluate(() => document.fonts.check('13px "Tycoon Korean"', '한글 레시피'))).toBe(true);
    expect(await rawSave(page)).toBe(before);
    await choose(page, 'en');
    await expect(page.locator('#panel-title')).toHaveText('Recipe');
    await expect(page.locator('#save-status')).toHaveText('Saved on this device');
    expect(await rawSave(page)).toBe(before);
    await choose(page, 'ko'); await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    await expect(page.locator('[data-page=supplies]')).toHaveText('재료');
    expect(await rawSave(page)).toBe(before);
    expect(errors).toEqual([]);
});

test('company names matching message IDs remain player data in cards, details and titles', async ({ page }) => {
    await page.goto('/'); await choose(page, 'ko'); await page.locator('#main-menu').click();
    await page.locator('#menu-new').click(); await page.locator('#menu-name').fill('Park');
    await page.locator('#menu-create button[type=submit]').click();
    await expect(page.locator('#start-menu')).toBeHidden();
    await page.locator('#main-menu').click();
    await expect(page.locator('[data-company="1"] .company-name')).toHaveText('Park');
    await expect(page.locator('[data-company="1"]')).toHaveAttribute('title', 'Park');
    await expect(page.locator('.menu-company-name')).toHaveText('Park');
    await page.locator('#menu-options').click();
    await page.locator('#language').selectOption('en'); await page.locator('#help-close').click();
    await expect(page.locator('[data-company="1"] .company-name')).toHaveText('Park');
});

test('Korean paid-v12 replay and live language switching retain the exact outcome and opening charge', async ({ page }) => {
    const fixture = require('../fixtures/alpha21-v12-supplies.json').cases[0];
    await page.goto('/'); await choose(page, 'ko');
    await page.locator('#save-file').setInputFiles({ name: 'v12.json', mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(fixture.document)) });
    await expect(page.locator('#save-status')).toContainText('가져온');
    await page.locator('[data-page=supplies]').click(); await page.locator('[data-supply=ice]').click();
    await expect(page.locator('#bundle-label-0')).toHaveText('얼음 60개');
    await expect(page.locator('#bundle-price-0')).toHaveText('$1.20');
    await page.locator('#open').click();
    const paid = await rawSave(page);
    await choose(page, 'en'); await choose(page, 'ko');
    await expect(page.locator('#app')).toHaveAttribute('data-phase', 'selling');
    expect(await rawSave(page)).toBe(paid);
    await page.locator('#skip').click();
    await expect(page.locator('#results')).toBeVisible();
    expect(JSON.parse(await rawSave(page)).history[0]).toEqual(fixture.expected);
    await expect(page.locator('#result-intro')).not.toContainText('customers served');
});

test('unsupported preferences fall back to English and unknown recovery messages stay readable without writes', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('willow-lane.locale.v1', 'unsupported'));
    await page.goto('/'); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.addInitScript(() => {
        localStorage.setItem('willow-lane.locale.v1', 'ko'); window.localeWrites = 0;
        window.desktopSave = { getItem: async () => { throw Error('Unrecognized backend report XYZ'); },
            setItem: async () => { window.localeWrites++; }, onFlush: () => {} };
    });
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    await expect(page.locator('#save-status')).toContainText('Unrecognized backend report XYZ');
    expect(await page.evaluate(() => window.localeWrites)).toBe(0);
});

test('Korean preparation screens and catalogue controls fit narrow windows', async ({ page }, testInfo) => {
    await page.goto('/'); await choose(page, 'ko');
    for (const [width, height] of [[1280, 1000], [800, 600], [683, 465], [512, 350], [375, 667]]) {
        await page.setViewportSize({ width, height });
        for (const tab of ['recipe', 'marketing', 'supplies', 'rent', 'upgrades', 'staff', 'results']) {
            await page.locator('[data-page=' + tab + ']').click();
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
            if (tab === 'upgrades' || tab === 'staff') {
                for (let card = 0; card < (tab === 'upgrades' ? 4 : 3); card++) {
                    await page.locator('[data-catalog=' + tab + '][data-catalog-step="1"]').click();
                    expect(await page.locator('#' + tab + '-catalog').evaluate(catalog => {
                        const box = catalog.getBoundingClientRect();
                        const card = [...catalog.children].find(item => Math.abs(item.getBoundingClientRect().left - box.left) < 2);
                        const button = card.querySelector('button').getBoundingClientRect();
                        return button.left >= box.left && button.right <= box.right;
                    })).toBe(true);
                }
            }
        }
    }
    await page.setViewportSize({ width: 800, height: 600 });
    await page.locator('[data-page=recipe]').click();
    await page.screenshot({ path: testInfo.outputPath('korean-800.png'), fullPage: true });
});
