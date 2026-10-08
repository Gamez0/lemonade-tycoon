const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
    });
    page.on("response", (response) => {
        if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    page.errors = errors;
    await page.goto("/");
    await expect(page.locator("canvas")).toBeVisible();
});
test.afterEach(async ({ page }) => {
    expect(page.errors).toEqual([]);
});
const tab = (page, name) => page.locator(`[data-page="${name}"]`).click();
async function add(page, item, size = 0, times = 1) {
    await page.locator(`[data-supply="${item}"]`).click();
    for (let i = 0; i < times; i++) await page.locator(`[data-bundle="${size}"][data-delta="1"]`).click();
}
async function stock(page, extraIce = false) {
    await tab(page, "supplies");
    for (const item of ["lemon", "sugar", "ice", "cup"]) await add(page, item, 0, item === "ice" && extraIce ? 2 : 1);
    await page.locator("#buy-order").click();
}
async function change(page, id, value) {
    await tab(page, id === "price" ? "marketing" : "recipe");
    await page.locator(`#${id}`).fill(value);
    await page.locator(`#${id}`).press("Tab");
}
async function finishDay(page, capture = false) {
    await page.locator("#open").click();
    await expect(page.locator("#selling")).toBeVisible();
    await expect(page.locator("#weather-label")).toHaveText("Current weather");
    await expect(page.locator("#closed-sign")).toBeHidden();
    await expect(page.locator("#lemon")).toBeDisabled();
    await expect(page.locator('[data-page="supplies"]')).toBeDisabled();
    if (capture) await page.locator("#app").screenshot({ path: "test-results/m2-selling.png" });
    await page.locator("#speed").click();
    await expect(page.locator("#results")).toBeVisible();
    await expect(page.locator("#next")).toBeEnabled();
    await expect(page.locator("#closed-sign")).toBeVisible();
    await expect(page.locator("#weather-label")).toHaveText("Today's weather");
}
const cents = (value) => Math.round(Number(value.replace("$", "")) * 100);

test("three days keep daily and cumulative books and classic geometry", async ({ page }) => {
    await expect(page.locator("#cash")).toHaveText("$40.00");
    await expect(page.locator("#weather-label")).toHaveText("Weather forecast");
    await expect(page.locator("#weather-art")).toHaveAttribute("aria-label", "Sunny");
    await tab(page, "results");
    await expect(page.locator("#result-intro")).toContainText("No completed days");
    await page.locator("#open").click();
    await expect(page.locator("#message")).toContainText("Buy enough supplies");
    await stock(page, true);
    await expect(page.locator("#inventory-lemon")).toHaveText("40");
    await change(page, "ice", "4");
    await expect(page.locator("#supplies-page")).toBeHidden();
    await page.locator("#app").screenshot({ path: "test-results/m2-recipe.png" });
    await change(page, "price", "1.75");
    await expect(page.locator("#unit-cost")).toHaveText("$0.15");
    await page.locator("#app").screenshot({ path: "test-results/m2-price.png" });
    const geometry = await page.evaluate(() => {
        const box = (selector) => document.querySelector(selector).getBoundingClientRect();
        const left = box(".management-column"),
            right = box(".world-column"),
            scene = box("canvas"),
            app = box("#app");
        return {
            share: left.width / (left.width + right.width),
            scene: scene.width / scene.height,
            app: app.width / app.height,
        };
    });
    expect(geometry.share).toBeCloseTo(0.5, 2);
    expect(geometry.scene).toBeCloseTo(1.25, 2);
    expect(geometry.app).toBeGreaterThan(1.2);
    expect(geometry.app).toBeLessThan(1.45);
    let totalSold = 0,
        totalRevenue = 0,
        totalCashChange = 0;
    for (let day = 1; day <= 3; day++) {
        if (day > 1) await stock(page, true);
        await finishDay(page, day === 1);
        const values = await page.locator("#result-values dd").allTextContents();
        expect(cents(values[1])).toBe(Number(values[0]) * 175);
        expect(cents(values[2])).toBeGreaterThanOrEqual(Number(values[0]) * 6);
        expect(cents(values[3])).toBe(cents(values[1]) - cents(values[2]));
        expect(cents(values[5])).toBe(cents(values[1]) - cents(values[4]));
        totalSold += Number(values[0]);
        totalRevenue += cents(values[1]);
        totalCashChange += cents(values[5]);
        await page.locator("#app").screenshot({ path: `test-results/m2-results-${day}.png` });
        await page.locator('[data-report="ledger"]').click();
        const ledger = await page.locator("#result-values dd").allTextContents();
        expect(Number(ledger[0])).toBe(totalSold);
        expect(cents(ledger[1])).toBe(totalRevenue);
        expect(cents(ledger[5])).toBe(totalCashChange);
        expect(cents(await page.locator("#cash").textContent())).toBe(4000 + totalCashChange);
        const cash = await page.locator("#cash").textContent();
        const reactionCounts = await page.locator(".reactions strong").allTextContents();
        expect(reactionCounts.map(Number).reduce((a, b) => a + b, 0)).toBe(
            Number((await page.locator("#progress-text").textContent()).split(" / ")[0]),
        );
        await page.locator("#next").click();
        await expect(page.locator("#weather-label")).toHaveText("Weather forecast");
        await expect(page.locator("#reaction-price")).toHaveText("0");
        await expect(page.locator("#day")).toHaveText(String(day + 1).padStart(2, "0"));
        await expect(page.locator("#cash")).toHaveText(cash);
        await expect(page.locator("#speed-label")).toHaveText("Speed: 1×");
        await tab(page, "results");
        await expect(page.locator("#result-intro")).toContainText(`Day ${day}`);
        await expect(page.locator("#next")).toBeHidden();
    }
    await page.locator('[data-report="ledger"]').click();
    await page.locator("#app").screenshot({ path: "test-results/m2-ledger.png" });
    await page.locator("#restart").click();
    await page.locator("#restart").click();
    await expect(page.locator("#cash")).toHaveText("$40.00");
    await expect(page.locator("#day")).toHaveText("01");
    await expect(page.locator("#capacity")).toHaveText("0 cups");
    await tab(page, "results");
    await expect(page.locator("#result-intro")).toContainText("No completed days");
});

