// Opt-in real Windows package evidence. All saves use a fresh isolated directory.
const { _electron: electron, chromium } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');

const oldExe = process.env.LEMONADE_OLD_EXE;
const newExe = process.env.LEMONADE_DESKTOP_EXE;
const output = process.env.LEMONADE_EVIDENCE_ROOT;
if (process.platform !== 'win32' || !oldExe || !newExe || !output)
    throw new Error('Windows, LEMONADE_OLD_EXE, LEMONADE_DESKTOP_EXE and LEMONADE_EVIDENCE_ROOT required.');
for (const exe of [oldExe, newExe]) assert.ok(fs.existsSync(exe), exe);
fs.mkdirSync(output, { recursive: true });
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-m4-device-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
delete env.ELECTRON_RUN_AS_NODE;
const savePath = path.join(base, 'Lemonade Tycoon', 'save.json');
const backupPath = path.join(base, 'Lemonade Tycoon', 'save.backup.json');
const key = 'lemonade-tycoon.reboot.save';
const report = { platform: process.platform, node: process.version, isolatedData: base,
    webURL: process.env.LEMONADE_WEB_URL || 'https://gamez0.github.io/lemonade-tycoon/', checks: [] };
const raw = () => fs.readFileSync(savePath, 'utf8');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const info = exe => JSON.parse(fs.readFileSync(path.join(path.dirname(exe), 'build-info.json'), 'utf8').replace(/^\uFEFF/, ''));
report.oldBuild = info(oldExe); report.newBuild = info(newExe);
assert.notEqual(report.oldBuild.source_commit, report.newBuild.source_commit);
assert.notEqual(hash(path.join(path.dirname(oldExe), 'resources/app.asar')), hash(path.join(path.dirname(newExe), 'resources/app.asar')));
let session, browser;
async function launch(exe = newExe) {
    const app = await electron.launch({ executablePath: exe, env, timeout: 60000 });
    session = { app, page: await app.firstWindow() };
    await expect(session.page.locator('canvas')).toBeVisible();
    return session;
}
async function close() {
    const closed = session.app.waitForEvent('close');
    await session.app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
    await closed; session = null;
}
async function stock(page) {
    await page.locator('[data-page="supplies"]').click();
    for (const item of ['lemon', 'sugar', 'ice', 'cup']) {
        await page.locator(`[data-supply="${item}"]`).click();
        await page.locator('[data-bundle="0"][data-delta="1"]').click();
    }
    await page.locator('#buy-order').click();
}
async function nativeExport(name) {
    const target = path.resolve(output, name);
    await session.app.evaluate(({ BrowserWindow }, target) => {
        BrowserWindow.getAllWindows()[0].webContents.session.once('will-download', (_event, item) => item.setSavePath(target));
    }, target);
    await session.page.locator('#export-save').click();
    await expect.poll(() => { try { return JSON.parse(fs.readFileSync(target, 'utf8')); } catch { return null; } }).toEqual(JSON.parse(raw()));
    return fs.readFileSync(target);
}
async function check(name, action) {
    try { await action(); report.checks.push({ name, result: 'PASS' }); console.log(`PASS ${name}`); }
    catch (error) {
        report.checks.push({ name, result: 'FAIL', detail: error.stack });
        console.error(`FAIL ${name}: ${error.message}`); process.exitCode = 1;
        if (session) { await session.app.close().catch(() => {}); session = null; }
        if (browser) { await browser.close().catch(() => {}); browser = null; }
    }
    finally { fs.writeFileSync(path.join(output, 'device-results.json'), JSON.stringify(report, null, 2) + '\n'); }
}
(async () => {
    try {
        await check('different-source package replacement and fresh extraction', async () => {
            await launch(oldExe); await stock(session.page);
            await session.page.locator('#open').click(); await session.page.locator('#skip').click();
            await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'results');
            await expect.poll(() => JSON.parse(raw()).state.phase).toBe('results');
            const previous = raw(); fs.writeFileSync(path.join(output, 'old-version-results.json'), previous);
            await close(); await launch(newExe); assert.equal(raw(), previous);
            const exported = await nativeExport('updated-results.json');
            assert.deepEqual(JSON.parse(exported), JSON.parse(previous));
            await close(); fs.writeFileSync(path.join(output, 'updated-results.json'), exported);
            // An unpacked prototype has no installer. Removing only a disposable install
            // then re-extracting establishes the distribution's supported reinstall method.
            const installed = path.join(base, 'disposable-install');
            fs.cpSync(path.dirname(newExe), installed, { recursive: true });
            await launch(path.join(installed, path.basename(newExe))); assert.equal(raw(), previous); await close();
            assert.ok(path.resolve(installed).startsWith(path.resolve(base) + path.sep));
            fs.rmSync(installed, { recursive: true });
            assert.equal(raw(), previous);
            fs.cpSync(path.dirname(newExe), installed, { recursive: true });
            await launch(path.join(installed, path.basename(newExe))); assert.equal(raw(), previous); await close();
            assert.ok(!fs.existsSync(path.join(installed, 'save.json')));
        });
        await check('interrupted partially sold day replays once from exact opening checkpoint', async () => {
            await launch(); await session.page.locator('#next').click(); await stock(session.page);
            await expect.poll(() => JSON.parse(raw()).state.day).toBe(2);
            const opening = raw(); fs.writeFileSync(path.join(output, 'opening-checkpoint.json'), opening);
            await session.page.locator('#open').click();
            await session.page.locator('#speed').click();
            await expect.poll(async () => Number(await session.page.locator('#sold').textContent()), { timeout: 60000 }).toBeGreaterThan(0);
            await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'selling');
            assert.equal(raw(), opening);
            await session.page.locator('#skip').click();
            await expect.poll(() => JSON.parse(raw()).state.phase).toBe('results');
            const uninterrupted = raw();
            await session.page.locator('#save-file').setInputFiles({ name: 'opening.json', mimeType: 'application/json', buffer: Buffer.from(opening) });
            await expect(session.page.locator('#save-status')).toContainText('Imported save');
            await session.page.locator('#open').click(); await session.page.locator('#speed').click();
            await expect.poll(async () => Number(await session.page.locator('#sold').textContent()), { timeout: 60000 }).toBeGreaterThan(0);
            await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'selling');
            report.soldBeforeForcedExit = Number(await session.page.locator('#sold').textContent());
            await session.page.screenshot({ path: path.join(output, 'before-forced-exit.png') });
            assert.equal(raw(), opening);
            execFileSync('taskkill', ['/PID', String(session.app.process().pid), '/T', '/F']); session = null;
            await launch(); await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'preparation');
            assert.equal(raw(), opening);
            await session.page.locator('#open').click(); await session.page.locator('#skip').click();
            await expect.poll(() => JSON.parse(raw()).state.phase).toBe('results');
            assert.deepEqual(JSON.parse(raw()), JSON.parse(uninterrupted));
            fs.writeFileSync(path.join(output, 'replayed-results.json'), raw()); await close();
        });
        await check('unsupported import, primary recovery and both-corrupt restart cancellation', async () => {
            await launch(); const primary = raw(), backup = fs.readFileSync(backupPath, 'utf8');
            await session.page.locator('#save-file').setInputFiles({ name: 'future.json', mimeType: 'application/json', buffer: Buffer.from('{"version":999}') });
            await expect(session.page.locator('#save-status')).toContainText('Unsupported save version');
            assert.equal(raw(), primary); assert.equal(fs.readFileSync(backupPath, 'utf8'), backup); await close();
            fs.writeFileSync(savePath, '{'); await launch();
            await expect(session.page.locator('#save-status')).toContainText('Recovered from backup');
            assert.deepEqual(JSON.parse(raw()), JSON.parse(backup)); await close();
            fs.writeFileSync(savePath, '{'); fs.writeFileSync(backupPath, '{'); await launch();
            await expect(session.page.locator('#save-status')).toContainText('not valid JSON');
            await session.page.locator('#restart').click(); await session.page.locator('#restart').press('Escape');
            await close(); assert.equal(raw(), '{'); assert.equal(fs.readFileSync(backupPath, 'utf8'), '{');
        });
        await check('actual published web to Windows and Windows to isolated Edge profile', async () => {
            browser = await chromium.launch({ channel: 'msedge', headless: true });
            const context = await browser.newContext({ acceptDownloads: true });
            const page = await context.newPage(); await page.goto(report.webURL);
            await expect(page.locator('canvas')).toBeVisible();
            await stock(page); await page.locator('#open').click(); await page.locator('#skip').click();
            await expect(page.locator('#app')).toHaveAttribute('data-phase', 'results');
            const portable = await page.evaluate(key => localStorage.getItem(key), key);
            const pending = page.waitForEvent('download'); await page.locator('#export-save').click();
            const download = await pending; const target = path.join(output, 'web-export.json'); await download.saveAs(target);
            assert.deepEqual(JSON.parse(fs.readFileSync(target)), JSON.parse(portable));
            await launch(); await session.page.locator('#save-file').setInputFiles(target);
            await expect(session.page.locator('#save-status')).toContainText('Imported save');
            assert.deepEqual(JSON.parse(raw()), JSON.parse(portable)); await close(); await launch();
            assert.deepEqual(JSON.parse(raw()), JSON.parse(portable));
            await session.page.locator('#next').click(); await expect.poll(() => JSON.parse(raw()).state.day).toBe(2);
            const native = await nativeExport('native-export.json'); await close();
            fs.writeFileSync(path.join(output, 'native-export.json'), native);
            const separate = await browser.newContext(); const destination = await separate.newPage();
            await destination.goto(report.webURL); await destination.locator('#save-file').setInputFiles({ name: 'native.json', mimeType: 'application/json', buffer: native });
            await expect(destination.locator('#save-status')).toContainText('Imported save');
            assert.deepEqual(JSON.parse(await destination.evaluate(key => localStorage.getItem(key), key)), JSON.parse(native));
            await destination.reload(); assert.deepEqual(JSON.parse(await destination.evaluate(key => localStorage.getItem(key), key)), JSON.parse(native));
            await browser.close(); browser = null;
        });
        await check('bundled file launch and complete loop with renderer network disabled', async () => {
            await launch(); await session.page.context().setOffline(true);
            await session.page.reload(); await expect(session.page.locator('canvas')).toBeVisible();
            assert.ok(session.page.url().startsWith('file:'));
            await stock(session.page); await session.page.locator('#open').click(); await session.page.locator('#skip').click();
            await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'results'); await close();
        });
    } finally {
        if (session) await session.app.close().catch(() => {});
        if (browser) await browser.close().catch(() => {});
        // Preserve only test evidence/data for investigation. Never delete user data.
        fs.writeFileSync(path.join(output, 'device-results.json'), JSON.stringify(report, null, 2) + '\n');
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
