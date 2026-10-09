const { test, expect } = require("@playwright/test");
const { observeAudio } = require("../helpers/audio-recovery.cjs");

test("static canvas sleeps, edits and resizing repaint, selling resumes and results sleep again", async ({ page }) => {
    await page.addInitScript(() => {
        window.__draws = 0;
        const original = CanvasRenderingContext2D.prototype.drawImage;
        CanvasRenderingContext2D.prototype.drawImage = function (...args) {
            window.__draws++;
            return original.apply(this, args);
        };
    });
    await page.goto("/");
    await expect(page.locator("canvas")).toBeVisible();
    await page.waitForTimeout(350);
    const idle = await page.evaluate(() => window.__draws);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => window.__draws)).toBe(idle);
    await page.locator("#lemon").fill("5");
    await page.locator("#lemon").press("Tab");
    await expect.poll(() => page.evaluate(() => window.__draws)).toBeGreaterThan(idle);
    const edited = await page.evaluate(() => window.__draws);
    await page.setViewportSize({ width: 800, height: 600 });
    await expect.poll(() => page.evaluate(() => window.__draws)).toBeGreaterThan(edited);
    await page.locator("[data-page=supplies]").click();
    for (const item of ["lemon", "sugar", "ice", "cup"]) {
        await page.locator(`[data-supply=${item}]`).click();
        await page.locator('[data-bundle="0"][data-delta="1"]').click();
    }
    await page.locator("#buy-order").click();
    await page.locator("#open").click();
    await expect(page.locator("#selling")).toBeVisible();
    await page.evaluate(() => {
        window.__weatherChanges = 0;
        new MutationObserver(() => window.__weatherChanges++).observe(document.getElementById("weather-art"), {
            childList: true,
            subtree: true,
        });
    });
    const selling = await page.evaluate(() => window.__draws);
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => window.__draws)).toBeGreaterThan(selling);
    expect(await page.evaluate(() => window.__weatherChanges)).toBe(0);
    await expect(page.locator("#progress-text")).not.toHaveText(/^0 \//);
    await page.locator("#skip").click();
    await expect(page.locator("#next")).toBeEnabled();
    await page.waitForTimeout(350);
    const closed = await page.evaluate(() => window.__draws);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => window.__draws)).toBe(closed);
    await page.locator("#next").click();
    await expect(page.locator("#day")).toHaveText("02");
    await expect.poll(() => page.evaluate(() => window.__draws)).toBeGreaterThan(closed);
});

test("muted audio suspends its context and resumes after unmute", async ({ page }) => {
    await page.addInitScript(observeAudio);
    await page.goto("/");
    await page.locator("#help-open").click();
    await expect.poll(() => page.evaluate(() => window.__audioProbe.contexts[0]?.state)).toBe("running");
    await page.locator("#mute-audio").check();
    await expect.poll(() => page.evaluate(() => window.__audioProbe.contexts[0]?.state)).toBe("suspended");
    await page.locator("#mute-audio").uncheck();
    await expect.poll(() => page.evaluate(() => window.__audioProbe.contexts[0]?.state)).toBe("running");
    await expect.poll(() => page.evaluate(() => window.__audioProbe.tones)).toBeGreaterThan(0);
});

test("saved mute preference avoids creating audio resources until explicitly unmuted", async ({ page }) => {
    await page.addInitScript(observeAudio);
    await page.addInitScript(() =>
        localStorage.setItem("willow-lane.audio.v1", JSON.stringify({ music: 0.25, effects: 0.35, muted: true })),
    );
    await page.goto("/");
    await page.locator("#help-open").click();
    expect(await page.evaluate(() => window.__audioProbe.contexts.length)).toBe(0);
    await page.locator("#mute-audio").uncheck();
    await expect.poll(() => page.evaluate(() => window.__audioProbe.contexts[0]?.state)).toBe("running");
});
