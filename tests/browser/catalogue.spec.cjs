const { test, expect } = require('../helpers/browser-game.cjs');
const { newGame } = require('../../.test-build/simulation/game.js');
const { encodeSave } = require('../../.test-build/simulation/save.js');

test('owned and next equipment abilities stay distinct through every level and small windows', async ({ page }) => {
    const state = { ...newGame(), cash: 2000000, openingCash: 2000000 };
    await page.addInitScript(raw => localStorage.setItem('lemonade-tycoon.reboot.save', raw), encodeSave(state, []));
    await page.goto('/');
    await page.locator('[data-page=upgrades]').click();
    const effects = {
        refrigerator: ['Keep 50% of leftover ice', 'Keep all leftover ice'],
        iceMaker: ['Produce up to 60 free ice at opening', 'Produce up to 120 free ice at opening'],
        blender: ['Reduce base service time by 12.5%', 'Reduce base service time by 25%'],
    };
    for (const [id, levels] of Object.entries(effects)) {
        for (let level = 0; level < levels.length; level++) {
            await expect(page.locator(`#upgrade-next-${id}`)).toContainText(levels[level]);
            await page.locator(`[data-upgrade=${id}]`).click();
            await expect(page.locator(`#upgrade-owned-${id}`)).toContainText(levels[level]);
            await expect(page.locator(`#upgrade-effect-${id}`)).toHaveText(`Level ${level + 1}/2`);
        }
        await expect(page.locator(`#upgrade-next-${id}`)).toHaveText('Fully upgraded');
        await expect(page.locator(`[data-upgrade=${id}]`)).toHaveText('MAX LEVEL');
        await expect(page.locator(`[data-upgrade=${id}]`)).toBeDisabled();
        for (const [width, height] of [[1280, 1000], [800, 600], [512, 350], [375, 667]]) {
            await page.setViewportSize({ width, height });
            const fits = await page.locator(`#upgrade-owned-${id}`).evaluate(label => {
                const card = label.closest('article').getBoundingClientRect(), text = label.getBoundingClientRect();
                return text.left >= card.left && text.right <= card.right && document.documentElement.scrollWidth <= innerWidth;
            });
            expect(fits).toBe(true);
        }
        await page.setViewportSize({ width: 1280, height: 1000 });
        await page.getByRole('button', { name: 'Next upgrade', exact: true }).click();
    }
    await expect(page.locator('#upgrade-owned-stand')).toHaveText('Owned: Basic Stand');
    await expect(page.locator('#upgrade-next-stand')).toContainText('Classic Stand');
    for (const name of ['Classic Stand', 'Lemon Stand', 'Castle Stand']) {
        await page.locator('[data-upgrade=stand]').click();
        await expect(page.locator('#upgrade-owned-stand')).toContainText(name);
    }
    await expect(page.locator('#upgrade-next-stand')).toHaveText('Fully upgraded');
});

test('illustrated catalogues browse without spending and retain purchase and hire choices', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('canvas')).toBeVisible();
    await page.locator('[data-page=upgrades]').click();
    await expect(page.locator('#cash')).toHaveText('$40.00');
    await expect(page.locator('#upgrade-owned-refrigerator')).toHaveText('Owned: No leftover ice retained');
    await expect(page.locator('#upgrade-next-refrigerator')).toHaveText('Next ($9.00): Keep 50% of leftover ice');
    const illustrations = page.locator('#upgrades-catalog .equipment-illustration');
    await expect(illustrations).toHaveCount(3);
    for (const image of await illustrations.all()) {
        const native = await image.evaluate(async img => {
            await img.decode();
            return { width: img.naturalWidth, height: img.naturalHeight, filter: getComputedStyle(img).imageRendering };
        });
        expect(native).toEqual({ width: 1402, height: 1122, filter: 'auto' });
    }
    await page.getByRole('button', { name: 'Next upgrade', exact: true }).click();
    await expect(page.locator('#upgrades-position')).toHaveText('2 / 4');
    await page.getByRole('button', { name: 'Next upgrade', exact: true }).click();
    await expect(page.locator('#upgrades-position')).toHaveText('3 / 4');
    await page.getByRole('button', { name: 'Next upgrade', exact: true }).click();
    await expect(page.locator('#upgrades-position')).toHaveText('4 / 4');
    await expect(page.locator('#upgrade-title-stand')).toHaveText('Basic Stand');
    await expect(page.locator('[data-upgrade=stand]')).toBeDisabled();
    await page.getByRole('button', { name: 'Next upgrade', exact: true }).click();
    await expect(page.locator('#upgrades-position')).toHaveText('1 / 4');
    await expect(page.locator('#cash')).toHaveText('$40.00');
    await page.locator('[data-upgrade=refrigerator]').click();
    await expect(page.locator('#cash')).toHaveText('$31.00');
    await expect(page.locator('#upgrade-effect-refrigerator')).toContainText('Level 1/2');
    await expect(page.locator('#upgrade-owned-refrigerator')).toHaveText('Owned: Keep 50% of leftover ice');
    await expect(page.locator('#upgrade-next-refrigerator')).toHaveText('Next ($17.00): Keep all leftover ice');
    await page.locator('[data-page=staff]').click();
    await page.getByRole('button', { name: 'Next employee', exact: true }).click();
    await expect(page.locator('#staff-position')).toHaveText('2 / 3');
    await expect(page.locator('[data-staff=server]')).toHaveText('HIRE');
    await page.locator('[data-staff=server]').click();
    await expect(page.locator('[data-staff=server]')).toHaveText('CURRENT');
    await expect(page.locator('#cash')).toHaveText('$31.00');
    await page.reload();
    await page.locator('[data-page=staff]').click();
    await expect(page.locator('[data-staff=server]')).toHaveAttribute('aria-pressed', 'true');
    await page.setViewportSize({ width: 375, height: 1000 });
    await page.getByRole('button', { name: 'Previous employee', exact: true }).click();
    await expect(page.locator('#staff-position')).toHaveText('3 / 3');
    await expect(page.locator('#cash')).toHaveText('$31.00');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('staff catalogue keeps its controls within small windows without a horizontal scrollbar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('canvas')).toBeVisible();
    await page.locator('[data-page=staff]').click();
    for (const [width, height] of [[800, 600], [683, 465], [640, 480], [512, 350], [375, 667]]) {
        await page.setViewportSize({ width, height });
        for (let i = 0; i < 3; i++) {
            await page.getByRole('button', { name: 'Next employee', exact: true }).click();
            const geometry = await page.locator('#staff-catalog').evaluate(catalogue => {
                const viewport = catalogue.getBoundingClientRect();
                const card = [...catalogue.children].find(card => Math.abs(card.getBoundingClientRect().x - viewport.x) < 2);
                const button = card?.querySelector('button').getBoundingClientRect();
                return { overflow: getComputedStyle(catalogue).overflowX,
                    rootFits: document.documentElement.scrollWidth <= innerWidth,
                    fits: Boolean(button && button.x >= viewport.x && button.right <= viewport.right),
                    scrollbar: catalogue.offsetHeight - catalogue.clientHeight };
            });
            expect(geometry).toEqual({ overflow: 'hidden', rootFits: true, fits: true, scrollbar: 0 });
        }
    }
});
