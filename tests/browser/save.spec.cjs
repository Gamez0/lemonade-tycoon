const { test, expect } = require('@playwright/test');
const key = 'lemonade-tycoon.reboot.save';
const saved = page => page.evaluate(key => localStorage.getItem(key), key);

async function delayedDesktop(page) {
    await page.addInitScript(() => {
        window.holdWrites = false;
        window.desktopSave = {
            getItem: async key => localStorage.getItem(key),
            setItem: async (key, raw) => {
                if (window.holdWrites && key === 'lemonade-tycoon.reboot.save') {
                    await new Promise(resolve => { window.releaseWrite = resolve; });
                }
                localStorage.setItem(key, raw);
            },
            onFlush: handler => { window.flushDesktopSave = handler; },
        };
    });
    await page.goto('/');
    await expect.poll(() => saved(page)).not.toBeNull();
}

test('normal close during startup waits for the initial read and new-business write', async ({ page }) => {
    await page.addInitScript(() => {
        window.holdRestore = true;
        window.desktopSave = {
            getItem: async key => {
                if (window.holdRestore) await new Promise(resolve => { window.releaseRestore = resolve; });
                return localStorage.getItem(key);
            },
            setItem: async (key, raw) => localStorage.setItem(key, raw),
            onFlush: handler => { window.flushDesktopSave = handler; },
        };
    });
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => typeof window.releaseRestore)).toBe('function');
    const result = await page.evaluate(async () => {
        let flushed = false;
        const flush = window.flushDesktopSave().then(() => { flushed = true; });
        await new Promise(resolve => setTimeout(resolve, 50));
        const closedBeforeRead = flushed;
        window.holdRestore = false; window.releaseRestore(); await flush;
        return { closedBeforeRead, raw: localStorage.getItem('lemonade-tycoon.reboot.save'), inert: document.querySelector('#app').inert };
    });
    expect(result.closedBeforeRead).toBe(false);
    expect(JSON.parse(result.raw).state.day).toBe(1);
    expect(result.inert).toBe(true);
});

test('normal close freezes edits while its last disk checkpoint is pending', async ({ page }) => {
    await delayedDesktop(page);
    await page.evaluate(() => { window.holdWrites = true; });
    await page.locator('#lemon').fill('3'); await page.locator('#lemon').press('Tab');
    await expect.poll(() => page.evaluate(() => typeof window.releaseWrite)).toBe('function');
    await page.evaluate(() => { window.flushPromise = window.flushDesktopSave(); });
    expect(await page.locator('#app').evaluate(app => app.inert)).toBe(true);
    // A queued event must not create a newer write after close captured its queue.
    await page.evaluate(() => {
        const input = document.querySelector('#lemon');
        input.value = '4'; input.dispatchEvent(new Event('change'));
        window.holdWrites = false; window.releaseWrite();
    });
    await page.evaluate(() => window.flushPromise);
    expect(JSON.parse(await saved(page)).state.plan.recipe.lemon).toBe(3);
});

test('normal close during selling stops later transactions and retains the opening checkpoint', async ({ page }) => {
    await delayedDesktop(page); await stock(page);
    await page.evaluate(() => window.flushDesktopSave());
    // Use a fresh page after the previous simulated close, as a real app would.
    await page.reload();
    await expect(page.locator('#app')).toBeVisible();
    await page.evaluate(() => { window.holdWrites = true; });
    await page.locator('#open').click();
    await expect.poll(() => page.evaluate(() => typeof window.releaseWrite)).toBe('function');
    await page.evaluate(() => { window.flushPromise = window.flushDesktopSave(); });
    const progress = await page.locator('#progress-text').textContent();
    await page.waitForTimeout(1200);
    expect(await page.locator('#progress-text').textContent()).toBe(progress);
    await page.evaluate(() => {
        document.querySelector('#skip').click();
        window.holdWrites = false; window.releaseWrite();
    });
    await page.evaluate(() => window.flushPromise);
    const checkpoint = JSON.parse(await saved(page));
    expect(checkpoint.state.phase).toBe('preparation');
    expect(checkpoint.state.business.paid).toBe(true);
    expect(checkpoint.state.daily.visitors).toBe(0);
    expect(checkpoint.history).toHaveLength(0);
});

test('native import pauses editing and normal-close flush waits for file reading and serialized writes', async ({ page }) => {
    const { newGame, buy } = require('../../.test-build/simulation/game.js');
    const { encodeSave } = require('../../.test-build/simulation/save.js');
    const imported = encodeSave(buy(newGame(), 'lemon', 3), []);
    await page.addInitScript(() => {
        let active = 0;
        window.importTrace = { overlap: false };
        const read = File.prototype.text;
        File.prototype.text = async function () {
            await new Promise(resolve => setTimeout(resolve, 180));
            return read.call(this);
        };
        window.desktopSave = {
            getItem: async key => localStorage.getItem(key),
            setItem: async (key, raw) => {
                if (++active > 1) window.importTrace.overlap = true;
                await new Promise(resolve => setTimeout(resolve, 80));
                localStorage.setItem(key, raw); active--;
            },
            onFlush: handler => { window.flushImportForTest = handler; },
        };
    });
    await page.goto('/');
    await expect(page.locator('#save-status')).toHaveText('Saved on this PC');
    await page.locator('#save-file').setInputFiles({ name: 'import.json', mimeType: 'application/json', buffer: Buffer.from(imported) });
    const wasBusy = await page.locator('#app').evaluate(app => app.inert && app.getAttribute('aria-busy') === 'true');
    // A close during File.text must include the import, not just the older save queue.
    await page.evaluate(() => window.flushImportForTest());
    expect(await saved(page)).toBe(imported);
    expect(wasBusy).toBe(true);
    await expect(page.locator('#inventory-lemon')).toHaveText('3');
    await expect(page.locator('#app')).toHaveAttribute('aria-busy', 'true');
    expect(await page.locator('#app').evaluate(app => app.inert)).toBe(true);
    expect(await page.evaluate(() => window.importTrace.overlap)).toBe(false);
});

