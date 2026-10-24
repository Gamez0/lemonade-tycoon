const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { fundedStandBusiness } = require('./helpers/stand-business.cjs');
const { encodeSave } = require('../.test-build/simulation/save.js');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');
const executablePath = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== 'win32' || !executablePath) throw Error('Windows package required.');
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-stand-catalogue-'));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
delete env.ELECTRON_RUN_AS_NODE;
const out = path.resolve(process.env.LEMONADE_CATALOGUE_EVIDENCE_ROOT || 'test-results/desktop-catalogue');
fs.mkdirSync(out, { recursive: true });
(async () => {
    const app = await electron.launch({ executablePath, env, args: profileArgs(base) });
    try {
        await verifyProfile(app, base);
        const page = await app.firstWindow();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const business = fundedStandBusiness('neighborhood');
        await expect(page.locator('canvas')).toBeVisible();
        await page.locator('#save-file').setInputFiles({ name: 'funded.json', mimeType: 'application/json',
            buffer: Buffer.from(encodeSave(business.state, business.history)) });
        await expect(page.locator('#cash')).toHaveText(`$${(business.state.cash / 100).toFixed(2)}`);
        const results = [];
        for (const [index, id] of ['refrigerator', 'iceMaker', 'blender'].entries()) {
            await page.locator('[data-page=upgrades]').click();
            const card = page.locator('#upgrades-catalog .management-card').nth(index);
            for (const [width, height] of [[1280, 1000], [800, 600]]) {
                await app.evaluate(({ BrowserWindow }, size) =>
                    BrowserWindow.getAllWindows()[0].setContentSize(...size), [width, height]);
                await expect.poll(() => page.evaluate(() => [innerWidth, innerHeight])).toEqual([width, height]);
                await card.scrollIntoViewIfNeeded();
                const metrics = await card.locator('.equipment-illustration').evaluate(async img => {
                    await img.decode();
                    const c = document.createElement('canvas'); c.width = c.height = 1;
                    const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, 1, 1, 0, 0, 1, 1);
                    const picture = img.parentElement.getBoundingClientRect(), rect = img.getBoundingClientRect();
                    const button = img.closest('article').querySelector('button').getBoundingClientRect();
                    return { native: [img.naturalWidth, img.naturalHeight],
                        corner: ctx.getImageData(0, 0, 1, 1).data[3], filter: getComputedStyle(img).imageRendering,
                        contained: rect.x >= picture.x && rect.y >= picture.y &&
                            rect.right <= picture.right && rect.bottom <= picture.bottom,
                        buttonClear: rect.bottom < button.top,
                        rootFits: document.documentElement.scrollWidth <= innerWidth };
                });
                expect(metrics.native).toEqual([1402, 1122]);
                expect(metrics.corner).toBe(0);
                expect(metrics.filter).toBe('auto');
                expect(metrics.contained && metrics.buttonClear && metrics.rootFits).toBe(true);
                await card.screenshot({ path: path.join(out, `equipment-${id}-${width}.png`) });
                results.push({ equipment: id, width, height, ...metrics });
            }
        }
        await expect(page.locator('#cash')).toHaveText(`$${(business.state.cash / 100).toFixed(2)}`);
        for (let level = 0; level < 4; level++) {
            await page.locator('[data-page=upgrades]').click();
            if (level) await page.locator('[data-upgrade=stand]').click();
            await expect(page.locator('#upgrade-art-stand')).toHaveAttribute('data-level', String(level));
            await expect(page.locator('canvas')).toHaveAttribute('data-stand-level', String(level));
            for (const [width, height] of [[1280, 1000], [800, 600]]) {
                await app.evaluate(({ BrowserWindow }, size) => {
                    const win = BrowserWindow.getAllWindows()[0];
                    win.setContentSize(size[0], size[1]);
                }, [width, height]);
                await expect.poll(() => page.evaluate(() => [innerWidth, innerHeight])).toEqual([width, height]);
                await page.locator('#upgrade-art-stand').scrollIntoViewIfNeeded();
                const metrics = await page.locator('#upgrade-art-stand').evaluate(async picture => {
                    const svg = picture.querySelector('svg'), image = svg.querySelector('image');
                    const native = new Image(); native.src = image.href.baseVal; await native.decode();
                    const frame = picture.getBoundingClientRect(), rect = svg.getBoundingClientRect();
                    const button = picture.closest('article').querySelector('button').getBoundingClientRect();
                    return { href: image.href.baseVal, native: [native.naturalWidth, native.naturalHeight],
                        filter: getComputedStyle(svg).imageRendering,
                        contained: rect.x >= frame.x && rect.y >= frame.y &&
                            rect.right <= frame.right && rect.bottom <= frame.bottom,
                        buttonClear: rect.bottom < button.top,
                        rootFits: document.documentElement.scrollWidth <= innerWidth };
                });
                expect(metrics.native).toEqual([1402, 1122]);
                expect(metrics.href).toMatch(new RegExp(`stand-${['basic', 'classic', 'lemon', 'castle'][level]}-v2`));
                expect(metrics.filter).toBe('auto');
                expect(metrics.contained && metrics.buttonClear && metrics.rootFits).toBe(true);
                await page.locator('#upgrades-catalog').screenshot({ path: path.join(out, `tier-${level}-${width}.png`) });
                results.push({ level, width, height, ...metrics });
            }
        }
        expect(errors).toEqual([]);
        const build = JSON.parse(fs.readFileSync(path.join(path.dirname(executablePath), 'build-info.json'), 'utf8').replace(/^\uFEFF/, ''));
        fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ build, results, errors }, null, 2));
        console.log('Windows catalogue: six equipment and eight stand previews, native alpha/filtering and control containment PASS.');
    } finally { await app.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
