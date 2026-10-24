const { test, expect } = require('@playwright/test');
const { encodeSave, SAVE_KEY, BACKUP_KEY } = require('../../.test-build/simulation/save.js');
const { newGame } = require('../../.test-build/simulation/game.js');
const companyKey = 'lemonade-tycoon.reboot.companies';
async function ready(page) { await expect(page.locator('#menu-continue')).toBeEnabled(); }
async function create(page, name) {
    await page.locator('#menu-new').click(); await page.locator('#menu-name').fill(name);
    await page.locator('#menu-create button[type=submit]').click();
    await expect(page.locator('#start-menu')).toBeHidden();
}
async function price(page, value) {
    await page.locator('[data-page=marketing]').click();
    await page.locator('#price').fill(value); await page.locator('#price').press('Tab');
}
test('launch opens the original640x480 menu composition, keyboard dialogs and eight company slots', async ({ page }) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('/'); await ready(page);
    for (const size of [{ width: 1280, height: 1000 }, { width: 800, height: 600 }, { width: 375, height: 812 }]) {
        await page.setViewportSize(size);
        // Chromium dispatches resize asynchronously after the viewport command.
        // Observe the completed layout before measuring its source coordinates.
        await expect.poll(() => page.evaluate(() => {
            const frame = document.querySelector('.start-frame').getBoundingClientRect();
            return Math.abs(frame.width - Math.min(innerWidth, innerHeight * 4 / 3)) < .5 &&
                frame.x >= -.5 && frame.right <= innerWidth + .5 && frame.y >= -.5 && frame.bottom <= innerHeight + .5;
        })).toBe(true);
        const geometry = await page.evaluate(() => {
            const frame = document.querySelector('.start-frame').getBoundingClientRect(), logo = document.querySelector('.menu-logo').getBoundingClientRect();
            const first = document.querySelector('[data-company="0"]').getBoundingClientRect();
            return { logoX: (logo.x - frame.x) * 640 / frame.width, logoWidth: logo.width * 640 / frame.width,
                company: [first.x - frame.x, first.y - frame.y, first.width, first.height].map(n => Math.round(n * 640 / frame.width)),
                fits: frame.x >= -.5 && frame.right <= innerWidth + .5 && frame.y >= -.5 && frame.bottom <= innerHeight + .5 };
        });
        expect(geometry.logoX).toBeCloseTo(320, 1); expect(geometry.logoWidth).toBeCloseTo(256, 1); expect(geometry.fits).toBe(true);
        expect(geometry.company).toEqual([17, 269, 146, 25]);
        await expect(page.locator('[data-company]')).toHaveCount(8);
        await expect(page.locator('#start-menu')).toBeVisible();
    }
    await page.locator('#menu-help').focus(); await page.keyboard.press('Enter');
    await expect(page.locator('#help-dialog')).toBeVisible(); await page.keyboard.press('Escape');
    await page.locator('#menu-credits').click(); await expect(page.locator('#menu-credits-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    expect(errors).toEqual([]);
});
test('named companies switch independently, retain changed plans across relaunch, and names stay plain text', async ({ page }) => {
    await page.goto('/'); await ready(page); await page.locator('#menu-continue').click();
    await price(page, '1.75');
    await page.locator('#main-menu').click(); await ready(page);
    const name = '<b>Second company</b>'; await create(page, name);
    await price(page, '2.25'); await page.reload(); await ready(page);
    await expect(page.locator('[data-company="1"]')).toHaveText(name);
    await expect(page.locator('[data-company="1"] b')).toHaveCount(0);
    await page.locator('#menu-continue').click(); await page.locator('[data-page=marketing]').click();
    await expect(page.locator('#price')).toHaveValue('2.25');
    await page.locator('#main-menu').click(); await ready(page);
    await page.locator('[data-company="0"]').click(); await page.locator('#menu-continue').click();
    await page.locator('[data-page=marketing]').click(); await expect(page.locator('#price')).toHaveValue('1.75');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('lemonade-tycoon.reboot.companies')).active)).toBe(0);
});
test('a protected newer autosave is not overwritten by visiting the menu and can be explicitly imported', async ({ page }) => {
    await page.addInitScript(({ key, backup, raw }) => {
        localStorage.setItem(key, '{"version":999}'); localStorage.setItem(backup, raw);
    }, { key: SAVE_KEY, backup: BACKUP_KEY, raw: encodeSave(newGame(), []) });
    await page.goto('/'); await expect(page.locator('#menu-inspect')).toBeVisible();
    await expect(page.locator('#menu-new')).toBeDisabled();
    expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe('{"version":999}');
    await page.locator('#save-file').setInputFiles({ name: 'compatible.json', mimeType: 'application/json', buffer: Buffer.from(encodeSave(newGame(300), [])) });
    await ready(page); await page.locator('#menu-continue').click();
    expect(JSON.parse(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).version).toBe(9);
});
test('failed journal cleanup keeps the new primary protected until recovery, including normal-close flush', async ({ page }) => {
    await page.addInitScript(companyKey => {
        let writes = 0;
        window.desktopSave = { getItem: async key => localStorage.getItem(key),
            setItem: async (key, raw) => {
                if (key === companyKey && ++writes === 2) throw Error('Company disk unavailable');
                localStorage.setItem(key, raw);
            }, onFlush: handler => { window.flushCompany = handler; } };
    }, companyKey);
    await page.goto('/'); await ready(page); await page.locator('#menu-continue').click(); await price(page, '1.75');
    await page.locator('#main-menu').click(); await ready(page); await page.locator('#menu-new').click();
    await page.locator('#menu-name').fill('New company'); await page.locator('#menu-create button[type=submit]').click();
    await expect(page.locator('#menu-status')).toContainText('unavailable');
    await expect(page.locator('#menu-continue')).toBeDisabled();
    const committed = await page.evaluate(key => localStorage.getItem(key), SAVE_KEY);
    await page.evaluate(() => window.flushCompany());
    expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(committed);
    await page.reload(); await ready(page);
    await expect(page.locator('[data-company="1"]')).toHaveText('New company');
    await page.locator('#menu-continue').click(); await page.locator('[data-page=marketing]').click();
    await expect(page.locator('#price')).toHaveValue('1.50');
});
test('corrupt current save with a different-company backup restores the selected company', async ({ page }) => {
    await page.goto('/'); await ready(page);
    await create(page, 'Keep this company'); await price(page, '2.25');
    await page.locator('#main-menu').click(); await ready(page);
    // Switching back and forth makes2.25 the durable snapshot for this slot.
    await page.locator('[data-company="0"]').click(); await page.locator('#menu-continue').click();
    await page.locator('#main-menu').click(); await ready(page);
    await page.locator('[data-company="1"]').click(); await page.locator('#menu-continue').click();
    await page.evaluate(({ key, backup, old }) => {
        localStorage.setItem(key, '{broken'); localStorage.setItem(backup, old);
    }, { key: SAVE_KEY, backup: BACKUP_KEY, old: encodeSave(newGame(), []) });
    await page.reload(); await ready(page); await page.locator('#menu-continue').click();
    await page.locator('[data-page=marketing]').click(); await expect(page.locator('#price')).toHaveValue('2.25');
});
test('New Challenge persists its mode and the thirtieth trading day ends at the menu without creating day31', async ({ page }) => {
    const { campaign, stock } = require('../helpers/business.cjs');
    const business = campaign(2026, 29);
    await page.goto('/'); await ready(page);
    await page.locator('#menu-challenge').click(); await page.locator('#menu-name').fill('Thirty days');
    await page.locator('#menu-create button[type=submit]').click(); await expect(page.locator('#start-menu')).toBeHidden();
    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'challenge');
    await page.locator('#save-file').setInputFiles({ name: 'challenge-day30.json', mimeType: 'application/json',
        buffer: Buffer.from(encodeSave(stock(business.state), business.history, 'import-challenge', 'challenge')) });
    await expect(page.locator('#day')).toHaveText('30');
    await page.locator('#open').click(); await page.locator('#skip').click();
    await expect(page.locator('#results')).toBeVisible();
    await expect(page.locator('#next-day-label')).toHaveText('Return to menu');
    await page.locator('#next').click(); await ready(page);
    const saved = JSON.parse(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY));
    expect(saved.state.day).toBe(30); expect(saved.history).toHaveLength(30); expect(saved.mode).toBe('challenge');
    await page.reload(); await ready(page); await page.locator('#menu-continue').click();
    await expect(page.locator('#next-day-label')).toHaveText('Return to menu');
    await expect(page.locator('#open')).toBeHidden();
});
test('returning to the main menu freezes selling and continuing resumes without another opening charge', async ({ page }) => {
    const { stock } = require('../helpers/business.cjs');
    await page.goto('/'); await ready(page); await page.locator('#menu-continue').click();
    await page.locator('#save-file').setInputFiles({ name: 'stock.json', mimeType: 'application/json', buffer: Buffer.from(encodeSave(stock(newGame()), [])) });
    await expect(page.locator('#save-status')).toContainText('Imported'); await page.locator('#open').click();
    const progress = page.locator('#progress-text');
    await expect.poll(async () => Number((await progress.textContent()).split(' /')[0])).toBeGreaterThanOrEqual(2);
    const paid = await page.evaluate(key => localStorage.getItem(key), SAVE_KEY);
    await page.locator('#main-menu').click(); await ready(page); const frozen = await progress.textContent();
    await page.waitForTimeout(600); expect(await progress.textContent()).toBe(frozen);
    await page.locator('#menu-continue').click(); await expect(progress).not.toHaveText(frozen);
    expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(paid);
});
test('close waits for a held company transfer and queued menu actions cannot start a later write', async ({ page }) => {
    await page.addInitScript(({ companyKey, saveKey }) => {
        window.companyWrites = 0; window.holdCompanyWrite = false;
        window.desktopSave = { getItem: async key => localStorage.getItem(key),
            setItem: async (key, raw) => {
                if (key === companyKey) window.companyWrites++;
                if (key === saveKey && window.holdCompanyWrite) await new Promise(resolve => { window.releaseCompanyWrite = resolve; });
                localStorage.setItem(key, raw);
            }, onFlush: handler => { window.flushCompany = handler; } };
    }, { companyKey, saveKey: SAVE_KEY });
    await page.goto('/'); await ready(page); await page.locator('#menu-new').click();
    await page.locator('#menu-name').fill('Pending company'); await page.evaluate(() => { window.holdCompanyWrite = true; });
    await page.locator('#menu-create button[type=submit]').click();
    await expect.poll(() => page.evaluate(() => typeof window.releaseCompanyWrite)).toBe('function');
    await page.evaluate(() => { window.closeCompany = window.flushCompany(); });
    expect(await page.locator('#start-menu').evaluate(menu => menu.inert)).toBe(true);
    await page.evaluate(() => {
        document.querySelector('#menu-create').dispatchEvent(new Event('submit', { cancelable: true }));
        window.holdCompanyWrite = false; window.releaseCompanyWrite();
    });
    await page.evaluate(() => window.closeCompany);
    expect(await page.evaluate(() => window.companyWrites)).toBe(2);
    const book = JSON.parse(await page.evaluate(key => localStorage.getItem(key), companyKey));
    expect(book.active).toBe(1); expect(book.pending).toBeUndefined();
    expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(book.companies[1].raw);
});
