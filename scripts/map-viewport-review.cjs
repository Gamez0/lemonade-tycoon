// Actual packaged Windows captures, not browser-emulated desktop styling.
const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { profileArgs, verifyProfile } = require('../tests/helpers/desktop-profile.cjs');
const { fundedStandBusiness } = require('../tests/helpers/stand-business.cjs');
const { encodeSave } = require('../.test-build/simulation/save.js');
const { LOCATION_IDS } = require('../.test-build/content/locations.js');
const executablePath = process.env.LEMONADE_DESKTOP_EXE;
if (!executablePath) throw Error('Actual Windows package required');
const baseline = process.env.LEMONADE_MAP_BASELINE === '1';
const out = path.resolve(process.env.LEMONADE_MAP_EVIDENCE_ROOT || 'test-results/map-viewport-review');
fs.mkdirSync(out, { recursive: true });
const sizes = [[800, 600], [1024, 768], [1100, 850], [1280, 720], [1920, 1080], [2560, 1080]];
const fixtures = LOCATION_IDS.map(id => { const f = fundedStandBusiness(id); return [id, encodeSave(f.state, f.history)]; });
const records = [], errors = [];
(async () => {
    for (const scale of [1, 1.25, 1.5, 1.75, 2]) {
        const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-map-fit-'));
        const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
        delete env.ELECTRON_RUN_AS_NODE;
        let app;
        try {
            app = await electron.launch({ executablePath, env, args: profileArgs(base, [`--force-device-scale-factor=${scale}`]) });
            await verifyProfile(app, base);
            const page = await app.firstWindow();
            page.on('pageerror', error => errors.push(error.message));
            await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setMinimumSize(0, 0));
            for (const [width, height] of sizes) {
                await app.evaluate(({ BrowserWindow }, size) => BrowserWindow.getAllWindows()[0].setContentSize(...size), [width, height]);
                for (const [id, raw] of fixtures) {
                    await page.locator('#save-file').setInputFiles({ name: 'map.json', mimeType: 'application/json', buffer: Buffer.from(raw) });
                    await expect(page.locator('#save-status')).toContainText('Imported');
                    await expect(page.locator('#app')).toHaveAttribute('data-location', id);
                    const measure = () => page.evaluate(() => {
                        const canvas = document.querySelector('canvas'), rect = canvas.getBoundingClientRect();
                        const layout = document.querySelector('.layout').getBoundingClientRect();
                        const frame = document.querySelector('.world-frame').getBoundingClientRect();
                        const factor = Math.min(rect.width / canvas.width, rect.height / canvas.height);
                        return { horizontal: rect.width - canvas.width * factor, vertical: rect.height - canvas.height * factor,
                            dpr: devicePixelRatio, canvas: { width: rect.width, height: rect.height },
                            fullMap: getComputedStyle(canvas).objectFit === 'contain',
                            frameFits: frame.bottom <= layout.bottom + 1 && frame.right <= innerWidth + 1,
                            pageFits: document.documentElement.scrollWidth <= innerWidth + 1 && document.documentElement.scrollHeight <= innerHeight + 1 };
                    });
                    if (!baseline) await expect.poll(async () => {
                        const m = await measure(); return Math.max(m.horizontal, m.vertical);
                    }).toBeLessThanOrEqual(1);
                    await page.waitForTimeout(80);
                    const measured = await measure(), name = `${scale}-${width}x${height}-${id}`;
                    records.push({ scale, width, height, id, name, ...measured });
                    await page.locator('.world-frame').screenshot({ path: path.join(out, name + '.png'), scale: 'css' });
                    if (id === 'park') await page.screenshot({ path: path.join(out, name + '-full.png'), scale: 'css' });
                    assert.ok(Math.abs(measured.dpr - scale) < .01);
                    if (!baseline) {
                        assert.ok(measured.fullMap && measured.frameFits && measured.pageFits, JSON.stringify(records.at(-1)));
                        assert.ok(measured.horizontal <= 1 && measured.vertical <= 1, JSON.stringify(records.at(-1)));
                    }
                }
            }
            const opened = app.waitForEvent('window');
            await app.evaluate(({ BrowserWindow }) => new BrowserWindow({ width: 1120, height: 1200, useContentSize: true }).loadURL('about:blank'));
            const gallery = await opened;
            const samples = records.filter(r => r.scale === scale && ['neighborhood', 'park', 'mall'].includes(r.id));
            const figures = samples.map(r => `<figure><figcaption>${r.width}x${r.height} ${r.id} gaps ${r.horizontal.toFixed(2)}/${r.vertical.toFixed(2)}</figcaption><img src="data:image/png;base64,${fs.readFileSync(path.join(out, r.name + '.png')).toString('base64')}"></figure>`).join('');
            await gallery.setContent(`<style>body{font:12px Arial;background:#eee}main{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}figure{margin:0}img{width:100%;display:block}</style><h1>Actual Windows maps ${scale * 100}%</h1><main>${figures}</main>`);
            await gallery.locator('img').evaluateAll(images => Promise.all(images.map(i => i.decode())));
            await gallery.screenshot({ path: path.join(out, `contact-${scale}.png`), fullPage: true });
        } finally {
            await app?.close();
            assert.ok(path.resolve(base).startsWith(path.resolve(os.tmpdir()) + path.sep + 'lemonade-map-fit-'));
            fs.rmSync(base, { recursive: true, force: true });
        }
    }
    fs.writeFileSync(path.join(out, 'geometry.json'), JSON.stringify({ baseline, records, errors }, null, 2));
    assert.deepEqual(errors, []);
    console.log(`${baseline ? 'Baseline' : 'PASS'}:300 actual map/size/scale cases; full map, viewport gaps and page bounds recorded`);
})().catch(error => { console.error(error); process.exitCode = 1; });
