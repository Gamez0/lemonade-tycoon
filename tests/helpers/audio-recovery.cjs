const { expect } = require('@playwright/test');
function observeAudio() {
    const NativeAudioContext = window.AudioContext, nativeFetch = window.fetch.bind(window);
    const arrays = new WeakMap(), buffers = new WeakMap();
    const probe = window.__audioProbe = { contexts: [], tones: 0, sources: [], events: [] };
    window.fetch = async (...args) => {
        const url = String(args[0]);
        try {
            const response = await nativeFetch(...args);
            const read = response.arrayBuffer.bind(response);
            response.arrayBuffer = async () => { const data = await read(); arrays.set(data, url); return data; };
            return response;
        } catch (error) { probe.events.push({ type: 'error', source: url }); throw error; }
    };
    window.AudioContext = class extends NativeAudioContext {
        constructor(...args) { super(...args); probe.contexts.push(this); }
        createOscillator() { probe.tones++; return super.createOscillator(); }
        async decodeAudioData(data) {
            const buffer = await super.decodeAudioData(data); buffers.set(buffer, arrays.get(data)); return buffer;
        }
        createBufferSource() {
            const node = super.createBufferSource(), start = node.start.bind(node), stop = node.stop.bind(node);
            let record;
            node.start = (when = 0, offset = 0, duration = node.buffer.duration - offset) => {
                record = { source: buffers.get(node.buffer), when, offset, duration,
                    context: this, rate: node.playbackRate.value, stopped: false };
                probe.sources.push(record); probe.events.push({ type: 'play', source: record.source });
                return start(when, offset, duration);
            };
            node.stop = (...args) => { if (record) record.stopped = true; return stop(...args); };
            return node;
        }
    };
    probe.active = () => probe.sources.filter(s => !s.stopped && s.context.state === 'running' &&
        s.context.currentTime >= s.when && s.context.currentTime < s.when + s.duration).map(s => ({
        source: s.source, time: s.context.currentTime - s.when + s.offset,
        duration: s.duration, rate: s.rate,
    }));
}
async function verifyRecovery(page) {
    await page.locator('#help-open').click();
    await expect.poll(() => page.evaluate(() => window.__audioProbe.active().length)).toBe(1);
    const position = await page.evaluate(async () => {
        const context = window.__audioProbe.contexts[0]; await context.suspend(); return context.currentTime;
    });
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await expect.poll(() => page.evaluate(() => window.__audioProbe.contexts[0].state), { timeout: 3000 }).toBe('running');
    await expect.poll(() => page.evaluate(() => window.__audioProbe.contexts[0].currentTime)).toBeGreaterThan(position);
    await page.locator('#mute-audio').check();
    const count = await page.evaluate(() => window.__audioProbe.sources.length);
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.__audioProbe.active().length)).toBe(0);
    expect(await page.evaluate(() => window.__audioProbe.sources.length)).toBe(count);
    await page.locator('#mute-audio').uncheck();
    await expect.poll(() => page.evaluate(() => window.__audioProbe.active().length)).toBe(1);
}
module.exports = { observeAudio, verifyRecovery };
