const { _electron: electron } = require("playwright");
const { expect } = require("@playwright/test");
const fs = require("fs"),
    path = require("path"),
    os = require("os"),
    assert = require("assert/strict");
const executable = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== "win32" || !executable || !fs.existsSync(executable))
    throw new Error("Set LEMONADE_DESKTOP_EXE to the Windows package executable.");
const base = fs.mkdtempSync(path.join(os.tmpdir(), "lemonade-ui-"));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, "Roaming") };
delete env.ELECTRON_RUN_AS_NODE;
const save = path.join(base, "Lemonade Tycoon/save.json");
const out = path.resolve(process.env.LEMONADE_UI_EVIDENCE_ROOT || "test-results/desktop-ui");
fs.mkdirSync(out, { recursive: true });
const results = [];
let app;
async function launch(exe) {
    app = await electron.launch({ executablePath: path.resolve(exe), env });
    const page = await app.firstWindow();
    await expect(page.locator("canvas")).toBeVisible();
    return page;
}
async function close() {
    const done = app.waitForEvent("close");
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
    await done;
    app = null;
}
async function fit(page, name) {
    const geometry = await page.evaluate(() => {
        const box = (el) => {
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
        };
        return {
            width: innerWidth,
            height: innerHeight,
            scrollWidth: document.documentElement.scrollWidth,
            scrollHeight: document.documentElement.scrollHeight,
            app: box(document.querySelector("#app")),
            scene: box(document.querySelector("#game-container")),
            canvas: box(document.querySelector("canvas")),
            controls: [...document.querySelectorAll("button,input:not([type=file])")]
                .filter((x) => x.getClientRects().length && getComputedStyle(x).visibility !== "hidden")
                .map((x) => ({ name: x.id || x.textContent.trim(), ...box(x) })),
        };
    });
    assert.ok(geometry.scrollWidth <= geometry.width + 1, JSON.stringify(geometry));
    assert.ok(geometry.scrollHeight <= geometry.height + 1, JSON.stringify(geometry));
    assert.ok(Math.abs(geometry.app.width - geometry.width) < 2);
    assert.ok(Math.abs(geometry.app.height - geometry.height) < 2);
    assert.ok(Math.abs(geometry.canvas.width - geometry.scene.width) < 3);
    assert.ok(Math.abs(geometry.canvas.height - geometry.scene.height) < 3);
    for (const box of geometry.controls) {
        assert.ok(
            box.x >= -1 && box.y >= -1 && box.right <= geometry.width + 1 && box.bottom <= geometry.height + 1,
            `${name}: ${JSON.stringify(box)}`,
        );
    }
    results.push({ name, ...geometry });
}
(async () => {
    try {
        let page,
            before = null;
        if (process.env.LEMONADE_BASELINE_EXE) {
            page = await launch(process.env.LEMONADE_BASELINE_EXE);
            await page.locator("[data-page=price]").click();
            before = await page.locator("#price").evaluate((x) => getComputedStyle(x).appearance);
            assert.equal(before, "auto");
            await close();
        }
        page = await launch(executable);
        assert.equal(await app.evaluate(({ Menu }) => Menu.getApplicationMenu()), null);
        await expect(page.locator(".masthead")).toBeHidden();
        for (const [width, height] of [
            [1100, 850],
            [800, 600],
            [1280, 720],
        ]) {
            await app.evaluate(
                ({ BrowserWindow }, { width, height }) =>
                    BrowserWindow.getAllWindows()[0].setContentSize(width, height),
                { width, height },
            );
            for (const tab of ["recipe", "price", "supplies", "results", "rent"]) {
                await page.locator(`[data-page=${tab}]`).click();
                await page.waitForTimeout(200);
                await fit(page, `${width}x${height} ${tab}`);
            }
        }
        await page.locator("[data-page=price]").click();
        assert.equal(await page.locator("#price").evaluate((x) => getComputedStyle(x).appearance), "textfield");
        await page.locator("#price").fill("2.25");
        await page.locator("#price").press("Tab");
        await expect.poll(() => JSON.parse(fs.readFileSync(save)).state.plan.price).toBe(225);
        await page.screenshot({ path: path.join(out, "price-fixed.png") });
        await close();
        page = await launch(executable);
        await page.locator("[data-page=price]").click();
        await expect(page.locator("#price")).toHaveValue("2.25");
        await page.locator("[data-page=supplies]").click();
        for (const item of ["lemon", "sugar", "ice", "cup"]) {
            await page.locator(`[data-supply=${item}]`).click();
            await page.locator('[data-bundle="0"][data-delta="1"]').click();
        }
        await page.locator("#buy-order").click();
        await page.locator("#open").click();
        await fit(page, "selling default");
        await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(800, 600));
        await page.waitForTimeout(200);
        await fit(page, "selling 800x600");
        await page.locator("#skip").click();
        await expect(page.locator("#app")).toHaveAttribute("data-phase", "results");
        await fit(page, "results 800x600");
        await page.screenshot({ path: path.join(out, "results-small.png") });
        await close();
        fs.writeFileSync(
            path.join(out, "ui-results.json"),
            JSON.stringify({ beforeSpinner: before, afterSpinner: "textfield", pricePersisted: 225, results }, null, 2),
        );
        console.log(
            "UI checks passed: 15 tab/size combinations, selling/results small, menu/title/margins/scroll, price typing/relaunch",
        );
    } finally {
        if (app) await app.close();
    }
})().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
