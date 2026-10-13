const { _electron: electron } = require('playwright');
const { expect } = require('@playwright/test');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert/strict');
const { profileArgs, verifyProfile } = require('./helpers/desktop-profile.cjs');
const executable = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== 'win32' || !executable || !fs.existsSync(executable)) throw new Error('Set LEMONADE_DESKTOP_EXE to a Windows package.');
const results = [];
const out = path.resolve(process.env.LEMONADE_DISPLAY_EVIDENCE_ROOT || 'test-results/desktop-display');
fs.mkdirSync(out, { recursive: true });
(async () => {
    for (const scale of [1, 1.25, 1.5, 1.75, 2]) {
        const base = fs.mkdtempSync(path.join(os.tmpdir(), 'lemonade-display-'));
        const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, 'Roaming') };
        delete env.ELECTRON_RUN_AS_NODE;
        let app, page;
        const prefs = path.join(base, 'Lemonade Tycoon', 'display.json');
        async function launch() {
            app = await electron.launch({ executablePath: path.resolve(executable), env,
                args: profileArgs(base, [`--force-device-scale-factor=${scale}`]) });
            page = await app.firstWindow();
            await verifyProfile(app, base);
            await expect(page.locator('canvas')).toBeVisible();
        }
        async function close() {
            const done = app.waitForEvent('close');
            await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
            await done; app = null;
        }
        async function geometry(name) {
            await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
            await expect.poll(() => page.evaluate(() => {
                const panel = document.querySelector('.panel');
                return panel.scrollHeight <= panel.clientHeight + 1
                    && Math.abs(Number(document.documentElement.style.getPropertyValue('--desktop-ui-scale')) - Math.min(1, innerHeight / 820)) < .001;
            })).toBe(true);
            const measured = await app.evaluate(({ BrowserWindow, screen }) => {
                const win = BrowserWindow.getAllWindows()[0];
                return { bounds: win.getBounds(), content: win.getContentBounds(), full: win.isFullScreen(),
                    workArea: screen.getDisplayMatching(win.getBounds()).workArea };
            });
            if (!measured.full) {
                const b = measured.bounds, a = measured.workArea;
                assert.ok(b.x >= a.x - 1 && b.y >= a.y - 1 && b.x + b.width <= a.x + a.width + 1
                    && b.y + b.height <= a.y + a.height + 1, JSON.stringify(measured));
            }
            const layout = await page.evaluate(() => {
                const panel = document.querySelector('.panel'), canvas = document.querySelector('canvas'), scene = document.querySelector('#game-container');
                const cb = canvas.getBoundingClientRect(), sb = scene.getBoundingClientRect();
                return { width: innerWidth, height: innerHeight, scale: devicePixelRatio,
                    panelHeight: panel.clientHeight, panelScroll: panel.scrollHeight,
                    fullMap: getComputedStyle(canvas).objectFit === 'contain' && cb.width <= sb.width + 2 && cb.height <= sb.height + 2 };
            });
            assert.ok(Math.abs(layout.scale - scale) < .01);
            assert.ok(layout.panelScroll <= layout.panelHeight + 1, JSON.stringify(layout));
            assert.ok(layout.fullMap);
            results.push({ scale, name, ...measured, layout });
            console.log(`Display ${scale * 100}% ${name} PASS`);
        }
        async function apply(mode, size) {
            await page.locator('#help-open').click();
            await expect(page.locator('#display-size option')).not.toHaveCount(0);
            await page.locator('#display-mode').selectOption(mode);
            if (size) await page.locator('#display-size').selectOption(size);
            await page.locator('#display-apply').click();
            await expect(page.locator('#display-status')).toContainText('Applied');
            await page.locator('#help-close').click();
            await expect.poll(() => app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isFullScreen())).toBe(mode === 'fullscreen');
        }
        try {
            await launch(); await geometry('default-safe-window');
            await page.locator('#help-open').click();
            await expect(page.locator('#display-size option')).not.toHaveCount(0);
            const choices = await page.locator('#display-size option').evaluateAll(options => options.map(option => option.value));
            await page.locator('#help-close').click();
            for (const size of choices) { await apply('windowed', size); await geometry(`window-${size}`); }
            const savedSize = choices[0];
            await apply('windowed', savedSize);
            const appliedSize = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].getContentSize());
            await close();
            await launch(); await geometry('relaunch-window');
            const selected = savedSize.split('x').map(Number);
            const restored = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].getContentSize());
            assert.ok(restored.every((value, index) => Math.abs(value - appliedSize[index]) <= 2), JSON.stringify({ restored, appliedSize, selected }));
            const stored = JSON.parse(fs.readFileSync(prefs, 'utf8'));
            assert.deepEqual([stored.width, stored.height], selected);
            await assert.rejects(page.evaluate(() => window.desktopApp.setDisplay({ mode: 'windowed', width: -1, height: 600 })), /fits/);
            await apply('fullscreen'); await geometry('fullscreen'); await close();
            assert.equal(JSON.parse(fs.readFileSync(prefs, 'utf8')).mode, 'fullscreen');
            await launch();
            await expect.poll(() => app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isFullScreen())).toBe(true);
            await geometry('relaunch-fullscreen');
            await apply('windowed'); await geometry('fullscreen-back-to-window'); await close();
            fs.writeFileSync(prefs, JSON.stringify({ version: 1, mode: 'windowed', width: 8000, height: 8000 }));
            await launch(); await geometry('oversized-prior-monitor-safe-fallback'); await close();
            fs.writeFileSync(prefs, '{broken');
            await launch(); await geometry('corrupt-preferences-safe-fallback');
            // Native fullscreen transitions must not overwrite an unreadable file.
            await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].emit('leave-full-screen'));
            assert.equal(fs.readFileSync(prefs, 'utf8'), '{broken');
            await close();
            assert.equal(fs.readFileSync(prefs, 'utf8'), '{broken');
        } finally {
            if (app) await app.close().catch(() => {});
            const resolved = path.resolve(base);
            if (!resolved.startsWith(path.resolve(os.tmpdir()) + path.sep + 'lemonade-display-')) throw new Error('Unexpected profile path.');
            fs.rmSync(resolved, { recursive: true, force: true });
            fs.mkdirSync(out, { recursive: true });
            fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2));
        }
    }
    console.log(`Windows display: ${results.length} mode/size/restore/fallback checks across 100-200% PASS.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
