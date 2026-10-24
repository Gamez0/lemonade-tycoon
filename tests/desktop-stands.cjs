const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { fundedStandBusiness } = require('./helpers/stand-business.cjs');
const { encodeSave } = require('../.test-build/simulation/save.js');
const { LOCATION_IDS } = require('../.test-build/content/locations.js');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');
const executablePath = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== 'win32' || !executablePath) throw Error('Windows package required.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-stand-tiers-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') }; delete env.ELECTRON_RUN_AS_NODE;
const out = path.resolve(process.env.LEMONADE_STAND_EVIDENCE_ROOT || 'test-results/desktop-stands');
fs.mkdirSync(out, { recursive: true });
const read = () => JSON.parse(fs.readFileSync(path.join(base, 'Lemonade Tycoon/save.json'), 'utf8'));
let app;
async function launch() {
    app = await electron.launch({ executablePath, env, args: profileArgs(base) });
    await verifyProfile(app, base); const page = await app.firstWindow();
    await expect(page.locator('canvas')).toBeVisible(); return page;
}
async function close() {
    const closed = app.waitForEvent('close');
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
    await closed; app = null;
}
(async () => {
    try {
        let page = await launch();
        for (const location of LOCATION_IDS) {
            const business = fundedStandBusiness(location);
            await page.locator('#save-file').setInputFiles({ name: 'stand-business.json', mimeType: 'application/json', buffer: Buffer.from(encodeSave(business.state, business.history)) });
            await expect.poll(() => read().state.cash).toBe(business.state.cash);
            await expect(page.locator('canvas')).toHaveAttribute('data-stand-texture', 'stand-0');
            await page.locator('[data-page=rent]').click();
            const background = await page.locator(`#thumbnail-${location}`).getAttribute('src');
            for (let level = 0; level <= 3; level++) {
                await page.locator('[data-page=upgrades]').click();
                if (level) {
                    const cash = read().state.cash;
                    await page.locator('[data-upgrade=stand]').click();
                    await expect.poll(() => read().state.management.upgrades.stand).toBe(level);
                    expect(read().state.cash).toBe(cash - [44999, 99999, 999999][level - 1]);
                }
                await expect(page.locator('canvas')).toHaveAttribute('data-stand-texture', `stand-${level}`);
                await page.locator('canvas').screenshot({ path: path.join(out, `${location}-${level}.png`) });
                await close(); page = await launch();
                await expect(page.locator('canvas')).toHaveAttribute('data-stand-level', String(level));
                expect(read().version).toBe(10);
                await page.locator('[data-page=rent]').click();
                expect(await page.locator(`#thumbnail-${location}`).getAttribute('src')).toBe(background);
            }
        }
        fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({ locations: LOCATION_IDS.length, tiers: 4,
            relaunches: LOCATION_IDS.length * 4, sameBackground: true, saveVersion: read().version }, null, 2));
        console.log('Windows stands: all40 map/tier combinations, exact charges, durable saves/relaunch and unchanged backgrounds PASS.');
    } finally { if (app) await app.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
