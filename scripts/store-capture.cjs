const { chromium } = require('playwright');
const { expect } = require('@playwright/test');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { campaign, stock } = require('../tests/helpers/business.cjs');
const { reserveLocation } = require('../.test-build/simulation/game.js');
const { encodeSave } = require('../.test-build/simulation/save.js');
const out = path.resolve('.local-m4/m9-store'); fs.mkdirSync(out, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '8083', '--strictPort'], { stdio: 'pipe' });
let browser, context;
(async () => {
    try {
        for (let i = 0; i < 50; i++) {
            if (server.exitCode !== null) throw new Error('Store capture preview failed.');
            try { if ((await fetch('http://127.0.0.1:8083')).ok) break; } catch {}
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        browser = await chromium.launch();
        context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: path.join(out, 'video'), size: { width: 1920, height: 1080 } } });
        const page = await context.newPage();
        await page.goto('http://127.0.0.1:8083'); await expect(page.locator('canvas')).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const scene = (await page.locator('canvas').screenshot()).toString('base64');
        const sizes = { header: [920, 430], small: [462, 174], main: [1232, 706], vertical: [748, 896], library: [600, 900], 'library-header': [920, 430], hero: [3840, 1240], logo: [1280, 720] };
        for (const [name, [width, height]] of Object.entries(sizes)) {
            const png = await page.evaluate(async ({ scene, name, width, height }) => {
                const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
                const c = canvas.getContext('2d');
                if (name !== 'logo') {
                    c.fillStyle = '#a7c878'; c.fillRect(0, 0, width, height);
                    const image = new Image(); image.src = 'data:image/png;base64,' + scene; await image.decode();
                    const scale = Math.max(width / image.width, height / image.height);
                    c.drawImage(image, (width - image.width * scale) / 2, (height - image.height * scale) / 2, image.width * scale, image.height * scale);
                    // Bring the actual game cart into the foreground, below the title.
                    if (name !== 'hero' && name !== 'small') {
                        const cartW = width * .23, cartH = cartW * 1.22;
                        c.imageSmoothingEnabled = false;
                        c.drawImage(image, image.width * 228 / 640, image.height * 157 / 512, image.width * 84 / 640, image.height * 100 / 512, width * .65, height - cartH - height * .06, cartW, cartH);
                    }
                    if (name !== 'hero') { c.fillStyle = '#1b422bbb'; c.fillRect(0, 0, width, height * .48); }
                }
                if (name !== 'hero') {
                    const size = Math.min(width / 7.5, height / 4.6);
                    c.font = `700 ${size}px TycoonCondensed, sans-serif`;
                    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
                    c.lineWidth = Math.max(2, size / 16); c.strokeStyle = '#1e422d'; c.fillStyle = '#fff1a4';
                    const firstY = name === 'logo' ? height * .35 : height * .18;
                    for (const [text, y] of [['Willow Lane', firstY], ['Lemonade', firstY + size * 1.08]]) { c.strokeText(text, width / 2, y); c.fillText(text, width / 2, y); }
                }
                return canvas.toDataURL('image/png').split(',')[1];
            }, { scene, name, width, height });
            fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(png, 'base64'));
        }
        const earned = campaign(2026, 10);
        for (const id of ['neighborhood', 'park', 'downtown']) {
            const state = stock(reserveLocation(earned.state, id), id === 'downtown' ? 275 : 175);
            const raw = encodeSave(state, earned.history);
            await page.evaluate(raw => localStorage.setItem('lemonade-tycoon.reboot.save', raw), raw);
            await page.reload(); await expect(page.locator('#open')).toBeVisible();
            await page.locator('#open').click(); await expect(page.locator('#selling')).toBeVisible();
            await page.waitForTimeout(2200);
            await page.screenshot({ path: path.join(out, `gameplay-${id}.png`) });
            await page.locator('#skip').click(); await expect(page.locator('#results')).toBeVisible();
            await page.screenshot({ path: path.join(out, `results-${id}.png`) });
            await page.waitForTimeout(1200);
        }
        await context.close(); context = null;
        fs.writeFileSync(path.join(out, 'capture-info.json'), JSON.stringify({ title: 'Willow Lane Lemonade', status: 'development drafts, review pending', source: require('node:child_process').execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), dirty: Boolean(require('node:child_process').execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()), sizes, screenshotSize: [1920, 1080], video: 'raw silent gameplay capture; editing and final audio mix pending' }, null, 2));
        console.log(`Store drafts: ${out}`);
    } finally { await context?.close(); await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
