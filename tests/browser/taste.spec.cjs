const { test, expect } = require('../helpers/browser-game.cjs');
const { newGame, setPlan, buyOrder, withWeatherForecast } = require('../../.test-build/simulation/game.js');
const { encodeSave } = require('../../.test-build/simulation/save.js');
const { WEATHER } = require('../../.test-build/content/catalog.js');

for (const [name, weather, recipe, english, korean] of [
    ['warm and sour', WEATHER[0], { lemon: 20, sugar: 0, ice: 0 }, ['Not enough ice', 'Too sour:'], ['얼음이 부족해요', '너무 셔요']],
    ['watery', WEATHER[2], { lemon: 1, sugar: 1, ice: 7 }, ['Too watery:'], ['너무 묽어요']],
    ['sweet', WEATHER[2], { lemon: 6, sugar: 10, ice: 0 }, ['Too sweet:'], ['너무 달아요']],
]) test(`Korean composed ${name} report and overnight recipe hints retain translations and save bytes`, async ({ page }, info) => {
    const state = buyOrder(setPlan({ ...newGame(), weather },
        { price: 25, recipe }), { lemon: 40, sugar: 20, ice: 500, cup: 40 });
    const key = 'lemonade-tycoon.reboot.save';
    await page.clock.install();
    await page.addInitScript(({ key, raw }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, raw); },
        { key, raw: encodeSave(state, []) });
    await page.goto('/'); await page.clock.runFor(500);
    await page.locator('#open').click(); await page.locator('#skip').click(); await page.clock.runFor(500);
    const raw = await page.evaluate(key => localStorage.getItem(key), key);
    const englishReport = await page.locator('#report-response').textContent();
    for (const advice of english) expect(englishReport).toContain(advice);
    for (const language of ['ko', 'en', 'ko']) {
        await page.locator('#help-open').click(); await page.locator('#language').selectOption(language); await page.locator('#help-close').click();
        await page.locator('[data-page=results]').click();
        if (language === 'ko') {
            for (const advice of korean) await expect(page.locator('#report-response')).toContainText(advice);
            await expect(page.locator('#report-response')).toContainText('품절');
            await expect(page.locator('#report-response')).not.toContainText(/visitors|left the line|passed by|Too |Not enough ice/);
        } else await expect(page.locator('#report-response')).toHaveText(englishReport);
        await page.locator('[data-page=recipe]').click();
        await expect(page.locator('#recipe-hint')).toContainText(language === 'ko' ? '밤사이 얼음' : 'ice melted overnight.');
        await expect(page.locator('#recipe-hint')).toContainText(language === 'ko' ? '레몬과 설탕도 균형 있게' : 'Cooling needs');
        if (language === 'ko') await expect(page.locator('#recipe-hint')).not.toContainText(/Cooling|Extra ice|overnight/);
        expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(raw);
    }
    await page.setViewportSize({ width: 512, height: 350 });
    await page.screenshot({ path: info.outputPath(`korean-${name}-overnight.png`), fullPage: true });
    await page.reload(); await page.clock.runFor(500);
    await expect(page.locator('#recipe-hint')).toContainText('밤사이 얼음');
});

