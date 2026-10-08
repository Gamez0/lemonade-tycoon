const { test, expect } = require('@playwright/test');
const { campaign } = require('../helpers/business.cjs');
const { encodeSave } = require('../../.test-build/simulation/save.js');
test('seven screens purchase, hire, advertise, restore and account for a paid replay', async ({ page }) => {
    const earned = campaign();
    const raw = encodeSave(earned.state, earned.history);
    await page.addInitScript(raw => {
        if (!localStorage.getItem('lemonade-tycoon.reboot.save')) localStorage.setItem('lemonade-tycoon.reboot.save', raw);
    }, raw);
    await page.goto('/');
    await expect(page.locator('[data-page]')).toHaveCount(7);
    await page.locator('[data-page=upgrades]').click();
    await page.locator('[data-upgrade=blender]').click();
    await expect(page.locator('#upgrade-effect-blender')).toContainText('Level 1/2');
    await page.locator('[data-page=staff]').click();
    await page.locator('[data-staff=server]').click();
    await page.locator('[data-page=marketing]').click();
    await page.locator('[data-advertising=flyers]').click();
    await page.locator('#price').fill('1.75'); await page.locator('#price').press('Tab');
    await page.reload();
    await page.locator('[data-page=staff]').click();
    await expect(page.locator('[data-staff=server]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-page=supplies]').click();
    for (const key of ['lemon', 'sugar', 'ice', 'cup']) {
        await page.locator(`[data-supply=${key}]`).click();
        await page.locator('[data-bundle="1"][data-delta="1"]').click();
    }
    await page.locator('#buy-order').click();
    await page.locator('#open').click();
    await expect(page.locator('#selling')).toBeVisible();
    await page.reload();
    await page.locator('[data-page=staff]').click();
    await expect(page.locator('[data-staff=none]')).toBeDisabled();
    await page.locator('#open').click(); await page.locator('#skip').click();
    await expect(page.locator('#results')).toBeVisible();
    await expect(page.locator('#result-values')).toContainText('$2.50 / $1.80');
    await expect(page.locator('#result-values')).toContainText('$14.00');
});
test('help keyboard, mute and independent volumes survive reload under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('#help-open').focus(); await page.keyboard.press('Enter');
    await expect(page.locator('#help-dialog')).toBeVisible();
    await page.locator('#mute-audio').check();
    await page.locator('#music-volume').fill('0');
    await page.locator('#effects-volume').fill('20');
    await page.keyboard.press('Escape');
    await expect(page.locator('#help-dialog')).toBeHidden();
    await page.reload(); await page.locator('#help-open').click();
    await expect(page.locator('#mute-audio')).toBeChecked();
    await expect(page.locator('#music-volume')).toHaveValue('0');
    await expect(page.locator('#effects-volume')).toHaveValue('20');
});
