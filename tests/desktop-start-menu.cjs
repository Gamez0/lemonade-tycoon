const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');
const executablePath = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== 'win32' || !executablePath) throw Error('Windows package required.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-main-menu-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') }; delete env.ELECTRON_RUN_AS_NODE;
const out = path.resolve(process.env.LEMONADE_MENU_EVIDENCE_ROOT || 'test-results/desktop-start-menu');
fs.mkdirSync(out, { recursive: true });
const read = file => JSON.parse(fs.readFileSync(path.join(base, 'Lemonade Tycoon', file), 'utf8'));
let app;
async function launch() {
    app = await electron.launch({ executablePath, env, args: profileArgs(base) });
    await verifyProfile(app, base, false);
    const page = await app.firstWindow(); await expect(page.locator('#menu-continue')).toBeEnabled({ timeout: 30000 });
    return page;
}
async function close() {
    const done = app.waitForEvent('close');
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
    await done; app = null;
}
(async () => {
    try {
        let page = await launch(); const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await expect(page.locator('[data-company]')).toHaveCount(8);
        for (const size of [[1280, 1000], [800, 600]]) {
            await app.evaluate(({ BrowserWindow }, size) => BrowserWindow.getAllWindows()[0].setContentSize(...size), size);
            await expect.poll(() => page.evaluate(() => [innerWidth, innerHeight])).toEqual(size);
            await page.screenshot({ path: path.join(out, `menu-${size[0]}.png`) });
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
        await page.locator('#menu-options').click(); await expect(page.locator('#display-settings')).toBeVisible();
        await page.keyboard.press('Escape');
        await page.locator('#menu-new').click(); await page.locator('#menu-name').fill('Windows Stand');
        await page.locator('#menu-create button[type=submit]').click(); await expect(page.locator('#start-menu')).toBeHidden();
        await page.locator('[data-page=marketing]').click(); await page.locator('#price').fill('1.75'); await page.locator('#price').press('Tab');
        await expect.poll(() => read('save.json').state.plan.price).toBe(175);
        await page.locator('#main-menu').click(); await expect(page.locator('#menu-continue')).toBeEnabled();
        await page.locator('[data-company="0"]').click(); await page.locator('#menu-continue').click();
        await expect.poll(() => read('save.json').state.plan.price).toBe(150);
        expect(JSON.parse(read('companies.json').companies[1].raw).state.plan.price).toBe(175);
        await close(); page = await launch();
        await expect(page.locator('[data-company="1"] .company-name')).toHaveText('Windows Stand');
        await page.locator('[data-company="1"]').click(); await page.locator('#menu-continue').click();
        await page.locator('[data-page=marketing]').click(); await expect(page.locator('#price')).toHaveValue('1.75');
        expect(read('save.json').mode).toBe('career');
        await page.locator('#main-menu').click(); await expect(page.locator('#menu-continue')).toBeEnabled();
        await page.locator('#menu-challenge').click(); await page.locator('#menu-name').fill('Windows Challenge');
        await page.locator('#menu-create button[type=submit]').click(); await expect(page.locator('#start-menu')).toBeHidden();
        expect(read('save.json').mode).toBe('challenge');
        await page.locator('#main-menu').click(); await expect(page.locator('#menu-continue')).toBeEnabled();
        await page.locator('[data-company="1"]').click(); await page.locator('#menu-continue').click();
        expect(read('save.json').mode).toBe('career');
        await page.locator('#main-menu').click(); await expect(page.locator('#menu-continue')).toBeEnabled();
        await page.screenshot({ path: path.join(out, 'saved-companies.png') });
        const closed = app.waitForEvent('close'); await page.locator('#menu-quit').click(); await closed; app = null;
        expect(read('save.json').state.plan.price).toBe(175); expect(read('companies.json').active).toBe(1);
        expect(errors).toEqual([]);
        const build = JSON.parse(fs.readFileSync(path.join(path.dirname(executablePath), 'build-info.json'), 'utf8'));
        fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ build, sizes: [[1280, 1000], [800, 600]],
            companies: 8, independentPlans: [150, 175], modes: ['career', 'challenge'], relaunch: true, nativeOptions: true, quitSaved: true, errors }, null, 2));
        console.log('Windows main menu: layouts/options/eight slots/create/switch/relaunch/normal quit PASS.');
    } finally { if (app) await app.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