test('a newer primary with an older valid backup is left untouched on startup and edits', async ({ page }) => {
    const { newGame } = require('../../.test-build/simulation/game.js');
    const { encodeSave } = require('../../.test-build/simulation/save.js');
    const backup = encodeSave(newGame(), []);
    const future = JSON.stringify({ ...JSON.parse(backup), version: 999 });
    await page.addInitScript(({ future, backup }) => {
        localStorage.setItem('lemonade-tycoon.reboot.save', future);
        localStorage.setItem('lemonade-tycoon.reboot.backup', backup);
    }, { future, backup });
    await page.goto('/');
    await expect(page.locator('#save-status')).toContainText('Unsupported save version');
    await page.locator('#lemon').fill('3'); await page.locator('#lemon').press('Tab');
    expect(await saved(page)).toBe(future);
    expect(await page.evaluate(() => localStorage.getItem('lemonade-tycoon.reboot.backup'))).toBe(backup);
});
async function stock(page) {
    await page.locator('[data-page="supplies"]').click();
    for (const item of ['lemon', 'sugar', 'ice', 'cup']) {
        await page.locator(`[data-supply="${item}"]`).click();
        await page.locator('[data-bundle="0"][data-delta="1"]').click();
    }
    await page.locator('#buy-order').click();
}
test('reload resumes checkpoints and preserves results, ledger and cancelled restart', async ({ page }) => {
    await page.goto('/'); await stock(page);
    const preparation = await saved(page);
    await page.locator('#open').click(); await page.reload();
    await expect(page.locator('#app')).toHaveAttribute('data-phase', 'preparation');
    const checkpoint = JSON.parse(await saved(page));
    expect(checkpoint.state.business.paid).toBe(true);
    const { openDay } = require('../../.test-build/simulation/game.js');
    expect(checkpoint.state).toEqual({ ...openDay(JSON.parse(preparation).state), phase: 'preparation' });
    expect(checkpoint.state.pitcherCups).toBe(12);
    expect(checkpoint.state.daily.pitchersMade).toBe(1);
    await page.locator('#open').click(); await page.locator('#skip').click();
    await expect(page.locator('#app')).toHaveAttribute('data-phase', 'results');
    const results = await saved(page);
    await page.reload();
    await expect(page.locator('#app')).toHaveAttribute('data-phase', 'results');
    expect(await saved(page)).toBe(results);
    await page.locator('#next').click();
    await expect(page.locator('#day')).toHaveText('02');
    const next = await saved(page);
    await page.locator('#restart').click(); await page.locator('#restart').press('Escape');
    await page.reload(); expect(await saved(page)).toBe(next);
    await expect(page.locator('#day')).toHaveText('02');
});
test('invalid saves remain protected through opening; valid import and backup recover', async ({ page }) => {
    await page.goto('/'); await stock(page); const valid = await saved(page);
    await page.evaluate(key => { localStorage.setItem(key, '{'); localStorage.removeItem('lemonade-tycoon.reboot.backup'); }, key);
    await page.reload(); await stock(page); await page.locator('#open').click();
    expect(await saved(page)).toBe('{');
    await page.locator('#save-file').setInputFiles({ name: 'save.json', mimeType: 'application/json', buffer: Buffer.from(valid) });
    await expect(page.locator('#save-status')).toContainText('Imported save');
    expect(await saved(page)).toBe(valid);
    await page.evaluate(({ key, valid }) => { localStorage.setItem('lemonade-tycoon.reboot.backup', valid); localStorage.setItem(key, '{'); }, { key, valid });
    await page.reload(); await expect(page.locator('#save-status')).toHaveText('Recovered from backup');
    expect(await saved(page)).toBe(valid);
    const downloadPromise = page.waitForEvent('download'); await page.locator('#export-save').click();
    const download = await downloadPromise; const stream = await download.createReadStream();
    const chunks = []; for await (const chunk of stream) chunks.push(chunk);
    expect(JSON.parse(Buffer.concat(chunks).toString())).toEqual(JSON.parse(valid));
});

test('desktop writes serialize and normal-close flush waits for the latest checkpoint', async ({ page }) => {
    await page.addInitScript(() => {
        let active = 0;
        window.saveTrace = { overlap: false, writes: [] };
        window.desktopSave = {
            getItem: async key => localStorage.getItem(key),
            setItem: async (key, raw) => {
                if (++active > 1) window.saveTrace.overlap = true;
                await new Promise(resolve => setTimeout(resolve, 30));
                localStorage.setItem(key, raw);
                window.saveTrace.writes.push(key);
                active--;
            },
            onFlush: handler => { window.flushDesktopSave = handler; },
        };
    });
    await page.goto('/'); await stock(page);
    await page.locator('#open').click(); await page.locator('#skip').click();
    await expect(page.locator('#app')).toHaveAttribute('data-phase', 'results');
    await page.locator('#next').click();
    await page.evaluate(() => window.flushDesktopSave());
    const latest = JSON.parse(await saved(page));
    expect(latest.state.day).toBe(2);
    expect(latest.state.phase).toBe('preparation');
    expect(latest.history).toHaveLength(1);
    const trace = await page.evaluate(() => window.saveTrace);
    expect(trace.overlap).toBe(false);
    expect(trace.writes.length).toBeGreaterThan(2);
    await page.reload();
    await expect(page.locator('#day')).toHaveText('02');
});
