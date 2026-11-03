// Technical twenty-minute scheduler exercise; does not establish listening acceptance.
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const output = path.resolve('.local-m4/music-soak');
fs.mkdirSync(output, { recursive: true });
const config = path.join(output, 'vite.config.mjs');
// Authoring output can change during this long probe; never reload its page.
fs.writeFileSync(config, 'export default { server: { hmr: false, watch: { ignored: ["**"] } } };\n');
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--config', config,
    '--host', '127.0.0.1', '--port', '8083', '--strictPort'], { stdio: 'ignore', windowsHide: true });
let browser;
(async () => {
    const rows = [], errors = [];
    try {
        let ready = false;
        for (let attempt = 0; attempt < 100; attempt++) {
            try { if ((await fetch('http://127.0.0.1:8083')).ok) { ready = true; break; } } catch {}
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        assert(ready, 'Soak server did not start');
        browser = await chromium.launch();
        const page = await browser.newPage();
        page.on('pageerror', error => errors.push(error.message));
        await page.goto('http://127.0.0.1:8083');
        await page.locator('#menu-continue').click();
        await page.evaluate(async () => {
            const { MusicPlayer } = await import('/src/game/presentation/music-player.ts');
            const context = new AudioContext({ sampleRate: 44100 });
            await context.resume();
            const player = new MusicPlayer(context, () => player.play('preparation'));
            player.volume(0.05);
            window.__musicSoak = { context, player };
            player.play('preparation');
        });
        const started = Date.now();
        for (let sample = 0; sample <= 240; sample++) {
            const row = await page.evaluate(sample => {
                const { context, player } = window.__musicSoak;
                // More than two uninterrupted full loops of each long song.
                if (sample === 120) player.play('selling');
                const voices = [player.current, player.retiring].filter(Boolean);
                return { sample, time: context.currentTime, state: context.state,
                    voices: voices.map(voice => ({ cue: voice.cue, buffers: voice.buffers.size,
                        pending: voice.pending.size, sources: voice.sources.size,
                        playing: [...voice.sources].filter(source => source.buffer !== null).length })),
                    failures: [...player.failed] };
            }, sample);
            row.elapsedMs = Date.now() - started;
            rows.push(row);
            assert.equal(row.state, 'running');
            assert.equal(row.failures.length, 0, 'Music loading or scheduling failed');
            assert(row.voices.length >= 1 && row.voices.length <= 2);
            for (const voice of row.voices) {
                assert(voice.buffers <= 2 && voice.pending <= 1 && voice.sources <= 2,
                    'Scheduler retained too many decoded segments or sources');
            }
            if (sample > 0 && sample !== 120) assert(row.voices.some(voice => voice.playing > 0), 'No live source');
            if (sample % 12 === 0) console.log('Music soak seconds:', Math.round(row.elapsedMs / 1000));
            if (sample < 240) await page.waitForTimeout(5000);
        }
        assert.deepEqual(errors, []);
        assert(rows.at(-1).elapsedMs >= 1200000);
        console.log('Twenty-minute technical scheduler soak passed. Human listening remains open.');
    } finally {
        fs.writeFileSync(path.join(output, 'scheduler.json'), JSON.stringify({ rows, errors }, null, 2) + '\n');
        if (browser) await browser.close();
        server.kill();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
