const { test, expect } = require('@playwright/test');
const { newGame, setPlan, buyOrder, openDay, reserveLocation, purchaseUpgrade, hireStaff, selectAdvertising, buy } = require('../../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../../.test-build/simulation/street-day.js');
const { encodeSave } = require('../../.test-build/simulation/save.js');
const { campaign } = require('../helpers/business.cjs');

test('native report with reserved rent and low-cash warning retains all rows and opening controls', async ({ page }) => {
    const prepared = campaign(2026, 3); let state = reserveLocation(prepared.state, 'park');
    for (const id of ['refrigerator', 'iceMaker', 'blender']) {
        state = purchaseUpgrade(purchaseUpgrade(state, id), id);
    }
    state = selectAdvertising(hireStaff(state, 'server'), 'radio');
    for (const [item, cost] of [['lemon', 8], ['sugar', 4], ['cup', 6], ['ice', 2]]) {
        const quantity = Math.min(999 - state.stock[item], Math.floor(state.cash / cost));
        if (quantity) state = buy(state, item, quantity);
    }
    const raw = encodeSave(state, prepared.history);
    await page.addInitScript(raw => {
        localStorage.setItem('lemonade-tycoon.reboot.save', raw);
        window.desktopSave = { getItem: async key => localStorage.getItem(key),
            setItem: async (key, value) => localStorage.setItem(key, value), onFlush() {} };
    }, raw);
    for (const [width, height] of [[1097, 554], [683, 465], [512, 350]]) {
        await page.setViewportSize({ width, height }); await page.goto('/');
        await page.locator('[data-page="results"]').click();
        await expect(page.locator('#business-warning')).toContainText('Opening costs exceed cash');
        for (const report of ['daily', 'ledger']) {
            await page.locator(`[data-report="${report}"]`).click();
            const geometry = await page.evaluate(() => {
                const report = document.querySelector('#results'), panel = document.querySelector('.panel');
                const box = panel.getBoundingClientRect(), style = getComputedStyle(panel), zoom = box.width / panel.offsetWidth;
                return { scroll: report.scrollHeight - report.clientHeight,
                    open: document.querySelector('#open').getBoundingClientRect().bottom,
                    limit: box.bottom - (parseFloat(style.paddingBottom) + parseFloat(style.borderBottomWidth)) * zoom };
            });
            expect(geometry.scroll, `${width}x${height} ${report}`).toBeLessThanOrEqual(1);
            expect(geometry.open).toBeLessThanOrEqual(geometry.limit + 1);
            await expect(page.locator('#result-values dd').last()).toBeInViewport();
        }
        await page.locator('#open').click();
        await expect(page.locator('#rent-page')).toBeVisible();
        await expect(page.locator('#message')).toContainText('Not enough cash');
        expect(await page.evaluate(() => localStorage.getItem('lemonade-tycoon.reboot.save'))).toBe(raw);
        const openingFits = await page.evaluate(() => {
            const panel = document.querySelector('.panel'), box = panel.getBoundingClientRect(), style = getComputedStyle(panel);
            const zoom = box.width / panel.offsetWidth;
            return document.querySelector('#open').getBoundingClientRect().bottom <=
                box.bottom - (parseFloat(style.paddingBottom) + parseFloat(style.borderBottomWidth)) * zoom + 1;
        });
        expect(openingFits).toBe(true);
    }
});

test('no-sale feedback diagnoses poor recipe at minimum price instead of asking for an impossible lower price', async ({ page }) => {
    const preparation = buyOrder(setPlan(newGame(67800), { price: 25, recipe: { lemon: 6, sugar: 1, ice: 7 } }),
        { lemon: 60, sugar: 10, ice: 500, cup: 60 });
    const done = finishStreetDay(beginStreetDay(openDay(preparation))).day.game;
    expect(done.daily.sold).toBe(0);
    expect(done.daily.priceRejected).toBe(0);
    await page.addInitScript(raw => localStorage.setItem('lemonade-tycoon.reboot.save', raw), encodeSave(done, [done]));
    await page.goto('/');
    await expect(page.locator('#report-response')).toContainText('Adjust your recipe');
    await expect(page.locator('#report-response')).toContainText('32 passed by');
    await expect(page.locator('#report-response')).not.toContainText('lower');
});

test('leaving an invalid-price tab clears transient feedback while keeping the value and opening validation', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-page="marketing"]').click();
    await page.locator('#price').fill('5.01'); await page.locator('#price').press('Tab');
    await expect(page.locator('#message')).toContainText('Check price');
    await page.locator('[data-page="results"]').click();
    await expect(page.locator('#message')).toBeEmpty();
    await page.locator('#open').click();
    await expect(page.locator('#price')).toBeVisible();
    await expect(page.locator('#price')).toHaveValue('5.01');
    await expect(page.locator('#message')).toContainText('Check price');
    await expect(page.locator('#app')).toHaveAttribute('data-phase', 'preparation');
});
