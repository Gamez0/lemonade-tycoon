const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');
const executable = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== 'win32' || !executable || !fs.existsSync(executable)) throw Error('Set LEMONADE_DESKTOP_EXE to a Windows package.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-language-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
delete env.ELECTRON_RUN_AS_NODE;
const save = path.join(base, 'Lemonade Tycoon', 'save.json');
const output = path.resolve('test-results/desktop-language'); fs.mkdirSync(output, { recursive: true });
let app;
const observations = [], requests = [];
async function launch(scale) {
    app = await electron.launch({ executablePath: path.resolve(executable), env,
        args: profileArgs(base, ['--force-device-scale-factor=' + scale]) });
    const page = await app.firstWindow();
    page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    await verifyProfile(app, base);
    return page;
}
async function close() {
    const closed = app.waitForEvent('close');
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
    await closed; app = null;
}
(async () => {
    try {
        let page = await launch(1);
        const before = fs.readFileSync(save, 'utf8');
        await page.locator('#help-open').click(); await page.locator('#language').selectOption('ko');
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => window.desktopApp.setLanguage('ko'));
        await page.locator('#help-close').click();
        assert.equal(fs.readFileSync(save, 'utf8'), before);
        await expect(page.locator('#panel-title')).toHaveText('레시피');
        assert.equal(JSON.parse(fs.readFileSync(path.join(base, 'Chromium', 'language.json'), 'utf8')).language, 'ko');
        await close();
        for (const scale of [1, 1.25, 1.5, 1.75, 2]) {
            page = await launch(scale);
            await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
            await page.evaluate(() => document.fonts.ready);
            assert.equal(await page.evaluate(() => document.fonts.check('13px "Tycoon Korean"', '한글 레시피')), true);
            await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setMinimumSize(0, 0));
            for (const [width, height] of [[800, 600], [512, 350]]) {
                await app.evaluate(({ BrowserWindow }, [width, height]) => BrowserWindow.getAllWindows()[0].setContentSize(width, height), [width, height]);
                await page.waitForTimeout(150);
                for (const tab of ['recipe', 'marketing', 'supplies', 'rent', 'upgrades', 'staff', 'results']) {
                    await page.locator('[data-page=' + tab + ']').click();
                    const fits = await page.evaluate(() => {
                        const panel = document.querySelector('.panel').getBoundingClientRect();
                        const button = document.querySelector('#open').getBoundingClientRect();
                        return document.documentElement.scrollWidth <= innerWidth && button.bottom <= panel.bottom + 1 && button.right <= panel.right + 1;
                    });
                    assert(fits, 'Korean controls overflow: ' + [scale, width, height, tab].join('/'));
                    observations.push({ scale, width, height, tab, fits });
                }
            }
            if (scale === 1) await page.screenshot({ path: path.join(output, 'korean-small.png') });
            await close();
        }
        page = await launch(1);
        const fixture = require('./fixtures/alpha21-v12-supplies.json').cases[0];
        await page.locator('#save-file').setInputFiles({ name: 'actual-v12.json', mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify(fixture.document)) });
        await expect(page.locator('#save-status')).toContainText('가져온');
        await page.locator('#open').click(); await page.locator('#skip').click();
        await expect.poll(() => JSON.parse(fs.readFileSync(save, 'utf8')).state.business).toBe(null);
        assert.deepEqual(JSON.parse(fs.readFileSync(save, 'utf8')).history[0], fixture.expected);
        // Capture the actual native warning strings without showing a modal or discarding user data.
        await app.evaluate(({ dialog, ipcMain }) => {
            globalThis.languageWarnings = [];
            dialog.showMessageBox = async (_window, options) => {
                globalThis.languageWarnings.push(options);
                return { response: globalThis.languageWarnings.length === 1 ? 0 : 1 };
            };
            ipcMain.removeHandler('save:set');
            ipcMain.handle('save:set', () => { throw Error('Language storage test'); });
        });
        await page.locator('[data-page=marketing]').click();
        await page.locator('#price').fill('1.75'); await page.locator('#price').press('Tab');
        await expect(page.locator('#save-status')).toContainText('저장 공간');
        await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
        await expect.poll(() => app.evaluate(() => globalThis.languageWarnings.length)).toBe(1);
        const warning = await app.evaluate(() => globalThis.languageWarnings[0]);
        assert.equal(warning.title, '저장하지 못했어요');
        assert.deepEqual(warning.buttons, ['계속 플레이', '저장하지 않고 종료']);
        await close();
        assert.deepEqual(requests, []);
        fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ observations, requests,
            scope: 'Korean offline font, persisted UI/native language,70 scale/window/tab combinations, exact v12 replay and native save warning.' }, null, 2));
        console.log('Windows Korean: offline font, persisted language,70 layouts at100–200%, v12 replay and native warning PASS.');
    } finally {
        if (app) await app.close().catch(() => {});
        if (!path.resolve(base).startsWith(path.resolve(os.tmpdir()) + path.sep)) throw Error('Invalid language test cleanup path');
        fs.rmSync(base, { recursive: true, force: true });
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
