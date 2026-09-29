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

async function stock(page) {
    for (const item of ["lemon", "sugar", "ice", "cup"]) await page.locator(`[data-item="${item}"]`).click();
}
async function change(page, id, value) {
    await page.locator(`#${id}`).fill(value);
    await page.locator(`#${id}`).press("Tab");
}
async function finishDay(page) {
    await page.locator("#open").click();
    await expect(page.locator("#selling")).toBeVisible();
    await expect(page.locator("#lemon")).toBeDisabled();
    await page.locator("#speed").click();
    await expect(page.locator("#results")).toBeVisible();
    await expect(page.locator("#next")).toBeEnabled();
}

test("three days preserve accounting, reset presentation and permit a fresh business", async ({ page }) => {
    await expect(page.locator("#cash")).toHaveText("$40.00");
    await page.locator("#open").click();
    await expect(page.locator("#message")).toContainText("Buy enough supplies");
    await stock(page);
    await change(page, "ice", "4");
    await change(page, "price", "1.75");
    await expect(page.locator("#unit-cost")).toHaveText("$0.34");
    for (let day = 1; day <= 3; day++) {
        if (day > 1) await stock(page);
        await finishDay(page);
        const values = await page.locator("#result-values dd").allTextContents();
        const cents = (value) => Math.round(Number(value.replace("$", "")) * 100);
        expect(cents(values[1])).toBe(Number(values[0]) * 175);
        expect(cents(values[2])).toBe(Number(values[0]) * 34);
        expect(cents(values[3])).toBe(cents(values[1]) - cents(values[2]));
        expect(cents(values[5])).toBe(cents(values[1]) - cents(values[4]));
        const cash = await page.locator("#cash").textContent();
        await page.screenshot({ path: `test-results/day-${day}.png`, fullPage: true });
        await page.locator("#next").click();
        await expect(page.locator("#day")).toHaveText(String(day + 1).padStart(2, "0"));
        await expect(page.locator("#cash")).toHaveText(cash);
        await expect(page.locator("#sold")).toHaveText("0");
        await expect(page.locator("#speed")).toHaveText("Speed: 1×");
    }
    await page.locator("#restart").click();
    await expect(page.locator("#day")).toHaveText("04");
    await page.locator("#restart").click();
    await expect(page.locator("#cash")).toHaveText("$40.00");
    await expect(page.locator("#day")).toHaveText("01");
    await expect(page.locator("#capacity")).toHaveText("0 cups");
    await expect(page.locator("#price")).toHaveValue("1.50");
});

test("invalid plans stay visible, funds failures are atomic and restart clears drafts", async ({ page }) => {
    await change(page, "lemon", "0");
    await expect(page.locator("#message")).toContainText("Check lemon");
    await page.locator('[data-item="cup"]').click();
    await expect(page.locator("#cash")).toHaveText("$40.00");
    await expect(page.locator("#lemon")).toHaveValue("0");
    await change(page, "lemon", "2");
    await change(page, "ice", "");
    await page.locator("#open").click();
    await expect(page.locator("#message")).toContainText("Check ice");
    await change(page, "ice", "0");
    await change(page, "price", "1.755");
    await expect(page.locator("#message")).toContainText("Check price");
    await change(page, "price", "1.75");
    for (let i = 0; i < 13; i++) await page.locator('[data-item="lemon"]').click();
    await expect(page.locator("#message")).toContainText("Not enough cash");
    await expect(page.locator("#cash")).toHaveText("$1.60");
    await expect(page.locator("#stock-lemon")).toHaveText("480 in stock");
    await page.locator("#restart").click();
    await page.locator("#restart").press("Escape");
    await expect(page.locator("#restart")).toHaveText("New business");
    await expect(page.locator("#cash")).toHaveText("$1.60");
    await page.locator("#restart").click();
    await page.locator("#restart").click();
    await expect(page.locator("#ice")).toHaveValue("2");
});

test("narrow layout supports a no-sale day and a restart while customers are moving", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await stock(page);
    await change(page, "price", "5");
    await finishDay(page);
    await expect(page.locator("#sold")).toHaveText("0");
    await expect(page.locator("#result-values")).toContainText("No buyers yet");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: "test-results/narrow-results.png", fullPage: true });
    await page.locator("#next").click();
    await page.locator("#open").click();
    await page.locator("#restart").click();
    await page.locator("#restart").click();
    await expect(page.locator("#preparation")).toBeVisible();
    await page.waitForTimeout(1800);
    await expect(page.locator("#sold")).toHaveText("0");
    await expect(page.locator("#cash")).toHaveText("$40.00");
    await page.screenshot({ path: "test-results/narrow-preparation.png", fullPage: true });
});