for (const [name, weather, ice, reaction, advice] of [
    ['hot day with too little ice', WEATHER[0], 0, 'Too warm!', 'Not enough ice'],
    ['cold day with diluted lemonade', WEATHER[2], 7, 'Too watery!', 'Too watery'],
]) test(name + ' reports buyer taste during sales and after reload, without applying it to other days', async ({ page }) => {
    const state = buyOrder(setPlan({ ...newGame(), weather }, { price: 25, recipe: { lemon: 6, sugar: 3, ice } }),
        { lemon: 40, sugar: 20, ice: 500, cup: 40 });
    await page.clock.install();
    await page.addInitScript(raw => {
        if (!localStorage.getItem('lemonade-tycoon.reboot.save')) localStorage.setItem('lemonade-tycoon.reboot.save', raw);
    }, encodeSave(state, []));
    await page.goto('/'); await page.clock.runFor(500);
    await expect(page.locator('#recipe-hint')).not.toContainText(/Taste score|\d+%|perfect/i);
    await expect(page.locator('#recipe-hint')).toContainText('Cooling needs');
    await page.locator('#open').click();
    let tasted = false;
    for (let i = 0; i < 120; i++) {
        await page.clock.runFor(100);
        if ((await page.locator('#feedback').textContent()).includes(reaction)) { tasted = true; break; }
    }
    expect(tasted).toBe(true);
    expect(Number(await page.locator('#sold').textContent())).toBeGreaterThan(0);
    await page.locator('#app').screenshot({ path: 'test-results/taste-' + ice + '-selling.png' });
    await page.locator('#skip').click(); await page.clock.runFor(500);
    await expect(page.locator('#report-response')).toContainText(advice);
    await page.locator('#app').screenshot({ path: 'test-results/taste-' + ice + '-results.png' });
    await page.reload(); await page.clock.runFor(500);
    await page.locator('[data-page=results]').click();
    await expect(page.locator('#report-response')).toContainText(advice);
    await page.locator('[data-report="ledger"]').click();
    await expect(page.locator('#report-response')).not.toContainText(advice);
    await page.locator('[data-page=recipe]').click();
    await page.locator('[data-page="recipe"]').click();
    await expect(page.locator('#lemon')).toHaveValue('6');
    await expect(page.locator('#sugar')).toHaveValue('3');
});

test('recipe guidance keeps cooling, dilution, yield and keyboard editing in both languages without predicting taste', async ({ page }, info) => {
    const state = buyOrder(setPlan(withWeatherForecast({ ...newGame(), weather: WEATHER[0] }),
        { price: 25, recipe: { lemon: 6, sugar: 3, ice: 0 } }),
        { lemon: 40, sugar: 20, ice: 500, cup: 40 });
    await page.addInitScript(raw => localStorage.setItem('lemonade-tycoon.reboot.save', raw), encodeSave(state, []));
    await page.goto('/');
    for (const language of ['en', 'ko']) {
        await page.locator('#help-open').click();
        await page.locator('#language').selectOption(language);
        await page.locator('#help-close').click();
        await expect(page.locator('#recipe-controls')).toHaveAttribute('aria-describedby', 'recipe-hint');
        await expect(page.locator('#recipe-controls')).toHaveAccessibleDescription(language === 'en'
            ? /Cooling needs .* ice per cup.*Extra ice needs balanced lemon and sugar/
            : /한 잔당 얼음 .*개가 필요해요.*레몬과 설탕도 균형 있게/);
        for (const ice of ['0', '2', '7']) {
            await page.locator('#ice').focus();
            await page.keyboard.press('ControlOrMeta+A');
            await page.keyboard.type(ice);
            await page.keyboard.press('Tab');
            await expect(page.locator('#ice')).toHaveValue(ice);
            await expect(page.locator('#recipe-hint')).not.toContainText(/Taste score|맛 점수|\d+%|perfect|완벽/i);
            await expect(page.locator('#pitcher-yield')).toContainText(language === 'en' ? 'cups per pitcher' : '잔');
        }
        for (const [width, height] of [[1280, 1000], [800, 600], [512, 350], [375, 667]]) {
            await page.setViewportSize({ width, height });
            expect(await page.evaluate(() => {
                const hint = document.querySelector('#recipe-hint').getBoundingClientRect();
                const panel = document.querySelector('#recipe-page').getBoundingClientRect();
                return document.documentElement.scrollWidth <= innerWidth && hint.left >= panel.left - 1 && hint.right <= panel.right + 1 && hint.bottom <= panel.bottom + 1;
            })).toBe(true);
        }
        await page.screenshot({ path: info.outputPath(`recipe-${language}-narrow.png`), fullPage: true });
    }
});
