const { test, expect } = require('../helpers/browser-game.cjs');

test('quoted bulk packs, combined totals and acquisition values survive checkout and reload', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-page=supplies]').click();
    await page.locator('[data-supply=ice]').click();
    for (const [index, quantity, price] of [[0, 50, '$1.00'], [1, 200, '$3.00'], [2, 500, '$5.00']]) {
        await expect(page.locator(`#bundle-label-${index}`)).toHaveText(`${quantity} Ice cubes`);
        await expect(page.locator(`#bundle-price-${index}`)).toHaveText(price);
        await page.locator(`[data-bundle="${index}"][data-delta="1"]`).click();
    }
    await page.locator('[data-supply=cup]').click();
    for (const [index, quantity, price] of [[0, 75, '$1.00'], [1, 225, '$2.35'], [2, 400, '$3.75']]) {
        await expect(page.locator(`#bundle-label-${index}`)).toHaveText(`${quantity} Paper cups`);
        await expect(page.locator(`#bundle-price-${index}`)).toHaveText(price);
    }
    await page.locator('[data-bundle="1"][data-delta="1"]').click({ clickCount: 2 });
    await expect(page.locator('#order-total')).toHaveText('$13.70');
    await page.locator('#buy-order').click();
    await expect(page.locator('#inventory-ice')).toHaveText('750');
    await expect(page.locator('#inventory-cup')).toHaveText('450');
    await expect(page.locator('#cash')).toHaveText('$26.30');
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('lemonade-tycoon.reboot.save')).state.inventoryCosts.values))
        .toEqual({ lemon: 0, sugar: 0, ice: 900, cup: 470 });
    await page.locator('[data-page=results]').click();
    await page.locator('[data-report=balance]').click();
    await expect(page.locator('#result-values dd').nth(1)).toHaveText('$13.70');
    await expect(page.locator('#result-values dd').nth(3)).toHaveText('$40.00');
    await page.reload();
    await expect(page.locator('#inventory-cup')).toHaveText('450');
    await expect(page.locator('#cash')).toHaveText('$26.30');
    await page.locator('[data-page=supplies]').click();
    await page.locator('[data-supply=cup]').click();
    await expect(page.locator('#bundle-price-2')).toHaveText('$3.75');
});
