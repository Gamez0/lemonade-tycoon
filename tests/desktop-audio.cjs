const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { observeAudio, verifyRecovery } = require('./helpers/audio-recovery.cjs');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');
const executable = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== 'win32' || !executable || !fs.existsSync(executable)) throw new Error('Set LEMONADE_DESKTOP_EXE to a Windows package.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-audio-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
delete env.ELECTRON_RUN_AS_NODE;
let app;
(async () => {
    try {
        app = await electron.launch({ executablePath: path.resolve(executable), env, args: profileArgs(base) });
        const page = await app.firstWindow();
        await page.addInitScript(observeAudio); await page.reload();
        await expect(page.locator('canvas')).toBeVisible();
        await verifyProfile(app, base);
        await app.evaluate(({ BrowserWindow }) => {
            const window = BrowserWindow.getAllWindows()[0]; window.show(); window.focus();
        });
        await expect.poll(() => page.evaluate(() => document.hasFocus())).toBe(true);
        try { await verifyRecovery(page); }
        catch (error) {
            console.error(await page.evaluate(() => ({ focused: document.hasFocus(), hidden: document.hidden,
                contexts: window.__audioProbe.contexts.map(context => context.state), tones: window.__audioProbe.tones,
                settings: localStorage.getItem('willow-lane.audio.v1') })));
            throw error;
        }
        console.log('Windows audio: actual context suspension/focus recovery and mute/unmute PASS.');
    } finally {
        if (app) await app.close().catch(() => {});
        fs.rmSync(base, { recursive: true, force: true });
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
