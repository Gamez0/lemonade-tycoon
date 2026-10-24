const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');
const executablePath = process.env.LEMONADE_DESKTOP_EXE;
if (!executablePath) throw Error('Actual Windows package required');
const baseline = process.env.LEMONADE_RENT_BASELINE === '1';
const out = path.resolve(process.env.LEMONADE_RENT_EVIDENCE_ROOT || 'test-results/desktop-rent');
fs.mkdirSync(out, { recursive: true });
const records = [];
(async () => {
    for (const scale of [1, 1.25, 1.5, 1.75, 2]) {
        const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-rent-'));
        const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
        delete env.ELECTRON_RUN_AS_NODE;
        let app;
        try {
            app = await electron.launch({ executablePath, env,
                args: profileArgs(base, [`--force-device-scale-factor=${scale}`]) });
            await verifyProfile(app, base);
            const page = await app.firstWindow();
            await page.locator('[data-page=rent]').click();
            const read = () => page.evaluate(() => window.desktopSave.getItem('lemonade-tycoon.reboot.save'));
            const before = await read();
            for (const [width, height] of [[1100, 850], [800, 600]]) {
                await app.evaluate(({ BrowserWindow }, size) => BrowserWindow.getAllWindows()[0].setContentSize(...size), [width, height]);
                for (let step = 0; step < 10; step++) {
                    await page.locator('#rent-next').click();
                    const selected = page.locator('.location-list [aria-pressed=true]');
                    await expect(selected).toBeInViewport();
                    const geometry = await page.evaluate(() => {
                        const e = document.querySelector('.location-list');
                        const initial = e.scrollLeft; e.scrollLeft = 10000;
                        const attempted = e.scrollLeft; e.scrollLeft = initial;
                        const rent = document.querySelector('#rent-page');
                        const elements = [...rent.querySelectorAll('*')];
                        for (let parent = rent; parent; parent = parent.parentElement) elements.push(parent);
                        return { selected: e.querySelector('[aria-pressed=true]').dataset.location,
                            client: e.clientWidth, scroll: e.scrollWidth, attempted,
                            visibleCards: [...e.children].filter(c => c.getClientRects().length).length,
                            horizontalScrollers: elements.filter(x => x.getClientRects().length &&
                                ['auto', 'scroll'].includes(getComputedStyle(x).overflowX) && x.scrollWidth > x.clientWidth + 1)
                                .map(x => ({ id: x.id, excess: x.scrollWidth - x.clientWidth })),
                            pageFits: document.documentElement.scrollWidth <= innerWidth,
                            scrollbarHeight: e.offsetHeight - e.clientHeight };
                    });
                    const name = `${scale}-${width}-${geometry.selected}`;
                    await page.locator('#rent-page').screenshot({ path: path.join(out, name + '.png') });
                    if (step === 4) await page.screenshot({ path: path.join(out, `${scale}-${width}-full.png`) });
                    records.push({ scale, width, height, name, ...geometry });
                    if (!baseline) {
                        assert.ok(geometry.scroll <= geometry.client + 1, JSON.stringify(records.at(-1)));
                        assert.equal(geometry.attempted, 0); assert.equal(geometry.visibleCards, 3);
                        assert.deepEqual(geometry.horizontalScrollers, []); assert.ok(geometry.pageFits);
                        assert.equal(geometry.scrollbarHeight, 0);
                    }
                }
                await page.locator('.location-list [aria-pressed=true]').press('ArrowLeft');
                await expect(page.locator('#rent-position')).toHaveText('10 / 10');
                await page.locator('.location-list [aria-pressed=true]').press('ArrowRight');
                await expect(page.locator('#rent-position')).toHaveText('1 / 10');
            }
            assert.equal(await read(), before, 'Browsing must not charge or mutate saved business');
        } finally {
            await app?.close();
            assert.ok(path.resolve(base).startsWith(path.resolve(os.tmpdir()) + path.sep + 'lemonade-rent-'));
            fs.rmSync(base, { recursive: true, force: true });
        }
    }
    fs.writeFileSync(path.join(out, 'geometry.json'), JSON.stringify({ baseline, records }, null, 2));
    // Use the package's Chromium for sheets too: Windows CI deliberately does
    // not require a separately downloaded Playwright browser.
    const galleryBase = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-rent-gallery-'));
    const galleryEnv = { ...process.env, LOCALAPPDATA: galleryBase, APPDATA: path.join(galleryBase, 'Roaming') };
    delete galleryEnv.ELECTRON_RUN_AS_NODE;
    let gallery;
    try {
        gallery = await electron.launch({ executablePath, env: galleryEnv, args: profileArgs(galleryBase) });
        await verifyProfile(gallery, galleryBase);
        const opened = gallery.waitForEvent('window');
        await gallery.evaluate(({ BrowserWindow }) => {
            const window = new BrowserWindow({ width: 1120, height: 1200, useContentSize: true, show: true });
            return window.loadURL('about:blank');
        });
        const page = await opened;
        for (const scale of [1, 1.25, 1.5, 1.75, 2]) {
            const figures = records.filter(r => r.scale === scale).map(r =>
                `<figure><figcaption>${r.width}px / ${r.selected} / excess ${r.scroll - r.client}px</figcaption><img src="data:image/png;base64,${fs.readFileSync(path.join(out, r.name + '.png')).toString('base64')}"></figure>`).join('');
            await page.setContent(`<style>body{font:12px Arial;background:#eee}main{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}figure{margin:0}img{width:100%;display:block}</style><h1>Actual Windows Rent: ${scale * 100}%</h1><main>${figures}</main>`);
            await page.locator('img').evaluateAll(images => Promise.all(images.map(i => i.decode())));
            await page.screenshot({ path: path.join(out, `contact-${scale}.png`), fullPage: true });
        }
    } finally {
        await gallery?.close();
        assert.ok(path.resolve(galleryBase).startsWith(path.resolve(os.tmpdir()) + path.sep + 'lemonade-rent-gallery-'));
        fs.rmSync(galleryBase, { recursive: true, force: true });
    }
    console.log(`${baseline ? 'Baseline recorded' : 'PASS'}:100 native Rent selections,5 forced scales,2 window sizes, keyboard wrap, saved business unchanged`);
})().catch(error => { console.error(error); process.exitCode = 1; });
