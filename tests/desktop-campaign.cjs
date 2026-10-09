const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert/strict');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');
const executable = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== 'win32' || !executable || !fs.existsSync(executable)) throw new Error('Set LEMONADE_DESKTOP_EXE to a Windows package.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-campaign-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') }; delete env.ELECTRON_RUN_AS_NODE;
const save = path.join(base, 'Lemonade Tycoon', 'save.json');
const out = path.resolve(process.env.LEMONADE_CAMPAIGN_EVIDENCE_ROOT || 'test-results/desktop-campaign');
fs.mkdirSync(out, { recursive: true });
const read = () => { try { return JSON.parse(fs.readFileSync(save, 'utf8')); } catch { return null; } };
const report = { build: JSON.parse(fs.readFileSync(path.join(path.dirname(executable), 'build-info.json'), 'utf8').replace(/^\uFEFF/, '')),
    scope: 'Thirty business days through actual UI; not thirty real days or human playtest acceptance.', days: [] };
let app, stage = 'new business';
async function launch() {
    app = await electron.launch({ executablePath: path.resolve(executable), env, args: profileArgs(base) });
    const page = await app.firstWindow(); await verifyProfile(app, base);
    await expect(page.locator('canvas')).toBeVisible();
    return page;
}
async function close() {
    const closed = app.waitForEvent('close');
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
    await closed; app = null;
}
async function change(page, id, value) { await page.locator(`#${id}`).fill(String(value)); await page.locator(`#${id}`).press('Tab'); }
(async () => {
    try {
        let page = await launch();
        await expect(page.locator('#cash')).toHaveText('$40.00');
        await page.locator('#help-open').click(); await page.locator('#mute-audio').check(); await page.locator('#help-close').click();
        for (let day = 1; day <= 30; day++) {
            stage = `day${day} preparation`;
            await page.locator('[data-page=marketing]').click();
            await change(page, 'price', day > 20 ? '2.75' : '1.75');
            await expect.poll(() => read()?.state.plan.price).toBe(day > 20 ? 275 : 175);
            const weather = read().state.weather.temperature;
            await page.locator('[data-page=recipe]').click();
            await change(page, 'ice', weather >= 30 ? 4 : weather >= 25 ? 3 : weather >= 21 ? 2 : 1);
            await page.locator('[data-page=supplies]').click();
            for (const [item, target, bundle] of [['lemon', 40, 40], ['sugar', 20, 20], ['ice', 320, 60], ['cup', 80, 20]]) {
                const count = Math.max(0, Math.ceil((target - read().state.stock[item]) / bundle));
                if (!count) continue;
                await page.locator(`[data-supply=${item}]`).click();
                for (let i = 0; i < count; i++) await page.locator('[data-bundle="0"][data-delta="1"]').click();
            }
            if (await page.locator('#buy-order').isEnabled()) await page.locator('#buy-order').click();
            await expect.poll(() => read()?.state.stock.cup).toBeGreaterThanOrEqual(80);
            const upgrades = { 4: 'iceMaker', 6: 'refrigerator', 8: 'blender', 12: 'iceMaker', 14: 'refrigerator', 16: 'blender' };
            if (upgrades[day]) {
                await page.locator('[data-page=upgrades]').click();
                await page.locator(`[data-upgrade=${upgrades[day]}]`).click();
                await expect.poll(() => read()?.state.management.upgrades[upgrades[day]]).toBe(day < 12 ? 1 : 2);
            }
            await page.locator('[data-page=staff]').click();
            await page.locator(`[data-staff=${day >= 21 ? 'server' : day >= 11 ? 'host' : 'none'}]`).click();
            await page.locator('[data-page=marketing]').click();
            await page.locator(`[data-advertising=${day >= 21 ? 'radio' : day >= 11 ? 'flyers' : 'none'}]`).click();
            const location = day >= 21 ? 'downtown' : day >= 11 ? 'park' : 'neighborhood';
            if (day === 11 || day === 21) {
                assert.ok(read().state.unlocked.includes(location), `Expected earned ${location} unlock`);
                await page.locator('[data-page=rent]').click();
                await page.locator(`[data-location=${location}]`).click(); await page.locator('#confirm-rent').click();
            }
            stage = `day${day} opening/results`;
            await page.locator('#open').click(); await expect(page.locator('#selling')).toBeVisible();
            await expect.poll(() => read()?.state.business?.paid).toBe(true);
            const paid = read();
            assert.equal(paid.state.location, location);
            await page.locator('#skip').click(); await expect(page.locator('#results')).toBeVisible();
            await expect.poll(() => read()?.history.length).toBe(day);
            const done = read(), d = done.state.daily;
            assert.equal(done.state.cash, paid.state.cash + d.revenue);
            const sum = field => done.history.reduce((total, entry) => total + entry.daily[field], 0);
            assert.equal(done.state.cash, 4000 + sum('revenue') - sum('purchases') - sum('capital') - sum('rent') - sum('moveFee') - sum('wages') - sum('advertising'));
            assert.equal(done.state.lifetimeRevenue, sum('revenue'));
            assert.equal(done.state.day, day); assert.equal(done.version, 5);
            const size = fs.statSync(save).size; assert.ok(size < 2_000_000, 'Save exceeds native IPC limit');
            report.days.push({ day, location, cash: done.state.cash, sold: d.sold, freeIceUsed: d.freeIceUsed, saveBytes: size });
            if (day % 5 === 0) {
                await close(); page = await launch(); assert.deepEqual(read(), done);
                await expect(page.locator('#app')).toHaveAttribute('data-phase', 'results');
            }
            if (day < 30) { await page.locator('#next').click(); await expect.poll(() => read()?.state.day).toBe(day + 1); }
            console.log(`PASS native campaign day${day} ${location}`);
        }
        const final = read();
        assert.deepEqual(final.state.management.upgrades, { refrigerator: 2, iceMaker: 2, blender: 2 });
        assert.ok(report.days.some(day => day.freeIceUsed > 0));
        await page.locator('[data-report=ledger]').click();
        await expect(page.locator('#result-intro')).toContainText('30 completed days');
        await page.screenshot({ path: path.join(out, 'thirty-day-ledger.png') });
        report.result = 'PASS'; console.log('Windows campaign:30 actual UI days, all locations/upgrades, cash ledger/free ice and six save/relaunch cycles PASS.');
    } catch (error) {
        report.result = 'FAIL'; report.stage = stage; report.error = error.message; throw error;
    } finally {
        fs.writeFileSync(path.join(out, 'campaign-results.json'), JSON.stringify(report, null, 2));
        if (app) await app.close().catch(() => {});
        fs.rmSync(base, { recursive: true, force: true });
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
