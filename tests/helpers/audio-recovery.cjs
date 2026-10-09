const { expect } = require('@playwright/test');
function observeAudio() {
    const NativeAudioContext = window.AudioContext;
    window.__audioProbe = { contexts: [], tones: 0 };
    window.AudioContext = class extends NativeAudioContext {
        constructor(...args) { super(...args); window.__audioProbe.contexts.push(this); }
        createOscillator() { window.__audioProbe.tones++; return super.createOscillator(); }
    };
}
async function verifyRecovery(page) {
    await page.locator('#help-open').click();
    await expect.poll(() => page.evaluate(() => window.__audioProbe.tones)).toBeGreaterThan(0);
    const before = await page.evaluate(async () => {
        await window.__audioProbe.contexts[0].suspend();
        return window.__audioProbe.tones;
    });
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await expect.poll(() => page.evaluate(() => window.__audioProbe.contexts[0].state), { timeout: 3000 }).toBe('running');
    await expect.poll(() => page.evaluate(() => window.__audioProbe.tones), { timeout: 3000 }).toBeGreaterThan(before);
    await page.locator('#mute-audio').check();
    const muted = await page.evaluate(() => window.__audioProbe.tones);
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.waitForTimeout(1100);
    expect(await page.evaluate(() => window.__audioProbe.tones)).toBe(muted);
    await page.locator('#mute-audio').uncheck();
    await expect.poll(() => page.evaluate(() => window.__audioProbe.tones)).toBeGreaterThan(muted);
}
module.exports = { observeAudio, verifyRecovery };