test("purchase drafts survive tabs; cancel and rejected checkout never change stock or cash", async ({ page }) => {
    await tab(page, "supplies");
    await page.locator("#buy-order").click();
    await expect(page.locator("#message")).toContainText("Choose supplies");
    await add(page, "lemon");
    await add(page, "cup");
    await expect(page.locator("#cash")).toHaveText("$40.00");
    await expect(page.locator("#inventory-lemon")).toHaveText("0");
    await expect(page.locator("#order-total")).toHaveText("$4.40");
    await tab(page, "recipe");
    await page.locator("#open").click();
    await expect(page.locator("#supplies-page")).toBeVisible();
    await expect(page.locator("#message")).toContainText("BUY or CANCEL");
    await page.locator("#app").screenshot({ path: "test-results/m2-supplies.png" });
    await page.locator("#cancel-order").click();
    await expect(page.locator("#order-total")).toHaveText("$0.00");
    await expect(page.locator("#cash")).toHaveText("$40.00");
    await add(page, "lemon", 2, 2);
    await add(page, "cup", 2, 2);
    await page.locator("#buy-order").click();
    await expect(page.locator("#message")).toContainText("Not enough cash");
    await expect(page.locator("#inventory-lemon")).toHaveText("0");
    await expect(page.locator("#cash")).toHaveText("$40.00");
    await expect(page.locator("#order-total")).toHaveText("$44.00");
    await page.locator("#cancel-order").click();
    await change(page, "lemon", "0");
    await expect(page.locator("#message")).toContainText("Check lemon");
    await tab(page, "supplies");
    await add(page, "cup");
    await page.locator("#buy-order").click();
    await expect(page.locator("#recipe-page")).toBeVisible();
    await expect(page.locator("#lemon")).toHaveValue("0");
    await expect(page.locator("#cash")).toHaveText("$40.00");
    await change(page, "lemon", "2");
    await change(page, "ice", "");
    await expect(page.locator("#message")).toContainText("Check ice");
    await change(page, "ice", "0");
    await change(page, "price", "1.755");
    await expect(page.locator("#message")).toContainText("Check price");
    await change(page, "price", "1.75");
    await tab(page, "supplies");
    await page.locator("#buy-order").click();
    await expect(page.locator("#inventory-cup")).toHaveText("20");
    await expect(page.locator("#cash")).toHaveText("$38.80");
    await add(page, "ice");
    await page.locator("#restart").click();
    await page.locator("#restart").press("Escape");
    await expect(page.locator("#restart")).toHaveText("New business");
    await expect(page.locator("#order-total")).toHaveText("$1.20");
    await page.locator("#restart").click();
    await page.locator("#restart").click();
    await tab(page, "supplies");
    await expect(page.locator("#order-total")).toHaveText("$0.00");
    await expect(page.locator("#cash")).toHaveText("$40.00");
});

test("375px layout supports three no-sale days and restarting during a visit", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await stock(page);
    await change(page, "price", "5");
    for (let day = 1; day <= 3; day++) {
        if (day > 1) await stock(page, true);
        await finishDay(page);
        await expect(page.locator("#sold")).toHaveText("0");
        await expect(page.locator("#result-values")).toContainText("No buyers yet");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: `test-results/narrow-results-${day}.png`, fullPage: true });
        await page.locator("#next").click();
    }
    await page.locator("#open").click();
    await page.locator("#restart").click();
    await page.locator("#restart").click();
    await expect(page.locator("#preparation")).toBeVisible();
    await page.waitForTimeout(1800);
    await expect(page.locator("#sold")).toHaveText("0");
    await expect(page.locator("#cash")).toHaveText("$40.00");
    await page.screenshot({ path: "test-results/narrow-preparation.png", fullPage: true });
});

