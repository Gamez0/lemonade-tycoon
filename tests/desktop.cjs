const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

let stage = 'launch and preparation save';
const executablePath = process.env.LEMONADE_DESKTOP_EXE;
if (!executablePath || !fs.existsSync(executablePath)) throw new Error('Set LEMONADE_DESKTOP_EXE to the packaged game executable.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-desktop-test-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
delete env.ELECTRON_RUN_AS_NODE;
const savePath = path.join(base, 'Lemonade Tycoon', 'save.json');
const launch = async (target = executablePath) => {
    const app = await electron.launch({ executablePath: target, env, timeout: 60000 });
    const page = await app.firstWindow();
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
        await closeNormally(session); session = await launch();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'preparation');
        if (fs.readFileSync(savePath, 'utf8') !== preparation) throw new Error('Preparation changed on relaunch.');
        await session.page.locator('#open').click();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'selling');
        await expect.poll(() => fs.readFileSync(savePath, 'utf8')).toBe(preparation);
        stage = 'forced selling termination';
        execFileSync('taskkill', ['/PID', String(session.app.process().pid), '/T', '/F']);
        session = await launch();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'preparation');
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
        stage = 'same-build installation relocation';
        const replacement = path.join(base, 'replacement-install');
        fs.cpSync(path.dirname(executablePath), replacement, { recursive: true });
        const beforeRelocation = fs.readFileSync(savePath, 'utf8');
        session = await launch(path.join(replacement, path.basename(executablePath)));
        await expect(session.page.locator('#day')).toHaveText('02');
        if (fs.readFileSync(savePath, 'utf8') !== beforeRelocation) throw new Error('Relocation changed the save.');
        await closeNormally(session); session = null;
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
        await session.page.locator('#save-file').setInputFiles(exportedPath);
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
