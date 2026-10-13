const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');

let stage = 'launch and preparation save';
const executablePath = process.env.LEMONADE_DESKTOP_EXE;
if (!executablePath || !fs.existsSync(executablePath)) throw new Error('Set LEMONADE_DESKTOP_EXE to the packaged game executable.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-desktop-test-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
delete env.ELECTRON_RUN_AS_NODE;
const savePath = path.join(base, 'Lemonade Tycoon', 'save.json');
const launch = async (target = executablePath) => {
    const app = await electron.launch({ executablePath: target, env, timeout: 60000, args: profileArgs(base) });
    const page = await app.firstWindow();
    await verifyProfile(app, base);
    await expect(page.locator('#app')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
    if (!await page.evaluate(() => Boolean(window.desktopSave))) throw new Error('Native save bridge is missing.');
    return { app, page };
};
const closeNormally = async session => {
    const closed = session.app.waitForEvent('close');
    await session.app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
    await closed;
};
(async () => {
    let session;
    try {
        session = await launch();
        await session.page.locator('[data-page="supplies"]').click();
        for (const item of ['lemon', 'sugar', 'ice', 'cup']) {
            await session.page.locator(`[data-supply="${item}"]`).click();
            await session.page.locator('[data-bundle="0"][data-delta="1"]').click();
        }
        await session.page.locator('#buy-order').click();
        await expect.poll(() => JSON.parse(fs.readFileSync(savePath, 'utf8')).state.stock.cup).toBeGreaterThan(0);
        const preparation = fs.readFileSync(savePath, 'utf8');
        stage = 'normal close freezes a delayed disk write against late UI events';
        await session.app.evaluate(({ ipcMain, BrowserWindow }, directory) => {
            const require = process.getBuiltinModule('module').createRequire(process.resourcesPath + '/app.asar/package.json');
            const path = require('node:path');
            const { createFileStorage } = require(path.join(process.resourcesPath, 'app.asar/src/desktop/file-storage.cjs'));
            const storage = createFileStorage(directory);
            ipcMain.removeHandler('save:set');
            ipcMain.handle('save:set', async (event, key, value) => {
                if (event.sender !== BrowserWindow.getAllWindows()[0].webContents) throw new Error('Unknown save caller.');
                await new Promise(resolve => setTimeout(resolve, 300));
                storage.setItem(key, value);
            });
        }, path.dirname(savePath));
        await session.page.locator('[data-page="recipe"]').click();
        await session.page.locator('#lemon').fill('3'); await session.page.locator('#lemon').press('Tab');
        const closedWithPendingSave = session.app.waitForEvent('close');
        await session.app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
        expect(await session.page.locator('#app').evaluate(app => app.inert)).toBe(true);
        await session.page.evaluate(() => {
            const input = document.querySelector('#lemon');
            input.value = '4'; input.dispatchEvent(new Event('change'));
        });
        await closedWithPendingSave; session = await launch();
        await expect(session.page.locator('#lemon')).toHaveValue('3');
        expect(JSON.parse(fs.readFileSync(savePath, 'utf8')).state.plan.recipe.lemon).toBe(3);
        // Restore this suite's baseline before testing its existing opening replay.
        await session.page.locator('#lemon').fill('2'); await session.page.locator('#lemon').press('Tab');
        await expect.poll(() => fs.readFileSync(savePath, 'utf8')).toBe(preparation);
        stage = 'failed disk close keeps playing, retries and explicitly discards';
        await session.app.evaluate(({ ipcMain, dialog, BrowserWindow }, directory) => {
            const require = process.getBuiltinModule('module').createRequire(process.resourcesPath + '/app.asar/package.json');
            const { createFileStorage } = require(process.resourcesPath + '/app.asar/src/desktop/file-storage.cjs');
            const storage = createFileStorage(directory);
            globalThis.closeFault = { fail: true, response: 0, dialogs: [] };
            dialog.showMessageBox = async (_window, options) => {
                globalThis.closeFault.dialogs.push(options);
                return { response: globalThis.closeFault.response };
            };
            ipcMain.removeHandler('save:set');
            ipcMain.handle('save:set', (event, key, value) => {
                if (event.sender !== BrowserWindow.getAllWindows()[0].webContents) throw new Error('Unknown save caller.');
                if (globalThis.closeFault.fail) throw new Error('Injected disk failure');
                storage.setItem(key, value);
            });
        }, path.dirname(savePath));
        await session.page.locator('#lemon').fill('3'); await session.page.locator('#lemon').press('Tab');
        await expect(session.page.locator('#save-status')).toContainText('Storage unavailable');
        await session.app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
        await expect.poll(() => session.app.evaluate(() => globalThis.closeFault.dialogs.length)).toBe(1);
        await expect.poll(() => session.page.locator('#app').evaluate(app => app.inert)).toBe(false);
        await expect(session.page.locator('#lemon')).toHaveValue('3');
        expect(fs.readFileSync(savePath, 'utf8')).toBe(preparation);
        const warning = await session.app.evaluate(() => globalThis.closeFault.dialogs[0]);
        expect(warning.defaultId).toBe(0); expect(warning.cancelId).toBe(0);
        expect(warning.buttons).toEqual(['Keep playing', 'Close without saving']);
        await session.app.evaluate(() => { globalThis.closeFault.fail = false; });
        await closeNormally(session); session = await launch();
        await expect(session.page.locator('#lemon')).toHaveValue('3');
        const durableRecipe = fs.readFileSync(savePath, 'utf8');
        await session.app.evaluate(({ ipcMain, dialog }) => {
            ipcMain.removeHandler('save:set');
            ipcMain.handle('save:set', () => { throw new Error('Injected disk failure'); });
            dialog.showMessageBox = async () => ({ response: 1 });
        });
        await session.page.locator('#lemon').fill('4'); await session.page.locator('#lemon').press('Tab');
        await expect(session.page.locator('#save-status')).toContainText('Storage unavailable');
        await closeNormally(session); session = await launch();
        await expect(session.page.locator('#lemon')).toHaveValue('3');
        expect(fs.readFileSync(savePath, 'utf8')).toBe(durableRecipe);
        await session.page.locator('#lemon').fill('2'); await session.page.locator('#lemon').press('Tab');
        await expect.poll(() => fs.readFileSync(savePath, 'utf8')).toBe(preparation);
        stage = 'close timeout keeps playing and ignores its late acknowledgement';
        await session.app.evaluate(({ ipcMain, dialog, BrowserWindow }, directory) => {
            const require = process.getBuiltinModule('module').createRequire(process.resourcesPath + '/app.asar/package.json');
            const { createFileStorage } = require(process.resourcesPath + '/app.asar/src/desktop/file-storage.cjs');
            const storage = createFileStorage(directory);
            globalThis.closeTimeout = { dialogs: 0, release: null, hold: true };
            dialog.showMessageBox = async () => { globalThis.closeTimeout.dialogs++; return { response: 0 }; };
            ipcMain.removeHandler('save:set');
            ipcMain.handle('save:set', async (event, key, value) => {
                if (event.sender !== BrowserWindow.getAllWindows()[0].webContents) throw new Error('Unknown save caller.');
                if (globalThis.closeTimeout.hold) await new Promise(resolve => { globalThis.closeTimeout.release = resolve; });
                storage.setItem(key, value);
            });
        }, path.dirname(savePath));
        await session.page.locator('#lemon').fill('3'); await session.page.locator('#lemon').press('Tab');
        await expect.poll(() => session.app.evaluate(() => typeof globalThis.closeTimeout.release)).toBe('function');
        await session.app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
        await expect.poll(() => session.app.evaluate(() => globalThis.closeTimeout.dialogs), { timeout: 10000 }).toBe(1);
        await expect.poll(() => session.page.locator('#app').evaluate(app => app.inert)).toBe(false);
        await session.app.evaluate(() => { globalThis.closeTimeout.hold = false; globalThis.closeTimeout.release(); });
        await expect.poll(() => JSON.parse(fs.readFileSync(savePath, 'utf8')).state.plan.recipe.lemon).toBe(3);
        await session.page.waitForTimeout(300);
        expect(await session.app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().length)).toBe(1);
        await closeNormally(session); session = await launch();
        await expect(session.page.locator('#lemon')).toHaveValue('3');
        await session.page.locator('#lemon').fill('2'); await session.page.locator('#lemon').press('Tab');
        await expect.poll(() => fs.readFileSync(savePath, 'utf8')).toBe(preparation);
        await closeNormally(session); session = await launch();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'preparation');
        if (fs.readFileSync(savePath, 'utf8') !== preparation) throw new Error('Preparation changed on relaunch.');
        await session.page.locator('#open').click();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'selling');
        await expect.poll(() => JSON.parse(fs.readFileSync(savePath, 'utf8')).state.business?.paid).toBe(true);
        const opening = JSON.parse(fs.readFileSync(savePath, 'utf8'));
        const prepared = JSON.parse(preparation);
        const { openDay } = require('../.test-build/simulation/game.js');
        expect(opening.state).toEqual({ ...openDay(prepared.state), phase: 'preparation' });
        expect(opening.state.pitcherCups).toBe(12);
        expect(opening.state.daily.pitchersMade).toBe(1);
        stage = 'normal selling close preserves the paid opening';
        await closeNormally(session); session = await launch();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'preparation');
        expect(JSON.parse(fs.readFileSync(savePath, 'utf8'))).toEqual(opening);
        await session.page.locator('#open').click();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'selling');
        await expect.poll(() => JSON.parse(fs.readFileSync(savePath, 'utf8'))).toEqual(opening);
        stage = 'forced selling termination';
        execFileSync('taskkill', ['/PID', String(session.app.process().pid), '/T', '/F']);
        session = await launch();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'preparation');
        expect(JSON.parse(fs.readFileSync(savePath, 'utf8'))).toEqual(opening);
        await session.page.locator('#open').click();
        await session.page.locator('#skip').click();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'results');
        await expect.poll(() => JSON.parse(fs.readFileSync(savePath, 'utf8')).state.phase).toBe('results');
        stage = 'results export and invalid import';
        const results = fs.readFileSync(savePath, 'utf8');
        // Exercise the native download, without assuming browser download events.
        const exportedPath = path.join(base, 'exported-business.json');
        await session.app.evaluate(({ BrowserWindow }, output) => {
            BrowserWindow.getAllWindows()[0].webContents.session.once('will-download', (_event, item) => {
                item.setSavePath(output);
            });
        }, exportedPath);
        await session.page.locator('#export-save').click();
        await expect.poll(() => {
            try { return JSON.parse(fs.readFileSync(exportedPath, 'utf8')); }
            catch { return null; }
        }).toEqual(JSON.parse(results));
        // Playwright deletes tracked downloads when the Electron context closes.
        // Retain the actual exported bytes for import after the relaunch checks.
        const exportedDocument = fs.readFileSync(exportedPath);
        await session.page.locator('#save-file').setInputFiles({ name: 'invalid.json',
            mimeType: 'application/json', buffer: Buffer.from('{') });
        await expect(session.page.locator('#save-status')).toContainText('not valid JSON');
        if (fs.readFileSync(savePath, 'utf8') !== results) throw new Error('Invalid import replaced results.');
        await closeNormally(session); session = await launch();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'results');
        if (fs.readFileSync(savePath, 'utf8') !== results) throw new Error('Results changed on relaunch.');
        stage = 'next-day immediate close and flush';
        // Close immediately after a new checkpoint: exercise the renderer flush handshake.
        await session.page.locator('#next').click();
        await closeNormally(session); session = await launch();
        await expect(session.page.locator('#day')).toHaveText('02');
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'preparation');
        await closeNormally(session); session = null;
        // A second installation directory must still use the same user-data root.
        // This simulates relocation, not an installer update or clean-PC acceptance.
        stage = 'normal close during delayed portable import';
        session = await launch();
        const importDocument = JSON.parse(fs.readFileSync(savePath, 'utf8'));
        importDocument.state.plan.price = 225;
        const importRaw = JSON.stringify(importDocument);
        await session.page.evaluate(() => {
            const read = File.prototype.text;
            File.prototype.text = async function () {
                await new Promise(resolve => setTimeout(resolve, 250));
                return read.call(this);
            };
        });
        await session.page.locator('#save-file').setInputFiles({ name: 'delayed.json', mimeType: 'application/json', buffer: Buffer.from(importRaw) });
        await closeNormally(session); session = await launch();
        await expect(session.page.locator('#price')).toHaveValue('2.25');
        expect(JSON.parse(fs.readFileSync(savePath, 'utf8'))).toEqual(importDocument);
        await closeNormally(session); session = null;
        stage = 'same-build installation relocation';
        const replacement = path.join(base, 'replacement-install');
        fs.cpSync(path.dirname(executablePath), replacement, { recursive: true });
        const beforeRelocation = fs.readFileSync(savePath, 'utf8');
        session = await launch(path.join(replacement, path.basename(executablePath)));
        await expect(session.page.locator('#day')).toHaveText('02');
        if (fs.readFileSync(savePath, 'utf8') !== beforeRelocation) throw new Error('Relocation changed the save.');
        await closeNormally(session); session = null;
        stage = 'newer-primary protection with an older valid backup';
        const backupBeforeFuture = fs.readFileSync(path.join(base, 'Lemonade Tycoon', 'save.backup.json'), 'utf8');
        const future = JSON.stringify({ ...JSON.parse(beforeRelocation), version: 999 });
        fs.writeFileSync(savePath, future);
        session = await launch();
        await expect(session.page.locator('#save-status')).toContainText('Unsupported save version');
        await session.page.locator('#lemon').fill('3'); await session.page.locator('#lemon').press('Tab');
        // Explicitly discard this session's edits while retaining the protected future files.
        await session.app.evaluate(({ dialog }) => { dialog.showMessageBox = async () => ({ response: 1 }); });
        await closeNormally(session); session = null;
        expect(fs.readFileSync(savePath, 'utf8')).toBe(future);
        expect(fs.readFileSync(path.join(base, 'Lemonade Tycoon', 'save.backup.json'), 'utf8')).toBe(backupBeforeFuture);
        fs.writeFileSync(savePath, beforeRelocation);
        stage = 'corrupt-primary backup recovery';
        const backup = JSON.parse(fs.readFileSync(path.join(base, 'Lemonade Tycoon', 'save.backup.json'), 'utf8'));
        fs.writeFileSync(savePath, '{', 'utf8');
        session = await launch();
        await expect(session.page.locator('#save-status')).toContainText('Recovered from backup');
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', backup.state.phase);
        await closeNormally(session); session = null;
        // Both damaged files stay protected even while the player buys and opens.
        stage = 'both-corrupt protection and portable import';
        const backupPath = path.join(base, 'Lemonade Tycoon', 'save.backup.json');
        fs.writeFileSync(savePath, '{'); fs.writeFileSync(backupPath, '{');
        session = await launch();
        await expect(session.page.locator('#save-status')).toContainText('not valid JSON');
        await session.page.locator('[data-page="supplies"]').click();
        for (const item of ['lemon', 'sugar', 'ice', 'cup']) {
            await session.page.locator(`[data-supply="${item}"]`).click();
            await session.page.locator('[data-bundle="0"][data-delta="1"]').click();
        }
        await session.page.locator('#buy-order').click();
        await session.page.locator('#open').click();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'selling');
        if (fs.readFileSync(savePath, 'utf8') !== '{' || fs.readFileSync(backupPath, 'utf8') !== '{')
            throw new Error('Playing erased damaged files.');
        await session.page.locator('#save-file').setInputFiles({ name: 'invalid.json',
            mimeType: 'application/json', buffer: Buffer.from('{') });
        await expect(session.page.locator('#save-status')).toContainText('not valid JSON');
        if (fs.readFileSync(savePath, 'utf8') !== '{' || fs.readFileSync(backupPath, 'utf8') !== '{')
            throw new Error('Invalid import erased damaged files.');
        await session.page.locator('#save-file').setInputFiles({ name: 'exported-business.json',
            mimeType: 'application/json', buffer: exportedDocument });
        await expect(session.page.locator('#save-status')).toContainText('Imported save');
        if (fs.readFileSync(savePath, 'utf8') !== results) throw new Error('Portable import changed the business.');
        await closeNormally(session); session = await launch();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'results');
        if (fs.readFileSync(savePath, 'utf8') !== results) throw new Error('Imported save changed on relaunch.');
        await closeNormally(session); session = null;
        process.stdout.write('Windows package: save, flush, forced exit, recovery, import/export and relocation passed.\n');
    } finally {
        if (session) await session.app.close().catch(() => {});
        fs.rmSync(base, { recursive: true, force: true });
    }
})().then(() => process.exit(0)).catch(error => {
    const detail = `${stage}: ${error.stack || error}`;
    process.stderr.write(`${detail}\n`);
    if (process.env.GITHUB_ACTIONS === 'true') {
        // Check annotations remain readable through the API even when log downloads are blocked.
        const escaped = detail.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
        process.stdout.write(`::error title=Windows packaged save failure::${escaped}\n`);
    }
    process.exit(1);
});
