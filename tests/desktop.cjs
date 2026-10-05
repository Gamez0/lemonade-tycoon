const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const executablePath = process.env.LEMONADE_DESKTOP_EXE;
if (!executablePath || !fs.existsSync(executablePath)) throw new Error('Set LEMONADE_DESKTOP_EXE to the packaged game executable.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-desktop-test-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
delete env.ELECTRON_RUN_AS_NODE;
const savePath = path.join(base, 'Lemonade Tycoon', 'save.json');
const launch = async () => {
    const app = await electron.launch({ executablePath, env, timeout: 60000 });
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
        execFileSync('taskkill', ['/PID', String(session.app.process().pid), '/T', '/F']);
        session = await launch();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'preparation');
        await session.page.locator('#open').click();
        await session.page.locator('#skip').click();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'results');
        await expect.poll(() => JSON.parse(fs.readFileSync(savePath, 'utf8')).state.phase).toBe('results');
        const results = fs.readFileSync(savePath, 'utf8');
        await closeNormally(session); session = await launch();
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'results');
        if (fs.readFileSync(savePath, 'utf8') !== results) throw new Error('Results changed on relaunch.');
        // Close immediately after a new checkpoint: exercise the renderer flush handshake.
        await session.page.locator('#next').click();
        await closeNormally(session); session = await launch();
        await expect(session.page.locator('#day')).toHaveText('02');
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', 'preparation');
        await closeNormally(session); session = null;
        const backup = JSON.parse(fs.readFileSync(path.join(base, 'Lemonade Tycoon', 'save.backup.json'), 'utf8'));
        fs.writeFileSync(savePath, '{', 'utf8');
        session = await launch();
        await expect(session.page.locator('#save-status')).toContainText('Recovered from backup');
        await expect(session.page.locator('#app')).toHaveAttribute('data-phase', backup.state.phase);
        await closeNormally(session); session = null;
        process.stdout.write('Windows package: save, relaunch, forced exit and results recovery passed.\n');
    } finally {
        if (session) await session.app.close().catch(() => {});
        fs.rmSync(base, { recursive: true, force: true });
    }
})().then(() => process.exit(0)).catch(error => { process.stderr.write(`${error.stack || error}\n`); process.exit(1); });
