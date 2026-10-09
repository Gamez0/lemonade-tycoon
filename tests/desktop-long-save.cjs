const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');
const { campaign } = require('./helpers/business.cjs');
const { encodeSave, decodeSave } = require('../.test-build/simulation/save.js');
const { maxSaveBytes } = require('../src/desktop/save-limits.json');
const executable = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== 'win32' || !executable || !fs.existsSync(executable)) throw new Error('Set LEMONADE_DESKTOP_EXE to a Windows package.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-long-save-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') }; delete env.ELECTRON_RUN_AS_NODE;
const save = path.join(base, 'Lemonade Tycoon', 'save.json');
const output = path.resolve(process.env.LEMONADE_LONG_SAVE_EVIDENCE_ROOT || 'test-results/desktop-long-save');
fs.mkdirSync(output, { recursive: true });
const report = { build: JSON.parse(fs.readFileSync(path.join(path.dirname(executable), 'build-info.json'), 'utf8').replace(/^\uFEFF/, '')),
    scope: 'Generated legitimate1600-day history restored through actual packaged UI, not a1600-day human playtest.' };
let app;
async function launch() {
    app = await electron.launch({ executablePath: path.resolve(executable), env, args: profileArgs(base) });
    const page = await app.firstWindow(); await verifyProfile(app, base);
    await expect(page.locator('canvas')).toBeVisible(); return page;
}
async function close() {
    const closed = app.waitForEvent('close');
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
    await closed; app = null;
}
(async () => {
    try {
        const business = campaign(2026, 1600), raw = encodeSave(business.state, business.history);
        report.inputBytes = Buffer.byteLength(raw); report.days = business.history.length;
        assert.ok(report.inputBytes > 2_000_000 && report.inputBytes < maxSaveBytes);
        let page = await launch();
        await page.locator('#save-file').setInputFiles({ name: 'long-business.json', mimeType: 'application/json', buffer: Buffer.from(raw) });
        await expect(page.locator('#save-status')).toContainText(/Imported save|Save file is too large/);
        if ((await page.locator('#save-status').textContent()).includes('too large')) throw new Error('Legitimate1600-day export rejected by packaged import.');
        await expect.poll(() => decodeSave(fs.readFileSync(save, 'utf8')).history.length).toBe(1600);
        assert.deepEqual(decodeSave(fs.readFileSync(save, 'utf8')), decodeSave(raw));
        await close(); page = await launch();
        await expect(page.locator('#day')).toHaveText('1601');
        assert.deepEqual(decodeSave(fs.readFileSync(save, 'utf8')), decodeSave(raw));
        const exported = path.join(base, 'exported-long-business.json');
        await app.evaluate(({ BrowserWindow }, file) => {
            BrowserWindow.getAllWindows()[0].webContents.session.once('will-download', (_event, item) => item.setSavePath(file));
        }, exported);
        await page.locator('#export-save').click();
        await expect.poll(() => fs.existsSync(exported)).toBe(true);
        assert.deepEqual(decodeSave(fs.readFileSync(exported, 'utf8')), decodeSave(raw));
        // The imported next-day checkpoint correctly has melted overnight ice.
        // Replenish through the same UI before attempting the next business day.
        await page.locator('[data-page=supplies]').click();
        for (const item of ['lemon', 'sugar', 'ice', 'cup']) {
            await page.locator(`[data-supply=${item}]`).click();
            await page.locator('[data-bundle="0"][data-delta="1"]').click();
        }
        await page.locator('#buy-order').click();
        await page.locator('#open').click();
        await expect(page.locator('#app')).toHaveAttribute('data-phase', 'selling');
        await page.locator('#skip').click();
        await expect(page.locator('#app')).toHaveAttribute('data-phase', 'results');
        await expect.poll(() => decodeSave(fs.readFileSync(save, 'utf8')).history.length).toBe(1601);
        const done = fs.readFileSync(save, 'utf8');
        await page.locator('#save-file').setInputFiles({ name: 'oversized.json', mimeType: 'application/json', buffer: Buffer.alloc(maxSaveBytes + 1, 32) });
        await expect(page.locator('#save-status')).toContainText('Save file is too large');
        assert.equal(fs.readFileSync(save, 'utf8'), done);
        const failure = await page.evaluate(async limit => {
            try { await window.desktopSave.setItem('lemonade-tycoon.reboot.save', 'é'.repeat(Math.floor(limit / 2) + 1)); return 'accepted'; }
            catch (error) { return error.message; }
        }, maxSaveBytes);
        assert.match(failure, /Save file is too large/); assert.equal(fs.readFileSync(save, 'utf8'), done);
        await close(); page = await launch();
        await expect(page.locator('#app')).toHaveAttribute('data-phase', 'results');
        assert.deepEqual(decodeSave(fs.readFileSync(save, 'utf8')), decodeSave(done));
        report.result = 'PASS'; report.finalBytes = Buffer.byteLength(done);
        console.log('Windows long save:1600-day import/export/relaunch, day1601 continuation and oversized UTF8/file rejection without overwrite PASS.');
    } catch (error) { report.result = 'FAIL'; report.error = error.message; throw error; }
    finally {
        fs.writeFileSync(path.join(output, 'long-save-results.json'), JSON.stringify(report, null, 2));
        if (app) await app.close().catch(() => {});
        fs.rmSync(base, { recursive: true, force: true });
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
