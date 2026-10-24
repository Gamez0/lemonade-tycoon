// Existing game tests enter via the real menu. Menu/startup tests use the
// unwrapped Playwright fixture and assert the entry flow explicitly.
const base = require('@playwright/test');
const test = base.test.extend({
    page: async ({ page }, use) => {
        const enter = () => page.locator('#menu-continue:enabled, #menu-inspect:not([hidden]):enabled').first()
            .click({ timeout: 30000 });
        const afterNavigation = async () => {
            // One startup/close regression intentionally holds the first read.
            // It must be able to release that read before entry can complete.
            if (await page.evaluate(() => Boolean(window.holdRestore))) void enter().catch(() => {});
            else await enter();
        };
        const go = page.goto.bind(page), reload = page.reload.bind(page);
        page.goto = async (...args) => { const response = await go(...args); await afterNavigation(); return response; };
        page.reload = async (...args) => { const response = await reload(...args); await afterNavigation(); return response; };
        await use(page);
    },
});
module.exports = { ...base, test };
