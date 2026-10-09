const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { observeAudio, verifyRecovery } = require('./helpers/audio-recovery.cjs');
const executable = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== 'win32' || !executable || !fs.existsSync(executable)) throw new Error('Set LEMONADE_DESKTOP_EXE to a Windows package.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-audio-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
delete env.ELECTRON_RUN_AS_NODE;
let app;
(async () => {
    try {
        app = await electron.launch({ executablePath: path.resolve(executable), env });
        const page = await app.firstWindow();
        await page.addInitScript(observeAudio); await page.reload();
        await expect(page.locator('canvas')).toBeVisible();
        await verifyRecovery(page);
        console.log('Windows audio: actual context suspension/focus recovery and mute/unmute PASS.');
    } finally {
        if (app) await app.close().catch(() => {});
        fs.rmSync(base, { recursive: true, force: true });
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
