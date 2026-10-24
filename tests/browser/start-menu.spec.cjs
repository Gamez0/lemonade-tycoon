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
test('company lobby keeps eight readable cards, selected details and primary actions separate', async ({ page }) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('/'); await ready(page);
    for (const size of [{ width: 1280, height: 1000 }, { width: 800, height: 600 }, { width: 375, height: 812 }]) {
        await page.setViewportSize(size);
        await expect.poll(() => page.evaluate(() => {
            const frame = document.querySelector('.start-frame').getBoundingClientRect();
            return Math.abs(frame.width - Math.min(innerWidth, innerHeight * 4 / 3)) < .5;
        })).toBe(true);
        const geometry = await page.evaluate(() => {
            const frame = document.querySelector('.start-frame').getBoundingClientRect();
            const boxes = [...document.querySelectorAll('[data-company], #menu-company-info, #menu-continue, #menu-new, #menu-challenge, #menu-import')].map(e => e.getBoundingClientRect());
            const logo = document.querySelector('.menu-logo');
            return { logoFits: logo.scrollWidth <= logo.clientWidth + 1,
                contained: boxes.every(r => r.x >= frame.x - .5 && r.right <= frame.right + .5 && r.y >= frame.y - .5 && r.bottom <= frame.bottom + .5),
                overlap: boxes.some((a,i) => boxes.slice(i+1).some(b => Math.min(a.right,b.right)>Math.max(a.x,b.x)+.5 && Math.min(a.bottom,b.bottom)>Math.max(a.y,b.y)+.5)),
                cardHeight: document.querySelector('[data-company]').getBoundingClientRect().height * 640 / frame.width };
        });
        expect(geometry.logoFits).toBe(true); expect(geometry.contained).toBe(true); expect(geometry.overlap).toBe(false); expect(geometry.cardHeight).toBeGreaterThanOrEqual(44);
        await expect(page.locator('[data-company]')).toHaveCount(8);
        await expect(page.locator('[data-company="0"] .company-summary')).toContainText('Day 1');
        await expect(page.locator('#menu-company-info')).toContainText('Year 1 / Month 1 / Day 1');
    }
    await page.locator('[data-company="0"]').focus(); await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-company="1"]')).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('#menu-continue')).toBeDisabled();
    await page.keyboard.press('End'); await expect(page.locator('[data-company="7"]')).toBeFocused();
    await page.keyboard.press('Home'); await expect(page.locator('[data-company="0"]')).toBeFocused();
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
    await expect(page.locator('[data-company="1"] .company-name')).toHaveText(name);
    await expect(page.locator('[data-company="1"] b')).toHaveCount(0);
    await page.locator('#menu-continue').click(); await page.locator('[data-page=marketing]').click();
    await expect(page.locator('#price')).toHaveValue('2.25');
    await page.locator('#main-menu').click(); await ready(page);
    await page.locator('[data-company="0"]').click(); await page.locator('#menu-continue').click();
    await page.locator('[data-page=marketing]').click(); await expect(page.locator('#price')).toHaveValue('1.75');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('lemonade-tycoon.reboot.companies')).active)).toBe(0);
});

test('full lobby keeps long names contained and replacement requires explicit confirmation', async ({ page }) => {
    const companies = Array.from({ length: 8 }, (_, i) => ({ name: i === 0 ? 'W'.repeat(40) : `Saved company ${i + 1}`,
        raw: encodeSave(newGame(100 + i), [], `lobby-${i}`, i % 2 ? 'challenge' : 'career') }));
    await page.addInitScript(({ key, save, companies }) => {
        localStorage.setItem(key, JSON.stringify({ version: 1, active: 0, companies }));
        localStorage.setItem(save, companies[0].raw);
    }, { key: companyKey, save: SAVE_KEY, companies });
    await page.goto('/'); await ready(page);
    await expect(page.locator('[data-company="1"] .company-summary')).toContainText('Challenge');
    expect(await page.locator('#menu-company-info').evaluate(e => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
    const before = await page.evaluate(key => localStorage.getItem(key), companyKey);
    await page.locator('#menu-new').click();
    await expect(page.locator('#menu-continue')).toBeHidden();
    await expect(page.locator('#menu-replace-label')).toBeVisible();
    await page.locator('#menu-name').fill('Replacement company');
    await page.locator('#menu-create button[type=submit]').click();
    await expect(page.locator('#menu-status')).toContainText('Confirm replacement');
    expect(await page.evaluate(key => localStorage.getItem(key), companyKey)).toBe(before);
    expect(await page.locator('#menu-create').evaluate(e => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
    await page.locator('#menu-replace').check(); await page.locator('#menu-cancel').click();
    expect(await page.evaluate(key => localStorage.getItem(key), companyKey)).toBe(before);
    await expect(page.locator('[data-company="0"] .company-name')).toHaveText(companies[0].name);
});
test('a protected newer autosave is not overwritten by visiting the menu and can be explicitly imported', async ({ page }) => {
    await page.addInitScript(({ key, backup, raw }) => {
        localStorage.setItem(key, '{"version":999}'); localStorage.setItem(backup, raw);
    }, { key: SAVE_KEY, backup: BACKUP_KEY, raw: encodeSave(newGame(), []) });
    await page.goto('/'); await expect(page.locator('#menu-inspect')).toBeVisible();
    await expect(page.locator('#menu-heading')).toHaveText('Saved game needs recovery');
    await expect(page.locator('#menu-company-info')).toContainText('The existing file will be kept');
    await expect(page.locator('#menu-company-info')).not.toContainText('$40.00');
    await expect(page.locator('#menu-new')).toBeDisabled();
    expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe('{"version":999}');
    await page.locator('#save-file').setInputFiles({ name: 'compatible.json', mimeType: 'application/json', buffer: Buffer.from(encodeSave(newGame(300), [])) });
    await ready(page); await page.locator('#menu-continue').click();
    expect(JSON.parse(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).version).toBe(10);
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
    await expect(page.locator('[data-company="1"] .company-name')).toHaveText('New company');
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
