// Real packaged gameplay, separate from the controlled renderer pose fixture.
const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const crypto = require('node:crypto');
const { fundedStandBusiness } = require('./helpers/stand-business.cjs');
const { encodeSave } = require('../.test-build/simulation/save.js');
const { LOCATION_IDS } = require('../.test-build/content/locations.js');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');
const executablePath = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== 'win32' || !executablePath) throw Error('Windows package required.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-customers-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
delete env.ELECTRON_RUN_AS_NODE;
const out = path.resolve(process.env.LEMONADE_CUSTOMER_NATIVE_ROOT || 'test-results/desktop-customers');
fs.mkdirSync(out, { recursive: true });
const errors = [], records = [];
let app;
(async () => {
    try {
        app = await electron.launch({ executablePath, env, args: profileArgs(base) });
        await verifyProfile(app, base);
        const page = await app.firstWindow();
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        const canvas = page.locator('canvas'), progress = page.locator('#progress-text');
        await expect(canvas).toBeVisible();
        for (const location of LOCATION_IDS) {
            const business = fundedStandBusiness(location);
            await page.locator('#save-file').setInputFiles({ name: 'customer-business.json', mimeType: 'application/json',
                buffer: Buffer.from(encodeSave(business.state, business.history)) });
            await expect(page.locator('#app')).toHaveAttribute('aria-busy', 'false');
            await expect(canvas).toHaveAttribute('aria-label', new RegExp('People walk'));
            await page.locator('#open').click();
            await expect.poll(async () => Number((await progress.textContent()).split(' /')[0])).toBeGreaterThanOrEqual(6);
            const before = await progress.textContent();
            const a = await canvas.screenshot({ path: path.join(out, location + '-a.png') });
            await expect(progress).not.toHaveText(before);
            const b = await canvas.screenshot({ path: path.join(out, location + '-b.png') });
            const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
            expect(hash(a)).not.toBe(hash(b));
            records.push({ location, before, after: await progress.textContent(), framesDiffer: true });
            await page.locator('#speed').click();
            await expect(page.locator('#results')).toBeVisible();
            await expect(page.locator('#next')).toBeEnabled();
            await page.locator('#next').click();
        }
        expect(errors).toEqual([]);
        fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ scope: 'Actual packaged gameplay; no injected renderer states.',
            executablePath, records, errors }, null, 2));
        console.log('Windows customers: ten playable maps, moving frames, actual opening/results transitions and no renderer errors PASS.');
    } finally { if (app) await app.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
