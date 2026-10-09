const { test, expect } = require('@playwright/test');
const { newGame, setPlan, buyOrder, openDay } = require('../../.test-build/simulation/game.js');
const { beginStreetDay, finishStreetDay } = require('../../.test-build/simulation/street-day.js');
const { encodeSave } = require('../../.test-build/simulation/save.js');

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
