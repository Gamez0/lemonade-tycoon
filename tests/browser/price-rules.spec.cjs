const { test, expect } = require('../helpers/browser-game.cjs');
const SAVE = 'lemonade-tycoon.reboot.save';
const read = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)),SAVE);

test('new-company equipment basis and next quotes remain separate through company switches and relaunch', async ({page}) => {
    await page.goto('/');
    expect((await read(page)).state.economy.rule).toBe('legacy-v1');
    await page.locator('[data-page=upgrades]').click();
    await page.locator('[data-upgrade=refrigerator]').click();
    await expect(page.locator('#upgrade-next-refrigerator')).toContainText('$17.00');
    await expect.poll(async () => (await read(page)).state.economy.equipment.refrigerator).toEqual([900]);
    await page.locator('[data-page=results]').click(); await page.locator('[data-report=balance]').click();
    await expect(page.locator('#result-values dd').nth(2)).toHaveText('$9.00');
    await page.locator('#main-menu').click(); await page.locator('#menu-new').click();
    await page.locator('#menu-name').fill('Second'); await page.locator('#menu-create button[type=submit]').click();
    expect((await read(page)).state.economy.equipment.refrigerator).toEqual([]);
    await page.locator('#main-menu').click(); await page.locator('[data-company="0"]').click();
    await page.locator('#menu-continue').click(); await page.reload();
    await expect(page.locator('#cash')).toHaveText('$31.00');
    expect((await read(page)).state.economy.equipment.refrigerator).toEqual([900]);
});

for (const fixture of require('../fixtures/alpha24-v13-economy.json').cases) {
    test(`actual schema13 ${fixture.name}: paid costs and complete ledger survive import and replay`, async ({page}) => {
        await page.goto('/');
        await page.locator('#save-file').setInputFiles({name:'schema13.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture.document))});
        await expect(page.locator('#save-status')).toContainText('Imported save');
        await page.locator('[data-page=marketing]').click();
        await expect(page.locator('#management-bill')).toContainText('Wages $1.80 | Ads $1.80');
        const imported = await read(page);
        expect(imported.state.economy).toBeUndefined();
        expect(imported.state.cash).toBe(fixture.document.state.cash);
        await page.locator('#open').click(); await page.locator('#skip').click();
        await expect(page.locator('#results')).toBeVisible();
        await expect.poll(async () => (await read(page)).state.business).toBe(null);
        const saved = await read(page);
        expect(saved.version).toBe(14);
        expect(saved.history.at(-1)).toEqual(fixture.expected);
        expect(saved.state.economy).toBeUndefined();
    });
}
