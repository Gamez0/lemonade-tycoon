const { _electron: electron } = require("playwright");
const assert = require("node:assert/strict");
const { campaign } = require("../tests/helpers/business.cjs");
const { encodeSave } = require("../.test-build/simulation/save.js");
const { setPlan, buy } = require("../.test-build/simulation/game.js");
const { expect } = require("@playwright/test");
const crypto = require("node:crypto");
const fs = require("node:fs"),
    path = require("node:path"),
    os = require("node:os");
const { profileArgs, verifyProfile } = require("../tests/helpers/desktop-profile.cjs");
const executable = process.env.LEMONADE_DESKTOP_EXE;
if (process.platform !== "win32" || !executable) throw new Error("Windows package required.");
const base = fs.mkdtempSync(path.join(os.tmpdir(), "lemonade-performance-"));
const env = { ...process.env, LOCALAPPDATA: base, APPDATA: path.join(base, "Roaming") };
delete env.ELECTRON_RUN_AS_NODE;
const out = path.resolve(process.env.LEMONADE_PERF_EVIDENCE_ROOT || "test-results/desktop-performance");
fs.mkdirSync(out, { recursive: true });
const report = {
    build: JSON.parse(
        fs.readFileSync(path.join(path.dirname(executable), "build-info.json"), "utf8").replace(/^\uFEFF/, ""),
    ),
    toolSha256: crypto.createHash("sha256").update(fs.readFileSync(__filename)).digest("hex"),
    host: { cpu: os.cpus()[0].model, logicalCPUs: os.cpus().length, totalRAMMiB: os.totalmem() / 1048576 },
    launchFlags: process.env.LEMONADE_PERF_DISABLE_GPU === "1" ? ["--disable-gpu"] : [],
    scope: "Isolated Windows development-machine measurement, not minimum-spec certification. Sum Electron process working sets includes shared pages; private bytes measured separately. CPU is sum of Electron-reported process percentages. Negative raw counter samples are retained but floored to zero in aggregate CPU.",
    phases: [],
};
let app, page;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function sample(name, seconds = 6) {
    await delay(1000);
    await app.evaluate(({ app }) => app.getAppMetrics());
    const before = await page.evaluate(() => ({ draws: window.__draws, frames: window.__frames }));
    const started = performance.now();
    const phaseStart = await page.locator("#app").getAttribute("data-phase");
    const samples = [];
    for (let i = 0; i < seconds; i++) {
        await delay(1000);
        samples.push(
            await app.evaluate(({ app }) =>
                app
                    .getAppMetrics()
                    .map((p) => ({
                        type: p.type,
                        cpu: p.cpu.percentCPUUsage,
                        workingSetKiB: p.memory.workingSetSize,
                        privateKiB: p.memory.privateBytes || 0,
                    })),
            ),
        );
    }
    const after = await page.evaluate(() => ({ draws: window.__draws, frames: window.__frames }));
    const totals = samples.map((rows) =>
        rows.reduce(
            (v, p) => ({
                cpu: v.cpu + Math.max(0, p.cpu),
                workingSetMiB: v.workingSetMiB + p.workingSetKiB / 1024,
                privateMiB: v.privateMiB + p.privateKiB / 1024,
            }),
            { cpu: 0, workingSetMiB: 0, privateMiB: 0 },
        ),
    );
    const mean = (key) => totals.reduce((sum, r) => sum + r[key], 0) / totals.length;
    const value = {
        name,
        seconds,
        elapsedSeconds: (performance.now() - started) / 1000,
        phaseStart,
        phaseEnd: await page.locator("#app").getAttribute("data-phase"),
        negativeCPUSamples: samples.flat().filter((p) => p.cpu < 0).length,
        canvasDraws: after.draws - before.draws,
        canvasFrames: after.frames - before.frames,
        meanCPU: mean("cpu"),
        meanWorkingSetMiB: mean("workingSetMiB"),
        meanPrivateMiB: mean("privateMiB"),
        samples,
    };
    report.phases.push(value);
    console.log(JSON.stringify({ ...value, samples: undefined }));
}
(async () => {
    try {
        const started = Date.now();
        app = await electron.launch({
            executablePath: path.resolve(executable),
            env,
            args: profileArgs(base, process.env.LEMONADE_PERF_DISABLE_GPU === "1" ? ["--disable-gpu"] : []),
        });
        page = await app.firstWindow();
        await verifyProfile(app, base);
        await expect(page.locator("canvas")).toBeVisible();
        report.launchToVisibleMs = Date.now() - started;
        report.gpuFeatures = await app.evaluate(({ app }) => app.getGPUFeatureStatus());
        await page.evaluate(() => {
            window.__frames = 0;
            const canvas = document.querySelector("canvas");
            const clear = CanvasRenderingContext2D.prototype.clearRect;
            CanvasRenderingContext2D.prototype.clearRect = function (...args) {
                if (this.canvas === canvas) window.__frames++;
                return clear.apply(this, args);
            };
            window.__draws = 0;
            const original = CanvasRenderingContext2D.prototype.drawImage;
            CanvasRenderingContext2D.prototype.drawImage = function (...args) {
                window.__draws++;
                return original.apply(this, args);
            };
        });
        await sample("preparation idle");
        await page.locator("#help-open").click();
        await page.locator("#mute-audio").check();
        await page.locator("#help-close").click();
        await sample("preparation muted after interaction");
        await page.locator("[data-page=supplies]").click();
        for (const item of ["lemon", "sugar", "ice", "cup"]) {
            await page.locator(`[data-supply=${item}]`).click();
            await page.locator('[data-bundle="0"][data-delta="1"]').click();
        }
        await page.locator("#buy-order").click();
        await page.locator("#open").click();
        await expect(page.locator("#selling")).toBeVisible();
        await sample("selling 1x");
        await page.locator("#speed").click();
        await sample("selling accelerated", 2);
        await page.locator("#skip").evaluate((button) => {
            if (!button.disabled) button.click();
        });
        await expect(page.locator("#next")).toBeEnabled({ timeout: 30000 });
        await sample("results idle");
        await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].minimize());
        await sample("minimized results");
        await app.evaluate(({ BrowserWindow }) => {
            const win = BrowserWindow.getAllWindows()[0];
            win.restore();
            win.focus();
        });
        const fixture = campaign(2026, 40);
        let funded = setPlan(fixture.state, { price: 175, recipe: { lemon: 4, sugar: 3, ice: 0 } });
        for (const item of ["lemon", "sugar", "cup"]) funded = buy(funded, item, 999 - funded.stock[item]);
        await page
            .locator("#save-file")
            .setInputFiles({
                name: "performance-business.json",
                mimeType: "application/json",
                buffer: Buffer.from(encodeSave(funded, fixture.history)),
            });
        await expect(page.locator("#day")).toHaveText("41");
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("HeapProfiler.collectGarbage");
        const heapBefore = await cdp.send("Runtime.getHeapUsage");
        for (let day = 41; day <= 60; day++) {
            await page.locator("#open").click();
            await expect(page.locator("#selling")).toBeVisible();
            await page.locator("#skip").click();
            await expect(page.locator("#next")).toBeEnabled();
            await page.locator("#next").click();
            await expect(page.locator("#day")).toHaveText(String(day + 1));
        }
        await cdp.send("HeapProfiler.collectGarbage");
        const heapAfter = await cdp.send("Runtime.getHeapUsage");
        report.retention = {
            days: 20,
            startHistory: 40,
            endHistory: 60,
            heapBefore,
            heapAfter,
            retainedGrowthMiB: (heapAfter.usedSize - heapBefore.usedSize) / 1048576,
            scope: "Post-GC live JS heap comparison; separate from normal-play CPU/RAM samples.",
        };
        await sample("after 20 rapid completed days", 3);
        if (process.env.LEMONADE_PERF_ENFORCE === "1") {
            for (const phase of report.phases.filter(
                (p) =>
                    p.name.includes("idle") ||
                    p.name.includes("muted") ||
                    p.name.includes("minimized") ||
                    p.name.includes("after 20"),
            ))
                assert.equal(phase.canvasDraws, 0, phase.name + " continuously redraws");
            assert.ok(report.retention.retainedGrowthMiB < 16, "Unexpected retained JS heap growth over 20 days");
            assert.ok(
                report.phases.every((p) => p.meanPrivateMiB < 256),
                "Private memory exceeds provisional engineering budget",
            );
            for (const phase of report.phases.filter((p) => p.phaseStart === "selling" && p.phaseEnd === "selling"))
                assert.ok(
                    phase.canvasFrames > 0 && phase.canvasFrames <= phase.elapsedSeconds * 25,
                    "Active canvas exceeds the 20fps design ceiling or fails to repaint",
                );
        }
        report.status = "PASS";
    } catch (error) {
        report.status = "FAIL";
        report.error = error.message;
        throw error;
    } finally {
        fs.writeFileSync(path.join(out, "performance-results.json"), JSON.stringify(report, null, 2));
        if (app) await app.close();
        assert.ok(
            path.resolve(base).startsWith(path.resolve(os.tmpdir()) + path.sep + "lemonade-performance-"),
            "Unexpected profile cleanup target",
        );
        fs.rmSync(base, { recursive: true, force: true });
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
