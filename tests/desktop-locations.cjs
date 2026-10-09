const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { campaign, stock } = require('./helpers/business.cjs');
const { openDay, reserveLocation } = require('../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../.test-build/simulation/street-day.js');
const { encodeSave } = require('../.test-build/simulation/save.js');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');
const executablePath = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== 'win32' || !executablePath || !fs.existsSync(executablePath))
    throw new Error('Set LEMONADE_DESKTOP_EXE to the Windows package.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-m5-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
delete env.ELECTRON_RUN_AS_NODE;
const primary = path.join(base, 'Lemonade Tycoon', 'save.json');
const read = () => JSON.parse(fs.readFileSync(primary, 'utf8'));
let app;
async function launch() {
    app = await electron.launch({ executablePath, env, args: profileArgs(base) });
    const page = await app.firstWindow();
    await verifyProfile(app, base);
    await expect(page.locator('canvas')).toBeVisible();
    return page;
}
async function close() {
    const done = app.waitForEvent('close');
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
    await done; app = null;
}
(async () => {
    try {
        let page = await launch();
        const initial = campaign(); initial.state = stock(initial.state);
        await page.locator('#save-file').setInputFiles({ name: 'web-business.json', mimeType: 'application/json',
            buffer: Buffer.from(encodeSave(initial.state, initial.history)) });
        await expect(page.locator('#save-status')).toContainText('Imported save');
        await page.locator('[data-page=rent]').click();
        await page.locator('button[data-location=downtown]').click();
        await page.locator('#confirm-rent').click();
        await close(); page = await launch();
        expect(read().state.pendingLocation).toBe('downtown');
        await page.locator('#open').click();
        await expect.poll(() => read().state.business?.paid).toBe(true);
        const checkpoint = read();
        expect(checkpoint.state.cash).toBe(initial.state.cash - 800);
        await expect(page.locator('#sold')).not.toHaveText('0');
        execFileSync('taskkill', ['/PID', String(app.process().pid), '/T', '/F']); app = null;
        page = await launch();
        expect(read()).toEqual(checkpoint);
        await expect(page.locator('#app')).toHaveAttribute('data-phase', 'preparation');
        await page.locator('#open').click(); await page.locator('#skip').click();
        await expect.poll(() => read().state.phase).toBe('results');
        const expected = finishStreetDay(beginStreetDay(openDay(reserveLocation(initial.state, 'downtown')))).day.game;
        expect(read().state).toEqual(expected);
        const results = read(); await close(); page = await launch(); expect(read()).toEqual(results);
        const exportPath = path.join(base, 'native-business.json');
        await app.evaluate(({ BrowserWindow }, output) => {
            BrowserWindow.getAllWindows()[0].webContents.session.once('will-download', (_event, item) => item.setSavePath(output));
        }, exportPath);
        await page.locator('#export-save').click();
        await expect.poll(() => {
            try { return JSON.parse(fs.readFileSync(exportPath, 'utf8')); } catch { return null; }
        }).toEqual(results);
        await page.locator('#next').click();
        await page.locator('[data-page=rent]').click(); await page.locator('button[data-location=neighborhood]').click();
        await page.locator('#confirm-rent').click();
        await page.locator('[data-page=recipe]').click(); await page.locator('#ice').fill('0'); await page.locator('#ice').press('Tab');
        await page.locator('#open').click();
        await expect.poll(() => read().state.location).toBe('neighborhood');
        expect(read().state.daily.rent).toBe(0); expect(read().state.daily.moveFee).toBe(0);
        await page.locator('#skip').click(); await expect.poll(() => read().state.phase).toBe('results');
        // Import an actual pre-M5 shape. History accounting must survive the format upgrade.
        const old = JSON.parse(JSON.stringify(campaign(2026, 1).history[0]));
        for (const key of ['location', 'pendingLocation', 'unlocked', 'locationStats', 'lifetimeRevenue', 'business']) delete old[key];
        delete old.daily.rent; delete old.daily.moveFee;
        await page.locator('#save-file').setInputFiles({ name: 'v2-business.json', mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify({ version: 2, state: old, history: [old] })) });
        await expect(page.locator('#save-status')).toContainText('Imported save');
        const migrated = read(); expect(migrated.version).toBe(5);
        expect(migrated.state.cash).toBe(old.cash); expect(migrated.state.daily.cost).toBe(old.daily.cost);
        await close(); page = await launch(); expect(read()).toEqual(migrated);
        await close();
        console.log('M5 Windows: reservation, paid replay after partial sale, exact results, export, free return and v2 migration passed.');
    } finally {
        if (app) await app.close().catch(() => {});
        if (!path.resolve(base).startsWith(path.resolve(os.tmpdir()) + path.sep)) throw new Error('Invalid test cleanup path.');
        fs.rmSync(base, { recursive: true, force: true });
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