test("all preparation screens retain forecast details and action position across breakpoints", async ({ page }) => {
    for (const width of [375, 520, 640, 768]) {
        await page.setViewportSize({ width, height: 1000 });
        const positions = [];
        for (const name of ["recipe", "marketing", "supplies", "results", "rent", "upgrades", "staff"]) {
            await tab(page, name);
            await expect(page.locator("#forecast-news")).toBeVisible();
            await expect(page.locator("#progress-text")).toBeVisible();
            positions.push((await page.locator("#open").boundingBox()).y);
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
        expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1);
    }
});

test("storage-limit checkout preserves every item, cash and pending order", async ({ page }) => {
    await tab(page, "supplies");
    await add(page, "ice", 2, 3);
    await page.locator("#buy-order").click();
    await expect(page.locator("#inventory-ice")).toHaveText("900");
    await expect(page.locator("#cash")).toHaveText("$22.00");
    await add(page, "lemon");
    await add(page, "ice", 1);
    await page.locator("#buy-order").click();
    await expect(page.locator("#message")).toContainText("Storage limit");
    await expect(page.locator("#inventory-lemon")).toHaveText("0");
    await expect(page.locator("#inventory-ice")).toHaveText("900");
    await expect(page.locator("#cash")).toHaveText("$22.00");
    await expect(page.locator("#order-total")).toHaveText("$5.60");
    await page.locator("#cancel-order").click();
    await expect(page.locator("#order-total")).toHaveText("$0.00");
    await expect(page.locator("#cash")).toHaveText("$22.00");
});

for (const timing of ["immediately", "after a committed visit", "after changing speed"]) {
    test(`SKIP ${timing} matches normal day accounting without duplicate visits`, async ({ page }) => {
        const game = require("../../.test-build/simulation/game.js");
        const street = require("../../.test-build/simulation/street-day.js");
        const opened = game.openDay(game.buyOrder(game.newGame(), { lemon: 40, sugar: 20, ice: 60, cup: 20 }));
        const expected = street.finishStreetDay(street.beginStreetDay(opened)).day.game;
        await stock(page);
        await page.locator("#open").click();
        if (timing !== "immediately") {
            if (timing === "after changing speed") await page.locator("#speed").click();
            await expect(page.locator("#progress-text")).not.toHaveText(/^0 \/ /);
        }
        await page.locator("#skip").click();
        await expect(page.locator("#results")).toBeVisible();
        await expect(page.locator("#next")).toBeEnabled();
        await expect(page.locator("#closed-sign")).toBeVisible();
        await expect(page.locator("#scene-controls")).toBeHidden();
        const values = await page.locator("#result-values dd").allTextContents();
        expect(Number(values[0])).toBe(expected.daily.sold);
        expect(cents(values[1])).toBe(expected.daily.revenue);
        expect(cents(values[2])).toBe(expected.daily.cost);
        expect(cents(await page.locator("#cash").textContent())).toBe(expected.cash);
        await expect(page.locator("#reaction-abandoned")).toHaveText(String(expected.daily.abandoned));
        const counts = await page.locator(".reactions strong").allTextContents();
        expect(counts.map(Number).reduce((a, b) => a + b, 0)).toBe(expected.business.traffic);
        for (const item of ["lemon", "sugar", "ice", "cup"]) {
            await expect(page.locator(`#inventory-${item}`)).toHaveText(String(expected.stock[item]));
        }
        await page.locator("#next").click();
        await expect(page.locator("#day")).toHaveText("02");
        await expect(page.locator("#speed-label")).toHaveText("Speed: 1×");
        await tab(page, "results");
        await page.locator('[data-report="ledger"]').click();
        await expect(page.locator("#result-intro")).toContainText("1 completed day.");
        await page.waitForTimeout(1700);
        await expect(page.locator("#cash")).toHaveText(`$${(expected.cash / 100).toFixed(2)}`);
    });
}

test("waiting departures appear separately in the live reaction count and report", async ({ page }) => {
    const game = require("../../.test-build/simulation/game.js");
    const street = require("../../.test-build/simulation/street-day.js");
    const supplies = { lemon: 120, sugar: 60, ice: 180, cup: 60 };
    const expected = street.finishStreetDay(street.beginStreetDay(
        game.openDay(game.buyOrder(game.newGame(), supplies)))).day.game;
    expect(expected.daily.abandoned).toBeGreaterThan(0);
    await tab(page, "supplies");
    for (const item of ["lemon", "sugar", "ice", "cup"]) await add(page, item, 0, 3);
    await page.locator("#buy-order").click();
    await page.locator("#open").click();
    await expect(page.locator("#world-status")).toContainText("waiting");
    await page.locator("#skip").click();
    await expect(page.locator("#reaction-abandoned")).toHaveText(String(expected.daily.abandoned));
    await expect(page.locator("#report-response")).toContainText("left the line");
    await expect(page.locator("#cash")).toHaveText(`$${(expected.cash / 100).toFixed(2)}`);
});
