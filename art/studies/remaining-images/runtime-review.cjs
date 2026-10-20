// Actual Windows catalogue evidence, never a source-image mockup.
const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const { profileArgs, verifyProfile } = require(path.join(root, 'tests/helpers/desktop-profile.cjs'));
const executable = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== 'win32' || !executable) throw Error('Set LEMONADE_DESKTOP_EXE to the rebuilt Windows package.');
const output = path.resolve(root, process.argv[2] || '.local-m4/remaining-images/native');
fs.mkdirSync(output, { recursive: true });
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-portrait-review-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
delete env.ELECTRON_RUN_AS_NODE;
let app;
(async () => {
    const evidence = [];
    try {
        app = await electron.launch({ executablePath: path.resolve(executable), env, args: profileArgs(base) });
        const page = await app.firstWindow();
        await verifyProfile(app, base);
        await expect(page.locator('canvas')).toBeVisible();
        for (const [width, height] of [[1280, 1000], [800, 600]]) {
            await app.evaluate(({ BrowserWindow }, bounds) => BrowserWindow.getAllWindows()[0].setContentSize(...bounds), [width, height]);
            await page.locator('[data-page=staff]').click();
            for (const [index, id] of ['none', 'server', 'host'].entries()) {
                const card = page.locator('#staff-catalog .management-card').nth(index);
                await card.evaluate(el => el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' }));
                const portrait = card.locator('.staff-portrait');
                await expect(portrait).toBeVisible();
                await portrait.evaluate(img => img.decode());
                const dimensions = await portrait.evaluate(img => {
                    const r = img.getBoundingClientRect();
                    const c = document.createElement('canvas'); c.width = c.height = 1;
                    c.getContext('2d').drawImage(img, 0, 0, 1, 1, 0, 0, 1, 1);
                    return { native: [img.naturalWidth, img.naturalHeight], displayed: [r.width, r.height],
                        alphaCorner: c.getContext('2d').getImageData(0, 0, 1, 1).data[3], filtering: getComputedStyle(img).imageRendering };
                });
                assert.deepEqual(dimensions.native, [1254, 1254]);
                assert.equal(dimensions.alphaCorner, 0);
                assert.equal(dimensions.filtering, 'auto');
                assert.ok(dimensions.displayed.every(value => value > 0 && value <= 100));
                const button = card.locator(`[data-staff=${id}]`);
                await expect(button).toBeVisible();
                const screenshot = `${width}-${id}.png`;
                await card.screenshot({ path: path.join(output, screenshot) });
                evidence.push({ width, height, id, ...dimensions, screenshot });
            }
            await page.screenshot({ path: path.join(output, `${width}-staff-screen.png`) });
        }
        const build = JSON.parse(fs.readFileSync(path.join(path.dirname(executable), 'build-info.json'), 'utf8'));
        fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify({ build, evidence }, null, 2));
        const png = file => 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
        const figures = evidence.map(row => `<figure><figcaption>${row.width}×${row.height} · ${row.id} · actual Windows card</figcaption><img src="${png(path.join(output, row.screenshot))}"></figure>`).join('');
        fs.writeFileSync(path.join(output, 'review.html'), `<!doctype html><meta charset="utf-8"><title>Actual Windows staff portraits</title><style>body{font:16px system-ui;background:#25292b;color:white}main{display:flex;flex-wrap:wrap;gap:24px}figure{margin:12px}img{display:block;max-width:100%}</style><h1>Actual packaged Staff catalogue</h1><p>Source commit ${build.source_commit}; captured native cards at two window sizes. These are actual package screenshots, not composited source previews.</p><main>${figures}</main>`);
        console.log('Actual Windows portraits: six catalogue cards, native alpha/filtering and accessible staff actions PASS.');
    } finally {
        if (app) { const closed = app.waitForEvent('close'); await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close()); await closed; }
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
