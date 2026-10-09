const { chromium, firefox, webkit } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const scenarios = [
    ['chromium', chromium, {}, { width: 1280, height: 1000 }],
    ['edge', chromium, { channel: 'msedge' }, { width: 1280, height: 1000 }],
    ['firefox', firefox, {}, { width: 1280, height: 1000 }],
    ['webkit-preview', webkit, {}, { width: 1280, height: 1000 }],
    ['mobile-chromium-emulation', chromium, {}, { width: 390, height: 844 }],
    ['mobile-webkit-emulation', webkit, {}, { width: 390, height: 844 }],
];
const out = path.resolve('.local-m4/m8-engines'); fs.mkdirSync(out, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '8082', '--strictPort'], { stdio: 'pipe' });
let serverError = ''; server.stderr.on('data', data => { serverError += data; });
const results = [];
(async () => {
    try {
        for (let i = 0; i < 50; i++) {
            if (server.exitCode !== null) throw new Error(serverError || 'Preview failed.');
            try { if ((await fetch('http://127.0.0.1:8082')).ok) break; } catch {}
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        for (const [name, engine, options, viewport] of scenarios) {
            let browser;
            try {
                browser = await engine.launch(options);
                const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
                const errors = []; page.on('pageerror', error => errors.push(error.message));
                await page.goto('http://127.0.0.1:8082');
                await expect(page.locator('canvas')).toBeVisible();
                await page.locator('#help-open').click(); await page.locator('#mute-audio').check(); await page.locator('#help-close').click();
                await page.locator('[data-page=supplies]').click();
                for (const item of ['lemon', 'sugar', 'ice', 'cup']) {
                    await page.locator(`[data-supply=${item}]`).click(); await page.locator('[data-bundle="1"][data-delta="1"]').click();
                }
                await page.locator('#buy-order').click();
                await page.locator('#open').click(); await expect(page.locator('#selling')).toBeVisible();
                const frames = await page.evaluate(() => new Promise(resolve => {
                    let previous = performance.now(); const samples = [];
                    function frame(now) { samples.push(now - previous); previous = now; if (samples.length < 120) requestAnimationFrame(frame); else resolve(samples); }
                    requestAnimationFrame(frame);
                }));
                await page.locator('#skip').click(); await expect(page.locator('#results')).toBeVisible();
                const completed = await page.evaluate(() => JSON.parse(localStorage.getItem('lemonade-tycoon.reboot.save')));
                await page.reload(); await expect(page.locator('#results')).toBeVisible();
                const reloaded = await page.evaluate(() => JSON.parse(localStorage.getItem('lemonade-tycoon.reboot.save')));
                if (JSON.stringify(completed) !== JSON.stringify(reloaded)) throw new Error('Reload changed results.');
                if (errors.length) throw new Error(errors.join('\n'));
                await page.screenshot({ path: path.join(out, `${name}.png`) });
                const sorted = frames.sort((a, b) => a - b);
                results.push({ name, version: browser.version(), viewport, status: 'passed', frames: frames.length, frameP95ms: sorted[Math.floor(sorted.length * .95)], frameMaxMs: sorted.at(-1), sold: completed.state.daily.sold });
                console.log(`${name}: PASS`);
            } catch (error) { results.push({ name, status: 'failed', error: error.message }); console.error(`${name}: ${error.message}`); process.exitCode = 1; }
            finally { await browser?.close(); }
        }
    } finally {
        server.kill();
        fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ scope: 'Automated engine/emulation preview; not human, hardware minimum or real mobile certification', results }, null, 2));
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
